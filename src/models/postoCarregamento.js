const db = require("../config/db");

//para mostrar os diferentes postos de carregamento organizados por zona
const listarPostos = async() => {
    const [postos] = await db.promise().query(`
        SELECT
            id_posto,
            area,
            disponibilidade
        FROM posto_carregamento
        ORDER BY area, id_posto
     `);

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
    await db.promise().query(
        `DELETE FROM posto_carregamento
         WHERE id_posto = ?`,
        [id_posto]
    );
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




module.exports = {
    listarPostos,
    listarAreas,
    adicionarPosto,
    atualizarPosto,
    removerPosto,
    alterarDisponibilidadeManual
};