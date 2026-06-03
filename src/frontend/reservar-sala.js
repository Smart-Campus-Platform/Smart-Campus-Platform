var salasSelecionadas = [];

document.addEventListener('DOMContentLoaded', function () {
    var hoje = new Date().toISOString().slice(0, 10);
    var dateInputs = document.querySelectorAll('.filtros-topo input[type="date"]');
    dateInputs.forEach(function (inp) { inp.min = hoje; });

    carregarSalas();

    document.querySelector('.btn-filtrar').addEventListener('click', function () {
        carregarSalas();
    });

    document.querySelector('.btn-reservar').addEventListener('click', function () {
        reservar();
    });

    var filtroSelect = document.querySelector('.filtro');
    if (filtroSelect) {
        filtroSelect.addEventListener('change', function () {
            filtrarSalas(this.value);
        });
    }
});

function carregarSalas() {
    var inputs = document.querySelectorAll('.filtros-topo input');
    var data = inputs[0] ? inputs[0].value : '';
    var horaInicio = inputs[1] ? inputs[1].value : '';
    var horaFim = inputs[2] ? inputs[2].value : '';

    var url = '/api/salas?';
    if (data) url += 'data=' + encodeURIComponent(data) + '&';
    if (horaInicio) url += 'horaInicio=' + encodeURIComponent(horaInicio) + '&';
    if (horaFim) url += 'horaFim=' + encodeURIComponent(horaFim) + '&';

    fetch(url).then(function (r) { return r.json(); }).then(function (salas) {
        renderizarSalas(salas);
    }).catch(function () {
        alert('Erro ao carregar salas.');
    });
}

function renderizarSalas(salas) {
    var lista = document.querySelector('.lista');
    lista.innerHTML = '';
    salasSelecionadas = [];

    var pisos = {};
    salas.forEach(function (s) {
        if (!pisos[s.piso]) pisos[s.piso] = [];
        pisos[s.piso].push(s);
    });

    Object.keys(pisos).sort(function (a, b) { return a - b; }).forEach(function (piso) {
        var id = 'salas-piso-' + piso;
        var div = document.createElement('div');
        div.className = 'piso';
        div.innerHTML =
            '<div class="titulo-piso" onclick="toggleSalas(\'' + id + '\', this)">' +
            '<span class="seta-piso">▸</span><span>Piso ' + piso + '</span></div>' +
            '<div class="salas" id="' + id + '"></div>';
        lista.appendChild(div);

        var salasDiv = div.querySelector('.salas');
        pisos[piso].forEach(function (s) {
            var cls = s.tipo === 'Laboratório' ? 'laboratorio' : 'sala-normal';
            var p = document.createElement('p');
            p.className = 'sala ' + cls;
            p.textContent = s.nome;
            p.dataset.id = s.id_sala;
            p.dataset.tipo = s.tipo;
            p.style.cursor = 'pointer';
            p.addEventListener('click', function () {
                selecionarSala(p);
            });
            salasDiv.appendChild(p);
        });
    });

    if (Object.keys(pisos).length === 0) {
        lista.innerHTML = '<p style="padding:16px;color:#666;">Nenhuma sala disponível para os filtros selecionados.</p>';
    }
}

function selecionarSala(el) {
    el.classList.toggle('selecionada');
    if (el.classList.contains('selecionada')) {
        el.style.background = '#3bbde8';
        el.style.color = '#fff';
        salasSelecionadas.push({ id: el.dataset.id, nome: el.textContent });
    } else {
        el.style.background = '';
        el.style.color = '';
        salasSelecionadas = salasSelecionadas.filter(function (s) { return s.id !== el.dataset.id; });
    }
}

function reservar() {
    if (salasSelecionadas.length === 0) {
        alert('Selecione pelo menos uma sala.');
        return;
    }
    var inputs = document.querySelectorAll('.filtros-topo input');
    var data = inputs[0] ? inputs[0].value : '';
    var horaInicio = inputs[1] ? inputs[1].value : '';
    var horaFim = inputs[2] ? inputs[2].value : '';

    if (!data || !horaInicio || !horaFim) {
        alert('Selecione data, hora de início e hora de fim.');
        return;
    }

    var agora = new Date();
    var hoje = agora.toISOString().slice(0, 10);
    if (data < hoje) {
        alert('Não é possível reservar para uma data anterior à de hoje.');
        return;
    }
    if (data === hoje) {
        var limiteHora = new Date(agora.getTime() + 60 * 60 * 1000);
        var horaInicioDate = new Date(data + 'T' + horaInicio + ':00');
        if (horaInicioDate < limiteHora) {
            alert('A hora de início deve ser pelo menos 1 hora após a hora atual.');
            return;
        }
    }

    var dataInicio = data + ' ' + horaInicio + ':00';
    var dataFim = data + ' ' + horaFim + ':00';

    var promessas = salasSelecionadas.map(function (s) {
        return apiFetch('/api/reservas/salas', {
            method: 'POST',
            body: JSON.stringify({ salaId: s.id, dataInicio: dataInicio, dataFim: dataFim })
        }).then(function (r) { return r.json(); });
    });

    Promise.all(promessas).then(function (resultados) {
        var sucesso = resultados.filter(function (r) { return r.id; }).length;
        var falha = resultados.filter(function (r) { return r.erro; });
        if (sucesso > 0) {
            alert(sucesso + ' reserva(s) efetuada(s) com sucesso!');
        }
        if (falha.length > 0) {
            alert('Erro: ' + falha.map(function (f) { return f.erro; }).join(', '));
        }
        carregarSalas();
    }).catch(function () {
        alert('Erro ao efetuar reserva.');
    });
}

