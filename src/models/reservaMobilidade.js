const db = require('../config/db');
const listarPorUtilizador = async (userId) => {
    const [rows] = await db.promise().query(
        `SELECT rm.*, m.tipo_mobilidade, m.zona
         FROM reserva_mobilidade rm
         JOIN mobilidade m ON m.codigo_mobilidade = rm.m_codigo_mobilidade
         WHERE rm.u_id_utilizador = ?
         ORDER BY rm.inicio DESC`,
        [userId]
    );
    return rows;
};
const listarTodas = async () => {
    const [rows] = await db.promise().query(
        `SELECT rm.*, m.tipo_mobilidade, m.zona, u.nome AS utilizador_nome
         FROM reserva_mobilidade rm
         JOIN mobilidade m ON m.codigo_mobilidade = rm.m_codigo_mobilidade
         JOIN utilizador u ON u.id_utilizador = rm.u_id_utilizador
         ORDER BY rm.inicio DESC`
    );
    return rows;
};
const verificarConflito = async (codigoMobilidade) => {
    const [conflito] = await db.promise().query(
        "SELECT id_reserva_mobilidade FROM reserva_mobilidade WHERE m_codigo_mobilidade = ? AND estado = 'ativa'",
        [codigoMobilidade]
    );
    return conflito;
};
const criar = async (userId, codigoMobilidade, inicio, dataFim) => {
    const [result] = await db.promise().query(
        "INSERT INTO reserva_mobilidade (u_id_utilizador, m_codigo_mobilidade, inicio, fim, estado) VALUES (?, ?, ?, ?, 'ativa')",
        [userId, codigoMobilidade, inicio, dataFim || null]
    );
    return result;
};
const buscarPorId = async (id, userId) => {
    const [rows] = await db.promise().query(
        'SELECT m_codigo_mobilidade FROM reserva_mobilidade WHERE id_reserva_mobilidade = ? AND u_id_utilizador = ?',
        [id, userId]
    );
    return rows;
};
const concluir = async (id) => {
    await db.promise().query(
        "UPDATE reserva_mobilidade SET fim = NOW(), estado = 'concluida' WHERE id_reserva_mobilidade = ?",
        [id]
    );
};
const cancelar = async (id) => {
    await db.promise().query(
        "UPDATE reserva_mobilidade SET estado = 'cancelada' WHERE id_reserva_mobilidade = ?",
        [id]
    );
};
module.exports = { listarPorUtilizador, listarTodas, verificarConflito, criar, buscarPorId, concluir, cancelar };
