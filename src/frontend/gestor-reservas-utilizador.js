var todasReservas = [];
var filtroAtivo = '';
var filtroEstado = '';

document.addEventListener('DOMContentLoaded', function () {
    carregarReservas();

    document.querySelectorAll('.filtro-opcao:not(.filtro-estado)').forEach(function (el) {
        el.addEventListener('click', function () { selecionarFiltro(el); });
        el.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selecionarFiltro(el); }
        });
    });

    document.querySelectorAll('.filtro-estado').forEach(function (el) {
        el.addEventListener('click', function () { selecionarFiltroEstado(el); });
        el.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selecionarFiltroEstado(el); }
        });
    });
});

function carregarReservas() {
    Promise.all([
        apiFetch('/api/reservas/salas').then(function (r) { return r.json(); }),
        apiFetch('/api/reservas/equipamentos').then(function (r) { return r.json(); }),
        apiFetch('/api/reservas/mobilidade').then(function (r) { return r.json(); })
    ]).then(function (results) {
        var salas = results[0].map(function (r) {
            return { id: r.id_reserva, tipo: 'Salas', recurso: r.sala_nome, inicio: r.data_inicio, fim: r.data_fim, estado: r.estado, apiTipo: 'salas' };
        });
        var equips = results[1].map(function (r) {
            return { id: r.id_reserva, tipo: 'Equipamento', recurso: r.e_tipo_equipamento, inicio: r.data_inicio, fim: r.data_fim, estado: r.estado, apiTipo: 'equipamentos' };
        });
        var mob = results[2].map(function (r) {
            return { id: r.id_reserva_mobilidade, tipo: r.tipo_mobilidade === 'trotinete' ? 'Trotinetes' : 'Bicicletas', recurso: r.m_codigo_mobilidade, inicio: r.inicio, fim: r.fim, estado: r.estado, apiTipo: 'mobilidade' };
        });
        todasReservas = salas.concat(equips).concat(mob);
        renderizarLista(todasReservas);
    }).catch(function () {
        document.querySelector('.reserva-lista').innerHTML = '<li style="padding:16px;color:#c0392b;">Erro ao carregar reservas.</li>';
    });
}

function renderizarLista(lista) {
    var ul = document.querySelector('.reserva-lista');
    ul.innerHTML = '';

    if (lista.length === 0) {
        ul.innerHTML = '<li style="padding:16px;color:#666;">Sem reservas para mostrar.</li>';
        return;
    }

    lista.forEach(function (r, i) {
        if (filtroAtivo && r.tipo !== filtroAtivo) return;
        if (filtroEstado && !(r.estado && r.estado.toLowerCase().startsWith(filtroEstado))) return;
        var li = document.createElement('li');
        li.className = 'reserva-item';
        li.dataset.tipo = r.tipo;

        var inicio = r.inicio ? new Date(r.inicio).toLocaleString('pt-PT') : '-';
        var fim = r.fim ? new Date(r.fim).toLocaleString('pt-PT') : '-';

        var botoes = '<button type="button" onclick="cancelarReserva(' + r.id + ',\'' + r.apiTipo + '\', this)">Cancelar</button>';
        if (r.apiTipo === 'mobilidade' && r.estado === 'ativa') {
            botoes += ' <button type="button" onclick="devolverVeiculo(' + r.id + ', this)">Devolver</button>';
        }

        li.innerHTML =
            '<div class="reserva-row" role="button" tabindex="0" aria-expanded="false"' +
            '     onclick="toggleReserva(this)"' +
            '     onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();toggleReserva(this);}">' +
            '    <span class="reserva-nome">' + r.tipo + '</span>' +
            '    <span class="reserva-sala">' + r.recurso + '</span>' +
            '    <span class="reserva-chevron" aria-hidden="true">▼</span>' +
            '</div>' +
            '<div class="reserva-acoes" aria-hidden="true">' +
            '    <p style="margin:4px 0;font-size:13px;">Início: ' + inicio + '</p>' +
            '    <p style="margin:4px 0;font-size:13px;">Fim: ' + fim + '</p>' +
            '    <p style="margin:4px 0;font-size:13px;">Estado: ' + r.estado + '</p>' +
            '    <div class="reserva-acoes-row">' + botoes + '</div>' +
            '</div>';
        ul.appendChild(li);
    });
}

function selecionarFiltro(el) {
    document.querySelectorAll('.filtro-opcao').forEach(function (item) {
        item.classList.remove('ativo');
        item.setAttribute('aria-pressed', 'false');
    });
    el.classList.add('ativo');
    el.setAttribute('aria-pressed', 'true');
    filtroAtivo = el.textContent.trim() === 'Salas' || el.textContent.trim() === 'Equipamento' ||
        el.textContent.trim() === 'Trotinetes' || el.textContent.trim() === 'Bicicletas'
        ? el.textContent.trim() : '';
    renderizarLista(todasReservas);
}

function selecionarFiltroEstado(el) {
    document.querySelectorAll('.filtro-estado').forEach(function (item) {
        item.classList.remove('ativo');
        item.setAttribute('aria-pressed', 'false');
    });
    el.classList.add('ativo');
    el.setAttribute('aria-pressed', 'true');
    filtroEstado = el.dataset.estado || '';
    renderizarLista(todasReservas);
}

function cancelarReserva(id, tipo, btn) {
    if (!confirm('Cancelar esta reserva?')) return;
    apiFetch('/api/reservas/' + tipo + '/' + id, { method: 'DELETE' })
        .then(function (r) { return r.json(); })
        .then(function (dados) {
            if (dados.erro) { alert('Erro: ' + dados.erro); return; }
            carregarReservas();
        });
}

function devolverVeiculo(id, btn) {
    if (!confirm('Devolver este veículo?')) return;
    apiFetch('/api/reservas/mobilidade/' + id + '/devolver', { method: 'PUT', body: JSON.stringify({}) })
        .then(function (r) { return r.json(); })
        .then(function (dados) {
            if (dados.erro) { alert('Erro: ' + dados.erro); return; }
            carregarReservas();
        });
}

function toggleReserva(row) {
    var item = row.closest('.reserva-item');
    var wasAberto = item.classList.contains('aberto');
    document.querySelectorAll('.reserva-item.aberto').forEach(function (other) {
        other.classList.remove('aberto');
        other.querySelector('.reserva-row').setAttribute('aria-expanded', 'false');
        other.querySelector('.reserva-acoes').setAttribute('aria-hidden', 'true');
    });
    if (!wasAberto) {
        item.classList.add('aberto');
        row.setAttribute('aria-expanded', 'true');
        item.querySelector('.reserva-acoes').setAttribute('aria-hidden', 'false');
    }
}

function toggleFiltros(btn) {
    var lista = document.getElementById('filtros-lista');
    var isAberto = lista.classList.toggle('aberto');
    btn.setAttribute('aria-expanded', isAberto ? 'true' : 'false');
}
