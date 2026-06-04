const sensor = require('../models/sensor');
const listarTiposSensor = async (req, res) => {
    try {
        const rows = await sensor.listarTipos();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ erro: 'Erro interno' });
    }
};
const adicionarTipoSensor = async (req, res) => {
    const { nome, unidade } = req.body;
    if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório' });
    try {
        const result = await sensor.adicionarTipo(nome, unidade);
        res.status(201).json({ mensagem: 'Tipo criado', id: result.insertId });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao criar tipo de sensor' });
    }
};
const listarSensores = async (req, res) => {
    const { tipo } = req.query;
    try {
        const rows = await sensor.listar(tipo);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ erro: 'Erro interno' });
    }
};
const adicionarSensor = async (req, res) => {
    const { tipoSensorId, salaId, lugarId, postoId, limiteMin, limiteMax } = req.body;
    try {
        const duplicado = await sensor.existeDuplicado(tipoSensorId, salaId, lugarId, postoId);
        if (duplicado) return res.status(409).json({ erro: 'Já existe um sensor deste tipo nesta localização.' });
        const result = await sensor.adicionar(tipoSensorId, salaId, lugarId, postoId, limiteMin, limiteMax);
        res.status(201).json({ mensagem: 'Sensor adicionado', id: result.insertId });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao adicionar sensor' });
    }
};
const atualizarSensor = async (req, res) => {
    const { tipoSensorId, salaId, lugarId, postoId, limiteMin, limiteMax } = req.body;
    try {
        const duplicado = await sensor.existeDuplicado(tipoSensorId, salaId, lugarId, postoId, req.params.id);
        if (duplicado) return res.status(409).json({ erro: 'Já existe um sensor deste tipo nesta localização.' });
        await sensor.atualizar(req.params.id, tipoSensorId, salaId, lugarId, postoId, limiteMin, limiteMax);
        res.json({ mensagem: 'Sensor atualizado' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao atualizar sensor' });
    }
};
const removerSensor = async (req, res) => {
    try {
        await sensor.remover(req.params.id);
        res.json({ mensagem: 'Sensor removido' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao remover sensor' });
    }
};
const atualizarEstadoSensor = async (req, res) => {
    const { estado } = req.body;
    try {
        await sensor.atualizarEstado(req.params.id, estado);
        res.json({ mensagem: 'Estado atualizado' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao atualizar estado' });
    }
};
const listarDadosSensor = async (req, res) => {
    try {
        const rows = await sensor.listarDados(req.params.id);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ erro: 'Erro interno' });
    }
};
const dashboardSensores = async (req, res) => {
    try {
        const rows = await sensor.listarParaDashboard();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ erro: 'Erro interno' });
    }
};
const relatoriosSensores = async (req, res) => {
    try {
        const dados = await sensor.obterDadosRelatorios();
        res.json(dados);
    } catch (err) {
        res.status(500).json({ erro: 'Erro interno' });
    }
};
const listarAlertas = async (req, res) => {
    try {
        const rows = await sensor.listarAlertas();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ erro: 'Erro interno' });
    }
};
module.exports = { listarTiposSensor, adicionarTipoSensor, listarSensores, adicionarSensor, atualizarSensor, removerSensor, atualizarEstadoSensor, listarDadosSensor, dashboardSensores, relatoriosSensores, listarAlertas };
