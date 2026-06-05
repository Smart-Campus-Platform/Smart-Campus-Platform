const db = require('../config/db');
const listarDisponiveis = async (tipo) => {
    let query = "SELECT * FROM mobilidade WHERE estado = 'disponivel'";
    const params = [];
    if (tipo) { query += ' AND tipo_mobilidade = ?'; params.push(tipo); }
    query += ' ORDER BY zona, codigo_mobilidade';
    const [rows] = await db.promise().query(query, params);
    return rows;
};

const listarTodas = async (tipo) => {
    let query = 'SELECT * FROM mobilidade';
    const params = [];
    if (tipo) { query += ' WHERE tipo_mobilidade = ?'; params.push(tipo); }
    query += ' ORDER BY zona, codigo_mobilidade';
    const [rows] = await db.promise().query(query, params);
    return rows;
};
const adicionar = async (codigo_mobilidade, tipo_mobilidade, zona) => {
    await db.promise().query(
        "INSERT INTO mobilidade (codigo_mobilidade, tipo_mobilidade, zona) VALUES (?, ?, ?)",
        [codigo_mobilidade, tipo_mobilidade, zona || null]
    );
};
const atualizar = async (codigo, zona, estado) => {
    await db.promise().query(
        'UPDATE mobilidade SET zona = ?, estado = ? WHERE codigo_mobilidade = ?',
        [zona, estado, codigo]
    );
};
const remover = async (codigo) => {
    await db.promise().query('DELETE FROM mobilidade WHERE codigo_mobilidade = ?', [codigo]);
};
const atualizarEstado = async (codigo, estado) => {
    await db.promise().query("UPDATE mobilidade SET estado = ? WHERE codigo_mobilidade = ?", [estado, codigo]);
};
module.exports = { listarDisponiveis, listarTodas, adicionar, atualizar, remover, atualizarEstado };
