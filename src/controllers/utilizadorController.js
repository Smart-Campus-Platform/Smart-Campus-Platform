const utilizador = require('../models/utilizador');
const redirectPorTipo = {
    'admin': '/menu-administrador',
    'docente': '/menu-docente',
    'funcionario': '/menu-funcionario',
    'funcionário': '/menu-funcionario',
    'estudante': '/menu-utilizador',
    'aluno': '/menu-utilizador'
};
function getUserId(req) {
    return parseInt(req.headers['x-user-id']) || null;
}
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ erro: 'Email e password são obrigatórios' });
    try {
        const rows = await utilizador.buscarPorEmailEPassword(email, utilizador.md5(password));
        if (rows.length === 0) return res.status(401).json({ erro: 'Email ou password incorretos' });
        const u = rows[0];
        const redirecionar = redirectPorTipo[u.tipo] || '/menu-utilizador';
        res.json({
            mensagem: 'Login bem-sucedido',
            utilizador: { id: u.id_utilizador, nome: u.nome, email: u.email, tipo: u.tipo },
            redirecionar
        });
    } catch (err) {
        console.error('Erro no login:', err);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};
const getMe = async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ erro: 'Não autenticado' });
    try {
        const rows = await utilizador.buscarPorId(userId);
        if (rows.length === 0) return res.status(404).json({ erro: 'Utilizador não encontrado' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ erro: 'Erro interno' });
    }
};
const updateMe = async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ erro: 'Não autenticado' });
    const { nome, email, contacto, morada } = req.body;
    try {
        await utilizador.atualizarPerfil(userId, nome, email, contacto, morada);
        res.json({ mensagem: 'Perfil atualizado' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao atualizar perfil' });
    }
};
const changePassword = async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ erro: 'Não autenticado' });
    const { passwordAtual, passwordNova } = req.body;
    if (!passwordAtual || !passwordNova) return res.status(400).json({ erro: 'Campos obrigatórios em falta' });
    try {
        const rows = await utilizador.verificarPassword(userId, utilizador.md5(passwordAtual));
        if (rows.length === 0) return res.status(400).json({ erro: 'Password atual incorreta' });
        await utilizador.alterarPassword(userId, utilizador.md5(passwordNova));
        res.json({ mensagem: 'Password alterada com sucesso' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao alterar password' });
    }
};
const listarUtilizadores = async (req, res) => {
    try {
        const rows = await utilizador.listarTodos();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ erro: 'Erro interno' });
    }
};
const registarUtilizador = async (req, res) => {
    const { nome, email, password, tipo, morada, NIF, contacto, dataNascimento } = req.body;
    if (!nome || !email || !password || !tipo || !morada || !NIF || !contacto)
        return res.status(400).json({ erro: 'Campos obrigatórios em falta' });
    try {
        const result = await utilizador.registar(nome, email, password, tipo, morada, NIF, contacto, dataNascimento || null);
        res.status(201).json({ mensagem: 'Utilizador registado', id: result.insertId });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ erro: 'Email ou NIF já existe' });
        res.status(500).json({ erro: 'Erro ao registar utilizador' });
    }
};
const atualizarUtilizador = async (req, res) => {
    const { nome, email, tipo, morada, NIF, contacto } = req.body;
    try {
        await utilizador.atualizar(req.params.id, nome, email, tipo, morada, NIF, contacto);
        res.json({ mensagem: 'Utilizador atualizado' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao atualizar utilizador' });
    }
};
const removerUtilizador = async (req, res) => {
    try {
        await utilizador.remover(req.params.id);
        res.json({ mensagem: 'Utilizador removido' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao remover utilizador' });
    }
};
const atualizarEstadoUtilizador = async (req, res) => {
    const { estado } = req.body;
    try {
        await utilizador.atualizarEstado(req.params.id, estado);
        res.json({ mensagem: 'Estado atualizado' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao atualizar estado' });
    }
};
module.exports = {
    login,
    getMe,
    updateMe,
    changePassword,
    listarUtilizadores,
    registarUtilizador,
    atualizarUtilizador,
    removerUtilizador,
    atualizarEstadoUtilizador
};
