function toggleReserva(row) {
    var item = row.closest('.reserva-item');
    var wasAberto = item.classList.contains('aberto');

    document.querySelectorAll('.reserva-item.aberto').forEach(function (other) {
        other.classList.remove('aberto');
        var otherRow = other.querySelector('.reserva-row');
        var otherAcoes = other.querySelector('.reserva-acoes');
        otherRow.setAttribute('aria-expanded', 'false');
        otherAcoes.setAttribute('aria-hidden', 'true');
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
