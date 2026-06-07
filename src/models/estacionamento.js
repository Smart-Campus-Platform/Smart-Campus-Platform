const db = require('../config/db');
const listarTodos = async () => {
    const [rows] = await db.promise().query('SELECT * FROM lugar_estacionamento ORDER BY parque, id_lugar');
    return rows;
};
const adicionar = async (id_lugar, parque) => {
    await db.promise().query('INSERT INTO lugar_estacionamento (id_lugar, parque) VALUES (?, ?)', [id_lugar, parque || null]);
};
const atualizar = async (id, parque) => {
    await db.promise().query('UPDATE lugar_estacionamento SET parque = ? WHERE id_lugar = ?', [parque, id]);
};
const remover = async (id) => {
    const conn = await db.promise().getConnection();
    try {
        await conn.beginTransaction();
        await conn.query(
            `DELETE ds FROM dados_sensor ds
             JOIN sensor s ON s.id_sensor = ds.s_id_sensor
             WHERE s.le_id_lugar = ?`,
            [id]
        );
        await conn.query('DELETE FROM sensor WHERE le_id_lugar = ?', [id]);
        await conn.query('DELETE FROM lugar_estacionamento WHERE id_lugar = ?', [id]);
        await conn.commit();
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};
const atualizarDisponibilidade = async (id, disponibilidade) => {
    await db.promise().query('UPDATE lugar_estacionamento SET disponibilidade = ? WHERE id_lugar = ?', [disponibilidade ? 1 : 0, id]);
};
module.exports = { listarTodos, adicionar, atualizar, remover, atualizarDisponibilidade };
