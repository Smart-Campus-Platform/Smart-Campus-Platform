async function carregarPostosUtilizador() {
    try {
        const resposta = await fetch("/api/postos-carregamento");
        await verificarResposta(resposta, "Erro ao carregar postos.");
        const postos = await resposta.json();

        const listaPostos = document.getElementById("lista-postos-carregamento");
        listaPostos.innerHTML = "";

        const postosPorArea = agruparPostosPorArea(postos);

        Object.keys(postosPorArea).forEach(function(area, indiceArea) {
            listaPostos.appendChild(criarElementoArea(area, postosPorArea[area], indiceArea));
        });
    } catch (erro) {
        alert(erro.message);
    }
}

async function verificarResposta(resposta, mensagemPadrao) {
    if (resposta.ok) {
        return;
    }

    try {
        const dados = await resposta.json();
        throw new Error(dados.erro || mensagemPadrao);
    } catch (erro) {
        throw new Error(erro.message || mensagemPadrao);
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
    const disponivel = posto.disponibilidade === true || posto.disponibilidade === 1 || posto.disponibilidade === "1";
    const classeDisponibilidade = disponivel ? "disponivel" : "indisponivel";
    const textoDisponibilidade = disponivel ? "Disponivel" : "Indisponivel";

    return "<div class=\"lugar\">" +
        "<span>" + posto.id_posto + "</span>" +
        "<span class=\"indicador " + classeDisponibilidade + "\" title=\"" + textoDisponibilidade + "\"></span>" +
    "</div>";
}


document.addEventListener("DOMContentLoaded", function() {
    carregarPostosUtilizador();
});
