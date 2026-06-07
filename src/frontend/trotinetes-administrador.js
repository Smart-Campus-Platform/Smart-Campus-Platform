// window.TIPO_MOB set in the HTML page ('trotinete' or 'bicicleta')

document.addEventListener('DOMContentLoaded', function () {
    carregarVeiculos();
    document.getElementById('modal-overlay').addEventListener('click', function (e) {
        if (e.target === this) fecharModal();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fecharModal(); });
});

function carregarVeiculos() {
    var tipo = window.TIPO_MOB || 'trotinete';
    apiFetch('/api/mobilidade/todas?tipo=' + tipo).then(function (r) { return r.json(); }).then(function (veiculos) {
        renderizarVeiculos(veiculos);
    });
}

function renderizarVeiculos(veiculos) {
    var ul = document.querySelector('.recursomob-lista');
    ul.innerHTML = '';
    if (veiculos.length === 0) {
        ul.innerHTML = '<li style="padding:16px;color:#666;">Nenhum veículo registado.</li>';
        return;
    }
    veiculos.sort(function (a, b) {
        var za = (a.zona || '').localeCompare(b.zona || '', 'pt', { sensitivity: 'base' });
        if (za !== 0) return za;
        return String(a.codigo_mobilidade).localeCompare(String(b.codigo_mobilidade), 'pt', { sensitivity: 'base' });
    });
    veiculos.forEach(function (v, i) {
        var id = 'detalhe-mob-' + i;
        var li = document.createElement('li');
        li.className = 'recursomob-item';
        li.dataset.codigo = v.codigo_mobilidade;
        li.innerHTML =
            '<div class="recursomob-row" role="button" tabindex="0" aria-expanded="false"' +
            '     onclick="toggleItem(this)" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();toggleItem(this);}">' +
            '    <span class="recursomob-nome">' + v.codigo_mobilidade + '</span>' +
            '    <span class="recursomob-local">' + (v.zona || 'Sem zona') + '</span>' +
            '    <span class="recursomob-tipo">' + v.estado + '</span>' +
            '    <span class="recursomob-chevron" aria-hidden="true">▼</span>' +
            '</div>' +
            '<div class="recursomob-detalhe" id="' + id + '" aria-hidden="true">' +
            '    <div class="edicao-campos" style="display:none">' +
            '        <div class="recursomob-campo"><label>Código</label><input class="input-codigo" type="text" value="' + v.codigo_mobilidade + '" readonly></div>' +
            '        <div class="recursomob-campo"><label>Área/Zona</label><input class="input-local" type="text" value="' + (v.zona || '') + '"></div>' +
            '        <div class="recursomob-botoes"><button type="button" class="btn-configurar" onclick="guardarAlteracoes(this)">Guardar</button></div>' +
            '    </div>' +
            '    <div class="recursomob-botoes item-acoes">' +
            '        <button type="button" class="btn-configurar" onclick="mostrarEdicao(this)">Alterar Detalhes</button>' +
            '        <button type="button" class="btn-remover" onclick="removerItem(this)">Remover</button>' +
            '    </div></div>';
        ul.appendChild(li);
    });
}

function toggleItem(row) {
    var item = row.closest('.recursomob-item');
    var wasAberto = item.classList.contains('aberto');
    document.querySelectorAll('.recursomob-item.aberto').forEach(function (o) {
        o.classList.remove('aberto');
        o.querySelector('.recursomob-row').setAttribute('aria-expanded', 'false');
        o.querySelector('.recursomob-detalhe').setAttribute('aria-hidden', 'true');
        var ec = o.querySelector('.edicao-campos'); if (ec) ec.style.display = 'none';
        var ia = o.querySelector('.item-acoes'); if (ia) ia.style.display = '';
    });
    if (!wasAberto) {
        item.classList.add('aberto');
        row.setAttribute('aria-expanded', 'true');
        item.querySelector('.recursomob-detalhe').setAttribute('aria-hidden', 'false');
    }
}

function toggleFiltros(btn) { document.getElementById('filtros-lista').classList.toggle('aberto'); }
function selecionarFiltro(el) {
    document.querySelectorAll('.filtro-opcao').forEach(function (i) { i.classList.remove('ativo'); });
    el.classList.add('ativo');
}

function removerItem(btn) {
    var item = btn.closest('.recursomob-item');
    var codigo = item.dataset.codigo;
    if (!confirm('Remover "' + codigo + '"?')) return;
    apiFetch('/api/mobilidade/' + encodeURIComponent(codigo), { method: 'DELETE' })
        .then(function (r) { return r.json(); })
        .then(function (d) { if (d.erro) { alert('Erro: ' + d.erro); return; } carregarVeiculos(); });
}

function mostrarEdicao(btn) {
    var detalhe = btn.closest('.recursomob-detalhe');
    detalhe.querySelector('.edicao-campos').style.display = '';
    detalhe.querySelector('.item-acoes').style.display = 'none';
}

function guardarAlteracoes(btn) {
    var item = btn.closest('.recursomob-item');
    var detalhe = btn.closest('.recursomob-detalhe');
    var codigo = item.dataset.codigo;
    var zona = detalhe.querySelector('.input-local').value.trim();
    apiFetch('/api/mobilidade/' + encodeURIComponent(codigo), {
        method: 'PUT',
        body: JSON.stringify({ zona: zona, estado: 'disponivel' })
    }).then(function (r) { return r.json(); }).then(function (d) {
        if (d.erro) { alert('Erro: ' + d.erro); return; }
        carregarVeiculos();
    });
}

function abrirModal() {
    document.getElementById('novo-codigo').value = '';
    document.getElementById('nova-area').value = '';
    document.getElementById('modal-overlay').classList.add('aberto');
    document.getElementById('novo-codigo').focus();
}

function fecharModal() {
    document.getElementById('modal-overlay').classList.remove('aberto');
}

function confirmarNovo() {
    var codigo = document.getElementById('novo-codigo').value.trim();
    var zona = document.getElementById('nova-area').value.trim();
    if (!codigo) { alert('Código é obrigatório.'); return; }
    var tipo = window.TIPO_MOB || 'trotinete';
    apiFetch('/api/mobilidade', {
        method: 'POST',
        body: JSON.stringify({ codigo_mobilidade: codigo, tipo_mobilidade: tipo, zona: zona })
    }).then(function (r) { return r.json(); }).then(function (d) {
        if (d.erro) { alert('Erro: ' + d.erro); return; }
        fecharModal();
        carregarVeiculos();
    });
}
