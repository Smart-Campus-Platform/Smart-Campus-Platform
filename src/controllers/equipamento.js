const db = require('../config/db');
const listar = async (data, horaInicio, horaFim) => {
    let query = 'SELECT * FROM equipamento';
    const params = [];
    if (data && horaInicio && horaFim) {
        const inicio = `${data} ${horaInicio}:00`;
        const fim = `${data} ${horaFim}:00`;
        query += ` WHERE tipo_equipamento NOT IN (
            SELECT e_tipo_equipamento FROM reserva_equipamento
            WHERE estado = 'ativa' AND data_inicio < ? AND data_fim > ?
        )`;
        params.push(fim, inicio);
    }
    query += ' ORDER BY piso, tipo_equipamento';
    const [rows] = await db.promise().query(query, params);
    return rows;
};
const adicionar = async (tipo_equipamento, piso) => {
    await db.promise().query('INSERT INTO equipamento (tipo_equipamento, piso) VALUES (?, ?)', [tipo_equipamento, piso]);
};
const atualizar = async (tipo, novoTipo, piso) => {
    await db.promise().query(
        'UPDATE equipamento SET tipo_equipamento = ?, piso = ? WHERE tipo_equipamento = ?',
        [novoTipo || tipo, piso, tipo]
    );
};
const remover = async (tipo) => {
    await db.promise().query('DELETE FROM equipamento WHERE tipo_equipamento = ?', [tipo]);
};
const atualizarEstado = async (tipo, estado) => {
    await db.promise().query('UPDATE equipamento SET estado = ? WHERE tipo_equipamento = ?', [estado ? 1 : 0, tipo]);
};
module.exports = { listar, adicionar, atualizar, remover, atualizarEstado };
