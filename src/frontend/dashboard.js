
document.addEventListener('DOMContentLoaded', function () {
    carregarDashboard();
    setInterval(carregarDashboard, 60000);
});

function carregarDashboard() {
    fetch('/api/sensores/dados/dashboard')
        .then(function (r) { return r.json(); })
        .then(function (sensores) {
            renderizarResumo(sensores);
            renderizarConsumo(sensores);
            renderizarSecao(sensores, 'Temperatura',        'cards-temperatura');
            renderizarSecao(sensores, 'Qualidade do Ar',    'cards-ar');
            renderizarSecao(sensores, 'Ocupação',           'cards-ocupacao');
            renderizarSecao(sensores, 'Consumo Energético', 'cards-energia');
            document.getElementById('dash-timestamp').textContent =
                'Última atualização: ' + new Date().toLocaleString('pt-PT');
        })
        .catch(function () {
            console.error('Erro ao carregar dashboard');
        });
}

function emAlerta(s) {
    if (s.ultimo_valor === null || s.ultimo_valor === undefined) return false;
    var v = Number(s.ultimo_valor);
    if (s.limite_max !== null && s.limite_max !== undefined && v > Number(s.limite_max)) return true;
    if (s.limite_min !== null && s.limite_min !== undefined && v < Number(s.limite_min)) return true;
    return false;
}

function renderizarResumo(sensores) {
    var total    = sensores.length;
    var ativos   = sensores.filter(function (s) { return s.estado === 'ligado'; }).length;
    var inativos = total - ativos;
    var alertas  = sensores.filter(function (s) { return s.estado === 'ligado' && emAlerta(s); }).length;

    document.getElementById('rc-total').textContent    = total;
    document.getElementById('rc-ativos').textContent   = ativos;
    document.getElementById('rc-inativos').textContent = inativos;
    document.getElementById('total-alertas').textContent = alertas;
}

function renderizarConsumo(sensores) {
    var energeticos = sensores.filter(function (s) {
        return s.tipo_nome && s.tipo_nome.toLowerCase().includes('consumo') && s.ultimo_valor !== null;
    });

    var elTotal = document.getElementById('consumo-total');
    if (elTotal) {
        var total = energeticos.reduce(function (acc, s) { return acc + Number(s.ultimo_valor); }, 0);
        elTotal.textContent = total.toFixed(1) + ' kW';
    }

    energeticos.sort(function (a, b) { return Number(b.ultimo_valor) - Number(a.ultimo_valor); });
    var top3  = energeticos.slice(0, 3);
    var lista = document.getElementById('top3-lista');

    if (!lista) return;
    if (top3.length === 0) {
        lista.innerHTML = '<p style="color:#666;font-size:14px;">Sem dados de consumo disponíveis.</p>';
        return;
    }
    lista.innerHTML = top3.map(function (s, i) {
        var local = s.sala_nome
            || (s.lugar_id ? 'Lugar ' + s.lugar_id : null)
            || (s.id_posto ? 'Posto ' + s.id_posto : null)
            || 'Geral';
        return '<div class="top3-item">' +
            '<span class="top3-pos">' + (i + 1) + 'º</span>' +
            '<span class="top3-local">' + local + '</span>' +
            '<span class="top3-valor">' + Number(s.ultimo_valor).toFixed(1) + ' ' + (s.unidade || 'kW') + '</span>' +
            '</div>';
    }).join('');
}

function renderizarSecao(sensores, tipoNome, containerId) {
    var filtrados = sensores.filter(function (s) {
        return s.tipo_nome && s.tipo_nome.toLowerCase() === tipoNome.toLowerCase();
    });
    var container = document.getElementById(containerId);
    if (filtrados.length === 0) {
        container.innerHTML = '<p style="color:#666;font-size:14px;padding:8px 0;">Sem sensores deste tipo.</p>';
        return;
    }

    var isOcupacao = tipoNome.toLowerCase().includes('ocup');

    container.innerHTML = filtrados.map(function (s) {
        var local = s.sala_nome
            || (s.lugar_id ? 'Lugar ' + s.lugar_id : null)
            || (s.id_posto ? 'Posto ' + s.id_posto : null)
            || 'Geral';
        if (s.sala_nome && s.piso !== null && s.piso !== undefined) {
            local += ' — Piso ' + s.piso;
        }

        var temDados = s.ultimo_valor !== null && s.ultimo_valor !== undefined;
        var valorTxt = temDados
            ? Number(s.ultimo_valor).toFixed(isOcupacao ? 0 : 1) + (s.unidade ? ' ' + s.unidade : '')
            : 'Sem dados';

        var alerta    = emAlerta(s);
        var inativo   = s.estado !== 'ligado';
        var statusCls = inativo ? 'sc-inativo' : (alerta ? 'sc-alerta' : 'sc-normal');
        var statusTxt = inativo ? 'Inativo' : (alerta ? 'Alerta' : 'Normal');

        return '<div class="sensor-card ' + statusCls + '" data-local="' + local.toLowerCase() + '">' +
            '<div class="sc-header">' +
            '<span class="sc-id">Sensor ' + s.id_sensor + '</span>' +
            '<span class="sc-local">' + local + '</span>' +
            '</div>' +
            '<div class="sc-valor">' + valorTxt + '</div>' +
            '<span class="sc-status">' + statusTxt + '</span>' +
            '</div>';
    }).join('');
}

function filtrarPorLocal(valor) {
    var termo = valor.trim().toLowerCase();
    var visiveisPorSecao = {};
    var totalVisiveis = 0;

    document.querySelectorAll('.sensor-card').forEach(function (card) {
        var local   = (card.dataset.local || '').toLowerCase();
        var mostrar = termo === '' || local.includes(termo);
        card.style.display = mostrar ? '' : 'none';
        if (mostrar) totalVisiveis++;

        var secao = card.closest('.secao-sensores');
        if (secao) {
            if (visiveisPorSecao[secao.id] === undefined) visiveisPorSecao[secao.id] = 0;
            if (mostrar) visiveisPorSecao[secao.id]++;
        }
    });

    document.querySelectorAll('.secao-sensores').forEach(function (secao) {
        var count = visiveisPorSecao[secao.id] || 0;
        secao.style.display = (termo !== '' && count === 0) ? 'none' : '';
    });

    document.getElementById('sem-resultados').style.display =
        (totalVisiveis === 0 && termo !== '') ? '' : 'none';
}

function limparPesquisa() {
    document.getElementById('pesquisa-local').value = '';
    filtrarPorLocal('');
}

function gerarRelatorio() {
    window.print();
}
