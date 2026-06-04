const db = require('../config/db');
const listarTipos = async () => {
    const [rows] = await db.promise().query('SELECT * FROM tipo_sensor ORDER BY nome');
    return rows;
};
const adicionarTipo = async (nome, unidade) => {
    const [result] = await db.promise().query(
        'INSERT INTO tipo_sensor (nome, unidade) VALUES (?, ?)',
        [nome, unidade || null]
    );
    return result;
};
const listar = async (tipo) => {
    let query = `
        SELECT sen.id_sensor, sen.estado, ts.nome AS tipo_nome,
               sal.nome AS sala_nome, sal.piso,
               le.id_lugar AS lugar_id, le.parque,
               pc.id_posto
        FROM sensor sen
        LEFT JOIN tipo_sensor ts ON ts.id_tipoSensor = sen.ts_id_tipoSensor
        LEFT JOIN sala sal ON sal.id_sala = sen.s_id_sala
        LEFT JOIN lugar_estacionamento le ON le.id_lugar = sen.le_id_lugar
        LEFT JOIN posto_carregamento pc ON pc.id_posto = sen.p_id_posto
    `;
    const params = [];
    if (tipo) {
        query += ' WHERE ts.nome = ?';
        params.push(tipo);
    }
    query += ' ORDER BY sen.id_sensor';
    const [rows] = await db.promise().query(query, params);
    return rows;
};
const existeDuplicado = async (tipoSensorId, salaId, lugarId, postoId, excluirId = null) => {
    let query, params;
    if (salaId) {
        query = 'SELECT COUNT(*) AS cnt FROM sensor WHERE ts_id_tipoSensor = ? AND s_id_sala = ?';
        params = [tipoSensorId, salaId];
    } else if (lugarId) {
        query = 'SELECT COUNT(*) AS cnt FROM sensor WHERE ts_id_tipoSensor = ? AND le_id_lugar = ?';
        params = [tipoSensorId, lugarId];
    } else if (postoId) {
        query = 'SELECT COUNT(*) AS cnt FROM sensor WHERE ts_id_tipoSensor = ? AND p_id_posto = ?';
        params = [tipoSensorId, postoId];
    } else {
        return false;
    }
    if (excluirId !== null) {
        query += ' AND id_sensor != ?';
        params.push(excluirId);
    }
    const [[row]] = await db.promise().query(query, params);
    return row.cnt > 0;
};
const adicionar = async (tipoSensorId, salaId, lugarId, postoId, limiteMin, limiteMax) => {
    const [result] = await db.promise().query(
        'INSERT INTO sensor (ts_id_tipoSensor, s_id_sala, le_id_lugar, p_id_posto, limite_min, limite_max) VALUES (?, ?, ?, ?, ?, ?)',
        [tipoSensorId, salaId || null, lugarId || null, postoId || null,
         limiteMin !== undefined ? limiteMin : null, limiteMax !== undefined ? limiteMax : null]
    );
    return result;
};
const atualizar = async (id, tipoSensorId, salaId, lugarId, postoId, limiteMin, limiteMax) => {
    await db.promise().query(
        'UPDATE sensor SET ts_id_tipoSensor = ?, s_id_sala = ?, le_id_lugar = ?, p_id_posto = ?, limite_min = ?, limite_max = ? WHERE id_sensor = ?',
        [tipoSensorId, salaId || null, lugarId || null, postoId || null,
         limiteMin !== undefined ? limiteMin : null, limiteMax !== undefined ? limiteMax : null, id]
    );
};
const remover = async (id) => {
    await db.promise().query('DELETE FROM sensor WHERE id_sensor = ?', [id]);
};
const atualizarEstado = async (id, estado) => {
    await db.promise().query("UPDATE sensor SET estado = ? WHERE id_sensor = ?", [estado, id]);
};
const listarDados = async (id) => {
    const [rows] = await db.promise().query(
        'SELECT * FROM dados_sensor WHERE s_id_sensor = ? ORDER BY data_hora DESC LIMIT 50',
        [id]
    );
    return rows;
};
const listarParaDashboard = async () => {
    const [rows] = await db.promise().query(`
        SELECT s.id_sensor, s.estado,
               ts.nome AS tipo_nome, ts.unidade, s.limite_min, s.limite_max,
               sal.nome AS sala_nome, sal.piso,
               le.id_lugar AS lugar_id,
               pc.id_posto,
               (SELECT valor    FROM dados_sensor WHERE s_id_sensor = s.id_sensor ORDER BY data_hora DESC LIMIT 1) AS ultimo_valor,
               (SELECT data_hora FROM dados_sensor WHERE s_id_sensor = s.id_sensor ORDER BY data_hora DESC LIMIT 1) AS ultima_data
        FROM sensor s
        LEFT JOIN tipo_sensor ts ON ts.id_tipoSensor = s.ts_id_tipoSensor
        LEFT JOIN sala sal ON sal.id_sala = s.s_id_sala
        LEFT JOIN lugar_estacionamento le ON le.id_lugar = s.le_id_lugar
        LEFT JOIN posto_carregamento pc ON pc.id_posto = s.p_id_posto
        ORDER BY s.id_sensor
    `);
    return rows;
};
const obterDadosRelatorios = async () => {
    const [[resumoConsumo]] = await db.promise().query(`
        SELECT
            COALESCE(ROUND(SUM(ds.valor), 1), 0)  AS consumo_total,
            COUNT(DISTINCT DATE(ds.data_hora))      AS num_dias
        FROM dados_sensor ds
        JOIN sensor s ON s.id_sensor = ds.s_id_sensor
        JOIN tipo_sensor ts ON ts.id_tipoSensor = s.ts_id_tipoSensor
        WHERE ts.nome LIKE '%Consumo%'
          AND ds.data_hora >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    const [topSensoresConsumo] = await db.promise().query(`
        SELECT s.id_sensor, ts.unidade, s.estado,
               COALESCE(sal.nome, CONCAT('Lugar ', le.id_lugar), CONCAT('Posto ', pc.id_posto), 'Geral') AS local,
               ROUND(AVG(ds.valor), 2) AS consumo_medio
        FROM dados_sensor ds
        JOIN sensor s ON s.id_sensor = ds.s_id_sensor
        JOIN tipo_sensor ts ON ts.id_tipoSensor = s.ts_id_tipoSensor
        LEFT JOIN sala sal ON sal.id_sala = s.s_id_sala
        LEFT JOIN lugar_estacionamento le ON le.id_lugar = s.le_id_lugar
        LEFT JOIN posto_carregamento pc ON pc.id_posto = s.p_id_posto
        WHERE ts.nome LIKE '%Consumo%'
          AND ds.data_hora >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY s.id_sensor, ts.unidade, s.estado, sal.nome, le.id_lugar, pc.id_posto
        ORDER BY consumo_medio DESC
        LIMIT 10
    `);
    const [alertas] = await db.promise().query(`
        SELECT ds.data_hora, s.id_sensor, ts.nome AS tipo_nome, ts.unidade,
               ds.valor, s.limite_max, s.limite_min,
               COALESCE(sal.nome, CONCAT('Lugar ', le.id_lugar), CONCAT('Posto ', pc.id_posto), 'Geral') AS local
        FROM dados_sensor ds
        JOIN sensor s ON s.id_sensor = ds.s_id_sensor
        JOIN tipo_sensor ts ON ts.id_tipoSensor = s.ts_id_tipoSensor
        LEFT JOIN sala sal ON sal.id_sala = s.s_id_sala
        LEFT JOIN lugar_estacionamento le ON le.id_lugar = s.le_id_lugar
        LEFT JOIN posto_carregamento pc ON pc.id_posto = s.p_id_posto
        WHERE ds.data_hora >= DATE_SUB(NOW(), INTERVAL 30 DAY)
          AND (
            (s.limite_max IS NOT NULL AND ds.valor > s.limite_max)
            OR (s.limite_min IS NOT NULL AND ds.valor < s.limite_min)
          )
        ORDER BY ds.data_hora DESC
        LIMIT 50
    `);
    const [qualidadeArMedia] = await db.promise().query(`
        SELECT COALESCE(sal.nome, CONCAT('Lugar ', le.id_lugar), CONCAT('Posto ', pc.id_posto), 'Geral') AS local,
               ROUND(AVG(ds.valor), 1) AS media_aqi
        FROM dados_sensor ds
        JOIN sensor s ON s.id_sensor = ds.s_id_sensor
        JOIN tipo_sensor ts ON ts.id_tipoSensor = s.ts_id_tipoSensor
        LEFT JOIN sala sal ON sal.id_sala = s.s_id_sala
        LEFT JOIN lugar_estacionamento le ON le.id_lugar = s.le_id_lugar
        LEFT JOIN posto_carregamento pc ON pc.id_posto = s.p_id_posto
        WHERE ts.nome LIKE '%Qualidade%'
          AND ds.data_hora >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY s.id_sensor, sal.nome, le.id_lugar, pc.id_posto
        ORDER BY media_aqi DESC
    `);
    const [qualidadeAr30] = await db.promise().query(`
        SELECT ds.data_hora, ds.valor AS aqi,
               COALESCE(sal.nome, CONCAT('Lugar ', le.id_lugar), CONCAT('Posto ', pc.id_posto), 'Geral') AS local
        FROM dados_sensor ds
        JOIN sensor s ON s.id_sensor = ds.s_id_sensor
        JOIN tipo_sensor ts ON ts.id_tipoSensor = s.ts_id_tipoSensor
        LEFT JOIN sala sal ON sal.id_sala = s.s_id_sala
        LEFT JOIN lugar_estacionamento le ON le.id_lugar = s.le_id_lugar
        LEFT JOIN posto_carregamento pc ON pc.id_posto = s.p_id_posto
        WHERE ts.nome LIKE '%Qualidade%'
          AND ds.data_hora >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ORDER BY ds.data_hora DESC
        LIMIT 30
    `);
    const [mediaSensores] = await db.promise().query(`
        SELECT s.id_sensor, ts.nome AS tipo_nome, ts.unidade, s.estado,
               COALESCE(sal.nome, CONCAT('Lugar ', le.id_lugar), CONCAT('Posto ', pc.id_posto), 'Geral') AS local,
               ROUND(AVG(ds.valor), 2) AS media
        FROM sensor s
        LEFT JOIN tipo_sensor ts ON ts.id_tipoSensor = s.ts_id_tipoSensor
        LEFT JOIN sala sal ON sal.id_sala = s.s_id_sala
        LEFT JOIN lugar_estacionamento le ON le.id_lugar = s.le_id_lugar
        LEFT JOIN posto_carregamento pc ON pc.id_posto = s.p_id_posto
        LEFT JOIN dados_sensor ds ON ds.s_id_sensor = s.id_sensor
            AND ds.data_hora >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY s.id_sensor, ts.nome, ts.unidade, s.estado, sal.nome, le.id_lugar, pc.id_posto
        ORDER BY s.id_sensor
    `);
    const [ocupacaoMedia] = await db.promise().query(`
        SELECT sal.nome AS sala, s.limite_max AS capacidade,
               ROUND(AVG(ds.valor), 1) AS ocupacao_media
        FROM dados_sensor ds
        JOIN sensor s ON s.id_sensor = ds.s_id_sensor
        JOIN tipo_sensor ts ON ts.id_tipoSensor = s.ts_id_tipoSensor
        JOIN sala sal ON sal.id_sala = s.s_id_sala
        WHERE ts.nome LIKE '%Ocupa%'
          AND ds.data_hora >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY sal.id_sala, sal.nome, s.limite_max
        ORDER BY ocupacao_media DESC
    `);
    const [picosOcupacao] = await db.promise().query(`
        SELECT sal.nome AS sala, s.limite_max AS capacidade,
               MAX(ds.valor) AS pico,
               DATE_FORMAT(MAX(ds.data_hora), '%H:%i') AS horario,
               DATE(MAX(ds.data_hora)) AS data
        FROM dados_sensor ds
        JOIN sensor s ON s.id_sensor = ds.s_id_sensor
        JOIN tipo_sensor ts ON ts.id_tipoSensor = s.ts_id_tipoSensor
        JOIN sala sal ON sal.id_sala = s.s_id_sala
        WHERE ts.nome LIKE '%Ocupa%'
          AND ds.data_hora >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY sal.id_sala, sal.nome, s.limite_max
        ORDER BY pico DESC
    `);
    const [parques] = await db.promise().query(`
        SELECT le.parque,
               COUNT(DISTINCT le.id_lugar) AS num_lugares,
               MAX(ds.valor) AS pico_ocupacao,
               ROUND(AVG(ds.valor), 1) AS media_ocupacao,
               DATE_FORMAT(MAX(ds.data_hora), '%H:%i') AS horario_pico
        FROM dados_sensor ds
        JOIN sensor s ON s.id_sensor = ds.s_id_sensor
        JOIN tipo_sensor ts ON ts.id_tipoSensor = s.ts_id_tipoSensor
        JOIN lugar_estacionamento le ON le.id_lugar = s.le_id_lugar
        WHERE ts.nome LIKE '%Ocupa%'
          AND ds.data_hora >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY le.parque
        ORDER BY pico_ocupacao DESC
    `);
    return { resumoConsumo, topSensoresConsumo, alertas, qualidadeArMedia, qualidadeAr30, mediaSensores, ocupacaoMedia, picosOcupacao, parques };
};
const listarAlertas = async () => {
    const [rows] = await db.promise().query(`
        SELECT ds.data_hora, s.id_sensor, ts.nome AS tipo_nome, ts.unidade,
               ds.valor, s.limite_max, s.limite_min,
               COALESCE(sal.nome, CONCAT('Posto ', pc.id_posto), 'Geral') AS local
        FROM dados_sensor ds
        JOIN sensor s ON s.id_sensor = ds.s_id_sensor
        JOIN tipo_sensor ts ON ts.id_tipoSensor = s.ts_id_tipoSensor
        LEFT JOIN sala sal ON sal.id_sala = s.s_id_sala
        LEFT JOIN lugar_estacionamento le ON le.id_lugar = s.le_id_lugar
        LEFT JOIN posto_carregamento pc ON pc.id_posto = s.p_id_posto
        WHERE ds.data_hora >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
          AND (
            (s.limite_max IS NOT NULL AND ds.valor > s.limite_max)
            OR (s.limite_min IS NOT NULL AND ds.valor < s.limite_min)
          )
        ORDER BY ds.data_hora DESC
        LIMIT 20
    `);
    return rows;
};
module.exports = { listarTipos, adicionarTipo, listar, existeDuplicado, adicionar, atualizar, remover, atualizarEstado, listarDados, listarParaDashboard, obterDadosRelatorios, listarAlertas };
