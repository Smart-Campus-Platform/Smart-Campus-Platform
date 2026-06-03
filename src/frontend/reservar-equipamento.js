var equipSelecionado = null;

document.addEventListener('DOMContentLoaded', function () {
    var hoje = new Date().toISOString().slice(0, 10);
    var dateInputs = document.querySelectorAll('.filtros-topo input[type="date"]');
    dateInputs.forEach(function (inp) { inp.min = hoje; });

    carregarEquipamentos();

    document.querySelector('.btn-filtrar').addEventListener('click', function () {
        carregarEquipamentos();
    });

    document.querySelector('.btn-reservar').addEventListener('click', function () {
        reservar();
    });
});

function carregarEquipamentos() {
    var inputs = document.querySelectorAll('.filtros-topo input');
    var data = inputs[0] ? inputs[0].value : '';
    var horaInicio = inputs[1] ? inputs[1].value : '';
    var horaFim = inputs[2] ? inputs[2].value : '';
    var url = '/api/equipamentos';
    if (data && horaInicio && horaFim) {
        url += '?data=' + encodeURIComponent(data) + '&horaInicio=' + encodeURIComponent(horaInicio) + '&horaFim=' + encodeURIComponent(horaFim);
    }
    fetch(url).then(function (r) { return r.json(); }).then(function (equips) {
        renderizarEquipamentos(equips);
    }).catch(function () {
        alert('Erro ao carregar equipamentos.');
    });
}

function renderizarEquipamentos(equips) {
    var lista = document.querySelector('.lista');
    lista.innerHTML = '';
    equipSelecionado = null;

    var pisos = {};
    equips.forEach(function (e) {
        var key = 'Piso ' + e.piso;
        if (!pisos[key]) pisos[key] = [];
        pisos[key].push(e);
    });

    if (Object.keys(pisos).length === 0) {
        lista.innerHTML = '<p style="padding:16px;color:#666;">Nenhum equipamento disponível.</p>';
        return;
    }

    Object.keys(pisos).sort().forEach(function (piso) {
        var id = 'eq-piso-' + piso.replace(/\s/g, '-');
        var div = document.createElement('div');
        div.className = 'piso';
        div.innerHTML =
            '<div class="titulo-piso" onclick="toggleSalas(\'' + id + '\', this)">' +
            '<span class="seta-piso">▸</span><span>' + piso + '</span></div>' +
            '<div class="salas" id="' + id + '"></div>';
        lista.appendChild(div);

        var salasDiv = div.querySelector('.salas');
        pisos[piso].forEach(function (e) {
            var p = document.createElement('p');
            p.className = 'sala sala-normal';
            p.textContent = e.tipo_equipamento;
            p.dataset.tipo = e.tipo_equipamento;
            p.style.cursor = 'pointer';
            p.addEventListener('click', function () {
                selecionarEquipamento(p);
            });
            salasDiv.appendChild(p);
        });
    });
}

function selecionarEquipamento(el) {
    document.querySelectorAll('.sala.selecionada').forEach(function (s) {
        s.classList.remove('selecionada');
        s.style.background = '';
        s.style.color = '';
    });
    el.classList.add('selecionada');
    el.style.background = '#3bbde8';
    el.style.color = '#fff';
    equipSelecionado = el.dataset.tipo;
}

function reservar() {
    if (!equipSelecionado) {
        alert('Selecione um equipamento.');
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

    apiFetch('/api/reservas/equipamentos', {
        method: 'POST',
        body: JSON.stringify({ tipoEquipamento: equipSelecionado, dataInicio: dataInicio, dataFim: dataFim })
    }).then(function (r) { return r.json(); }).then(function (dados) {
        if (dados.erro) {
            alert('Erro: ' + dados.erro);
        } else {
            alert('Reserva de "' + equipSelecionado + '" efetuada com sucesso!');
            equipSelecionado = null;
            carregarEquipamentos();
        }
    }).catch(function () {
        alert('Erro ao efetuar reserva.');
    });
}
