require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const db = require('../config/db');

function rf(min, max) { return Math.random() * (max - min) + min; }
function pad(n) { return String(n).padStart(2, '0'); }

function toMysqlTs(d) {
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ` +
           `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

async function seed() {
    console.log('A ler sensores da BD...');

    const [sensores] = await db.promise().query(`
        SELECT s.id_sensor, ts.nome AS tipo_nome, s.limite_min, s.limite_max
        FROM sensor s
        LEFT JOIN tipo_sensor ts ON ts.id_tipoSensor = s.ts_id_tipoSensor
        WHERE s.limite_min IS NOT NULL AND s.limite_max IS NOT NULL
    `);

    if (!sensores.length) {
        console.log('Nenhum sensor com limites definidos encontrado. Adiciona sensores primeiro.');
        process.exit(0);
    }

    console.log(`Encontrados ${sensores.length} sensores. A gerar leituras (365 dias × 30min)...\n`);

    const agora     = Date.now();
    const MS_INTERVALO = 30 * 60 * 1000;          // 30 minutos
    const NUM_LEIT     = 365 * 24 * 2;            // 17 520 leituras por sensor (1 a cada 30min, 1 ano)
    const BATCH     = 200;
    let totalGeral  = 0;

    for (const s of sensores) {
        const min     = Number(s.limite_min);
        const max     = Number(s.limite_max);
        const isOcup  = (s.tipo_nome || '').toLowerCase().includes('ocup');

        const values = [];
        for (let i = NUM_LEIT; i >= 0; i--) {
            const ts          = new Date(agora - i * MS_INTERVALO);
            const forcarAlerta = Math.random() < 0.12;   
            let valor;

            if (forcarAlerta) {
                //metade alerta maximo, metade alerta minimo
                valor = Math.random() > 0.5
                    ? max + (max - min) * rf(0.1, 0.35)
                    : Math.max(0, min - (max - min) * rf(0.05, 0.25));
            } else {
                valor = rf(min, max);
            }

            valor = isOcup ? Math.round(valor) : Math.round(valor * 10) / 10;
            values.push([s.id_sensor, valor, toMysqlTs(ts)]);
        }

        // inserir em batches
        for (let b = 0; b < values.length; b += BATCH) {
            await db.promise().query(
                'INSERT INTO dados_sensor (s_id_sensor, valor, data_hora) VALUES ?',
                [values.slice(b, b + BATCH)]
            );
        }

        totalGeral += values.length;
        console.log(`  [Sensor ${s.id_sensor}] ${s.tipo_nome} — ${values.length} leituras OK`);
    }

    console.log(`\n✓ Concluído! ${totalGeral} leituras inseridas no total.`);
    process.exit(0);
}

seed().catch(function (err) {
    console.error('Erro no seed:', err.message);
    process.exit(1);
});
