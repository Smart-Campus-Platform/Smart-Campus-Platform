let postoSelecionado = null;
let temporizadorCarregamento = null;

async function carregarPostosUtilizador() {
    try {
        const resposta = await fetch("/api/postos-carregamento");

        if (!resposta.ok) {
            const dados = await resposta.json();
            throw new Error(dados.erro || "Erro ao carregar postos.");
        }

        const postos = await resposta.json();

        const listaPostos = document.getElementById("lista-postos-carregamento");
        listaPostos.innerHTML = "";

        const postosPorArea = agruparPostosPorArea(postos);

        const areas = Object.keys(postosPorArea);

        for (let i = 0; i < areas.length; i++) {
            const area = areas[i];

            listaPostos.appendChild(
                criarElementoArea(area, postosPorArea[area], i)
    );
}
    } catch (erro) {
        alert(erro.message);
    }
}

function agruparPostosPorArea(postos) {
    const postosPorArea = {};

    postos.forEach(function(posto) {
        if (!postosPorArea[posto.area]) {
            postosPorArea[posto.area] = [];
        }

        postosPorArea[posto.area].push(posto);
    });

    return postosPorArea;
}

function criarElementoArea(area, postos, indiceArea) {
    const idArea = "area-postos-" + indiceArea;
    const areaElemento = document.createElement("div");
    areaElemento.className = "piso";

    areaElemento.innerHTML =
        "<div class=\"titulo-piso\" onclick=\"toggleSalas('" + idArea + "', this)\">" +
        "    <span class=\"seta-piso\">&#9656;</span>" +
        "    <span>" + area + "</span>" +
        "</div>" +
        "<div class=\"salas\" id=\"" + idArea + "\">" +
        postos.map(function(posto) {
            return criarHtmlPosto(posto);
        }).join("") +
        "</div>";

    return areaElemento;
}

function criarHtmlPosto(posto) {
    const disponivel = posto.disponibilidade === 1 || posto.disponibilidade === "1";
    const classeDisponibilidade = disponivel ? "disponivel" : "indisponivel";
    const textoDisponibilidade = disponivel ? "Disponivel" : "Indisponivel";
    const idPosto = posto.id_posto;
    const area = posto.area;
    const precoKwh = Number(posto.preco_kwh);

    return "<div class=\"lugar\" data-id-posto=\"" + idPosto + "\" data-area=\"" + area + "\" data-preco-kwh=\"" + precoKwh + "\">" +
        "<span class=\"nome-posto\">" + idPosto + "</span>" +
        "<span class=\"acoes-posto\">" +
        "    <span class=\"indicador " + classeDisponibilidade + "\" title=\"" + textoDisponibilidade + "\"></span>" +
        (disponivel
            ? "    <button type=\"button\" class=\"btn-carregar\" onclick=\"abrirModalCarregamento(this)\">Carregar</button>"
            : "    <button type=\"button\" class=\"btn-carregar indisponivel-botao\" disabled>Indisponivel</button>") +
        "</span>" +
    "</div>";
}

function abrirModalCarregamento(botao) {
    const lugar = botao.closest(".lugar");

    postoSelecionado = {
        id: lugar.dataset.idPosto,
        area: lugar.dataset.area,
        precoKwh: Number(lugar.dataset.precoKwh)
    };

    const modal = obterModalCarregamento();
    document.getElementById("posto-carregamento-selecionado").textContent = postoSelecionado.id;
    document.getElementById("area-carregamento-selecionada").textContent = postoSelecionado.area;
    document.getElementById("valor-kwh").value = ""; //limpar caso exista um valor anterior
    document.getElementById("preco-carregamento").textContent = formatarMoeda(0);
    document.getElementById("mensagem-carregamento").textContent = "";
    mostrarEstadoModal("formulario");

    modal.classList.add("aberto");
    modal.setAttribute("aria-hidden", "false");

}

function fecharModalCarregamento() {
    const modal = document.getElementById("modal-carregamento");

    if (!modal) {
        return;
    }

    if (temporizadorCarregamento) {
        clearTimeout(temporizadorCarregamento);
        temporizadorCarregamento = null;
    }

    modal.classList.remove("aberto");
    modal.setAttribute("aria-hidden", "true");
    postoSelecionado = null;
}

function atualizarPrecoCarregamento() {
    const campoKwh = document.getElementById("valor-kwh");
    const kwh = Number(campoKwh.value);
    const precoKwh = postoSelecionado ? postoSelecionado.precoKwh : 0;
    const preco = kwh > 0 ? kwh * precoKwh : 0;

    document.getElementById("preco-carregamento").textContent = formatarMoeda(preco);
}

async function confirmarPagamentoCarregamento() {
    const campoKwh = document.getElementById("valor-kwh");
    const kwh = Number(campoKwh.value);

    if (!postoSelecionado) {
        return;
    }

    mostrarEstadoModal("processamento");

    try {
        const inicioProcessamento = new Promise(function(resolve) {
            temporizadorCarregamento = setTimeout(resolve, 1000);
        });

        const resposta = await fetch("/api/postos-carregamento/" + encodeURIComponent(postoSelecionado.id) + "/carregar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                kwh: kwh
            })
        });

        if (!resposta.ok) {
            const dados = await resposta.json();
            throw new Error(dados.erro || "Erro ao efetuar carregamento.");
        }

        await inicioProcessamento;

        const dados = await resposta.json();
        const carregamento = dados.carregamento;

        mostrarEstadoModal("sucesso");
        document.getElementById("mensagem-sucesso-carregamento").textContent =
            "Carregamento efetuado no posto " + carregamento.id_posto +
            " por " + formatarMoeda(Number(carregamento.preco_total)) + ".";
        temporizadorCarregamento = null;
    } catch (erro) {
        if (temporizadorCarregamento) {
            clearTimeout(temporizadorCarregamento);
            temporizadorCarregamento = null;
        }

        mostrarEstadoModal("formulario");
        document.getElementById("mensagem-carregamento").textContent = erro.message;
    }
}

function mostrarEstadoModal(estado) {
    document.getElementById("formulario-carregamento").hidden = estado !== "formulario";
    document.getElementById("processamento-carregamento").hidden = estado !== "processamento";
    document.getElementById("sucesso-carregamento").hidden = estado !== "sucesso";
}

//porque repetia esta instrução várias vezes
function obterModalCarregamento() {
    return document.getElementById("modal-carregamento");
}

function formatarMoeda(valor) {
    return valor.toLocaleString("pt-PT", {
        style: "currency",
        currency: "EUR"
    });
}



document.addEventListener("DOMContentLoaded", function() {
    carregarPostosUtilizador();

    obterModalCarregamento().addEventListener("click", function(evento) {
        if (evento.target === this) {
            fecharModalCarregamento();
        }
    });
});
