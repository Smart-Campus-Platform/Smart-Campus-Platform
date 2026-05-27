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

    var tipo = el.dataset.tipo;
    document.querySelectorAll('.sensor-item').forEach(function (item) {
        var tipoSpan = item.querySelector('.sensor-tipo');
        if (!tipo || (tipoSpan && tipoSpan.textContent === tipo)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

function removerSensor(btn) {
    var item = btn.closest('.sensor-item');
    if (item) item.remove();
}

function atualizarCamposSensor() {
    var tipo = document.getElementById('novo-tipo').value;
    var campoOcupacao = document.getElementById('campo-max-ocupacao');
    var camposMinMax = document.getElementById('campos-min-max');
    var labelMin = document.getElementById('label-min-sensor');
    var labelMax = document.getElementById('label-max-sensor');
    var inputMaxPessoas = document.getElementById('novo-max-pessoas');
    var inputMin = document.getElementById('novo-min-sensor');
    var inputMaxSensor = document.getElementById('novo-max-sensor');

    campoOcupacao.style.display = 'none';
    camposMinMax.style.display = 'none';
    inputMaxPessoas.removeAttribute('required');
    inputMin.removeAttribute('required');
    inputMaxSensor.removeAttribute('required');

    if (tipo === 'Ocupação') {
        campoOcupacao.style.display = '';
        inputMaxPessoas.setAttribute('required', '');
    } else if (tipo === 'Temperatura') {
        camposMinMax.style.display = '';
        labelMin.textContent = 'Mínimo (°C)';
        labelMax.textContent = 'Máximo (°C)';
    } else if (tipo === 'Consumo Energético') {
        camposMinMax.style.display = '';
        labelMin.textContent = 'Mínimo (kW)';
        labelMax.textContent = 'Máximo (kW)';
    } else if (tipo === 'Qualidade do Ar') {
        camposMinMax.style.display = '';
        labelMin.textContent = 'Mínimo (AQI)';
        labelMax.textContent = 'Máximo (AQI)';
    }
}

var sensorCounter = 5;

function abrirModalSensor() {
    document.getElementById('novo-tipo').value = '';
    document.getElementById('nova-sala').value = '';
    document.getElementById('novo-max-pessoas').value = '';
    document.getElementById('novo-min-sensor').value = '';
    document.getElementById('novo-max-sensor').value = '';
    document.getElementById('campo-max-ocupacao').style.display = 'none';
    document.getElementById('campos-min-max').style.display = 'none';
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

    if (tipo === 'Ocupação') {
        var maxPessoasVal = document.getElementById('novo-max-pessoas').value.trim();
        if (!maxPessoasVal) {
            alert('O número máximo de pessoas é obrigatório para sensores de ocupação.');
            document.getElementById('novo-max-pessoas').focus();
            return;
        }
        var maxPessoasNum = parseInt(maxPessoasVal, 10);
        if (isNaN(maxPessoasNum) || maxPessoasNum < 1) {
            alert('O número máximo de pessoas deve ser no mínimo 1.');
            document.getElementById('novo-max-pessoas').focus();
            return;
        }
    } else {
        var minVal = document.getElementById('novo-min-sensor').value.trim();
        var maxVal = document.getElementById('novo-max-sensor').value.trim();
        if (minVal === '') {
            alert('O campo mínimo é obrigatório.');
            document.getElementById('novo-min-sensor').focus();
            return;
        }
        if (maxVal === '') {
            alert('O campo máximo é obrigatório.');
            document.getElementById('novo-max-sensor').focus();
            return;
        }
        if (parseFloat(minVal) >= parseFloat(maxVal)) {
            alert('O valor mínimo deve ser inferior ao valor máximo.');
            document.getElementById('novo-min-sensor').focus();
            return;
        }
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
        '    <div class="sensor-campo">' +
        '        <label for="desc-s' + sensorCounter + '">Descrição</label>' +
        '        <textarea id="desc-s' + sensorCounter + '" rows="3" placeholder="Insira uma descrição para este sensor..."></textarea>' +
        '    </div>' +
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
        '        <button type="button" class="btn-remover" onclick="removerSensor(this)">Remover</button>' +
        '    </div>' +
        '</div>';
    document.querySelector('.sensor-lista').appendChild(li);
    var filtroAtivo = document.querySelector('.filtro-opcao.ativo');
    if (filtroAtivo) selecionarFiltro(filtroAtivo);
    fecharModalSensor();
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('modal-overlay').addEventListener('click', function (e) {
        if (e.target === this) fecharModalSensor();
    });
});

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') fecharModalSensor();
});
