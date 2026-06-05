const mobilidade = require('../models/mobilidade');


const listarMobilidade = async (req, res) => {
    const { tipo } = req.query;
    try {
        const rows = await mobilidade.listarDisponiveis(tipo);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ erro: 'Erro interno' });
    }
};

const listarTodaMobilidade = async (req, res) => {
    const { tipo } = req.query;
    try {
        const rows = await mobilidade.listarTodas(tipo);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ erro: 'Erro interno' });
    }
};

const adicionarVeiculo = async (req, res) => {
    const { codigo_mobilidade, tipo_mobilidade, zona } = req.body;
    if (!codigo_mobilidade || !tipo_mobilidade) return res.status(400).json({ erro: 'Campos obrigatórios em falta' });
    try {
        await mobilidade.adicionar(codigo_mobilidade, tipo_mobilidade, zona);
        res.status(201).json({ mensagem: 'Veículo adicionado' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ erro: 'Código já existe' });
        res.status(500).json({ erro: 'Erro ao adicionar veículo' });
    }
};

const atualizarVeiculo = async (req, res) => {
    const { zona, estado } = req.body;
    try {
        await mobilidade.atualizar(req.params.codigo, zona, estado);
        res.json({ mensagem: 'Veículo atualizado' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao atualizar veículo' });
    }
};

const removerVeiculo = async (req, res) => {
    try {
        await mobilidade.remover(req.params.codigo);
        res.json({ mensagem: 'Veículo removido' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao remover veículo' });
    }
};
module.exports = { listarMobilidade, listarTodaMobilidade, adicionarVeiculo, atualizarVeiculo, removerVeiculo };
