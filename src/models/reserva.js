const db = require('../config/db');
const listarTodas = async () => {
    const [salas] = await db.promise().query(
        `SELECT rs.id_reserva AS id, 'sala' AS tipo, s.nome AS recurso, u.nome AS utilizador,
                rs.data_inicio AS inicio, rs.data_fim AS fim, rs.estado
         FROM reserva_sala rs
         JOIN sala s ON s.id_sala = rs.s_id_sala
         JOIN utilizador u ON u.id_utilizador = rs.u_id_utilizador
         ORDER BY rs.data_inicio DESC`
    );
    const [equip] = await db.promise().query(
        `SELECT re.id_reserva AS id, 'equipamento' AS tipo, re.e_tipo_equipamento AS recurso, u.nome AS utilizador,
                re.data_inicio AS inicio, re.data_fim AS fim, re.estado
         FROM reserva_equipamento re
         JOIN utilizador u ON u.id_utilizador = re.u_id_utilizador
         ORDER BY re.data_inicio DESC`
    );
    const [mob] = await db.promise().query(
        `SELECT rm.id_reserva_mobilidade AS id, m.tipo_mobilidade AS tipo, m.codigo_mobilidade AS recurso, u.nome AS utilizador,
                rm.inicio, rm.fim, rm.estado
         FROM reserva_mobilidade rm
         JOIN mobilidade m ON m.codigo_mobilidade = rm.m_codigo_mobilidade
         JOIN utilizador u ON u.id_utilizador = rm.u_id_utilizador
         ORDER BY rm.inicio DESC`
    );
    return [...salas, ...equip, ...mob];
};
module.exports = { listarTodas };
