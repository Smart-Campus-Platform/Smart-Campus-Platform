const reservaSala = require('../models/reservaSala');
const { validarHorarioFaculdade } = require('../utils/horario');
function getUserId(req) {
    return parseInt(req.headers['x-user-id']) || null;
}
const listarReservasSalas = async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ erro: 'Não autenticado' });
    try {
        const rows = await reservaSala.listarPorUtilizador(userId);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ erro: 'Erro interno' });
    }
};
const listarTodasReservasSalas = async (req, res) => {
    try {
        const rows = await reservaSala.listarTodas();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ erro: 'Erro interno' });
    }
};
const criarReservaSala = async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ erro: 'Não autenticado' });
    const { salaId, dataInicio, dataFim } = req.body;
    if (!salaId || !dataInicio || !dataFim) return res.status(400).json({ erro: 'Campos obrigatórios em falta' });
    const erroHorario = validarHorarioFaculdade(dataInicio, dataFim);
    if (erroHorario) return res.status(400).json({ erro: erroHorario });
    try {
        const conflito = await reservaSala.verificarConflito(salaId, dataInicio, dataFim);
        if (conflito.length > 0) return res.status(409).json({ erro: 'Sala já reservada nesse período' });
        const result = await reservaSala.criar(userId, salaId, dataInicio, dataFim);
        res.status(201).json({ mensagem: 'Reserva efetuada', id: result.insertId });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao criar reserva' });
    }
};
const cancelarReservaSala = async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ erro: 'Não autenticado' });
    try {
        await reservaSala.cancelar(req.params.id, userId);
        res.json({ mensagem: 'Reserva cancelada' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao cancelar reserva' });
    }
};
const atualizarEstadoReservaSala = async (req, res) => {
    const { estado } = req.body;
    try {
        await reservaSala.atualizarEstado(req.params.id, estado);
        if (estado === 'confirmada') {
            const detalhes = await reservaSala.buscarDetalhesPorId(req.params.id);
            if (detalhes.length > 0) {
                await reservaSala.registarAcesso(detalhes[0].u_id_utilizador, detalhes[0].s_id_sala);
            }
        }
        res.json({ mensagem: 'Estado atualizado' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao atualizar estado' });
    }
};
module.exports = { listarReservasSalas, listarTodasReservasSalas, criarReservaSala, cancelarReservaSala, atualizarEstadoReservaSala };
