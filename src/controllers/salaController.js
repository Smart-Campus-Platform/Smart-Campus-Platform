const sala = require('../models/sala');
const listarSalas = async (req, res) => {
    const { data, horaInicio, horaFim, tipo } = req.query;
    try {
        const rows = await sala.listarDisponiveis(data, horaInicio, horaFim, tipo);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro interno' });
    }
};
const listarTodasSalas = async (req, res) => {
    try {
        const rows = await sala.listarTodas();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ erro: 'Erro interno' });
    }
};
const adicionarSala = async (req, res) => {
    const { nome, tipo, piso, capacidade, disponibilidade } = req.body;
    if (!nome || !tipo || piso === undefined) return res.status(400).json({ erro: 'Campos obrigatórios em falta' });
    try {
        const id = await sala.adicionar(nome, tipo, piso, capacidade, disponibilidade);
        res.status(201).json({ mensagem: 'Sala adicionada', id });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao adicionar sala' });
    }
};
const atualizarSala = async (req, res) => {
    const { nome, tipo, piso, capacidade } = req.body;
    try {
        await sala.atualizar(req.params.id, nome, tipo, piso, capacidade);
        res.json({ mensagem: 'Sala atualizada' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao atualizar sala' });
    }
};
const removerSala = async (req, res) => {
    try {
        await sala.remover(req.params.id);
        res.json({ mensagem: 'Sala removida' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao remover sala' });
    }
};
const atualizarDisponibilidadeSala = async (req, res) => {
    const { disponibilidade } = req.body;
    try {
        await sala.atualizarDisponibilidade(req.params.id, disponibilidade);
        res.json({ mensagem: 'Disponibilidade atualizada' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao atualizar disponibilidade' });
    }
};
module.exports = { listarSalas, listarTodasSalas, adicionarSala, atualizarSala, removerSala, atualizarDisponibilidadeSala };
