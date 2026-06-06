require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const db = require('../config/db');

function rf(min, max) { return Math.random() * (max - min) + min; }
function pad(n) { return String(n).padStart(2, '0'); }

function toMysqlTs(d) {
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ` +
           `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

async function seed() {
    const agora        = Date.now();
    const MS_INTERVALO = 30 * 60 * 1000;
    const NUM_LEIT     = 365 * 24 * 2;   // 17 520 por sensor (1 a cada 30min, 1 ano)
    const BATCH        = 200;
    let totalGeral     = 0;

    // ── 1. sensores normais (com limites definidos) ───────────────────────
    console.log('A ler sensores da BD...');
    const [sensores] = await db.promise().query(`
        SELECT s.id_sensor, ts.nome AS tipo_nome, s.limite_min, s.limite_max
        FROM sensor s
        LEFT JOIN tipo_sensor ts ON ts.id_tipoSensor = s.ts_id_tipoSensor
        WHERE s.limite_min IS NOT NULL AND s.limite_max IS NOT NULL
    `);

    if (sensores.length) {
        console.log(`Encontrados ${sensores.length} sensores. A gerar leituras...\n`);
        for (const s of sensores) {
            const min    = Number(s.limite_min);
            const max    = Number(s.limite_max);
            const isOcup = (s.tipo_nome || '').toLowerCase().includes('ocup');
            const values = [];
            for (let i = NUM_LEIT; i >= 0; i--) {
                const ts           = new Date(agora - i * MS_INTERVALO);
                const forcarAlerta = Math.random() < 0.12;
                let valor;
                if (forcarAlerta) {
                    valor = Math.random() > 0.5
                        ? max + (max - min) * rf(0.1, 0.35)
                        : Math.max(0, min - (max - min) * rf(0.05, 0.25));
                } else {
                    valor = rf(min, max);
                }
                valor = isOcup ? Math.round(valor) : Math.round(valor * 10) / 10;
                values.push([s.id_sensor, valor, toMysqlTs(ts)]);
            }
            for (let b = 0; b < values.length; b += BATCH) {
                await db.promise().query(
                    'INSERT INTO dados_sensor (s_id_sensor, valor, data_hora) VALUES ?',
                    [values.slice(b, b + BATCH)]
                );
            }
            totalGeral += values.length;
            console.log(`  [Sensor ${s.id_sensor}] ${s.tipo_nome} — ${values.length} leituras OK`);
        }
    } else {
        console.log('Nenhum sensor com limites definidos encontrado.\n');
    }

    // ── 2. sensores de ocupação para parques de estacionamento ───────────
    console.log('\nA verificar parques de estacionamento...');

    // tipo_sensor "Ocupação"
    const [[tipoOcup]] = await db.promise().query(
        "SELECT id_tipoSensor FROM tipo_sensor WHERE nome LIKE '%Ocupa%' LIMIT 1"
    );
    if (!tipoOcup) {
        console.log('  Tipo de sensor "Ocupação" não encontrado, a saltar parques.');
        console.log(`\n✓ Concluído! ${totalGeral} leituras inseridas no total.`);
        process.exit(0);
    }

    // parques: nome, total de lugares, um lugar representativo
    const [parques] = await db.promise().query(`
        SELECT parque, COUNT(*) AS total, MIN(id_lugar) AS id_lugar_ref
        FROM lugar_estacionamento
        WHERE parque IS NOT NULL
        GROUP BY parque
    `);

    if (!parques.length) {
        console.log('  Nenhum parque encontrado, a saltar.');
        console.log(`\n✓ Concluído! ${totalGeral} leituras inseridas no total.`);
        process.exit(0);
    }

    for (const p of parques) {
        // verificar se já existe sensor de ocupação para este lugar
        const [[existing]] = await db.promise().query(
            'SELECT id_sensor FROM sensor WHERE le_id_lugar = ? AND ts_id_tipoSensor = ? LIMIT 1',
            [p.id_lugar_ref, tipoOcup.id_tipoSensor]
        );

        let sensorId;
        if (existing) {
            sensorId = existing.id_sensor;
            console.log(`  [Parque ${p.parque}] sensor existente #${sensorId}`);
        } else {
            const [ins] = await db.promise().query(
                'INSERT INTO sensor (ts_id_tipoSensor, le_id_lugar, limite_min, limite_max) VALUES (?, ?, 0, ?)',
                [tipoOcup.id_tipoSensor, p.id_lugar_ref, p.total]
            );
            sensorId = ins.insertId;
            console.log(`  [Parque ${p.parque}] sensor criado #${sensorId} (0–${p.total} lugares)`);
        }

        // gerar ocupação realista: maior durante dias úteis e horas de ponta
        const values = [];
        for (let i = NUM_LEIT; i >= 0; i--) {
            const ts      = new Date(agora - i * MS_INTERVALO);
            const hora    = ts.getHours();
            const diaSem  = ts.getDay(); // 0=Dom, 6=Sab
            const fimSem  = diaSem === 0 || diaSem === 6;
            const pontaManha = hora >= 8  && hora <= 10;
            const pontaTarde = hora >= 17 && hora <= 19;
            const horaUtil   = hora >= 7  && hora <= 20;

            let taxa;
            if (fimSem) {
                taxa = horaUtil ? rf(0.1, 0.4) : rf(0.0, 0.15);
            } else if (pontaManha || pontaTarde) {
                taxa = rf(0.7, 1.0);
            } else if (horaUtil) {
                taxa = rf(0.4, 0.85);
            } else {
                taxa = rf(0.0, 0.2);
            }

            const valor = Math.round(taxa * p.total);
            values.push([sensorId, valor, toMysqlTs(ts)]);
        }

        for (let b = 0; b < values.length; b += BATCH) {
            await db.promise().query(
                'INSERT INTO dados_sensor (s_id_sensor, valor, data_hora) VALUES ?',
                [values.slice(b, b + BATCH)]
            );
        }
        totalGeral += values.length;
        console.log(`  [Parque ${p.parque}] ${values.length} leituras de ocupação OK`);
    }

    console.log(`\n✓ Concluído! ${totalGeral} leituras inseridas no total.`);
    process.exit(0);
}

seed().catch(function (err) {
    console.error('Erro no seed:', err.message);
    process.exit(1);
});
