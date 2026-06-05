const express = require('express');
const router = express.Router();
const estacionamentoController = require('../controllers/estacionamentoController');
router.get('/estacionamentos', estacionamentoController.listarEstacionamentos);
router.post('/estacionamentos', estacionamentoController.adicionarLugar);
router.put('/estacionamentos/:id', estacionamentoController.atualizarLugar);
router.delete('/estacionamentos/:id', estacionamentoController.removerLugar);
router.patch('/estacionamentos/:id/disponibilidade', estacionamentoController.atualizarDisponibilidadeLugar);

module.exports = router;
