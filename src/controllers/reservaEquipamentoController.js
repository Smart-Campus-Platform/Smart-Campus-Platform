const reservaEquipamento = require('../models/reservaEquipamento');
function getUserId(req) {
    return parseInt(req.headers['x-user-id']) || null;
}
const listarReservasEquipamentos = async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ erro: 'Não autenticado' });
    try {
        const rows = await reservaEquipamento.listarPorUtilizador(userId);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ erro: 'Erro interno' });
    }
};
const listarTodasReservasEquipamentos = async (req, res) => {
    try {
        const rows = await reservaEquipamento.listarTodas();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ erro: 'Erro interno' });
    }
};
const criarReservaEquipamento = async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ erro: 'Não autenticado' });
    const { tipoEquipamento, dataInicio, dataFim } = req.body;
    if (!tipoEquipamento || !dataInicio || !dataFim) return res.status(400).json({ erro: 'Campos obrigatórios em falta' });
    try {
        const conflito = await reservaEquipamento.verificarConflito(tipoEquipamento, dataInicio, dataFim);
        if (conflito.length > 0) return res.status(409).json({ erro: 'Equipamento já reservado nesse período' });
        const result = await reservaEquipamento.criar(userId, tipoEquipamento, dataInicio, dataFim);
        res.status(201).json({ mensagem: 'Reserva efetuada', id: result.insertId });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao criar reserva' });
    }
};
const cancelarReservaEquipamento = async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ erro: 'Não autenticado' });
    try {
        await reservaEquipamento.cancelar(req.params.id, userId);
        res.json({ mensagem: 'Reserva cancelada' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao cancelar reserva' });
    }
};
module.exports = { listarReservasEquipamentos, listarTodasReservasEquipamentos, criarReservaEquipamento, cancelarReservaEquipamento };
