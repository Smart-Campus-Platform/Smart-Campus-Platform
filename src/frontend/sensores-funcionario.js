document.addEventListener('DOMContentLoaded', function () {
    carregarSensores();

    document.querySelectorAll('.filtro-opcao').forEach(function (el) {
        el.addEventListener('click', function () { selecionarFiltro(el); });
        el.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selecionarFiltro(el); }
        });
    });
});

function carregarSensores() {
    var filtroAtivo = document.querySelector('.filtro-opcao.ativo');
    var tipo = filtroAtivo ? filtroAtivo.dataset.tipo || '' : '';
    var url = '/api/sensores' + (tipo ? '?tipo=' + encodeURIComponent(tipo) : '');
    fetch(url).then(function (r) { return r.json(); }).then(function (sensores) {
        renderizarSensores(sensores);
    }).catch(function () {
        document.querySelector('.sensor-lista').innerHTML = '<li style="padding:16px;color:#c0392b;">Erro ao carregar sensores.</li>';
    });
}

function formatarLocalSala(sensor) {
    if (!sensor.sala_nome) return null;
    var tipoSala = sensor.sala_tipo || 'Sala';
    var nomeSala = String(sensor.sala_nome);
    if (nomeSala.toLowerCase().indexOf(String(tipoSala).toLowerCase()) === 0) {
        return nomeSala;
    }
    return tipoSala + ' ' + nomeSala;
}

function renderizarSensores(sensores) {
    var ul = document.querySelector('.sensor-lista');
    ul.innerHTML = '';
    if (sensores.length === 0) {
        ul.innerHTML = '<li style="padding:16px;color:#666;">Nenhum sensor registado.</li>';
        return;
    }
    sensores.forEach(function (s, i) {
        var id = 'detalhe-sf-' + i;
        var local = formatarLocalSala(s)
            || (s.lugar_id ? ((s.parque ? s.parque + ' - ' : '') + 'Lugar ' + s.lugar_id) : null)
            || (s.id_posto !== null && s.id_posto !== undefined ? 'Posto ' + s.id_posto : null)
            || 'Geral';
        var tipo = s.tipo_nome || (s.lugar_id ? 'Disponibilidade' : 'Sem tipo');
        var li = document.createElement('li');
        li.className = 'sensor-item';
        li.dataset.sensorId = s.id_sensor;
        li.innerHTML =
            '<div class="sensor-row" role="button" tabindex="0" aria-expanded="false"' +
            '     onclick="toggleSensor(this)" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();toggleSensor(this);}">' +
            '    <span class="sensor-nome">Sensor ' + s.id_sensor + '</span>' +
            '    <span class="sensor-local">' + local + '</span>' +
            '    <span class="sensor-tipo">' + tipo + '</span>' +
            '    <span class="sensor-chevron" aria-hidden="true">▼</span>' +
            '</div>' +
            '<div class="sensor-detalhe" id="' + id + '" aria-hidden="true">' +
            '    <div class="sensor-estado-wrap">' +
            '        <span class="sensor-estado-label">Estado: ' + s.estado + '</span>' +
            '        <label class="toggle-switch" aria-label="Ativar ou desativar sensor">' +
            '            <input type="checkbox"' + (s.estado === 'ligado' ? ' checked' : '') + ' onchange="toggleEstado(this)">' +
            '            <span class="toggle-track"><span class="toggle-thumb"></span></span>' +
            '        </label></div></div>';
        ul.appendChild(li);
    });
}

function toggleSensor(row) {
    var item = row.closest('.sensor-item');
    var wasAberto = item.classList.contains('aberto');
    document.querySelectorAll('.sensor-item.aberto').forEach(function (o) {
        o.classList.remove('aberto');
        o.querySelector('.sensor-row').setAttribute('aria-expanded', 'false');
        o.querySelector('.sensor-detalhe').setAttribute('aria-hidden', 'true');
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
}

function selecionarFiltro(el) {
    document.querySelectorAll('.filtro-opcao').forEach(function (i) { i.classList.remove('ativo'); i.setAttribute('aria-pressed', 'false'); });
    el.classList.add('ativo');
    el.setAttribute('aria-pressed', 'true');
    carregarSensores();
}

function toggleEstado(input) {
    var item = input.closest('.sensor-item');
    var id = item.dataset.sensorId;
    var novoEstado = input.checked ? 'ligado' : 'desligado';
    apiFetch('/api/sensores/' + id + '/estado', {
        method: 'PATCH',
        body: JSON.stringify({ estado: novoEstado })
    }).then(function (r) { return r.json(); }).then(function (d) {
        if (d.erro) {
            alert('Erro: ' + d.erro);
            input.checked = !input.checked;
        } else {
            var label = item.querySelector('.sensor-estado-label');
            if (label) label.textContent = 'Estado: ' + novoEstado;
        }
    });
}
