const { spawn } = require('child_process');
const db = require('../config/db');
const { validarHorarioFaculdade } = require('../utils/horario');

function getUserId(req) {
    return req.session?.utilizador?.id || null;
}

function callPythonLSS(comando) {
    return new Promise((resolve, reject) => {
        const python = spawn('py', ['compiladores/main.py', comando]);
        let output = '';
        let error = '';

        python.stdout.on('data', (data) => { output += data.toString(); });
        python.stderr.on('data', (data) => { error += data.toString(); });

        python.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(error || 'Erro ao executar comando'));
                return;
            }

            try {
                resolve(JSON.parse(output));
            } catch {
                reject(new Error('Python nao devolveu JSON valido'));
            }
        });
    });
}

function buildPeriodo(resultado) {
    return {
        dataInicio: `${resultado.data} ${resultado.inicio}:00`,
        dataFim: `${resultado.data} ${resultado.fim}:00`
    };
}

function validarPeriodo(dataInicio, dataFim) {
    if (dataInicio >= dataFim) {
        return 'A hora de fim tem de ser depois da hora de inicio';
    }

    return validarHorarioFaculdade(dataInicio, dataFim);
}

async function consultarReservas(resultado, idUtilizador) {
    let filtroEstadoSala = '';
    let filtroEstadoEquipamento = '';
    const parametrosSala = [idUtilizador];
    const parametrosEquipamento = [idUtilizador];

    if (resultado.estado !== 'todas') {
        filtroEstadoSala = 'AND rs.estado = ?';
        filtroEstadoEquipamento = 'AND re.estado = ?';
        parametrosSala.push(resultado.estado);
        parametrosEquipamento.push(resultado.estado);
    }

    const [reservasSala] = await db.promise().query(
        `SELECT
            rs.id_reserva,
            'sala' AS recurso_categoria,
            s.nome AS recurso_nome,
            rs.data_inicio,
            rs.data_fim,
            rs.estado
         FROM reserva_sala rs
         JOIN sala s ON s.id_sala = rs.s_id_sala
         WHERE rs.u_id_utilizador = ?
         ${filtroEstadoSala}
         ORDER BY rs.data_inicio DESC`,
        parametrosSala
    );

    const [reservasEquipamento] = await db.promise().query(
        `SELECT
            re.id_reserva,
            'equipamento' AS recurso_categoria,
            re.e_tipo_equipamento AS recurso_nome,
            re.data_inicio,
            re.data_fim,
            re.estado
         FROM reserva_equipamento re
         WHERE re.u_id_utilizador = ?
         ${filtroEstadoEquipamento}
         ORDER BY re.data_inicio DESC`,
        parametrosEquipamento
    );

    const reservas = [...reservasSala, ...reservasEquipamento]
        .sort((a, b) => new Date(b.data_inicio) - new Date(a.data_inicio));

    return { reservas, reservasSala, reservasEquipamento };
}

async function cancelarReserva(resultado, idUtilizador) {
    let cancelamento;

    if (resultado.recurso_categoria === 'sala' || resultado.recurso_categoria === 'laboratorio') {
        [cancelamento] = await db.promise().query(
            `UPDATE reserva_sala
             SET estado = 'cancelada'
             WHERE id_reserva = ?
             AND u_id_utilizador = ?
             AND estado = 'ativa'`,
            [resultado.id_reserva, idUtilizador]
        );
    } else if (resultado.recurso_categoria === 'equipamento') {
        [cancelamento] = await db.promise().query(
            `UPDATE reserva_equipamento
             SET estado = 'cancelada'
             WHERE id_reserva = ?
             AND u_id_utilizador = ?
             AND estado = 'ativa'`,
            [resultado.id_reserva, idUtilizador]
        );
    } else {
        throw new Error('Tipo de recurso nao suportado');
    }

    if (cancelamento.affectedRows === 0) {
        throw new Error('Reserva nao encontrada ou nao ativa');
    }
}

async function consultarDisponibilidade(resultado) {
    const { dataInicio, dataFim } = buildPeriodo(resultado);
    const erroPeriodo = validarPeriodo(dataInicio, dataFim);
    if (erroPeriodo) throw new Error(erroPeriodo);

    if (resultado.recurso_categoria === 'sala' || resultado.recurso_categoria === 'laboratorio') {
        const [disponiveis] = await db.promise().query(
            `SELECT
                s.id_sala,
                s.nome,
                s.piso
             FROM sala s
             WHERE s.disponibilidade = 1
             AND NOT EXISTS (
                SELECT 1
                FROM reserva_sala rs
                WHERE rs.s_id_sala = s.id_sala
                AND rs.estado = 'ativa'
                AND rs.data_inicio < ?
                AND rs.data_fim > ?
             )
             ORDER BY s.nome`,
            [dataFim, dataInicio]
        );

        return disponiveis;
    }

    if (resultado.recurso_categoria === 'equipamento') {
        const [disponiveis] = await db.promise().query(
            `SELECT
                e.tipo_equipamento,
                e.piso,
                e.estado
             FROM equipamento e
             WHERE NOT EXISTS (
                SELECT 1
                FROM reserva_equipamento re
                WHERE re.e_tipo_equipamento = e.tipo_equipamento
                AND re.estado = 'ativa'
                AND re.data_inicio < ?
                AND re.data_fim > ?
             )
             ORDER BY e.tipo_equipamento`,
            [dataFim, dataInicio]
        );

        return disponiveis;
    }

    throw new Error('Tipo de recurso nao suportado');
}

async function criarReserva(resultado, idUtilizador) {
    const { dataInicio, dataFim } = buildPeriodo(resultado);
    const erroPeriodo = validarPeriodo(dataInicio, dataFim);
    if (erroPeriodo) throw new Error(erroPeriodo);

    if (new Date(dataInicio) <= new Date()) {
        throw new Error('So e possivel fazer reservas para uma data e hora futuras');
    }

    if (resultado.recurso_categoria === 'sala' || resultado.recurso_categoria === 'laboratorio') {
        const [salas] = await db.promise().query(
            'SELECT id_sala FROM sala WHERE nome = ?',
            [resultado.recurso_nome]
        );

        if (salas.length === 0) {
            throw new Error('Sala nao encontrada: ' + resultado.recurso_nome);
        }

        const [reservasExistentes] = await db.promise().query(
            `SELECT id_reserva
             FROM reserva_sala
             WHERE s_id_sala = ?
             AND estado = 'ativa'
             AND data_inicio < ?
             AND data_fim > ?
             LIMIT 1`,
            [salas[0].id_sala, dataFim, dataInicio]
        );

        if (reservasExistentes.length > 0) {
            throw new Error('A sala ja esta reservada nesse horario');
        }

        const [reserva] = await db.promise().query(
            `INSERT INTO reserva_sala
             (u_id_utilizador, s_id_sala, data_inicio, data_fim, estado)
             VALUES (?, ?, ?, ?, 'ativa')`,
            [idUtilizador, salas[0].id_sala, dataInicio, dataFim]
        );

        return reserva;
    }

    if (resultado.recurso_categoria === 'equipamento') {
        const [equipamentos] = await db.promise().query(
            'SELECT tipo_equipamento FROM equipamento WHERE tipo_equipamento = ?',
            [resultado.recurso_nome]
        );

        if (equipamentos.length === 0) {
            throw new Error('Equipamento nao encontrado: ' + resultado.recurso_nome);
        }

        const [reservasExistentes] = await db.promise().query(
            `SELECT id_reserva
             FROM reserva_equipamento
             WHERE e_tipo_equipamento = ?
             AND estado = 'ativa'
             AND data_inicio < ?
             AND data_fim > ?
             LIMIT 1`,
            [equipamentos[0].tipo_equipamento, dataFim, dataInicio]
        );

        if (reservasExistentes.length > 0) {
            throw new Error('O equipamento ja esta reservado nesse horario');
        }

        const [reserva] = await db.promise().query(
            `INSERT INTO reserva_equipamento
             (u_id_utilizador, e_tipo_equipamento, data_inicio, data_fim, estado)
             VALUES (?, ?, ?, ?, 'ativa')`,
            [idUtilizador, equipamentos[0].tipo_equipamento, dataInicio, dataFim]
        );

        return reserva;
    }

    throw new Error('Tipo de recurso nao suportado');
}

const processarComando = async (req, res) => {
    const { comando } = req.body;

    if (!comando || comando.trim() === '') {
        return res.status(400).json({ erro: 'Comando vazio' });
    }

    try {
        const resultado = await callPythonLSS(comando);
        const idUtilizador = getUserId(req);

        if (!idUtilizador) {
            return res.status(401).json({ erro: 'Nao autenticado' });
        }

        if (resultado.tipo === 'consultar') {
            const { reservas, reservasSala, reservasEquipamento } = await consultarReservas(resultado, idUtilizador);

            return res.json({
                mensagem: 'Reservas encontradas',
                comando,
                resultado,
                reservas,
                reservas_sala: reservasSala,
                reservas_equipamento: reservasEquipamento
            });
        }

        if (resultado.tipo === 'cancelar') {
            await cancelarReserva(resultado, idUtilizador);

            return res.json({
                mensagem: 'Reserva cancelada',
                comando,
                resultado,
                id_reserva: resultado.id_reserva
            });
        }

        if (resultado.tipo === 'disponibilidade') {
            const disponiveis = await consultarDisponibilidade(resultado);

            return res.json({
                mensagem: 'Disponibilidade encontrada',
                comando,
                resultado,
                disponiveis
            });
        }

        if (resultado.tipo === 'reservar') {
            const reserva = await criarReserva(resultado, idUtilizador);

            return res.json({
                mensagem: 'Reserva efetuada',
                comando,
                resultado,
                id_reserva: reserva.insertId
            });
        }

        throw new Error('Comando nao suportado');
    } catch (err) {
        return res.status(400).json({ erro: err.message });
    }
};

module.exports = { processarComando };
