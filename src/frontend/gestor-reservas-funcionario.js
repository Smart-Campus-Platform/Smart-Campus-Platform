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
    fetch('/api/reservas/todas')
        .then(function (r) { return r.json(); })
        .then(function (reservas) {
            todasReservas = reservas;
            renderizarLista(reservas);
        })
        .catch(function () {
            document.querySelector('.reserva-lista').innerHTML = '<li style="padding:16px;color:#c0392b;">Erro ao carregar reservas.</li>';
        });
}

function renderizarLista(lista) {
    var ul = document.querySelector('.reserva-lista');
    ul.innerHTML = '';

    var filtradas = lista.filter(function (r) {
        var tipoOk = !filtroAtivo ||
            (filtroAtivo === 'Salas' && r.tipo === 'sala') ||
            (filtroAtivo === 'Equipamento' && r.tipo === 'equipamento') ||
            (filtroAtivo === 'Trotinetes' && r.tipo === 'trotinete') ||
            (filtroAtivo === 'Bicicletas' && r.tipo === 'bicicleta');
        var estadoOk = !filtroEstado || (r.estado && r.estado.toLowerCase().startsWith(filtroEstado));
        return tipoOk && estadoOk;
    });

    if (filtradas.length === 0) {
        ul.innerHTML = '<li style="padding:16px;color:#666;">Sem reservas para mostrar.</li>';
        return;
    }

    filtradas.forEach(function (r) {
        var li = document.createElement('li');
        li.className = 'reserva-item';
        li.dataset.tipo = r.tipo;

        var inicio = r.inicio ? new Date(r.inicio).toLocaleString('pt-PT') : '-';
        var fim = r.fim ? new Date(r.fim).toLocaleString('pt-PT') : '-';

        li.innerHTML =
            '<div class="reserva-row" role="button" tabindex="0" aria-expanded="false"' +
            '     onclick="toggleReserva(this)"' +
            '     onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();toggleReserva(this);}">' +
            '    <span class="reserva-nome">' + (r.utilizador || '') + '</span>' +
            '    <span class="reserva-sala">' + r.recurso + ' (' + r.tipo + ')</span>' +
            '    <span class="reserva-chevron" aria-hidden="true">▼</span>' +
            '</div>' +
            '<div class="reserva-acoes" aria-hidden="true">' +
            '    <p style="margin:4px 0;font-size:13px;">Início: ' + inicio + '</p>' +
            '    <p style="margin:4px 0;font-size:13px;">Fim: ' + fim + '</p>' +
            '    <p style="margin:4px 0;font-size:13px;">Estado: ' + r.estado + '</p>' +
            '    <div class="reserva-acoes-row">' +
            (r.tipo === 'sala' ?
                '<button type="button" onclick="atualizarEstado(' + r.id + ',\'confirmada\')">Confirmar</button>' +
                '<button type="button" onclick="atualizarEstado(' + r.id + ',\'cancelada\')">Cancelar</button>' : '') +
            '    </div>' +
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
    var txt = el.textContent.trim();
    filtroAtivo = (txt === 'Todos') ? '' : txt;
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

function atualizarEstado(id, estado) {
    apiFetch('/api/reservas/salas/' + id + '/estado', {
        method: 'PATCH',
        body: JSON.stringify({ estado: estado })
    }).then(function (r) { return r.json(); }).then(function (dados) {
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
