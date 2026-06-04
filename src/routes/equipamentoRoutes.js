const express = require('express');
const router = express.Router();
const equipamentoController = require('../controllers/equipamentoController');
router.get('/equipamentos', equipamentoController.listarEquipamentos);
router.post('/equipamentos', equipamentoController.adicionarEquipamento);
router.put('/equipamentos/:tipo', equipamentoController.atualizarEquipamento);
router.delete('/equipamentos/:tipo', equipamentoController.removerEquipamento);
router.patch('/equipamentos/:tipo/estado', equipamentoController.atualizarEstadoEquipamento);
module.exports = router;
