document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('rel-timestamp').textContent =
        'Última atualização: ' + new Date().toLocaleString('pt-PT');

    carregarRelatorios();

    document.getElementById('modal-relatorio').addEventListener('click', function (e) {
        if (e.target === this) fecharModalRelatorio();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') fecharModalRelatorio();
    });
});

function carregarRelatorios() {
    fetch('/api/sensores/dados/relatorios')
        .then(function (r) { return r.json(); })
        .then(function (dados) {
            renderizarResumoCards(dados);
            renderizarTabelaConsumo(dados.topSensoresConsumo);
            renderizarTabelaAlertas(dados.alertas);
            renderizarTabelaQarMedia(dados.qualidadeArMedia);
            renderizarQar30(dados.qualidadeAr30);
            renderizarMediaSensores(dados.mediaSensores);
            renderizarOcupacaoMedia(dados.ocupacaoMedia);
            renderizarPicosOcupacao(dados.picosOcupacao);
            renderizarParques(dados.parques);
        })
        .catch(function () {
            console.error('Erro ao carregar relatórios');
        });
}

function renderizarResumoCards(dados) {
    var r = dados.resumoConsumo || {};
    var total    = Number(r.consumo_total) || 0;
    var numDias  = Number(r.num_dias)      || 1;
    var media    = numDias > 0 ? total / numDias : 0;

    document.getElementById('rc-consumo-total').textContent = total.toFixed(1) + ' kWh';
    document.getElementById('rc-media-diaria').textContent  = media.toFixed(1) + ' kWh';
    document.getElementById('rc-alertas').textContent       = dados.alertas.length;
}

function renderizarTabelaConsumo(topSensores) {
    var tbody = document.getElementById('tabela-consumo-body');
    if (!topSensores || !topSensores.length) {
        tbody.innerHTML = '<tr><td colspan="5" style="color:#666;padding:16px;">Sem dados disponíveis.</td></tr>';
        return;
    }
    tbody.innerHTML = topSensores.map(function (s, i) {
        var consumo = Number(s.consumo_medio);
        var unidade = s.unidade || 'kW';
        var badge   = s.estado === 'ligado'
            ? '<span class="badge-normal">Ativo</span>'
            : '<span class="badge-inativo">Inativo</span>';
        return '<tr><td>' + (i + 1) + 'º</td><td>Sensor ' + s.id_sensor + '</td><td>' +
               (s.local || '—') + '</td><td>' + consumo.toFixed(2) + ' ' + unidade +
               '</td><td>' + badge + '</td></tr>';
    }).join('');
}

function renderizarTabelaAlertas(alertas) {
    var tbody = document.getElementById('tabela-alertas-body');
    if (!alertas.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="color:#666;padding:16px;">Sem alertas registados.</td></tr>';
        return;
    }
    tbody.innerHTML = alertas.map(function (a) {
        var unid    = a.unidade ? ' ' + a.unidade : '';
        var acima   = a.limite_max !== null && Number(a.valor) > Number(a.limite_max);
        var limite  = acima
            ? 'Máx: ' + a.limite_max + unid
            : 'Mín: ' + a.limite_min + unid;
        var badge   = acima
            ? '<span class="badge-alerta">Alerta ↑</span>'
            : '<span class="badge-atencao">Alerta ↓</span>';
        var data = new Date(a.data_hora).toLocaleString('pt-PT');
        return '<tr><td>' + data + '</td><td>Sensor ' + a.id_sensor + '</td><td>' +
               a.tipo_nome + '</td><td>' + Number(a.valor).toFixed(1) + unid +
               '</td><td>' + limite + '</td><td>' + badge + '</td></tr>';
    }).join('');
}

function renderizarTabelaQarMedia(qualidadeArMedia) {
    var tbody = document.getElementById('tabela-qar-media-body');
    if (!qualidadeArMedia.length) {
        tbody.innerHTML = '<tr><td colspan="4" style="color:#666;padding:16px;">Sem dados disponíveis.</td></tr>';
        return;
    }
    tbody.innerHTML = qualidadeArMedia.map(function (q) {
        var aqi    = Number(q.media_aqi);
        var estado = aqi > 100
            ? '<span class="badge-alerta">Alerta</span>'
            : (aqi > 75
                ? '<span class="badge-atencao">Atenção</span>'
                : '<span class="badge-normal">Normal</span>');
        var tendencia = aqi > 75 ? '↑' : '→';
        return '<tr><td>' + q.local + '</td><td>' + aqi.toFixed(1) + ' AQI</td><td>' +
               tendencia + '</td><td>' + estado + '</td></tr>';
    }).join('');
}

function renderizarQar30(qualidadeAr30) {
    var tbody = document.getElementById('tabela-qar-body');
    if (!qualidadeAr30 || !qualidadeAr30.length) {
        tbody.innerHTML = '<tr><td colspan="4" style="color:#666;padding:16px;">Sem dados disponíveis.</td></tr>';
        return;
    }
    tbody.innerHTML = qualidadeAr30.map(function (d) {
        var aqi    = Number(d.aqi);
        var estado = aqi > 100
            ? '<span class="badge-alerta">Alerta</span>'
            : (aqi > 75
                ? '<span class="badge-atencao">Atenção</span>'
                : '<span class="badge-normal">Normal</span>');
        var data = new Date(d.data_hora).toLocaleDateString('pt-PT');
        return '<tr><td>' + data + '</td><td>' + d.local + '</td><td>' +
               aqi.toFixed(0) + ' AQI</td><td>' + estado + '</td></tr>';
    }).join('');
}

function renderizarMediaSensores(mediaSensores) {
    var tbody = document.getElementById('tabela-media-sensores-body');
    if (!mediaSensores.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="color:#666;padding:16px;">Sem dados disponíveis.</td></tr>';
        return;
    }
    tbody.innerHTML = mediaSensores.map(function (s) {
        var media  = s.media !== null && s.media !== undefined ? Number(s.media).toFixed(1) : 'N/D';
        var badge  = s.estado === 'ligado'
            ? '<span class="badge-normal">Ativo</span>'
            : '<span class="badge-inativo">Inativo</span>';
        return '<tr><td>Sensor ' + s.id_sensor + '</td><td>' + (s.tipo_nome || '—') + '</td><td>' +
               (s.local || '—') + '</td><td>' + media + '</td><td>' + (s.unidade || '—') +
               '</td><td>' + badge + '</td></tr>';
    }).join('');
}

function renderizarOcupacaoMedia(ocupacaoMedia) {
    var tbody = document.getElementById('tabela-ocupacao-media-body');
    if (!ocupacaoMedia.length) {
        tbody.innerHTML = '<tr><td colspan="4" style="color:#666;padding:16px;">Sem dados disponíveis.</td></tr>';
        return;
    }
    tbody.innerHTML = ocupacaoMedia.map(function (o) {
        var media = Number(o.ocupacao_media);
        var cap   = o.capacidade ? Number(o.capacidade) : null;
        var taxa  = cap ? Math.round((media / cap) * 100) + '%' : 'N/D';
        return '<tr><td>' + o.sala + '</td><td>' + (cap !== null ? cap : 'N/D') + '</td><td>' +
               media.toFixed(1) + '</td><td>' + taxa + '</td></tr>';
    }).join('');
}

function renderizarPicosOcupacao(picosOcupacao) {
    var tbody = document.getElementById('tabela-picos-body');
    if (!picosOcupacao || !picosOcupacao.length) {
        tbody.innerHTML = '<tr><td colspan="5" style="color:#666;padding:16px;">Sem dados disponíveis.</td></tr>';
        return;
    }
    tbody.innerHTML = picosOcupacao.map(function (p) {
        var cap  = p.capacidade ? Number(p.capacidade) : null;
        var data = new Date(p.data).toLocaleDateString('pt-PT');
        return '<tr><td>' + p.sala + '</td><td>' + (cap !== null ? cap : 'N/D') + '</td><td>' +
               Math.round(p.pico) + '</td><td>' + (p.horario || 'N/D') + '</td><td>' +
               data + '</td></tr>';
    }).join('');
}

function renderizarParques(parques) {
    var tbody = document.getElementById('tabela-parques-body');
    if (!parques || !parques.length) {
        tbody.innerHTML = '<tr><td colspan="5" style="color:#666;padding:16px;">Sem dados disponíveis.</td></tr>';
        return;
    }
    tbody.innerHTML = parques.map(function (p) {
        return '<tr><td>' + (p.parque || 'N/D') + '</td><td>' + p.num_lugares + '</td><td>' +
               Math.round(p.pico_ocupacao) + '</td><td>' + Number(p.media_ocupacao).toFixed(1) +
               '</td><td>' + (p.horario_pico || 'N/D') + '</td></tr>';
    }).join('');
}

function abrirModalRelatorio() {
    document.getElementById('modal-relatorio').classList.add('aberto');
    document.getElementById('nome-relatorio').focus();
}

function fecharModalRelatorio() {
    document.getElementById('modal-relatorio').classList.remove('aberto');
}

function confirmarGerarRelatorio() {
    var nome = document.getElementById('nome-relatorio').value.trim() || 'Relatório';

    var mapa = [
        { check: 'check-media-sensores',  secao: 'media-sensores'  },
        { check: 'check-ocupacao-media',  secao: 'ocupacao-media'  },
        { check: 'check-picos-ocupacao',  secao: 'picos-ocupacao'  },
        { check: 'check-parques',         secao: 'parques'         },
        { check: 'check-qualidade-ar-30', secao: 'qualidade-ar-30' }
    ];

    var secoes = mapa
        .filter(function (m) { return document.getElementById(m.check).checked; })
        .map(function (m) { return m.secao; });

    if (secoes.length === 0) {
        alert('Selecione pelo menos uma secção para incluir no PDF.');
        return;
    }

    fecharModalRelatorio();

    var btnGerar = document.querySelector('.btn-confirmar-rel');
    function restaurarBotao() {
        if (btnGerar) {
            btnGerar.disabled = false;
            btnGerar.innerHTML = '<i class="fa-solid fa-print"></i> Gerar';
        }
    }

    if (btnGerar) {
        btnGerar.disabled = true;
        btnGerar.textContent = 'A gerar…';
    }

    try {
        fetch('/api/relatorios/gerar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: nome, secoes: secoes })
        })
        .then(function (r) {
            if (!r.ok) throw new Error('Servidor devolveu ' + r.status);
            return r.blob();
        })
        .then(function (blob) {
            var url = URL.createObjectURL(blob);
            var a   = document.createElement('a');
            a.href  = url;
            a.download = nome.replace(/[\\/:*?"<>|]/g, '_') + '.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            restaurarBotao();
        })
        .catch(function (e) {
            alert('Erro ao gerar relatório: ' + e.message);
            restaurarBotao();
        });
    } catch (e) {
        alert('Erro inesperado: ' + e.message);
        restaurarBotao();
    }
}
