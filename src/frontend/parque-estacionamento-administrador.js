document.addEventListener('DOMContentLoaded', function () {
    carregarLugares();
    document.getElementById('modal-overlay').addEventListener('click', function (e) {
        if (e.target === this) fecharModal();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fecharModal(); });
});

function carregarLugares() {
    fetch('/api/estacionamentos').then(function (r) { return r.json(); }).then(function (lugares) {
        renderizarLugares(lugares);
    });
}

function renderizarLugares(lugares) {
    var ul = document.querySelector('.sensor-lista');
    ul.innerHTML = '';
    if (lugares.length === 0) {
        ul.innerHTML = '<li style="padding:16px;color:#666;">Nenhum lugar registado.</li>';
        return;
    }
    lugares.sort(function (a, b) {
        var pa = (a.parque || '').localeCompare(b.parque || '', 'pt', { sensitivity: 'base' });
        if (pa !== 0) return pa;
        return String(a.id_lugar).localeCompare(String(b.id_lugar), 'pt', { sensitivity: 'base' });
    });
    lugares.forEach(function (l, i) {
        var id = 'detalhe-lu-' + i;
        var disp = l.disponibilidade ? 'Disponível' : 'Ocupado';
        var li = document.createElement('li');
        li.className = 'sensor-item';
        li.dataset.lugar = l.id_lugar;
        li.innerHTML =
            '<div class="sensor-row" role="button" tabindex="0" aria-expanded="false"' +
            '     onclick="toggleItem(this)" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();toggleItem(this);}">' +
            '    <span class="sensor-nome">' + l.id_lugar + '</span>' +
            '    <span class="sensor-local">' + (l.parque || 'Geral') + '</span>' +
            '    <span class="sensor-tipo">' + disp + '</span>' +
            '    <span class="sensor-chevron" aria-hidden="true">▼</span>' +
            '</div>' +
            '<div class="sensor-detalhe" id="' + id + '" aria-hidden="true">' +
            '    <div class="edicao-campos" style="display:none">' +
            '        <div class="sensor-campo"><label>ID Lugar</label><input class="input-id" type="text" value="' + l.id_lugar + '" readonly></div>' +
            '        <div class="sensor-campo"><label>Parque</label><input class="input-parque" type="text" value="' + (l.parque || '') + '"></div>' +
            '        <div class="sensor-botoes"><button type="button" class="btn-configurar" onclick="guardarAlteracoes(this)">Guardar</button></div>' +
            '    </div>' +
            '    <div class="sensor-botoes item-acoes">' +
            '        <button type="button" class="btn-configurar" onclick="mostrarEdicao(this)">Alterar Detalhes</button>' +
            '        <button type="button" class="btn-remover" onclick="removerItem(this)">Remover</button>' +
            '        <div class="sensor-estado-wrap"><span class="sensor-estado-label">Disponível</span>' +
            '            <label class="toggle-switch"><input type="checkbox"' + (l.disponibilidade ? ' checked' : '') + ' onchange="toggleDisp(this)">' +
            '            <span class="toggle-track"><span class="toggle-thumb"></span></span></label></div>' +
            '    </div></div>';
        ul.appendChild(li);
    });
}

function toggleItem(row) {
    var item = row.closest('.sensor-item');
    var wasAberto = item.classList.contains('aberto');
    document.querySelectorAll('.sensor-item.aberto').forEach(function (o) {
        o.classList.remove('aberto');
        o.querySelector('.sensor-row').setAttribute('aria-expanded', 'false');
        o.querySelector('.sensor-detalhe').setAttribute('aria-hidden', 'true');
        var ec = o.querySelector('.edicao-campos'); if (ec) ec.style.display = 'none';
        var ia = o.querySelector('.item-acoes'); if (ia) ia.style.display = '';
    });
    if (!wasAberto) {
        item.classList.add('aberto');
        row.setAttribute('aria-expanded', 'true');
        item.querySelector('.sensor-detalhe').setAttribute('aria-hidden', 'false');
    }
}

function toggleFiltros(btn) { document.getElementById('filtros-lista').classList.toggle('aberto'); }
function selecionarFiltro(el) {
    document.querySelectorAll('.filtro-opcao').forEach(function (i) { i.classList.remove('ativo'); });
    el.classList.add('ativo');
}

function removerItem(btn) {
    var item = btn.closest('.sensor-item');
    var id = item.dataset.lugar;
    if (!confirm('Remover lugar "' + id + '"? Os sensores associados e as respetivas leituras serão removidos.')) return;
    apiFetch('/api/estacionamentos/' + encodeURIComponent(id), { method: 'DELETE' })
        .then(function (r) { return r.json(); })
        .then(function (d) { if (d.erro) { alert('Erro: ' + d.erro); return; } carregarLugares(); });
}

function mostrarEdicao(btn) {
    var detalhe = btn.closest('.sensor-detalhe');
    detalhe.querySelector('.edicao-campos').style.display = '';
    detalhe.querySelector('.item-acoes').style.display = 'none';
}

function guardarAlteracoes(btn) {
    var item = btn.closest('.sensor-item');
    var detalhe = btn.closest('.sensor-detalhe');
    var id = item.dataset.lugar;
    var parque = detalhe.querySelector('.input-parque').value.trim();
    apiFetch('/api/estacionamentos/' + encodeURIComponent(id), {
        method: 'PUT',
        body: JSON.stringify({ parque: parque })
    }).then(function (r) { return r.json(); }).then(function (d) {
        if (d.erro) { alert('Erro: ' + d.erro); return; }
        carregarLugares();
    });
}

function toggleDisp(input) {
    var item = input.closest('.sensor-item');
    var id = item.dataset.lugar;
    apiFetch('/api/estacionamentos/' + encodeURIComponent(id) + '/disponibilidade', {
        method: 'PATCH',
        body: JSON.stringify({ disponibilidade: input.checked })
    }).then(function (r) { return r.json(); }).then(function (d) {
        if (d.erro) { alert('Erro: ' + d.erro); input.checked = !input.checked; }
    });
}

function abrirModal() {
    document.getElementById('novo-id').value = '';
    document.getElementById('novo-parque').value = '';
    document.getElementById('modal-overlay').classList.add('aberto');
    document.getElementById('novo-id').focus();
}

function fecharModal() {
    document.getElementById('modal-overlay').classList.remove('aberto');
}

function confirmarNovo() {
    var id = document.getElementById('novo-id').value.trim();
    var parque = document.getElementById('novo-parque').value.trim();
    if (!id) { alert('ID é obrigatório.'); return; }
    apiFetch('/api/estacionamentos', {
        method: 'POST',
        body: JSON.stringify({ id_lugar: id, parque: parque })
    }).then(function (r) { return r.json(); }).then(function (d) {
        if (d.erro) { alert('Erro: ' + d.erro); return; }
        fecharModal();
        carregarLugares();
    });
}
