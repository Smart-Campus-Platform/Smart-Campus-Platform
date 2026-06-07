document.addEventListener('DOMContentLoaded', function () {
    carregarSalas();

    document.getElementById('modal-overlay').addEventListener('click', function (e) {
        if (e.target === this) fecharModal();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') fecharModal();
    });
});

function carregarSalas() {
    apiFetch('/api/salas/todas').then(function (r) { return r.json(); }).then(function (salas) {
        renderizarSalas(salas);
    }).catch(function () {
        document.querySelector('.sala-lista').innerHTML = '<li style="padding:16px;color:#c0392b;">Erro ao carregar salas.</li>';
    });
}

function renderizarSalas(salas) {
    var ul = document.querySelector('.sala-lista');
    ul.innerHTML = '';

    var filtroAtivo = document.querySelector('.filtro-opcao.ativo');
    var filtro = filtroAtivo ? filtroAtivo.textContent.trim() : 'Todos';

    salas.sort(function (a, b) {
        return String(a.nome).localeCompare(String(b.nome), 'pt', { sensitivity: 'base' });
    });
    salas.forEach(function (s, i) {
        if (filtro === 'Salas' && s.tipo !== 'Sala') return;
        if (filtro === 'Laboratórios' && s.tipo !== 'Laboratório') return;

        var id = 'detalhe-sala-' + i;
        var li = document.createElement('li');
        li.className = 'sala-item';
        li.dataset.capacidade = s.capacidade || '';
        li.dataset.salaId = s.id_sala;
        li.innerHTML =
            '<div class="sala-row" role="button" tabindex="0" aria-expanded="false" aria-controls="' + id + '"' +
            '     onclick="toggleItem(this)" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();toggleItem(this);}">' +
            '    <span class="sala-nome">' + s.nome + '</span>' +
            '    <span class="sala-local">Piso ' + s.piso + '</span>' +
            '    <span class="sala-tipo">' + s.tipo + '</span>' +
            '    <span class="sala-chevron" aria-hidden="true">▼</span>' +
            '</div>' +
            '<div class="sala-detalhe" id="' + id + '" aria-hidden="true">' +
            '    <div class="edicao-campos" style="display:none">' +
            '        <div class="sala-campo"><label>Nome</label><input class="input-nome" type="text" value="' + s.nome + '"></div>' +
            '        <div class="sala-campo"><label>Piso</label><input class="input-piso" type="number" value="' + s.piso + '"></div>' +
            '        <div class="sala-campo"><label>Tipo</label>' +
            '            <select class="input-tipo">' +
            '                <option value="Sala"' + (s.tipo === 'Sala' ? ' selected' : '') + '>Sala</option>' +
            '                <option value="Laboratório"' + (s.tipo === 'Laboratório' ? ' selected' : '') + '>Laboratório</option>' +
            '            </select></div>' +
            '        <div class="sala-campo"><label>Capacidade</label><input class="input-capacidade" type="number" min="1" value="' + (s.capacidade || '') + '"></div>' +
            '        <div class="sala-botoes"><button type="button" class="btn-configurar" onclick="guardarAlteracoes(this)">Guardar</button></div>' +
            '    </div>' +
            '    <div class="sala-botoes item-acoes">' +
            '        <button type="button" class="btn-configurar" onclick="mostrarEdicao(this)">Alterar Detalhes</button>' +
            '        <button type="button" class="btn-remover" onclick="removerItem(this)">Remover</button>' +
            '        <div class="sala-estado-wrap">' +
            '            <span class="sala-estado-label">Estado</span>' +
            '            <label class="toggle-switch" aria-label="Ativar ou desativar sala">' +
            '                <input type="checkbox"' + (s.disponibilidade ? ' checked' : '') + ' onchange="toggleDisponibilidade(this)">' +
            '                <span class="toggle-track"><span class="toggle-thumb"></span></span>' +
            '            </label></div></div></div>';
        ul.appendChild(li);
    });

    if (ul.children.length === 0) {
        ul.innerHTML = '<li style="padding:16px;color:#666;">Nenhuma sala encontrada.</li>';
    }
}

function toggleItem(row) {
    var item = row.closest('.sala-item');
    var wasAberto = item.classList.contains('aberto');
    document.querySelectorAll('.sala-item.aberto').forEach(function (other) {
        other.classList.remove('aberto');
        other.querySelector('.sala-row').setAttribute('aria-expanded', 'false');
        other.querySelector('.sala-detalhe').setAttribute('aria-hidden', 'true');
        var ec = other.querySelector('.edicao-campos');
        if (ec) ec.style.display = 'none';
        var ia = other.querySelector('.item-acoes');
        if (ia) ia.style.display = '';
    });
    if (!wasAberto) {
        item.classList.add('aberto');
        row.setAttribute('aria-expanded', 'true');
        item.querySelector('.sala-detalhe').setAttribute('aria-hidden', 'false');
    }
}

function toggleFiltros(btn) {
    var lista = document.getElementById('filtros-lista');
    var isAberto = lista.classList.toggle('aberto');
    btn.setAttribute('aria-expanded', isAberto ? 'true' : 'false');
}

function selecionarFiltro(el) {
    document.querySelectorAll('.filtro-opcao').forEach(function (item) {
        item.classList.remove('ativo');
        item.setAttribute('aria-pressed', 'false');
    });
    el.classList.add('ativo');
    el.setAttribute('aria-pressed', 'true');
    carregarSalas();
}

function removerItem(btn) {
    var item = btn.closest('.sala-item');
    var salaId = item.dataset.salaId;
    if (!confirm('Remover esta sala?')) return;
    apiFetch('/api/salas/' + salaId, { method: 'DELETE' })
        .then(function (r) { return r.json(); })
        .then(function (dados) {
            if (dados.erro) { alert('Erro: ' + dados.erro); return; }
            carregarSalas();
        });
}

function mostrarEdicao(btn) {
    var detalhe = btn.closest('.sala-detalhe');
    detalhe.querySelector('.edicao-campos').style.display = '';
    detalhe.querySelector('.item-acoes').style.display = 'none';
}

function guardarAlteracoes(btn) {
    var item = btn.closest('.sala-item');
    var detalhe = btn.closest('.sala-detalhe');
    var salaId = item.dataset.salaId;
    var nome = detalhe.querySelector('.input-nome').value.trim();
    var piso = detalhe.querySelector('.input-piso').value;
    var tipo = detalhe.querySelector('.input-tipo').value;
    var capacidade = detalhe.querySelector('.input-capacidade').value;

    if (!nome || !piso) { alert('Preencha todos os campos.'); return; }

    apiFetch('/api/salas/' + salaId, {
        method: 'PUT',
        body: JSON.stringify({ nome: nome, tipo: tipo, piso: parseInt(piso), capacidade: capacidade ? parseInt(capacidade) : null })
    }).then(function (r) { return r.json(); }).then(function (dados) {
        if (dados.erro) { alert('Erro: ' + dados.erro); return; }
        carregarSalas();
    });
}

function toggleDisponibilidade(input) {
    var item = input.closest('.sala-item');
    var salaId = item.dataset.salaId;
    apiFetch('/api/salas/' + salaId + '/disponibilidade', {
        method: 'PATCH',
        body: JSON.stringify({ disponibilidade: input.checked })
    }).then(function (r) { return r.json(); }).then(function (dados) {
        if (dados.erro) { alert('Erro: ' + dados.erro); input.checked = !input.checked; }
    });
}

function abrirModal() {
    document.getElementById('novo-nome').value = '';
    document.getElementById('novo-piso').value = '';
    document.getElementById('novo-tipo').value = 'Sala';
    document.getElementById('nova-capacidade').value = '';
    document.getElementById('nova-disponibilidade').value = '';
    document.getElementById('modal-overlay').classList.add('aberto');
    document.getElementById('novo-nome').focus();
}

function fecharModal() {
    document.getElementById('modal-overlay').classList.remove('aberto');
}

function confirmarNovo() {
    var nome = document.getElementById('novo-nome').value.trim();
    var piso = parseInt(document.getElementById('novo-piso').value);
    var tipo = document.getElementById('novo-tipo').value;
    var capacidade = parseInt(document.getElementById('nova-capacidade').value);
    var dispEl = document.getElementById('nova-disponibilidade');
    var disponibilidade = dispEl ? dispEl.value !== 'indisponivel' : true;

    if (!nome || isNaN(piso)) { alert('Preencha todos os campos.'); return; }
    if (isNaN(capacidade) || capacidade < 1) { alert('Capacidade inválida.'); return; }

    apiFetch('/api/salas', {
        method: 'POST',
        body: JSON.stringify({ nome: nome, tipo: tipo, piso: piso, capacidade: capacidade, disponibilidade: disponibilidade })
    }).then(function (r) { return r.json(); }).then(function (dados) {
        if (dados.erro) { alert('Erro: ' + dados.erro); return; }
        fecharModal();
        carregarSalas();
    });
}
