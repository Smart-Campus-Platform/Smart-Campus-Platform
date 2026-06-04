const db = require('../config/db');
const crypto = require('crypto');
function md5(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}
const buscarPorEmailEPassword = async (email, passwordHash) => {
    const [rows] = await db.promise().query(
        'SELECT id_utilizador, nome, email, tipo FROM utilizador WHERE email = ? AND password_encript = ? AND estado = 1',
        [email, passwordHash]
    );
    return rows;
};
const buscarPorId = async (id) => {
    const [rows] = await db.promise().query(
        'SELECT id_utilizador, nome, email, tipo, morada, NIF, contacto, estado FROM utilizador WHERE id_utilizador = ?',
        [id]
    );
    return rows;
};
const atualizarPerfil = async (id, nome, email, contacto, morada) => {
    await db.promise().query(
        'UPDATE utilizador SET nome = ?, email = ?, contacto = ?, morada = ? WHERE id_utilizador = ?',
        [nome, email, contacto, morada, id]
    );
};
const verificarPassword = async (id, passwordHash) => {
    const [rows] = await db.promise().query(
        'SELECT id_utilizador FROM utilizador WHERE id_utilizador = ? AND password_encript = ?',
        [id, passwordHash]
    );
    return rows;
};
const alterarPassword = async (id, novaPasswordHash) => {
    await db.promise().query(
        'UPDATE utilizador SET password_encript = ? WHERE id_utilizador = ?',
        [novaPasswordHash, id]
    );
};
const listarTodos = async () => {
    const [rows] = await db.promise().query(
        'SELECT id_utilizador, nome, email, tipo, morada, NIF, contacto, estado FROM utilizador ORDER BY id_utilizador'
    );
    return rows;
};
const registar = async (nome, email, password, tipo, morada, NIF, contacto, dataNascimento) => {
    const [result] = await db.promise().query(
        'INSERT INTO utilizador (nome, email, password_encript, tipo, morada, NIF, contacto, data_nascimento) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [nome, email, md5(password), tipo, morada, NIF, contacto, dataNascimento || null]
    );
    return result;
};
const atualizar = async (id, nome, email, tipo, morada, NIF, contacto) => {
    await db.promise().query(
        'UPDATE utilizador SET nome = ?, email = ?, tipo = ?, morada = ?, NIF = ?, contacto = ? WHERE id_utilizador = ?',
        [nome, email, tipo, morada, NIF, contacto, id]
    );
};
const remover = async (id) => {
    await db.promise().query('DELETE FROM acesso WHERE u_id_utilizador = ?', [id]);
    await db.promise().query('DELETE FROM reserva_sala WHERE u_id_utilizador = ?', [id]);
    await db.promise().query('DELETE FROM reserva_equipamento WHERE u_id_utilizador = ?', [id]);
    await db.promise().query('DELETE FROM reserva_mobilidade WHERE u_id_utilizador = ?', [id]);
    await db.promise().query('DELETE FROM utilizador WHERE id_utilizador = ?', [id]);
};
const atualizarEstado = async (id, estado) => {
    await db.promise().query('UPDATE utilizador SET estado = ? WHERE id_utilizador = ?', [estado ? 1 : 0, id]);
};
module.exports = {
    md5,
    buscarPorEmailEPassword,
    buscarPorId,
    atualizarPerfil,
    verificarPassword,
    alterarPassword,
    listarTodos,
    registar,
    atualizar,
    remover,
    atualizarEstado
};
