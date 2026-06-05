const PDFDocument = require('pdfkit');
const sensor      = require('../models/sensor');

var MARGEM       = 40;
var ALTURA_LINHA = 18;
var ALTURA_CAB   = 20;
var PAD_X        = 5;
var PAD_Y        = 5;
var COR_CAB      = '#33add6';
var COR_TEXTO    = '#222222';
var COR_ZEBRA    = '#e8f6fb';
var COR_TITULO   = '#1a7a9a';

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

const gerarPDF = async (req, res) => {
    var nome   = (req.body.nome || 'Relatorio').replace(/[\\/:*?"<>|]/g, '_');
    var secoes = Array.isArray(req.body.secoes) ? req.body.secoes : [];

    var dados;
    try {
        dados = await sensor.obterDadosRelatorios();
    } catch (err) {
        return res.status(500).json({ erro: 'Erro ao obter dados da base de dados' });
    }

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

    // ── secção: média de todos os sensores ────────────────────────────────
    if (secoes.includes('media-sensores')) {
        desenharCabecalhoSecao(doc, 'Média de Todos os Sensores — Últimos 30 Dias');
        var linhasMS = (dados.mediaSensores || []).map(function (s) {
            var media  = s.media !== null && s.media !== undefined ? Number(s.media).toFixed(1) : 'N/D';
            var estado = s.estado === 'ligado' ? 'Ativo' : 'Inativo';
            return ['Sensor ' + s.id_sensor, s.tipo_nome || '—', s.local || '—', media, s.unidade || '—', estado];
        });
        if (!linhasMS.length) linhasMS = [['Sem dados', '', '', '', '', '']];
        desenharTabela(doc,
            ['Sensor', 'Tipo', 'Local', 'Média', 'Unidade', 'Estado'],
            linhasMS,
            [55, 110, 120, 55, 80, 95]
        );
    }

    // ── secção: ocupação média diária ─────────────────────────────────────
    if (secoes.includes('ocupacao-media')) {
        desenharCabecalhoSecao(doc, 'Ocupação Média Diária por Sala');
        var linhasOM = (dados.ocupacaoMedia || []).map(function (o) {
            var cap  = o.capacidade !== null ? Number(o.capacidade) : null;
            var med  = Number(o.ocupacao_media);
            var taxa = cap ? Math.round((med / cap) * 100) + '%' : 'N/D';
            return [o.sala || '—', cap !== null ? cap : 'N/D', med.toFixed(1), taxa];
        });
        if (!linhasOM.length) linhasOM = [['Sem dados', '', '', '']];
        desenharTabela(doc,
            ['Sala / Lab', 'Capacidade', 'Ocupação Média', 'Taxa de Utilização'],
            linhasOM,
            [200, 105, 105, 105]
        );
    }

    // ── secção: picos de ocupação ─────────────────────────────────────────
    if (secoes.includes('picos-ocupacao')) {
        desenharCabecalhoSecao(doc, 'Picos de Ocupação — Salas e Horários');
        var linhasPO = (dados.picosOcupacao || []).map(function (p) {
            var cap  = p.capacidade !== null ? Number(p.capacidade) : 'N/D';
            var data = p.data ? new Date(p.data).toLocaleDateString('pt-PT') : 'N/D';
            return [p.sala || '—', cap, Math.round(p.pico), p.horario || 'N/D', data];
        });
        if (!linhasPO.length) linhasPO = [['Sem dados', '', '', '', '']];
        desenharTabela(doc,
            ['Sala / Lab', 'Capacidade', 'Pico de Ocupação', 'Horário', 'Data'],
            linhasPO,
            [140, 80, 100, 95, 100]
        );
    }

    // ── secção: parques de estacionamento ─────────────────────────────────
    if (secoes.includes('parques')) {
        desenharCabecalhoSecao(doc, 'Parques de Estacionamento — Pico e Média de Ocupação');
        var linhasP = (dados.parques || []).map(function (p) {
            return [p.parque || 'N/D', p.num_lugares, Math.round(p.pico_ocupacao), Number(p.media_ocupacao).toFixed(1), p.horario_pico || 'N/D'];
        });
        if (!linhasP.length) linhasP = [['Sem dados', '', '', '', '']];
        desenharTabela(doc,
            ['Parque', 'Lugares', 'Pico de Ocupação', 'Média de Ocupação', 'Horário de Pico'],
            linhasP,
            [120, 75, 110, 110, 100]
        );
    }

    // ── secção: qualidade do ar ───────────────────────────────────────────
    if (secoes.includes('qualidade-ar-30')) {
        desenharCabecalhoSecao(doc, 'Qualidade do Ar — Últimos 30 Dias');
        var linhasQA = (dados.qualidadeAr30 || []).map(function (q) {
            var aqi    = Number(q.aqi);
            var estado = aqi > 100 ? 'Alerta' : aqi > 75 ? 'Atenção' : 'Normal';
            var data   = q.data_hora ? new Date(q.data_hora).toLocaleDateString('pt-PT') : 'N/D';
            return [data, q.local || '—', aqi.toFixed(0), estado];
        });
        if (!linhasQA.length) linhasQA = [['Sem dados', '', '', '']];
        desenharTabela(doc,
            ['Data', 'Local', 'AQI', 'Estado'],
            linhasQA,
            [110, 175, 100, 130]
        );
    }

    doc.end();
};

module.exports = { gerarPDF };
