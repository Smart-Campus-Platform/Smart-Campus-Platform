var postoAbertoId = null;

async function carregarPostos() {
    try {
        const resposta = await fetch("/api/postos-carregamento"); //vai buscar à API todos os postos que estão na BD
        await verificarResposta(resposta, "Erro ao carregar postos.");
        const postos = await resposta.json();

        const listaPostos = document.querySelector(".posto-lista");
        listaPostos.innerHTML = ""; //limpa a lista

        postos.forEach(function(posto) {
            listaPostos.appendChild(criarElementoPosto(posto));
        });

        carregarFiltros(postos);
        restaurarPostoAberto();
    } catch (erro) {
        alert(erro.message);
    }
}

//Quando clicamento em adicionar posto e confirmamos chama esta função
async function confirmarNovo() {
    var idPosto = document.getElementById("novo-codigo").value.trim();
    var area = document.getElementById("nova-area").value.trim();

    if (!idPosto || !area) {
        alert("Por favor preencha todos os campos.");
        return;
    }

    try {
        const resposta = await fetch("/api/postos-carregamento", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id_posto: idPosto,
                area: area
            })
        });
        await verificarResposta(resposta, "Erro ao adicionar posto.");

        fecharModal();
        carregarPostos();//para fechar o modal e mostrar de novo os postos
    } catch (erro) {
        alert(erro.message);
    }
}

async function guardarAlteracoes(botao) {
    var postoElemento = botao.closest(".posto-item");//posto de carregamento a que pertence o botão selecionado
    var idPostoAtual = postoElemento.dataset.idPosto;

    var novoIdPosto = postoElemento.querySelector(".input-codigo").value.trim();
    var novaArea = postoElemento.querySelector(".input-local").value.trim();

    if (!novoIdPosto || !novaArea) {
        alert("Por favor preencha todos os campos.");
        return;
    }

    try {
        const resposta = await fetch("/api/postos-carregamento/" + encodeURIComponent(idPostoAtual), {
            //encodeURIComponent() serve para converter caracteres especiais para uma forma segura para URLs, tipo acentos e assim
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id_posto: novoIdPosto,
                area: novaArea
            })
        });
        await verificarResposta(resposta, "Erro ao guardar alterações.");

        carregarPostos(); //chama sempre o carregarPostos para atualizar a lista
    } catch (erro) {
        alert(erro.message);
    }
}

async function removerItem(botao) {
    var postoElemento = botao.closest(".posto-item");
    var idPosto = postoElemento.dataset.idPosto;

    try {
        const resposta = await fetch("/api/postos-carregamento/" + encodeURIComponent(idPosto), {
            method: "DELETE"
        });
        await verificarResposta(resposta, "Erro ao remover posto.");

        carregarPostos();
    } catch (erro) {
        alert(erro.message);
    }
}

async function alterarDisponibilidade(input) {
    var postoElemento = input.closest(".posto-item");
    var idPosto = postoElemento.dataset.idPosto;
    var novaDisponibilidade = input.checked;

    try {
        const resposta = await fetch("/api/postos-carregamento/" + encodeURIComponent(idPosto) + "/disponibilidade", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                disponibilidade: novaDisponibilidade
            })
        });
        await verificarResposta(resposta, "Erro ao alterar disponibilidade.");

        carregarPostos();
    } catch (erro) {
        input.checked = !novaDisponibilidade;
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

//por cada posto recebido vamos criar um <li>
function criarElementoPosto(posto) {
    var postoElemento = document.createElement("li");
    postoElemento.className = "posto-item";
    postoElemento.dataset.idPosto = posto.id_posto;//para guardar o id real da base de dados
    postoElemento.dataset.area = posto.area;

    var disponivel = posto.disponibilidade === true || posto.disponibilidade === 1 || posto.disponibilidade === "1";
    var textoDisponibilidade = disponivel ? "Disponivel" : "Indisponivel";
    var idDetalhePosto = "detalhe-pc-" + posto.id_posto;//associar o botão à secção que abre e fecha.
    var checkedDisponibilidade = disponivel ? " checked" : "";

    postoElemento.innerHTML =
        "<div class=\"posto-row\" role=\"button\" tabindex=\"0\"" +
        " aria-expanded=\"false\" aria-controls=\"" + idDetalhePosto + "\"" +
        " onclick=\"toggleItem(this)\"" +
        " onkeydown=\"if(event.key===&quot;Enter&quot;||event.key===&quot; &quot;){event.preventDefault();toggleItem(this);}\">" +
        "    <span class=\"posto-nome\">" + posto.id_posto + "</span>" +
        "    <span class=\"posto-local\">" + posto.area + "</span>" +
        "    <span class=\"posto-disponibilidade\">" + textoDisponibilidade + "</span>" +
        "    <span class=\"posto-chevron\" aria-hidden=\"true\">▼</span>" +
        "</div>" +
        "<div class=\"posto-detalhe\" id=\"" + idDetalhePosto + "\" aria-hidden=\"true\">" +
        "    <div class=\"edicao-campos\" style=\"display:none\">" +
        "        <div class=\"posto-campo\"><label>Código</label><input class=\"input-codigo\" type=\"text\"></div>" +
        "        <div class=\"posto-campo\"><label>Área</label><input class=\"input-local\" type=\"text\"></div>" +
        "        <div class=\"posto-botoes\"><button type=\"button\" class=\"btn-configurar\" onclick=\"guardarAlteracoes(this)\">Guardar</button></div>" +
        "    </div>" +
        "    <div class=\"posto-botoes item-acoes\">" +
        "        <button type=\"button\" class=\"btn-configurar\" onclick=\"mostrarEdicao(this)\">Alterar Detalhes</button>" +
        "        <div class=\"posto-estado-wrap\">" +
        "            <span class=\"posto-estado-label\">Disponibilidade</span>" +
        "            <label class=\"toggle-switch\" aria-label=\"Alterar disponibilidade do posto\">" +
        "                <input type=\"checkbox\" onchange=\"alterarDisponibilidade(this)\"" + checkedDisponibilidade + ">" +
        "                <span class=\"toggle-track\"><span class=\"toggle-thumb\"></span></span>" +
        "                <span class=\"toggle-text toggle-text-disponibilidade\"></span>" +
        "            </label>" +
        "        </div>" +
        "        <button type=\"button\" class=\"btn-remover\" onclick=\"removerItem(this)\">Remover</button>" +
        "    </div>" +
        "</div>";

    return postoElemento;
}

//vai tirar areas repetidas e garantir que mostra cada área uma vez
function carregarFiltros(postos) {
    var listaFiltros = document.getElementById("filtros-lista");
    listaFiltros.innerHTML = "";

    var filtroTodos = document.createElement("div");
    filtroTodos.className = "filtro-opcao ativo";
    filtroTodos.setAttribute("role", "button");
    filtroTodos.setAttribute("tabindex", "0");
    filtroTodos.setAttribute("aria-pressed", "true");
    filtroTodos.dataset.area = "";
    filtroTodos.textContent = "Todas";
    filtroTodos.onclick = function() {
        selecionarFiltro(filtroTodos);
    };
    listaFiltros.appendChild(filtroTodos);

    var areas = [...new Set(postos.map(function(posto) { return posto.area; }))];

    areas.forEach(function(area) {
        var filtroArea = document.createElement("div");
        filtroArea.className = "filtro-opcao";
        filtroArea.setAttribute("role", "button");
        filtroArea.setAttribute("tabindex", "0");
        filtroArea.setAttribute("aria-pressed", "false");
        filtroArea.dataset.area = area;
        filtroArea.textContent = area;
        filtroArea.onclick = function() {
            selecionarFiltro(filtroArea);
        };

        listaFiltros.appendChild(filtroArea);
    });
}

function filtrarPostosPorArea(area) {
    document.querySelectorAll(".posto-item").forEach(function(postoElemento) {
        var mostrarPosto = !area || postoElemento.dataset.area === area;
        postoElemento.style.display = mostrarPosto ? "" : "none";
    });
}

function toggleItem(linhaPosto) {
    var postoElemento = linhaPosto.closest(".posto-item");
    var estavaAberto = postoElemento.classList.contains("aberto");
    document.querySelectorAll(".posto-item.aberto").forEach(function(outroPosto) {
        outroPosto.classList.remove("aberto");
        outroPosto.querySelector(".posto-row").setAttribute("aria-expanded", "false");
        outroPosto.querySelector(".posto-detalhe").setAttribute("aria-hidden", "true");
        outroPosto.querySelector(".edicao-campos").style.display = "none";
        outroPosto.querySelector(".item-acoes").style.display = "";
    });
    if (!estavaAberto) {
        postoElemento.classList.add("aberto");
        linhaPosto.setAttribute("aria-expanded", "true");
        postoElemento.querySelector(".posto-detalhe").setAttribute("aria-hidden", "false");
        postoAbertoId = postoElemento.dataset.idPosto;
    } else {
        postoAbertoId = null;
    }
}

function restaurarPostoAberto() {
    if (!postoAbertoId) {
        return;
    }

    var postoElemento = document.querySelector(".posto-item[data-id-posto=\"" + postoAbertoId + "\"]");

    if (!postoElemento) {
        postoAbertoId = null;
        return;
    }

    postoElemento.classList.add("aberto");
    postoElemento.querySelector(".posto-row").setAttribute("aria-expanded", "true");
    postoElemento.querySelector(".posto-detalhe").setAttribute("aria-hidden", "false");
}

function toggleFiltros(botao) {
    var listaFiltros = document.getElementById("filtros-lista");
    var filtrosAbertos = listaFiltros.classList.toggle("aberto");
    botao.setAttribute("aria-expanded", filtrosAbertos ? "true" : "false");
    botao.setAttribute("aria-label", filtrosAbertos ? "Esconder filtros" : "Mostrar filtros");
}

function selecionarFiltro(filtroSelecionado) {
    document.querySelectorAll(".filtro-opcao").forEach(function(filtro) {
        filtro.classList.remove("ativo");
        filtro.setAttribute("aria-pressed", "false");
    });
    filtroSelecionado.classList.add("ativo");
    filtroSelecionado.setAttribute("aria-pressed", "true");

    filtrarPostosPorArea(filtroSelecionado.dataset.area);
}

function mostrarEdicao(botao) {
    var detalhePosto = botao.closest(".posto-detalhe");
    var linhaPosto = botao.closest(".posto-item").querySelector(".posto-row");
    detalhePosto.querySelector(".input-codigo").value = linhaPosto.querySelector(".posto-nome").textContent.trim();
    detalhePosto.querySelector(".input-local").value = linhaPosto.querySelector(".posto-local").textContent.trim();
    detalhePosto.querySelector(".edicao-campos").style.display = "";
    detalhePosto.querySelector(".item-acoes").style.display = "none";
}

function abrirModal() {
    document.getElementById("novo-codigo").value = "";
    document.getElementById("nova-area").value = "";
    document.getElementById("modal-overlay").classList.add("aberto");
    document.getElementById("novo-codigo").focus();
}

function fecharModal() {
    document.getElementById("modal-overlay").classList.remove("aberto");
}

//é aqui que tudo começa quando abrimos o html
document.addEventListener("DOMContentLoaded", function() {
    carregarPostos();
    //também abre e fecha um modal
    document.getElementById("modal-overlay").addEventListener("click", function(evento) {
        if (evento.target === this) fecharModal();
    });
});

document.addEventListener("keydown", function(evento) {
    if (evento.key === "Escape") fecharModal();
});
