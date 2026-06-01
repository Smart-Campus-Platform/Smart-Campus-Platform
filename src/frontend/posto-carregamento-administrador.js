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
}

function removerItem(btn) {
    var item = btn.closest('.sensor-item');
    if (item) item.remove();
}

function mostrarEdicao(btn) {
    var detalhe = btn.closest('.sensor-detalhe');
    var row = btn.closest('.sensor-item').querySelector('.sensor-row');
    detalhe.querySelector('.input-codigo').value = row.querySelector('.sensor-nome').textContent.trim();
    detalhe.querySelector('.input-local').value = row.querySelector('.sensor-local').textContent.trim();
    detalhe.querySelector('.edicao-campos').style.display = '';
    detalhe.querySelector('.item-acoes').style.display = 'none';
}

function guardarAlteracoes(btn) {
    var item = btn.closest('.sensor-item');
    var detalhe = btn.closest('.sensor-detalhe');
    var row = item.querySelector('.sensor-row');
    var novoNome = detalhe.querySelector('.input-codigo').value.trim();
    var novoLocal = detalhe.querySelector('.input-local').value.trim();
    if (!novoNome || !novoLocal) {
        alert('Por favor preencha todos os campos.');
        return;
    }
    row.querySelector('.sensor-nome').textContent = novoNome;
    row.querySelector('.sensor-local').textContent = novoLocal;
    detalhe.querySelector('.edicao-campos').style.display = 'none';
    detalhe.querySelector('.item-acoes').style.display = '';
    item.classList.remove('aberto');
    row.setAttribute('aria-expanded', 'false');
    detalhe.setAttribute('aria-hidden', 'true');
}

var itemCounter = 3;

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
    var area = document.getElementById('nova-area').value.trim();
    if (!codigo || !area) {
        alert('Por favor preencha todos os campos.');
        return;
    }
    itemCounter++;
    var id = 'detalhe-pc' + itemCounter;
    var li = document.createElement('li');
    li.className = 'sensor-item';
    li.innerHTML =
        '<div class="sensor-row" role="button" tabindex="0"' +
        '     aria-expanded="false" aria-controls="' + id + '"' +
        '     onclick="toggleItem(this)"' +
        '     onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();toggleItem(this);}">' +
        '    <span class="sensor-nome">' + codigo + '</span>' +
        '    <span class="sensor-local">' + area + '</span>' +
        '    <span class="sensor-chevron" aria-hidden="true">▼</span>' +
        '</div>' +
        '<div class="sensor-detalhe" id="' + id + '" aria-hidden="true">' +
        '    <div class="edicao-campos" style="display:none">' +
        '        <div class="sensor-campo"><label>Código</label><input class="input-codigo" type="text"></div>' +
        '        <div class="sensor-campo"><label>Área</label><input class="input-local" type="text"></div>' +
        '        <div class="sensor-botoes"><button type="button" class="btn-configurar" onclick="guardarAlteracoes(this)">Guardar</button></div>' +
        '    </div>' +
        '    <div class="sensor-botoes item-acoes">' +
        '        <button type="button" class="btn-configurar" onclick="mostrarEdicao(this)">Alterar Detalhes</button>' +
        '        <button type="button" class="btn-remover" onclick="removerItem(this)">Remover</button>' +
        '    </div>' +
        '</div>';
    document.querySelector('.sensor-lista').appendChild(li);
    fecharModal();
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('modal-overlay').addEventListener('click', function(e) {
        if (e.target === this) fecharModal();
    });
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') fecharModal();
});
