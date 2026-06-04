const PDFDocument = require('pdfkit');
function ri(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function rf(min, max, dec) { return parseFloat((Math.random() * (max - min) + min).toFixed(dec)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function dataStr(d) { return d.toLocaleDateString('pt-PT'); }
function dataHoraStr(d) { return d.toLocaleString('pt-PT'); }
function gerarMediaSensores() {
    var tipos   = ['Temperatura', 'Ocupação', 'Qualidade do Ar', 'Consumo Energético'];
    var locais  = ['Sala A1', 'Sala A2', 'Sala B1', 'Sala B2', 'Lab C1', 'Lab C2', 'Parque A', 'Posto 1'];
    var unidade = { 'Temperatura': '°C', 'Ocupação': 'pessoas', 'Qualidade do Ar': 'AQI', 'Consumo Energético': 'kW' };
    var ranges  = { 'Temperatura': [15, 32], 'Ocupação': [1, 40], 'Qualidade do Ar': [20, 140], 'Consumo Energético': [0.5, 9] };
    return Array.from({ length: ri(7, 11) }, function (_, i) {
        var tipo = pick(tipos);
        return {
            id: i + 1,
            tipo: tipo,
            local: pick(locais),
            media: rf(ranges[tipo][0], ranges[tipo][1], 1),
            unidade: unidade[tipo],
            estado: pick(['Ativo', 'Ativo', 'Ativo', 'Inativo'])
        };
    });
}
function gerarOcupacaoMedia() {
    var salas = ['Sala A1', 'Sala A2', 'Sala B1', 'Sala B2', 'Lab C1', 'Lab D1', 'Sala E1', 'Lab F2'];
    return salas.slice(0, ri(5, 8)).map(function (sala) {
        var cap   = pick([20, 25, 30, 35, 40, 50]);
        var media = rf(0, cap * 0.92, 1);
        return { sala: sala, capacidade: cap, media: media, taxa: parseFloat(((media / cap) * 100).toFixed(0)) };
    });
}
function gerarPicosOcupacao() {
    var salas    = ['Sala A1', 'Sala A2', 'Sala B1', 'Sala B2', 'Lab C1', 'Lab D1'];
    var horarios = ['08:30', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
    var agora    = new Date();
    return salas.slice(0, ri(4, 6)).map(function (sala) {
        var cap   = pick([20, 25, 30, 35, 40]);
        var pico  = ri(Math.ceil(cap * 0.5), cap);
        var data  = new Date(agora.getTime() - ri(0, 29) * 86400000);
        return { sala: sala, capacidade: cap, pico: pico, horario: pick(horarios), data: data };
    });
}
function gerarParques() {
    var parques  = ['Parque A', 'Parque B', 'Parque C'];
    var horarios = ['08:00', '09:00', '12:00', '13:00', '18:00'];
    return parques.slice(0, ri(2, 3)).map(function (p) {
        var lugares = ri(10, 30);
        var pico    = ri(Math.ceil(lugares * 0.6), lugares);
        var media   = rf(lugares * 0.2, pico * 0.85, 1);
        return { parque: p, lugares: lugares, pico: pico, media: media, horario_pico: pick(horarios) };
    });
}
function gerarQualidadeAr30() {
    var locais = ['Sala A1', 'Sala B2', 'Lab C1'];
    var agora  = new Date();
    var rows   = [];
    for (var d = 29; d >= 0; d--) {
        var data = new Date(agora.getTime() - d * 86400000);
        locais.forEach(function (local) {
            var aqi    = ri(15, 155);
            var estado = aqi > 100 ? 'Alerta' : aqi > 75 ? 'Atenção' : 'Normal';
            rows.push({ data: data, local: local, aqi: aqi, estado: estado });
        });
    }
    return rows;
}
var MARGEM      = 40;
var ALTURA_LINHA = 18;
var ALTURA_CAB  = 20;
var PAD_X       = 5;
var PAD_Y       = 5;
var COR_CAB     = '#33add6';
var COR_TEXTO   = '#222222';
var COR_ZEBRA   = '#e8f6fb';
var COR_TITULO  = '#1a7a9a';
function paginaUtil(doc) { return doc.page.width - 2 * MARGEM; }
function desenharCabecalhoSecao(doc, titulo) {
    if (doc.y + 40 > doc.page.height - MARGEM) doc.addPage();
    doc.moveDown(0.5)
       .fontSize(12).font('Helvetica-Bold').fillColor(COR_TITULO)
       .text(titulo, MARGEM, doc.y)
       .moveDown(0.3);
}
function desenharTabela(doc, colunas, linhas, larguraColunas) {
    var largTotal = paginaUtil(doc);
    if (!larguraColunas) {
        var w = largTotal / colunas.length;
        larguraColunas = colunas.map(function () { return w; });
    }
    if (doc.y + ALTURA_CAB + ALTURA_LINHA > doc.page.height - MARGEM) doc.addPage();
    var startY = doc.y;
    doc.rect(MARGEM, startY, largTotal, ALTURA_CAB).fill(COR_CAB);
    var xPos = MARGEM;
    colunas.forEach(function (col, i) {
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#ffffff')
           .text(col, xPos + PAD_X, startY + PAD_Y, { width: larguraColunas[i] - PAD_X * 2, lineBreak: false });
        xPos += larguraColunas[i];
    });
    doc.y = startY + ALTURA_CAB;
    linhas.forEach(function (linha, ri) {
        if (doc.y + ALTURA_LINHA > doc.page.height - MARGEM) doc.addPage();
        var rowY = doc.y;
        doc.rect(MARGEM, rowY, largTotal, ALTURA_LINHA).fill(ri % 2 === 0 ? COR_ZEBRA : '#ffffff');
        var rx = MARGEM;
        linha.forEach(function (celula, ci) {
            doc.fontSize(8).font('Helvetica').fillColor(COR_TEXTO)
               .text(String(celula == null ? '—' : celula), rx + PAD_X, rowY + PAD_Y, {
                   width: larguraColunas[ci] - PAD_X * 2,
                   lineBreak: false
               });
            rx += larguraColunas[ci];
        });
        doc.y = rowY + ALTURA_LINHA;
    });
    doc.moveDown(1);
}
const gerarPDF = (req, res) => {
    var nome   = (req.body.nome || 'Relatorio').replace(/[\\/:*?"<>|]/g, '_');
    var secoes = Array.isArray(req.body.secoes) ? req.body.secoes : [];
    // gerar todos os dados aleatórios
    var dados = {
        mediaSensores:  gerarMediaSensores(),
        ocupacaoMedia:  gerarOcupacaoMedia(),
        picosOcupacao:  gerarPicosOcupacao(),
        parques:        gerarParques(),
        qualidadeAr30:  gerarQualidadeAr30()
    };
    var doc = new PDFDocument({ margin: MARGEM, size: 'A4', bufferPages: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="' + encodeURIComponent(nome) + '.pdf"');
    doc.pipe(res);
    // ── capa / título ──────────────────────────────────────────────────────
    doc.fontSize(20).font('Helvetica-Bold').fillColor(COR_TITULO)
       .text(nome, MARGEM, 60, { align: 'center', width: paginaUtil(doc) });
    doc.fontSize(10).font('Helvetica').fillColor('#555555')
       .text('Gerado em: ' + new Date().toLocaleString('pt-PT'), { align: 'center' })
       .moveDown(2);
    var largTotal = paginaUtil(doc);
    // ── secção: média de todos os sensores ────────────────────────────────
    if (secoes.includes('media-sensores')) {
        desenharCabecalhoSecao(doc, 'Média de Todos os Sensores — Últimos 30 Dias');
        var colMS = [55, 110, 120, 55, 80, 95];
        desenharTabela(doc,
            ['Sensor', 'Tipo', 'Local', 'Média', 'Unidade', 'Estado'],
            dados.mediaSensores.map(function (s) {
                return ['Sensor ' + s.id, s.tipo, s.local, s.media, s.unidade, s.estado];
            }),
            colMS
        );
    }
    // ── secção: ocupação média diária ─────────────────────────────────────
    if (secoes.includes('ocupacao-media')) {
        desenharCabecalhoSecao(doc, 'Ocupação Média Diária por Sala');
        desenharTabela(doc,
            ['Sala / Lab', 'Capacidade', 'Ocupação Média', 'Taxa de Utilização'],
            dados.ocupacaoMedia.map(function (o) {
                return [o.sala, o.capacidade, o.media.toFixed(1), o.taxa + '%'];
            }),
            [200, 105, 105, 105]
        );
    }
    // ── secção: picos de ocupação ─────────────────────────────────────────
    if (secoes.includes('picos-ocupacao')) {
        desenharCabecalhoSecao(doc, 'Picos de Ocupação — Salas e Horários');
        desenharTabela(doc,
            ['Sala / Lab', 'Capacidade', 'Pico de Ocupação', 'Horário', 'Data'],
            dados.picosOcupacao.map(function (p) {
                return [p.sala, p.capacidade, p.pico, p.horario, dataStr(p.data)];
            }),
            [140, 80, 100, 95, 100]
        );
    }
    // ── secção: parques de estacionamento ─────────────────────────────────
    if (secoes.includes('parques')) {
        desenharCabecalhoSecao(doc, 'Parques de Estacionamento — Pico e Média de Ocupação');
        desenharTabela(doc,
            ['Parque', 'Lugares', 'Pico de Ocupação', 'Média de Ocupação', 'Horário de Pico'],
            dados.parques.map(function (p) {
                return [p.parque, p.lugares, p.pico, p.media.toFixed(1), p.horario_pico];
            }),
            [120, 75, 110, 110, 100]
        );
    }
    // ── secção: qualidade do ar ───────────────────────────────────────────
    if (secoes.includes('qualidade-ar-30')) {
        desenharCabecalhoSecao(doc, 'Qualidade do Ar — Últimos 30 Dias');
        desenharTabela(doc,
            ['Data', 'Local', 'AQI', 'Estado'],
            dados.qualidadeAr30.map(function (q) {
                return [dataStr(q.data), q.local, q.aqi, q.estado];
            }),
            [110, 175, 100, 130]
        );
    }
    doc.end();
};
module.exports = { gerarPDF };
