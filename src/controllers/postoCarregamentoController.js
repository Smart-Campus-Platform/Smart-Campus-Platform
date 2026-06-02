const posto = require("../models/postoCarregamento");

const listarPostos = async (req, res) => {
    try{
        const postos = await posto.listarPostos();
        res.json(postos);
    } catch (erro){
        res.status(500).json({erro: "Erro ao listar postos"});
    }
};

const listarAreas = async (req, res) => {
    try {
        const areas = await posto.listarAreas();
        res.json(areas);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao listar áreas" });
    }
};

const adicionarPosto = async (req, res) => {
    try {
        const { id_posto, area } = req.body;

        if (!id_posto || id_posto.trim() === "" || !area || area.trim() === "") {
            return res.status(400).json({
                erro: "ID do posto e área são obrigatórios"
            });
        }

        await posto.adicionarPosto(id_posto.trim(), area.trim());

        res.status(201).json({
            mensagem: "Posto adicionado com sucesso"
        });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao adicionar posto" });
    }
};

const atualizarPosto = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_posto, area } = req.body;

        if (!id_posto || id_posto.trim() === "" || !area || area.trim() === "") {
            return res.status(400).json({
                erro: "Novo ID do posto e área são obrigatórios"
            });
        }

        await posto.atualizarPosto(id, id_posto.trim(), area.trim());

        res.json({ mensagem: "Posto atualizado com sucesso" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao atualizar posto" });
    }
};

const removerPosto = async (req, res) => {
    try {
        const { id } = req.params;

        await posto.removerPosto(id);

        res.json({ mensagem: "Posto removido com sucesso" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao remover posto" });
    }
};

const alterarDisponibilidade = async (req, res) => {
    try {
        const { id } = req.params;
        const { disponibilidade } = req.body;

        await posto.alterarDisponibilidadeManual(id, disponibilidade);

        res.json({ mensagem: "Disponibilidade atualizada com sucesso" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao alterar disponibilidade" });
    }
};

const carregarPosto = async (req, res) => {
    try {
        const { id } = req.params;
        const kwh = Number(req.body.kwh);

        if (!kwh || kwh <= 0) {
            return res.status(400).json({
                erro: "Numero de kWh invalido"
            });
        }

        const carregamento = await posto.registarCarregamento(id, kwh);

        res.status(201).json({
            mensagem: "Carregamento efetuado com sucesso",
            carregamento
        });
    } catch (erro) {
        res.status(erro.status || 500).json({
            erro: erro.status ? erro.message : "Erro ao efetuar carregamento"
        });
    }
};

module.exports = {
    listarPostos,
    listarAreas,
    adicionarPosto,
    atualizarPosto,
    removerPosto,
    alterarDisponibilidade,
    carregarPosto
};
