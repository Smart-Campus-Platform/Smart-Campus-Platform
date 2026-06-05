const reservaMobilidade = require('../models/reservaMobilidade');
const mobilidade = require('../models/mobilidade');
const { validarHorarioFaculdade } = require('../utils/horario');
function getUserId(req) {
    return parseInt(req.headers['x-user-id']) || null;
}
const listarReservasMobilidade = async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ erro: 'Não autenticado' });
    try {
        const rows = await reservaMobilidade.listarPorUtilizador(userId);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ erro: 'Erro interno' });
    }
};
const listarTodasReservasMobilidade = async (req, res) => {
    try {
        const rows = await reservaMobilidade.listarTodas();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ erro: 'Erro interno' });
    }
};
const criarReservaMobilidade = async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ erro: 'Não autenticado' });
    const { codigoMobilidade, dataInicio, dataFim } = req.body;
    if (!codigoMobilidade) return res.status(400).json({ erro: 'Campos obrigatórios em falta' });
    const inicioEfetivo = dataInicio || new Date().toISOString().slice(0, 19).replace('T', ' ');
    const erroHorario = validarHorarioFaculdade(inicioEfetivo, dataFim || null);
    if (erroHorario) return res.status(400).json({ erro: erroHorario });
    try {
        const conflito = await reservaMobilidade.verificarConflito(codigoMobilidade);
        if (conflito.length > 0) return res.status(409).json({ erro: 'Veículo já em uso' });
        const result = await reservaMobilidade.criar(userId, codigoMobilidade, inicioEfetivo, dataFim);
        await mobilidade.atualizarEstado(codigoMobilidade, 'em_uso');
        res.status(201).json({ mensagem: 'Veículo reservado', id: result.insertId });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao reservar veículo' });
    }
};
const devolverVeiculo = async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ erro: 'Não autenticado' });
    try {
        const rows = await reservaMobilidade.buscarPorId(req.params.id, userId);
        if (rows.length === 0) return res.status(404).json({ erro: 'Reserva não encontrada' });
        await reservaMobilidade.concluir(req.params.id);
        await mobilidade.atualizarEstado(rows[0].m_codigo_mobilidade, 'disponivel');
        res.json({ mensagem: 'Veículo devolvido' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao devolver veículo' });
    }
};
const cancelarReservaMobilidade = async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ erro: 'Não autenticado' });
    try {
        const rows = await reservaMobilidade.buscarPorId(req.params.id, userId);
        if (rows.length === 0) return res.status(404).json({ erro: 'Reserva não encontrada' });
        await reservaMobilidade.cancelar(req.params.id);
        await mobilidade.atualizarEstado(rows[0].m_codigo_mobilidade, 'disponivel');
        res.json({ mensagem: 'Reserva cancelada' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao cancelar reserva' });
    }
};
module.exports = { listarReservasMobilidade, listarTodasReservasMobilidade, criarReservaMobilidade, devolverVeiculo, cancelarReservaMobilidade };
