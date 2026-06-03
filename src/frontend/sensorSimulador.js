const db = require('../config/db');

let iteracao = 0;

function gerarValor(tipoNome, limiteMin, limiteMax, forcarAlerta) {
    const min = Number(limiteMin);
    const max = Number(limiteMax);
    const nomeLower = (tipoNome || '').toLowerCase();

    let valor;
    if (forcarAlerta) {
        const usarAbaixo = min > 0 && Math.random() > 0.5;
        if (usarAbaixo) {
            valor = min * Math.random() * 0.4;
        } else {
            valor = max + (max - min) * (0.1 + Math.random() * 0.3);
        }
    } else {
        valor = Math.random() * (max - min) + min;
    }

    return nomeLower.includes('ocup') ? Math.round(valor) : Math.round(valor * 10) / 10;
}

async function simularDados() {
    iteracao++;
    const forcarAlerta = (iteracao % 3 === 0);

    try {
        const [sensores] = await db.promise().query(`
            SELECT s.id_sensor, ts.nome AS tipo_nome, s.limite_min, s.limite_max
            FROM sensor s
            LEFT JOIN tipo_sensor ts ON ts.id_tipoSensor = s.ts_id_tipoSensor
            WHERE s.estado = 'ligado'
              AND s.limite_min IS NOT NULL
              AND s.limite_max IS NOT NULL
        `);

        for (const s of sensores) {
            const valor = gerarValor(s.tipo_nome, s.limite_min, s.limite_max, forcarAlerta);
            await db.promise().query(
                'INSERT INTO dados_sensor (s_id_sensor, valor, data_hora) VALUES (?, ?, NOW())',
                [s.id_sensor, valor]
            );
        }
        console.log(`[Simulador #${iteracao}] ${sensores.length} leituras${forcarAlerta ? ' *** ALERTAS FORÇADOS ***' : ''}`);
    } catch (err) {
        console.error('[Simulador] Erro:', err.message);
    }
}

function iniciar() {
    simularDados();
    setInterval(simularDados, 60000);
}

module.exports = { iniciar };
