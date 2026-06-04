const equipamento = require('../models/equipamento');
const listarEquipamentos = async (req, res) => {
    const { data, horaInicio, horaFim } = req.query;
    try {
        const rows = await equipamento.listar(data, horaInicio, horaFim);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ erro: 'Erro interno' });
    }
};
const adicionarEquipamento = async (req, res) => {
    const { tipo_equipamento, piso } = req.body;
    if (!tipo_equipamento || piso === undefined) return res.status(400).json({ erro: 'Campos obrigatórios em falta' });
    try {
        await equipamento.adicionar(tipo_equipamento, piso);
        res.status(201).json({ mensagem: 'Equipamento adicionado' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ erro: 'Equipamento já existe' });
        res.status(500).json({ erro: 'Erro ao adicionar equipamento' });
    }
};
const atualizarEquipamento = async (req, res) => {
    const { novoTipo, piso } = req.body;
    try {
        await equipamento.atualizar(req.params.tipo, novoTipo, piso);
        res.json({ mensagem: 'Equipamento atualizado' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao atualizar equipamento' });
    }
};
const removerEquipamento = async (req, res) => {
    try {
        await equipamento.remover(req.params.tipo);
        res.json({ mensagem: 'Equipamento removido' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao remover equipamento' });
    }
};
const atualizarEstadoEquipamento = async (req, res) => {
    const { estado } = req.body;
    try {
        await equipamento.atualizarEstado(req.params.tipo, estado);
        res.json({ mensagem: 'Estado atualizado' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao atualizar estado' });
    }
};
module.exports = { listarEquipamentos, adicionarEquipamento, atualizarEquipamento, removerEquipamento, atualizarEstadoEquipamento };
