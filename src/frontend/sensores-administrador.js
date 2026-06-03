var tiposDisponiveis = [];

document.addEventListener('DOMContentLoaded', function () {
    carregarTipos();
    carregarSensores();

    document.getElementById('modal-overlay').addEventListener('click', function (e) {
        if (e.target === this) fecharModal();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fecharModal(); });
});

function carregarTipos() {
    fetch('/api/sensores/tipos').then(function (r) { return r.json(); }).then(function (tipos) {
        tiposDisponiveis = tipos;
    });
}

function carregarSensores() {
    var filtroAtivo = document.querySelector('.filtro-opcao.ativo');
    var tipo = filtroAtivo ? filtroAtivo.dataset.tipo || '' : '';
    var url = '/api/sensores' + (tipo ? '?tipo=' + encodeURIComponent(tipo) : '');
    fetch(url).then(function (r) { return r.json(); }).then(function (sensores) {
        renderizarSensores(sensores);
    });
}

function renderizarSensores(sensores) {
    var ul = document.querySelector('.sensor-lista');
    ul.innerHTML = '';
    if (sensores.length === 0) {
        ul.innerHTML = '<li style="padding:16px;color:#666;">Nenhum sensor registado.</li>';
        return;
    }
    sensores.forEach(function (s, i) {
        var id = 'detalhe-sn-' + i;
        var local = s.sala_nome || (s.id_posto !== null && s.id_posto !== undefined ? 'Posto ' + s.id_posto : null) || 'Geral';
        var li = document.createElement('li');
        li.className = 'sensor-item';
        li.dataset.sensorId = s.id_sensor;
        li.innerHTML =
            '<div class="sensor-row" role="button" tabindex="0" aria-expanded="false"' +
            '     onclick="toggleSensor(this)" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();toggleSensor(this);}">' +
            '    <span class="sensor-nome">Sensor ' + s.id_sensor + '</span>' +
            '    <span class="sensor-local">' + local + '</span>' +
            '    ' + (s.tipo_nome ? '<span class="sensor-tipo">' + s.tipo_nome + '</span>' : '') +
            '    <span class="sensor-chevron" aria-hidden="true">▼</span>' +
            '</div>' +
            '<div class="sensor-detalhe" id="' + id + '" aria-hidden="true">' +
            '    <div class="sensor-estado-wrap">' +
            '        <span class="sensor-estado-label">Estado</span>' +
            '        <label class="toggle-switch" aria-label="Ativar ou desativar sensor">' +
            '            <input type="checkbox"' + (s.estado === 'ligado' ? ' checked' : '') + ' onchange="toggleEstado(this)">' +
            '            <span class="toggle-track"><span class="toggle-thumb"></span></span>' +
            '        </label></div>' +
            '    <div class="sensor-botoes">' +
            '        <button type="button" class="btn-remover" onclick="removerSensor(this)">Remover</button>' +
            '    </div></div>';
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

function removerSensor(btn) {
    var item = btn.closest('.sensor-item');
    var id = item.dataset.sensorId;
    if (!confirm('Remover sensor ' + id + '?')) return;
    apiFetch('/api/sensores/' + id, { method: 'DELETE' })
        .then(function (r) { return r.json(); })
        .then(function (d) { if (d.erro) { alert('Erro: ' + d.erro); return; } carregarSensores(); });
}

function toggleEstado(input) {
    var item = input.closest('.sensor-item');
    var id = item.dataset.sensorId;
    apiFetch('/api/sensores/' + id + '/estado', {
        method: 'PATCH',
        body: JSON.stringify({ estado: input.checked ? 'ligado' : 'desligado' })
    }).then(function (r) { return r.json(); }).then(function (d) {
        if (d.erro) { alert('Erro: ' + d.erro); input.checked = !input.checked; }
    });
}

function abrirModal() {
    document.getElementById('novo-tipo').innerHTML = '<option value="">Selecionar tipo...</option>';
    document.getElementById('novo-min-sensor').value = '';
    document.getElementById('novo-max-sensor').value = '';
    document.getElementById('campos-min-max').style.display = 'none';
    document.getElementById('secao-tipo').style.display = 'none';
    document.getElementById('loc-id').value = '';
    document.getElementById('loc-tipo').value = '';
    document.getElementById('loc-lista').style.display = 'none';
    document.getElementById('loc-lista').innerHTML = '';
    document.getElementById('loc-selecionado').style.display = 'none';
    document.querySelectorAll('.btn-loc').forEach(function (b) { b.classList.remove('ativo'); });
    document.getElementById('modal-overlay').classList.add('aberto');
}

function popularDropdownTipos(locTipo) {
    var select = document.getElementById('novo-tipo');
    select.innerHTML = '<option value="">Selecionar tipo...</option>';

    var tipos = locTipo === 'posto'
        ? tiposDisponiveis.filter(function (t) { return t.nome.toLowerCase() === 'consumo energético'; })
        : tiposDisponiveis;

    tipos.forEach(function (t) {
        var opt = document.createElement('option');
        opt.value = String(t.id_tipoSensor);
        opt.textContent = t.nome;
        select.appendChild(opt);
    });
}

function carregarLocalizacoes(tipo) {
    document.querySelectorAll('.btn-loc').forEach(function (b) { b.classList.remove('ativo'); });
    document.getElementById('btn-loc-' + tipo).classList.add('ativo');
    document.getElementById('loc-id').value = '';
    document.getElementById('loc-tipo').value = tipo;
    document.getElementById('loc-selecionado').style.display = 'none';

    document.getElementById('novo-tipo').value = '';
    document.getElementById('campos-min-max').style.display = 'none';

    var secaoTipo = document.getElementById('secao-tipo');
    if (tipo === 'lugar') {
        secaoTipo.style.display = 'none';
        var ocupType = tiposDisponiveis.find(function (t) { return t.nome.toLowerCase().includes('ocup'); });
        document.getElementById('novo-tipo').value = ocupType ? String(ocupType.id_tipoSensor) : '';
        if (ocupType) {
            atualizarCamposSensor();
            document.getElementById('novo-min-sensor').value = '0';
            document.getElementById('novo-max-sensor').value = '1';
        }
    } else {
        secaoTipo.style.display = '';
        popularDropdownTipos(tipo);
    }

    var lista = document.getElementById('loc-lista');
    lista.innerHTML = '';
    lista.style.display = '';

    var urls = { sala: '/api/salas/todas', lugar: '/api/estacionamentos', posto: '/api/postos-carregamento' };
    fetch(urls[tipo]).then(function (r) { return r.json(); }).then(function (items) {
        lista.innerHTML = '';
        if (!items.length) {
            lista.innerHTML = '<button class="loc-item" style="color:#999;" disabled>Nenhum disponível.</button>';
            return;
        }
        items.forEach(function (item) {
            var id, label;
            if (tipo === 'sala') {
                id = item.id_sala;
                label = item.nome + (item.piso !== undefined ? ' — Piso ' + item.piso : '');
            } else if (tipo === 'lugar') {
                id = item.id_lugar;
                label = item.id_lugar + (item.parque ? ' — ' + item.parque : '');
            } else {
                id = item.id_posto;
                label = item.id_posto;
            }
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'loc-item';
            btn.textContent = label;
            btn.onclick = function () {
                lista.querySelectorAll('.loc-item').forEach(function (b) { b.classList.remove('selecionado'); });
                btn.classList.add('selecionado');
                document.getElementById('loc-id').value = id;
                var sel = document.getElementById('loc-selecionado');
                sel.textContent = '✓ ' + label;
                sel.style.display = '';
            };
            lista.appendChild(btn);
        });
    });
}

function atualizarCamposSensor() {
    var tipoId = document.getElementById('novo-tipo').value;

    if (!tipoId) {
        document.getElementById('campos-min-max').style.display = 'none';
        return;
    }

    var tipo = tiposDisponiveis.find(function (t) { return String(t.id_tipoSensor) === tipoId; });
    if (!tipo) return;

    document.getElementById('campos-min-max').style.display = '';
    var u = tipo.unidade ? ' (' + tipo.unidade + ')' : '';
    document.getElementById('label-min-sensor').textContent = 'Mínimo' + u;
    document.getElementById('label-max-sensor').textContent = 'Máximo' + u;
    document.getElementById('novo-min-sensor').value = '';
    document.getElementById('novo-max-sensor').value = '';
}

function fecharModal() {
    document.getElementById('modal-overlay').classList.remove('aberto');
}

function confirmarNovoSensor() {
    var locId   = document.getElementById('loc-id').value || null;
    var locTipo = document.getElementById('loc-tipo').value;
    if (!locTipo) { alert('Selecione uma localização (Sala, Lugar ou Posto).'); return; }
    if (!locId)   { alert('Selecione um item da lista.'); return; }

    var salaId  = locTipo === 'sala'  ? locId : null;
    var lugarId = locTipo === 'lugar' ? locId : null;
    var postoId = locTipo === 'posto' ? locId : null;

    var tipoId = document.getElementById('novo-tipo').value || null;
    if (!tipoId) { alert('Selecione o tipo de sensor.'); return; }

    var limiteMin, limiteMax;
    if (locTipo === 'lugar') {
        limiteMin = parseFloat(document.getElementById('novo-min-sensor').value);
        limiteMax = parseFloat(document.getElementById('novo-max-sensor').value);
        if (isNaN(limiteMin)) limiteMin = 0;
        if (isNaN(limiteMax)) limiteMax = 1;
    } else {
        var limiteMinStr = document.getElementById('novo-min-sensor').value;
        var limiteMaxStr = document.getElementById('novo-max-sensor').value;
        if (limiteMinStr === '' || limiteMaxStr === '') { alert('Introduza os limites mínimo e máximo.'); return; }
        limiteMin = parseFloat(limiteMinStr);
        limiteMax = parseFloat(limiteMaxStr);
        if (limiteMin >= limiteMax) { alert('O limite mínimo deve ser menor que o máximo.'); return; }
    }

    apiFetch('/api/sensores', {
        method: 'POST',
        body: JSON.stringify({
            tipoSensorId: parseInt(tipoId),
            salaId: salaId,
            lugarId: lugarId,
            postoId: postoId,
            limiteMin: limiteMin,
            limiteMax: limiteMax
        })
    }).then(function (r) { return r.json(); }).then(function (d) {
        if (d.erro) { alert('Erro: ' + d.erro); return; }
        fecharModal();
        carregarSensores();
    });
}
