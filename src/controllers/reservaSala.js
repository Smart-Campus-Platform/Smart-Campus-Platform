const db = require('../config/db');
const listarPorUtilizador = async (userId) => {
    const [rows] = await db.promise().query(
        `SELECT rs.*, s.nome AS sala_nome, s.piso
         FROM reserva_sala rs
         JOIN sala s ON s.id_sala = rs.s_id_sala
         WHERE rs.u_id_utilizador = ?
         ORDER BY rs.data_inicio DESC`,
        [userId]
    );
    return rows;
};
const listarTodas = async () => {
    const [rows] = await db.promise().query(
        `SELECT rs.*, s.nome AS sala_nome, u.nome AS utilizador_nome, u.email
         FROM reserva_sala rs
         JOIN sala s ON s.id_sala = rs.s_id_sala
         JOIN utilizador u ON u.id_utilizador = rs.u_id_utilizador
         ORDER BY rs.data_inicio DESC`
    );
    return rows;
};
const verificarConflito = async (salaId, dataInicio, dataFim) => {
    const [conflito] = await db.promise().query(
        `SELECT id_reserva FROM reserva_sala
         WHERE s_id_sala = ? AND estado = 'ativa' AND data_inicio < ? AND data_fim > ?`,
        [salaId, dataFim, dataInicio]
    );
    return conflito;
};
const criar = async (userId, salaId, dataInicio, dataFim) => {
    const [result] = await db.promise().query(
        'INSERT INTO reserva_sala (u_id_utilizador, s_id_sala, data_inicio, data_fim) VALUES (?, ?, ?, ?)',
        [userId, salaId, dataInicio, dataFim]
    );
    return result;
};
const cancelar = async (id, userId) => {
    await db.promise().query(
        "UPDATE reserva_sala SET estado = 'cancelada' WHERE id_reserva = ? AND u_id_utilizador = ?",
        [id, userId]
    );
};
const atualizarEstado = async (id, estado) => {
    await db.promise().query('UPDATE reserva_sala SET estado = ? WHERE id_reserva = ?', [estado, id]);
};
const buscarDetalhesPorId = async (id) => {
    const [rows] = await db.promise().query(
        'SELECT u_id_utilizador, s_id_sala FROM reserva_sala WHERE id_reserva = ?',
        [id]
    );
    return rows;
};
const registarAcesso = async (userId, salaId) => {
    await db.promise().query(
        'INSERT INTO acesso (u_id_utilizador, s_id_sala, data_acesso) VALUES (?, ?, NOW())',
        [userId, salaId]
    );
};
module.exports = { listarPorUtilizador, listarTodas, verificarConflito, criar, cancelar, atualizarEstado, buscarDetalhesPorId, registarAcesso };
