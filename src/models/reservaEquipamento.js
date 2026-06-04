const db = require('../config/db');
const listarPorUtilizador = async (userId) => {
    const [rows] = await db.promise().query(
        `SELECT re.*, e.piso
         FROM reserva_equipamento re
         JOIN equipamento e ON e.tipo_equipamento = re.e_tipo_equipamento
         WHERE re.u_id_utilizador = ?
         ORDER BY re.data_inicio DESC`,
        [userId]
    );
    return rows;
};
const listarTodas = async () => {
    const [rows] = await db.promise().query(
        `SELECT re.*, u.nome AS utilizador_nome, u.email
         FROM reserva_equipamento re
         JOIN utilizador u ON u.id_utilizador = re.u_id_utilizador
         ORDER BY re.data_inicio DESC`
    );
    return rows;
};
const verificarConflito = async (tipoEquipamento, dataInicio, dataFim) => {
    const [conflito] = await db.promise().query(
        `SELECT id_reserva FROM reserva_equipamento
         WHERE e_tipo_equipamento = ? AND estado = 'ativa' AND data_inicio < ? AND data_fim > ?`,
        [tipoEquipamento, dataFim, dataInicio]
    );
    return conflito;
};
const criar = async (userId, tipoEquipamento, dataInicio, dataFim) => {
    const [result] = await db.promise().query(
        'INSERT INTO reserva_equipamento (u_id_utilizador, e_tipo_equipamento, data_inicio, data_fim) VALUES (?, ?, ?, ?)',
        [userId, tipoEquipamento, dataInicio, dataFim]
    );
    return result;
};
const cancelar = async (id, userId) => {
    await db.promise().query(
        "UPDATE reserva_equipamento SET estado = 'cancelada' WHERE id_reserva = ? AND u_id_utilizador = ?",
        [id, userId]
    );
};
module.exports = { listarPorUtilizador, listarTodas, verificarConflito, criar, cancelar };
