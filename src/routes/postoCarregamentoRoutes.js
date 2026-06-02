const express = require("express"); //importar a biblioteca do express
const router = express.Router(); //criar um objeto router

const postoController = require("../controllers/postoCarregamentoController");


//as diferentes rotas necessárias
router.get("/postos-carregamento", postoController.listarPostos);
router.get("/postos-carregamento/areas", postoController.listarAreas);
router.post("/postos-carregamento", postoController.adicionarPosto);
router.put("/postos-carregamento/:id", postoController.atualizarPosto);
router.delete("/postos-carregamento/:id", postoController.removerPosto);
router.patch("/postos-carregamento/:id/disponibilidade", postoController.alterarDisponibilidade);

module.exports = router;