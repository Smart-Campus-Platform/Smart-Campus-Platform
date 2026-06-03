const express = require('express');
const router = express.Router();

const mobilidadeController = require('../controllers/mobilidadeController');

router.get('/mobilidade', mobilidadeController.listarMobilidade);
router.get('/mobilidade/todas', mobilidadeController.listarTodaMobilidade);
router.post('/mobilidade', mobilidadeController.adicionarVeiculo);
router.put('/mobilidade/:codigo', mobilidadeController.atualizarVeiculo);
router.delete('/mobilidade/:codigo', mobilidadeController.removerVeiculo);

module.exports = router;
