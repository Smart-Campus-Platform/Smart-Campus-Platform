// Generic mobility reservation script (used by trotinetes and bicicletas pages)
// Expects window.TIPO_MOBILIDADE = 'trotinete' or 'bicicleta'

var veiculoSelecionado = null;

document.addEventListener('DOMContentLoaded', function () {
    if (typeof window.TIPO_MOBILIDADE === 'undefined') return;
    carregarVeiculos();

    var hoje = new Date().toISOString().slice(0, 10);
    var dataInicioInput = document.getElementById('mob-data-inicio');
    var dataFimInput = document.getElementById('mob-data-fim');
    if (dataInicioInput) dataInicioInput.min = hoje;
    if (dataFimInput) dataFimInput.min = hoje;

    var btnReservar = document.querySelector('.btn-reservar');
    if (btnReservar) btnReservar.addEventListener('click', reservar);
});

function carregarVeiculos() {
    fetch('/api/mobilidade?tipo=' + encodeURIComponent(window.TIPO_MOBILIDADE))
        .then(function (r) { return r.json(); })
        .then(function (veiculos) {
            renderizarVeiculos(veiculos);
        })
        .catch(function () {
            alert('Erro ao carregar veículos.');
        });
}

function renderizarVeiculos(veiculos) {
    var lista = document.querySelector('.lista');
    lista.innerHTML = '';
    veiculoSelecionado = null;

    var zonas = {};
    veiculos.forEach(function (v) {
        var zona = v.zona || 'Zona Geral';
        if (!zonas[zona]) zonas[zona] = [];
        zonas[zona].push(v);
    });

    if (Object.keys(zonas).length === 0) {
        lista.innerHTML = '<p style="padding:16px;color:#666;">Nenhum veículo disponível.</p>';
        return;
    }

    var idx = 0;
    Object.keys(zonas).sort().forEach(function (zona) {
        idx++;
        var id = 'zona-mob-' + idx;
        var div = document.createElement('div');
        div.className = 'piso';
        div.innerHTML =
            '<div class="titulo-piso" onclick="toggleSalas(\'' + id + '\', this)">' +
            '<span class="seta-piso">▸</span><span>' + zona + '</span></div>' +
            '<div class="salas" id="' + id + '"></div>';
        lista.appendChild(div);

        var salasDiv = div.querySelector('.salas');
        zonas[zona].forEach(function (v) {
            var p = document.createElement('p');
            p.className = 'sala sala-normal';
            p.textContent = v.codigo_mobilidade;
            p.dataset.codigo = v.codigo_mobilidade;
            p.style.cursor = 'pointer';
            p.addEventListener('click', function () {
                selecionarVeiculo(p);
            });
            salasDiv.appendChild(p);
        });
    });
}

function selecionarVeiculo(el) {
    document.querySelectorAll('.sala.selecionada').forEach(function (s) {
        s.classList.remove('selecionada');
        s.style.background = '';
        s.style.color = '';
    });
    el.classList.add('selecionada');
    el.style.background = '#3bbde8';
    el.style.color = '#fff';
    veiculoSelecionado = el.dataset.codigo;
}

function reservar() {
    if (!veiculoSelecionado) {
        alert('Selecione um veículo.');
        return;
    }

    var dataInicioInput = document.getElementById('mob-data-inicio');
    var horaInicioInput = document.getElementById('mob-hora-inicio');
    var dataInicio = null;
    if (dataInicioInput && dataInicioInput.value && horaInicioInput && horaInicioInput.value) {
        var agora = new Date();
        var hoje = agora.toISOString().slice(0, 10);
        if (dataInicioInput.value < hoje) {
            alert('Não é possível reservar para uma data anterior à de hoje.');
            return;
        }
        if (dataInicioInput.value === hoje) {
            var limiteHora = new Date(agora.getTime() + 60 * 60 * 1000);
            var horaInicioDate = new Date(dataInicioInput.value + 'T' + horaInicioInput.value + ':00');
            if (horaInicioDate < limiteHora) {
                alert('A hora de início deve ser pelo menos 1 hora após a hora atual.');
                return;
            }
        }
        dataInicio = dataInicioInput.value + ' ' + horaInicioInput.value + ':00';
    }

    var dataFimInput = document.getElementById('mob-data-fim');
    var horaFimInput = document.getElementById('mob-hora-fim');
    var dataFim = null;
    if (dataFimInput && dataFimInput.value && horaFimInput && horaFimInput.value) {
        dataFim = dataFimInput.value + ' ' + horaFimInput.value + ':00';
    }

    apiFetch('/api/reservas/mobilidade', {
        method: 'POST',
        body: JSON.stringify({ codigoMobilidade: veiculoSelecionado, dataInicio: dataInicio, dataFim: dataFim })
    }).then(function (r) { return r.json(); }).then(function (dados) {
        if (dados.erro) {
            alert('Erro: ' + dados.erro);
        } else {
            alert('Reserva de "' + veiculoSelecionado + '" iniciada com sucesso!');
            veiculoSelecionado = null;
            carregarVeiculos();
        }
    }).catch(function () {
        alert('Erro ao efetuar reserva.');
    });
}
