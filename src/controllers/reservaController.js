
const reserva = require('../models/reserva');
const listarTodasReservas = async (req, res) => {
    try {
        const todas = await reserva.listarTodas();
        res.json(todas);
    } catch (err) {
        res.status(500).json({ erro: 'Erro interno' });
    }
};
module.exports = { listarTodasReservas };