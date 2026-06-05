const express = require('express');
const router = express.Router();
const lssController = require('../controllers/lssController');
router.post('/lss', lssController.processarComando);
module.exports = router;
