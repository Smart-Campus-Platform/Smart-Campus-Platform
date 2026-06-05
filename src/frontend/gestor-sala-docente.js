document.addEventListener('DOMContentLoaded', function () {
    carregarDisponibilidade();
});

function carregarDisponibilidade() {
    var agora = new Date().toISOString().slice(0, 16).replace('T', ' ');
    var data = new Date().toISOString().slice(0, 10);

    Promise.all([
        fetch('/api/salas/todas').then(function (r) { return r.json(); }),
        fetch('/api/reservas/salas/todas').then(function (r) { return r.json(); })
    ]).then(function (results) {
        var salas = results[0];
        var reservas = results[1];

        var agora = new Date();
        var ocupadas = new Set(reservas
            .filter(function (r) {
                return r.estado === 'ativa' &&
                    new Date(r.data_inicio) <= agora &&
                    new Date(r.data_fim) >= agora;
            })
            .map(function (r) { return r.s_id_sala; }));

        renderizarDisponibilidade(salas, ocupadas);
    }).catch(function () {
        document.querySelector('.lista').innerHTML = '<p style="padding:16px;color:#c0392b;">Erro ao carregar disponibilidade.</p>';
    });
}

function renderizarDisponibilidade(salas, ocupadas) {
    var lista = document.querySelector('.lista');
    lista.innerHTML = '';

    var pisos = {};
    salas.forEach(function (s) {
        if (!pisos[s.piso]) pisos[s.piso] = [];
        pisos[s.piso].push(s);
    });

    if (Object.keys(pisos).length === 0) {
        lista.innerHTML = '<p style="padding:16px;color:#666;">Nenhuma sala registada.</p>';
        return;
    }

    Object.keys(pisos).sort(function (a, b) { return a - b; }).forEach(function (piso) {
        var id = 'disp-piso-' + piso;
        var div = document.createElement('div');
        div.className = 'piso';
        div.innerHTML =
            '<div class="titulo-piso" onclick="toggleSalas(\'' + id + '\', this)">' +
            '<span class="seta-piso">▸</span><span>Piso ' + piso + '</span></div>' +
            '<div class="salas" id="' + id + '"></div>';
        lista.appendChild(div);

        var salasDiv = div.querySelector('.salas');
        pisos[piso].forEach(function (s) {
            var disponivel = !ocupadas.has(s.id_sala) && s.disponibilidade;
            var cls = disponivel ? 'disponivel' : 'indisponivel';
            var title = disponivel ? 'Disponível' : 'Indisponível';
            var wrapper = document.createElement('div');
            wrapper.className = 'sala-disp';
            wrapper.innerHTML = '<span>' + s.nome + '</span><span class="indicador ' + cls + '" title="' + title + '"></span>';
            salasDiv.appendChild(wrapper);
        });
    });
}
