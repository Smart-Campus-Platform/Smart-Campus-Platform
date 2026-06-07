const db = require('../config/db');
const listarDisponiveis = async (data, horaInicio, horaFim, tipo) => {
    let query = 'SELECT * FROM sala WHERE disponibilidade = 1';
    const params = [];
    if (tipo && tipo !== 'Todos') {
        query += ' AND tipo = ?';
        params.push(tipo);
    }
    if (data && horaInicio && horaFim) {
        const inicio = `${data} ${horaInicio}:00`;
        const fim = `${data} ${horaFim}:00`;
        query += ` AND id_sala NOT IN (
            SELECT s_id_sala FROM reserva_sala
            WHERE estado = 'ativa' AND data_inicio < ? AND data_fim > ?
        )`;
        params.push(fim, inicio);
    }
    query += ' ORDER BY piso, nome';
    const [rows] = await db.promise().query(query, params);
    return rows;
};
const listarTodas = async () => {
    const [rows] = await db.promise().query('SELECT * FROM sala ORDER BY piso, nome');
    return rows;
};
const adicionar = async (nome, tipo, piso, capacidade, disponibilidade) => {
    const [[{ maxId }]] = await db.promise().query('SELECT COALESCE(MAX(id_sala), 0) + 1 AS maxId FROM sala');
    const disp = disponibilidade === undefined ? 1 : (disponibilidade ? 1 : 0);
    await db.promise().query(
        'INSERT INTO sala (id_sala, nome, tipo, piso, capacidade, disponibilidade) VALUES (?, ?, ?, ?, ?, ?)',
        [maxId, nome, tipo, piso, capacidade || null, disp]
    );
    return maxId;
};
const atualizar = async (id, nome, tipo, piso, capacidade) => {
    await db.promise().query(
        'UPDATE sala SET nome = ?, tipo = ?, piso = ?, capacidade = ? WHERE id_sala = ?',
        [nome, tipo, piso, capacidade || null, id]
    );
};
const remover = async (id) => {
    const conn = await db.promise().getConnection();
    try {
        await conn.beginTransaction();
        await conn.query(
            `DELETE ds FROM dados_sensor ds
             JOIN sensor s ON s.id_sensor = ds.s_id_sensor
             WHERE s.s_id_sala = ?`,
            [id]
        );
        await conn.query('DELETE FROM sensor WHERE s_id_sala = ?', [id]);
        await conn.query('DELETE FROM sala WHERE id_sala = ?', [id]);
        await conn.commit();
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};
const atualizarDisponibilidade = async (id, disponibilidade) => {
    await db.promise().query('UPDATE sala SET disponibilidade = ? WHERE id_sala = ?', [disponibilidade ? 1 : 0, id]);
};
module.exports = { listarDisponiveis, listarTodas, adicionar, atualizar, remover, atualizarDisponibilidade };
