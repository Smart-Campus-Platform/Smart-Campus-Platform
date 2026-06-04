const dashboard = require('../models/dashboard');
const obterDashboard = async (req, res) => {
    try {
        const stats = await dashboard.obterEstatisticas();
        res.json(stats);
    } catch (err) {
        res.status(500).json({ erro: 'Erro interno' });
    }
};
module.exports = { obterDashboard };
