const db = require("../config/db");

const PRECO_KWH = 0.10;

//para mostrar os diferentes postos de carregamento organizados por zona
const listarPostos = async() => {
    const [postos] = await db.promise().query(`
        SELECT
            id_posto,
            area,
            disponibilidade,
            ? AS preco_kwh
        FROM posto_carregamento
        ORDER BY area, id_posto
     `, [PRECO_KWH]);

     return postos
};

//para listar as areas dos postos de carregamento
const listarAreas = async () => {
    const [areas] = await db.promise().query(`
        SELECT DISTINCT area
        FROM posto_carregamento
        ORDER BY area
    `);

    return areas;
};

//para adicionar novos postos
const adicionarPosto = async (id_posto, area) => {
    const [resultado] = await db.promise().query(
        `INSERT INTO posto_carregamento
         (id_posto, area, disponibilidade, atualizacao_automatica)
         VALUES (?, ?, true, true)`,
        [id_posto, area]
    );

    return resultado;
};

//para atualizar os detalhes de um posto
const atualizarPosto = async (id_atual, novo_id_posto, area) => {
    await db.promise().query(`
        UPDATE posto_carregamento
        SET id_posto = ?,
            area = ?
        WHERE id_posto = ?
    `,
    [novo_id_posto, area, id_atual]
    );
}

//remover permanentemente um posto
const removerPosto = async (id_posto) => {
    const conn = await db.promise().getConnection();
    try {
        await conn.beginTransaction();
        await conn.query(
            `DELETE ds FROM dados_sensor ds
             JOIN sensor s ON s.id_sensor = ds.s_id_sensor
             WHERE s.p_id_posto = ?`,
            [id_posto]
        );
        await conn.query('DELETE FROM sensor WHERE p_id_posto = ?', [id_posto]);
        await conn.query(
            `DELETE FROM posto_carregamento
             WHERE id_posto = ?`,
            [id_posto]
        );
        await conn.commit();
    } catch (erro) {
        await conn.rollback();
        throw erro;
    } finally {
        conn.release();
    }
};

//para alterarmos a disponibilidade de um posto de forma manual
const alterarDisponibilidadeManual = async (id_posto, disponibilidade) => {
    await db.promise().query(
        `UPDATE posto_carregamento
         SET disponibilidade = ?,
             atualizacao_automatica = ?
         WHERE id_posto = ?`,
        [disponibilidade, disponibilidade, id_posto]
    );
};

//para registar o carregamento feito por um utilizador num posto disponivel
const registarCarregamento = async (id_posto, kwh) => {
    const [postos] = await db.promise().query(
        `SELECT id_posto, area, disponibilidade
         FROM posto_carregamento
         WHERE id_posto = ?`,
        [id_posto]
    );

    if (postos.length === 0) {
        const erro = new Error("Posto de carregamento nao encontrado");
        erro.status = 404;
        throw erro;
    }

    const posto = postos[0];
    const disponivel = posto.disponibilidade === true || posto.disponibilidade === 1 || posto.disponibilidade === "1";

    if (!disponivel) {
        const erro = new Error("Posto de carregamento indisponivel");
        erro.status = 409;
        throw erro;
    }

    const precoTotal = Number((kwh * PRECO_KWH).toFixed(2));

    const [resultado] = await db.promise().query(
        `INSERT INTO carregamento_posto
         (pc_id_posto, kwh, preco_kwh, preco_total)
         VALUES (?, ?, ?, ?)`,
        [id_posto, kwh, PRECO_KWH, precoTotal]
    );

    return {
        id_carregamento: resultado.insertId,
        id_posto: posto.id_posto,
        area: posto.area,
        kwh,
        preco_kwh: PRECO_KWH,
        preco_total: precoTotal
    };
};




module.exports = {
    listarPostos,
    listarAreas,
    adicionarPosto,
    atualizarPosto,
    removerPosto,
    alterarDisponibilidadeManual,
    registarCarregamento
};
