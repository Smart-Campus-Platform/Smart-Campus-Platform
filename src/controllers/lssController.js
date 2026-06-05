const { spawn } = require('child_process');
const db = require('../config/db');
const { validarHorarioFaculdade } = require('../utils/horario');
function getUserId(req) {
    return parseInt(req.headers['x-user-id']) || null;
}
function callPythonLSS(comando) {
    return new Promise((resolve, reject) => {
        const python = spawn('py', ['compiladores/main.py', comando]);
        let output = '';
        let error = '';
        python.stdout.on('data', (data) => { output += data.toString(); });
        python.stderr.on('data', (data) => { error += data.toString(); });
        python.on('close', (code) => {
            if (code !== 0) { reject(new Error(error || 'Erro ao executar comando')); return; }
            try { resolve(JSON.parse(output)); } catch { reject(new Error('Python não devolveu JSON válido')); }
        });
    });
}
const processarComando = async (req, res) => {
    const { comando } = req.body;
    const userId = getUserId(req);
    if (!comando || comando.trim() === '') return res.status(400).json({ erro: 'Comando vazio' });
    try {
        const resultado = await callPythonLSS(comando);
        const [salas] = await db.promise().query('SELECT id_sala FROM sala WHERE nome = ?', [resultado.recurso_nome]);
        if (salas.length === 0) throw new Error('Sala não encontrada: ' + resultado.recurso_nome);
        const sala = salas[0];
        const dataInicio = `${resultado.data} ${resultado.inicio}:00`;
        const dataFim = `${resultado.data} ${resultado.fim}:00`;
        const erroHorario = validarHorarioFaculdade(dataInicio, dataFim);
        if (erroHorario) return res.status(400).json({ erro: erroHorario });
        const idUtilizador = userId || (await db.promise().query("SELECT id_utilizador FROM utilizador LIMIT 1"))[0][0]?.id_utilizador;
        if (!idUtilizador) throw new Error('Utilizador não encontrado');
        const [reserva] = await db.promise().query(
            'INSERT INTO reserva_sala (u_id_utilizador, s_id_sala, data_inicio, data_fim) VALUES (?, ?, ?, ?)',
            [idUtilizador, sala.id_sala, dataInicio, dataFim]
        );
        res.json({ mensagem: 'Reserva efetuada', comando, resultado, id_reserva: reserva.insertId });
    } catch (err) {
        res.status(400).json({ erro: err.message });
    }
};
module.exports = { processarComando };
