async function carregarPostos() {
    const resposta = await fetch("/api/postos-carregamento"); //vai buscar à API todos os postos que estão na BD
    const postos = await resposta.json();

    const lista = document.querySelector(".sensor-lista");
    lista.innerHTML = ""; //limpa a lista

    postos.forEach(function(posto) {
        lista.appendChild(criarElementoPosto(posto));
    });

    carregarFiltros(postos);
}

//Quando clicamento em adicionar posto e confirmamos chama esta função
async function confirmarNovo() {
    var codigo = document.getElementById("novo-codigo").value.trim();
    var area = document.getElementById("nova-area").value.trim();

    if (!codigo || !area) {
        alert("Por favor preencha todos os campos.");
        return;
    }

    await fetch("/api/postos-carregamento", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id_posto: codigo,
            area: area
        })
    });

    fecharModal();
    carregarPostos();//para fechar o modal
}

async function guardarAlteracoes(btn) {
    var item = btn.closest(".sensor-item");
    var idAtual = item.dataset.idPosto;
    var detalhe = btn.closest(".sensor-detalhe");

    var novoCodigo = detalhe.querySelector(".input-codigo").value.trim();
    var novaArea = detalhe.querySelector(".input-local").value.trim();

    if (!novoCodigo || !novaArea) {
        alert("Por favor preencha todos os campos.");
        return;
    }

    await fetch("/api/postos-carregamento/" + encodeURIComponent(idAtual), {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id_posto: novoCodigo,
            area: novaArea
        })
    });

    carregarPostos(); //chama sempre o carregarPostos para atualizar a lista
}

async function removerItem(btn) {
    var item = btn.closest(".sensor-item");
    var idPosto = item.dataset.idPosto;

    await fetch("/api/postos-carregamento/" + encodeURIComponent(idPosto), {
        method: "DELETE"
    });

    carregarPostos();
}

async function alterarDisponibilidade(btn, novaDisponibilidade) {
    var item = btn.closest(".sensor-item");
    var idPosto = item.dataset.idPosto;

    await fetch("/api/postos-carregamento/" + encodeURIComponent(idPosto) + "/disponibilidade", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            disponibilidade: novaDisponibilidade
        })
    });

    carregarPostos();
}

//por cada posto recebido vamos criar um <li>
function criarElementoPosto(posto) {
    var li = document.createElement("li");
    li.className = "sensor-item";
    li.dataset.idPosto = posto.id_posto;//para guardar o id real da base de dados
    li.dataset.area = posto.area;

    var disponivel = posto.disponibilidade === 1 || posto.disponibilidade === "1";
    var textoDisponibilidade = disponivel ? "Disponivel" : "Indisponivel";
    var textoBotaoDisponibilidade = disponivel ? "Marcar como Indisponivel" : "Marcar como Disponivel";

    var detalheId = "detalhe-pc-" + posto.id_posto;//associar o botão à secção que abre e fecha.

    li.innerHTML =
        '<div class="sensor-row" role="button" tabindex="0"' +
        ' aria-expanded="false" aria-controls="' + detalheId + '"' +
        ' onclick="toggleItem(this)"' +
        ' onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();toggleItem(this);}">' +
        '    <span class="sensor-nome">' + posto.id_posto + '</span>' +
        '    <span class="sensor-local">' + posto.area + '</span>' +
        '    <span class="sensor-disponibilidade">' + textoDisponibilidade + '</span>' +
        '    <span class="sensor-chevron" aria-hidden="true">▼</span>' +
        '</div>' +
        '<div class="sensor-detalhe" id="' + detalheId + '" aria-hidden="true">' +
        '    <div class="edicao-campos" style="display:none">' +
        '        <div class="sensor-campo"><label>Código</label><input class="input-codigo" type="text"></div>' +
        '        <div class="sensor-campo"><label>Área</label><input class="input-local" type="text"></div>' +
        '        <div class="sensor-botoes"><button type="button" class="btn-configurar" onclick="guardarAlteracoes(this)">Guardar</button></div>' +
        '    </div>' +
        '    <div class="sensor-botoes item-acoes">' +
        '        <button type="button" class="btn-configurar" onclick="mostrarEdicao(this)">Alterar Detalhes</button>' +
        '        <button type="button" class="btn-configurar" onclick="alterarDisponibilidade(this, ' + !disponivel + ')">' + textoBotaoDisponibilidade + '</button>' +
        '        <button type="button" class="btn-remover" onclick="removerItem(this)">Remover</button>' +
        '    </div>' +
        '</div>';

    return li;
}

//vai tirar areas repetidas e garantir que mostra cada área uma vez
function carregarFiltros(postos) {
    var filtros = document.getElementById("filtros-lista");
    filtros.innerHTML = "";

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
    filtros.appendChild(filtroTodos);

    var areas = [...new Set(postos.map(function(posto) { return posto.area; }))];

    areas.forEach(function(area) {
        var div = document.createElement("div");
        div.className = "filtro-opcao";
        div.setAttribute("role", "button");
        div.setAttribute("tabindex", "0");
        div.setAttribute("aria-pressed", "false");
        div.dataset.area = area;
        div.textContent = area;
        div.onclick = function() {
            selecionarFiltro(div);
        };

        filtros.appendChild(div);
    });
}

function filtrarPostosPorArea(area) {
    document.querySelectorAll(".sensor-item").forEach(function(item) {
        var mostrar = !area || item.dataset.area === area;
        item.style.display = mostrar ? "" : "none";
    });
}

function toggleItem(row) {
    var item = row.closest('.sensor-item');
    var wasAberto = item.classList.contains('aberto');
    document.querySelectorAll('.sensor-item.aberto').forEach(function(other) {
        other.classList.remove('aberto');
        other.querySelector('.sensor-row').setAttribute('aria-expanded', 'false');
        other.querySelector('.sensor-detalhe').setAttribute('aria-hidden', 'true');
        other.querySelector('.edicao-campos').style.display = 'none';
        other.querySelector('.item-acoes').style.display = '';
    });
    if (!wasAberto) {
        item.classList.add('aberto');
        row.setAttribute('aria-expanded', 'true');
        item.querySelector('.sensor-detalhe').setAttribute('aria-hidden', 'false');
    }
}

function toggleFiltros(btn) {
    var lista = document.getElementById('filtros-lista');
    var isAberto = lista.classList.toggle('aberto');
    btn.setAttribute('aria-expanded', isAberto ? 'true' : 'false');
    btn.setAttribute('aria-label', isAberto ? 'Esconder filtros' : 'Mostrar filtros');
}

function selecionarFiltro(el) {
    document.querySelectorAll('.filtro-opcao').forEach(function(item) {
        item.classList.remove('ativo');
        item.setAttribute('aria-pressed', 'false');
    });
    el.classList.add('ativo');
    el.setAttribute('aria-pressed', 'true');

    filtrarPostosPorArea(el.dataset.area);
}

function mostrarEdicao(btn) {
    var detalhe = btn.closest('.sensor-detalhe');
    var row = btn.closest('.sensor-item').querySelector('.sensor-row');
    detalhe.querySelector('.input-codigo').value = row.querySelector('.sensor-nome').textContent.trim();
    detalhe.querySelector('.input-local').value = row.querySelector('.sensor-local').textContent.trim();
    detalhe.querySelector('.edicao-campos').style.display = '';
    detalhe.querySelector('.item-acoes').style.display = 'none';
}

function abrirModal() {
    document.getElementById('novo-codigo').value = '';
    document.getElementById('nova-area').value = '';
    document.getElementById('modal-overlay').classList.add('aberto');
    document.getElementById('novo-codigo').focus();
}

function fecharModal() {
    document.getElementById("modal-overlay").classList.remove("aberto");
}

//é aqui que tudo começa quando abrimos o html
document.addEventListener("DOMContentLoaded", function() {
    carregarPostos();
    //também abre e fecha um modal
    document.getElementById("modal-overlay").addEventListener("click", function(e) {
        if (e.target === this) fecharModal();
    });
});

document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") fecharModal();
});
