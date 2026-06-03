document.addEventListener('DOMContentLoaded', function () {
    carregarEquipamentos();
    document.getElementById('modal-overlay').addEventListener('click', function (e) {
        if (e.target === this) fecharModal();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fecharModal(); });
});

function carregarEquipamentos() {
    apiFetch('/api/equipamentos').then(function (r) { return r.json(); }).then(function (equips) {
        renderizarEquipamentos(equips);
    });
}

function renderizarEquipamentos(equips) {
    var ul = document.querySelector('.sensor-lista');
    ul.innerHTML = '';
    if (equips.length === 0) {
        ul.innerHTML = '<li style="padding:16px;color:#666;">Nenhum equipamento registado.</li>';
        return;
    }
    equips.sort(function (a, b) {
        return String(a.tipo_equipamento).localeCompare(String(b.tipo_equipamento), 'pt', { sensitivity: 'base' });
    });
    equips.forEach(function (e, i) {
        var id = 'detalhe-eq-' + i;
        var li = document.createElement('li');
        li.className = 'sensor-item';
        li.dataset.tipo = e.tipo_equipamento;
        li.innerHTML =
            '<div class="sensor-row" role="button" tabindex="0" aria-expanded="false"' +
            '     onclick="toggleItem(this)" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();toggleItem(this);}">' +
            '    <span class="sensor-nome">' + e.tipo_equipamento + '</span>' +
            '    <span class="sensor-local">Piso ' + e.piso + '</span>' +
            '    <span class="sensor-chevron" aria-hidden="true">▼</span>' +
            '</div>' +
            '<div class="sensor-detalhe" id="' + id + '" aria-hidden="true">' +
            '    <div class="edicao-campos" style="display:none">' +
            '        <div class="sensor-campo"><label>Nome</label><input class="input-nome" type="text" value="' + e.tipo_equipamento + '"></div>' +
            '        <div class="sensor-campo"><label>Piso</label><input class="input-local" type="number" value="' + e.piso + '"></div>' +
            '        <div class="sensor-botoes"><button type="button" class="btn-configurar" onclick="guardarAlteracoes(this)">Guardar</button></div>' +
            '    </div>' +
            '    <div class="sensor-botoes item-acoes">' +
            '        <button type="button" class="btn-configurar" onclick="mostrarEdicao(this)">Alterar Detalhes</button>' +
            '        <button type="button" class="btn-remover" onclick="removerItem(this)">Remover</button>' +
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

function toggleFiltros(btn) {
    var lista = document.getElementById('filtros-lista');
    lista.classList.toggle('aberto');
}

function selecionarFiltro(el) {
    document.querySelectorAll('.filtro-opcao').forEach(function (i) { i.classList.remove('ativo'); i.setAttribute('aria-pressed', 'false'); });
    el.classList.add('ativo');
    el.setAttribute('aria-pressed', 'true');
}

function removerItem(btn) {
    var item = btn.closest('.sensor-item');
    var tipo = item.dataset.tipo;
    if (!confirm('Remover "' + tipo + '"?')) return;
    apiFetch('/api/equipamentos/' + encodeURIComponent(tipo), { method: 'DELETE' })
        .then(function (r) { return r.json(); })
        .then(function (d) { if (d.erro) { alert('Erro: ' + d.erro); return; } carregarEquipamentos(); });
}

function mostrarEdicao(btn) {
    var detalhe = btn.closest('.sensor-detalhe');
    detalhe.querySelector('.edicao-campos').style.display = '';
    detalhe.querySelector('.item-acoes').style.display = 'none';
}

function guardarAlteracoes(btn) {
    var item = btn.closest('.sensor-item');
    var detalhe = btn.closest('.sensor-detalhe');
    var tipoAtual = item.dataset.tipo;
    var novoNome = detalhe.querySelector('.input-nome').value.trim();
    var novoPiso = detalhe.querySelector('.input-local').value;
    if (!novoNome || !novoPiso) { alert('Preencha todos os campos.'); return; }
    apiFetch('/api/equipamentos/' + encodeURIComponent(tipoAtual), {
        method: 'PUT',
        body: JSON.stringify({ novoTipo: novoNome, piso: parseInt(novoPiso) })
    }).then(function (r) { return r.json(); }).then(function (d) {
        if (d.erro) { alert('Erro: ' + d.erro); return; }
        carregarEquipamentos();
    });
}

function abrirModal() {
    document.getElementById('novo-nome').value = '';
    document.getElementById('novo-piso').value = '';
    document.getElementById('modal-overlay').classList.add('aberto');
    document.getElementById('novo-nome').focus();
}

function fecharModal() {
    document.getElementById('modal-overlay').classList.remove('aberto');
}

function confirmarNovo() {
    var nome = document.getElementById('novo-nome').value.trim();
    var piso = parseInt(document.getElementById('novo-piso').value);
    if (!nome || !piso) { alert('Preencha todos os campos.'); return; }
    apiFetch('/api/equipamentos', {
        method: 'POST',
        body: JSON.stringify({ tipo_equipamento: nome, piso: piso })
    }).then(function (r) { return r.json(); }).then(function (d) {
        if (d.erro) { alert('Erro: ' + d.erro); return; }
        fecharModal();
        carregarEquipamentos();
    });
}
