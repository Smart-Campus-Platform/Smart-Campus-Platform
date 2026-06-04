const express = require('express');
const router = express.Router();
const relatorioController = require('../controllers/relatorioController');
router.post('/relatorios/gerar', relatorioController.gerarPDF);
module.exports = router;
