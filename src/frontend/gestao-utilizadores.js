document.addEventListener('DOMContentLoaded', function () {
    prepararCampos();
    carregarUtilizadores();
});

function carregarUtilizadores() {
    apiFetch('/api/utilizadores').then(function (r) { return r.json(); }).then(function (utilizadores) {
        renderizarUtilizadores(utilizadores);
    }).catch(function () {
        alert('Erro ao carregar utilizadores.');
    });
}

function renderizarUtilizadores(lista) {
    var main = document.querySelector('main.content');
    // Remove existing utilizador-card elements
    main.querySelectorAll('.utilizador-card').forEach(function (el) { el.remove(); });

    var pesquisaCard = main.querySelector('.pesquisa-card');

    lista.forEach(function (u) {
        var div = document.createElement('div');
        div.className = 'card utilizador-card';
        div.dataset.numero = u.id_utilizador;
        div.dataset.estado = u.estado ? 'ativo' : 'inativo';

        var tipoOptions = ['admin', 'funcionario', 'docente', 'estudante'].map(function (t) {
            return '<option value="' + t + '"' + (u.tipo === t ? ' selected' : '') + '>' + t.charAt(0).toUpperCase() + t.slice(1) + '</option>';
        }).join('');

        div.innerHTML =
            '<div style="width:100%">' +
            '<h2>' + (u.nome || 'Utilizador') + '</h2>' +
            '<table>' +
            '<tr><td style="width:160px"><strong>ID:</strong></td><td>' + u.id_utilizador + '</td></tr>' +
            '<tr><td><strong>Tipo:</strong></td><td>' +
            '<select class="campo-editavel campo-tipo" disabled>' + tipoOptions + '</select>' +
            '</td></tr>' +
            '<tr><td><strong>Email:</strong></td><td>' +
            '<input class="campo-editavel" type="email" value="' + (u.email || '') + '" readonly>' +
            '</td></tr>' +
            '<tr><td><strong>Contacto:</strong></td><td>' +
            '<input class="campo-editavel campo-contacto" type="text" value="' + (u.contacto || '') + '" readonly>' +
            '</td></tr>' +
            '<tr><td><strong>NIF:</strong></td><td>' +
            '<input class="campo-editavel campo-nif" type="text" value="' + (u.NIF || '') + '" readonly>' +
            '</td></tr>' +
            '<tr><td><strong>Morada:</strong></td><td>' +
            '<input class="campo-editavel campo-morada" type="text" value="' + (u.morada || '') + '" readonly>' +
            '</td></tr>' +
            '</table>' +
            '<div class="acoes-card">' +
            '<button type="button" onclick="alterarUtilizador(this)">Alterar</button>' +
            '<button type="button" onclick="guardarUtilizador(this,' + u.id_utilizador + ')" style="display:none">Guardar</button>' +
            '<button type="button" onclick="removerUtilizador(this,' + u.id_utilizador + ')">Remover</button>' +
            '<div class="toggle-estado">' +
            '<label class="toggle-switch" aria-label="Ativar ou desativar utilizador">' +
            '<input type="checkbox" class="toggle-input"' + (u.estado ? ' checked' : '') + ' onchange="toggleEstado(this,' + u.id_utilizador + ')">' +
            '<span class="toggle-slider"></span>' +
            '</label>' +
            '<span class="toggle-estado-label ' + (u.estado ? 'ativo' : 'inativo') + '">' + (u.estado ? 'Ativo' : 'Inativo') + '</span>' +
            '</div></div></div>';

        main.appendChild(div);
    });

    prepararCampos();
    aplicarFiltros();
}

function aplicarFiltros() {
    var pesquisa = document.getElementById('pesquisa-numero').value.trim();
    var estadoFiltro = document.getElementById('pesquisa-estado').value;
    var cards = document.querySelectorAll('.utilizador-card');
    var mensagem = document.getElementById('mensagem-pesquisa');
    var encontrados = 0;

    cards.forEach(function (card) {
        var numero = card.getAttribute('data-numero');
        var estado = card.getAttribute('data-estado');
        var passaNumero = pesquisa === '' || numero.includes(pesquisa);
        var passaEstado = estadoFiltro === '' || estado === estadoFiltro;
        if (passaNumero && passaEstado) { card.style.display = 'flex'; encontrados++; }
        else { card.style.display = 'none'; }
    });

    if (mensagem) mensagem.style.display = encontrados === 0 ? 'block' : 'none';
}

function limparPesquisa() {
    document.getElementById('pesquisa-numero').value = '';
    document.getElementById('pesquisa-estado').value = '';
    aplicarFiltros();
}

function alterarUtilizador(botao) {
    var card = botao.closest('.card');
    var campos = card.querySelectorAll('.campo-editavel');
    campos.forEach(function (campo) {
        if (campo.tagName === 'SELECT') campo.disabled = false;
        else campo.readOnly = false;
        campo.style.backgroundColor = 'white';
        campo.style.border = '1px solid black';
    });
    botao.style.display = 'none';
    var guardarBtn = card.querySelector('button[onclick^="guardarUtilizador"]');
    if (guardarBtn) guardarBtn.style.display = '';
}

function guardarUtilizador(botao, id) {
    var card = botao.closest('.card');
    var tipo = card.querySelector('.campo-tipo').value;
    var email = card.querySelector('input[type="email"]').value;
    var contacto = card.querySelector('.campo-contacto').value;
    var nif = card.querySelector('.campo-nif').value;
    var morada = card.querySelector('.campo-morada').value;
    var nome = card.querySelector('h2').textContent;

    apiFetch('/api/utilizadores/' + id, {
        method: 'PUT',
        body: JSON.stringify({ nome: nome, email: email, tipo: tipo, morada: morada, NIF: nif, contacto: contacto })
    }).then(function (r) { return r.json(); }).then(function (dados) {
        if (dados.erro) { alert('Erro: ' + dados.erro); return; }
        alert('Utilizador atualizado.');
        var campos = card.querySelectorAll('.campo-editavel');
        campos.forEach(function (campo) {
            if (campo.tagName === 'SELECT') campo.disabled = true;
            else campo.readOnly = true;
            campo.style.backgroundColor = 'transparent';
            campo.style.border = '1px solid transparent';
        });
        botao.style.display = 'none';
        var alterarBtn = card.querySelector('button[onclick^="alterarUtilizador"]');
        if (alterarBtn) alterarBtn.style.display = '';
    }).catch(function () { alert('Erro ao guardar.'); });
}

function removerUtilizador(botao, id) {
    if (!confirm('Quer remover este utilizador?')) return;
    apiFetch('/api/utilizadores/' + id, { method: 'DELETE' })
        .then(function (r) { return r.json(); })
        .then(function (dados) {
            if (dados.erro) { alert('Erro: ' + dados.erro); return; }
            var card = botao.closest('.card');
            card.remove();
            aplicarFiltros();
        });
}

function toggleEstado(input, id) {
    var card = input.closest('.card');
    var label = card.querySelector('.toggle-estado-label');
    if (!input.checked) {
        if (!confirm('Quer desativar este utilizador?')) { input.checked = true; return; }
    }
    apiFetch('/api/utilizadores/' + id + '/estado', {
        method: 'PATCH',
        body: JSON.stringify({ estado: input.checked })
    }).then(function (r) { return r.json(); }).then(function (dados) {
        if (dados.erro) { alert('Erro: ' + dados.erro); input.checked = !input.checked; return; }
        label.textContent = input.checked ? 'Ativo' : 'Inativo';
        label.className = 'toggle-estado-label ' + (input.checked ? 'ativo' : 'inativo');
        card.dataset.estado = input.checked ? 'ativo' : 'inativo';
    });
}

function prepararCampos() {
    document.querySelectorAll('.campo-editavel').forEach(function (campo) {
        campo.style.boxSizing = 'border-box';
        campo.style.backgroundColor = 'transparent';
        campo.style.border = '1px solid transparent';
        campo.style.borderRadius = '5px';
        campo.style.padding = '2px 5px';
        campo.style.font = 'inherit';
        campo.style.color = 'black';
        campo.style.outline = 'none';
        campo.style.height = '26px';
    });
    document.querySelectorAll('.campo-tipo').forEach(function (c) { c.style.width = '130px'; });
    document.querySelectorAll('input[type="email"]').forEach(function (c) { c.style.width = '230px'; });
    document.querySelectorAll('.campo-contacto').forEach(function (c) { c.style.width = '120px'; });
    document.querySelectorAll('.campo-nif').forEach(function (c) { c.style.width = '110px'; });
    document.querySelectorAll('.campo-morada').forEach(function (c) { c.style.width = '260px'; });
}
