function toggleSensor(row) {
    var item = row.closest('.sensor-item');
    var wasAberto = item.classList.contains('aberto');

    document.querySelectorAll('.sensor-item.aberto').forEach(function (other) {
        other.classList.remove('aberto');
        var otherRow = other.querySelector('.sensor-row');
        var otherDetalhe = other.querySelector('.sensor-detalhe');
        otherRow.setAttribute('aria-expanded', 'false');
        otherDetalhe.setAttribute('aria-hidden', 'true');
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
    document.querySelectorAll('.filtro-opcao').forEach(function (item) {
        item.classList.remove('ativo');
        item.setAttribute('aria-pressed', 'false');
    });
    el.classList.add('ativo');
    el.setAttribute('aria-pressed', 'true');
}

var sensorCounter = 5;

function mostrarCampoCapacidade(tipo) {
    var campo = document.getElementById('campo-capacidade');
    if (campo) campo.style.display = (tipo === 'Ocupação') ? 'block' : 'none';
}

function abrirModalSensor() {
    document.getElementById('novo-tipo').value = '';
    document.getElementById('nova-sala').value = '';
    var campoCap = document.getElementById('campo-capacidade');
    if (campoCap) { campoCap.style.display = 'none'; }
    var novaCap = document.getElementById('nova-capacidade');
    if (novaCap) novaCap.value = '';
    document.getElementById('modal-overlay').classList.add('aberto');
    document.getElementById('novo-tipo').focus();
}

function fecharModalSensor() {
    document.getElementById('modal-overlay').classList.remove('aberto');
}

function confirmarNovoSensor() {
    var tipo = document.getElementById('novo-tipo').value.trim();
    var sala = document.getElementById('nova-sala').value.trim();
    if (!tipo || !sala) {
        alert('Por favor preencha o tipo e a sala.');
        return;
    }
    var campoPrincipal;
    if (tipo === 'Ocupação') {
        var capacidade = document.getElementById('nova-capacidade').value.trim() || '0';
        campoPrincipal =
            '<div class="sensor-campo">' +
            '    <label>Ocupação</label>' +
            '    <div class="sensor-ocup-valor" aria-label="Valor de ocupação">' + parseInt(capacidade, 10) + '</div>' +
            '</div>';
    } else {
        campoPrincipal =
            '<div class="sensor-campo">' +
            '    <label for="desc-s' + (sensorCounter + 1) + '">Descrição</label>' +
            '    <textarea id="desc-s' + (sensorCounter + 1) + '" rows="3" placeholder="Insira uma descrição para este sensor..."></textarea>' +
            '</div>';
    }
    sensorCounter++;
    var id = 'detalhe-s' + sensorCounter;
    var li = document.createElement('li');
    li.className = 'sensor-item';
    li.innerHTML =
        '<div class="sensor-row" role="button" tabindex="0"' +
        '     aria-expanded="false" aria-controls="' + id + '"' +
        '     onclick="toggleSensor(this)"' +
        '     onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();toggleSensor(this);}">' +
        '    <span class="sensor-nome">Sensor ' + sensorCounter + '</span>' +
        '    <span class="sensor-local">' + sala + '</span>' +
        '    <span class="sensor-tipo">' + tipo + '</span>' +
        '    <span class="sensor-chevron" aria-hidden="true">▼</span>' +
        '</div>' +
        '<div class="sensor-detalhe" id="' + id + '" aria-hidden="true">' +
        campoPrincipal +
        '    <div class="sensor-estado-wrap">' +
        '        <span class="sensor-estado-label">Estado</span>' +
        '        <label class="toggle-switch" aria-label="Ativar ou desativar sensor">' +
        '            <input type="checkbox" checked>' +
        '            <span class="toggle-track"><span class="toggle-thumb"></span></span>' +
        '            <span class="toggle-text"></span>' +
        '        </label>' +
        '    </div>' +
        '    <div class="sensor-botoes">' +
        '        <button type="button" class="btn-configurar">Configurar</button>' +
        '        <button type="button" class="btn-remover">Remover</button>' +
        '    </div>' +
        '</div>';
    document.querySelector('.sensor-lista').appendChild(li);
    fecharModalSensor();
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('modal-overlay').addEventListener('click', function (e) {
        if (e.target === this) fecharModalSensor();
    });

    document.querySelector('.sensor-lista').addEventListener('click', function (e) {
        if (e.target.classList.contains('btn-remover')) {
            var item = e.target.closest('.sensor-item');
            if (item) item.remove();
        }
    });
});

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') fecharModalSensor();
});
