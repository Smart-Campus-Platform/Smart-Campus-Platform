const estacionamento = require('../models/estacionamento');
const listarEstacionamentos = async (req, res) => {
    try {
        const rows = await estacionamento.listarTodos();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ erro: 'Erro interno' });
    }
};
const adicionarLugar = async (req, res) => {
    const { id_lugar, parque } = req.body;
    if (!id_lugar) return res.status(400).json({ erro: 'ID do lugar é obrigatório' });
    try {
        await estacionamento.adicionar(id_lugar, parque);
        res.status(201).json({ mensagem: 'Lugar adicionado' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ erro: 'Lugar já existe' });
        res.status(500).json({ erro: 'Erro ao adicionar lugar' });
    }
};
const atualizarLugar = async (req, res) => {
    const { parque } = req.body;
    try {
        await estacionamento.atualizar(req.params.id, parque);
        res.json({ mensagem: 'Lugar atualizado' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao atualizar lugar' });
    }
};
const removerLugar = async (req, res) => {
    try {
        await estacionamento.remover(req.params.id);
        res.json({ mensagem: 'Lugar removido' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao remover lugar' });
    }
};
const atualizarDisponibilidadeLugar = async (req, res) => {
    const { disponibilidade } = req.body;
    try {
        await estacionamento.atualizarDisponibilidade(req.params.id, disponibilidade);
        res.json({ mensagem: 'Disponibilidade atualizada' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao atualizar disponibilidade' });
    }
};
module.exports = { listarEstacionamentos, adicionarLugar, atualizarLugar, removerLugar, atualizarDisponibilidadeLugar };
