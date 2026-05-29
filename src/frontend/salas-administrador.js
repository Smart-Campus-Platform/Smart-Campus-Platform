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
    var item = btn.closest('.sensor-item');
    var detalhe = btn.closest('.sensor-detalhe');
    var row = item.querySelector('.sensor-row');
    detalhe.querySelector('.input-nome').value = row.querySelector('.sensor-nome').textContent.trim();
    detalhe.querySelector('.input-piso').value = row.querySelector('.sensor-local').textContent.trim();
    var tipoAtual = row.querySelector('.sensor-tipo').textContent.trim();
    var sel = detalhe.querySelector('.input-tipo');
    for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value === tipoAtual) { sel.selectedIndex = i; break; }
    }
    detalhe.querySelector('.input-capacidade').value = item.dataset.capacidade || '';
    detalhe.querySelector('.edicao-campos').style.display = '';
    detalhe.querySelector('.item-acoes').style.display = 'none';
}

function guardarAlteracoes(btn) {
    var item = btn.closest('.sensor-item');
    var detalhe = btn.closest('.sensor-detalhe');
    var row = item.querySelector('.sensor-row');
    var novoNome = detalhe.querySelector('.input-nome').value.trim();
    var novoPiso = detalhe.querySelector('.input-piso').value.trim();
    var novoTipo = detalhe.querySelector('.input-tipo').value;
    var novaCapacidade = parseInt(detalhe.querySelector('.input-capacidade').value, 10);
    if (!novoNome || !novoPiso) {
        alert('Por favor preencha todos os campos.');
        return;
    }
    if (isNaN(novaCapacidade) || novaCapacidade < 1) {
        alert('A capacidade é obrigatória e deve ser no mínimo 1.');
        detalhe.querySelector('.input-capacidade').focus();
        return;
    }
    row.querySelector('.sensor-nome').textContent = novoNome;
    row.querySelector('.sensor-local').textContent = novoPiso;
    row.querySelector('.sensor-tipo').textContent = novoTipo;
    item.dataset.capacidade = novaCapacidade;
    detalhe.querySelector('.edicao-campos').style.display = 'none';
    detalhe.querySelector('.item-acoes').style.display = '';
    item.classList.remove('aberto');
    row.setAttribute('aria-expanded', 'false');
    detalhe.setAttribute('aria-hidden', 'true');
}

var itemCounter = 4;

function abrirModal() {
    document.getElementById('novo-nome').value = '';
    document.getElementById('novo-piso').value = '';
    document.getElementById('novo-tipo').value = 'Sala';
    document.getElementById('nova-capacidade').value = '';
    document.getElementById('modal-overlay').classList.add('aberto');
    document.getElementById('novo-nome').focus();
}

function fecharModal() {
    document.getElementById('modal-overlay').classList.remove('aberto');
}

function confirmarNovo() {
    var nome = document.getElementById('novo-nome').value.trim();
    var piso = document.getElementById('novo-piso').value.trim();
    var tipo = document.getElementById('novo-tipo').value;
    var capacidade = parseInt(document.getElementById('nova-capacidade').value, 10);
    if (!nome || !piso) {
        alert('Por favor preencha todos os campos.');
        return;
    }
    if (isNaN(capacidade) || capacidade < 1) {
        alert('A capacidade é obrigatória e deve ser no mínimo 1.');
        document.getElementById('nova-capacidade').focus();
        return;
    }
    itemCounter++;
    var id = 'detalhe-s' + itemCounter;
    var li = document.createElement('li');
    li.className = 'sensor-item';
    li.dataset.capacidade = capacidade;
    li.innerHTML =
        '<div class="sensor-row" role="button" tabindex="0"' +
        '     aria-expanded="false" aria-controls="' + id + '"' +
        '     onclick="toggleItem(this)"' +
        '     onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();toggleItem(this);}">' +
        '    <span class="sensor-nome">' + nome + '</span>' +
        '    <span class="sensor-local">' + piso + '</span>' +
        '    <span class="sensor-tipo">' + tipo + '</span>' +
        '    <span class="sensor-chevron" aria-hidden="true">▼</span>' +
        '</div>' +
        '<div class="sensor-detalhe" id="' + id + '" aria-hidden="true">' +
        '    <div class="edicao-campos" style="display:none">' +
        '        <div class="sensor-campo"><label>Nome</label><input class="input-nome" type="text"></div>' +
        '        <div class="sensor-campo"><label>Piso</label><input class="input-piso" type="text"></div>' +
        '        <div class="sensor-campo"><label>Tipo</label>' +
        '            <select class="input-tipo"><option value="Sala">Sala</option><option value="Laboratório">Laboratório</option></select>' +
        '        </div>' +
        '        <div class="sensor-campo"><label>Capacidade</label><input class="input-capacidade" type="number" min="1" placeholder="Mín: 1"></div>' +
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
