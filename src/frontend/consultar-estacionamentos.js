document.addEventListener('DOMContentLoaded', function () {
    carregarEstacionamentos();
});

function carregarEstacionamentos() {
    fetch('/api/estacionamentos')
        .then(function (r) { return r.json(); })
        .then(function (lugares) {
            renderizarEstacionamentos(lugares);
        })
        .catch(function () {
            document.querySelector('.lista').innerHTML = '<p style="padding:16px;color:#c0392b;">Erro ao carregar estacionamentos.</p>';
        });
}

function renderizarEstacionamentos(lugares) {
    var lista = document.querySelector('.lista');
    lista.innerHTML = '';

    var parques = {};
    lugares.forEach(function (l) {
        var parque = l.parque || 'Parque Geral';
        if (!parques[parque]) parques[parque] = [];
        parques[parque].push(l);
    });

    if (Object.keys(parques).length === 0) {
        lista.innerHTML = '<p style="padding:16px;color:#666;">Nenhum lugar de estacionamento registado.</p>';
        return;
    }

    var idx = 0;
    Object.keys(parques).sort().forEach(function (parque) {
        idx++;
        var id = 'parque-' + idx;
        var div = document.createElement('div');
        div.className = 'piso';
        div.innerHTML =
            '<div class="titulo-piso" onclick="toggleSalas(\'' + id + '\', this)">' +
            '<span class="seta-piso">▸</span><span>' + parque + '</span></div>' +
            '<div class="salas" id="' + id + '"></div>';
        lista.appendChild(div);

        var salasDiv = div.querySelector('.salas');
        parques[parque].forEach(function (l) {
            var cls = l.disponibilidade ? 'sala-normal' : 'sala-indisponivel';
            var p = document.createElement('p');
            p.className = 'sala ' + cls;
            p.textContent = l.id_lugar + (l.disponibilidade ? '' : ' (Ocupado)');
            if (!l.disponibilidade) {
                p.style.opacity = '0.5';
                p.style.textDecoration = 'line-through';
            }
            salasDiv.appendChild(p);
        });
    });
}
