const db = require('../config/db');
const obterEstatisticas = async () => {
    const [[{ totalSalas }]] = await db.promise().query('SELECT COUNT(*) AS totalSalas FROM sala');
    const [[{ salasOcupadas }]] = await db.promise().query(
        "SELECT COUNT(DISTINCT s_id_sala) AS salasOcupadas FROM reserva_sala WHERE estado = 'ativa' AND data_inicio <= NOW() AND data_fim >= NOW()"
    );
    const [[{ totalEquipamentos }]] = await db.promise().query('SELECT COUNT(*) AS totalEquipamentos FROM equipamento');
    const [[{ totalUtilizadores }]] = await db.promise().query('SELECT COUNT(*) AS totalUtilizadores FROM utilizador WHERE estado = 1');
    const [[{ reservasHoje }]] = await db.promise().query(
        "SELECT COUNT(*) AS reservasHoje FROM reserva_sala WHERE DATE(data_inicio) = CURDATE() AND estado = 'ativa'"
    );
    const [[{ sensoresAtivos }]] = await db.promise().query("SELECT COUNT(*) AS sensoresAtivos FROM sensor WHERE estado = 'ligado'");
    const [[{ estacionamentosLivres }]] = await db.promise().query('SELECT COUNT(*) AS estacionamentosLivres FROM lugar_estacionamento WHERE disponibilidade = 1');
    const [[{ veiculosDisponiveis }]] = await db.promise().query("SELECT COUNT(*) AS veiculosDisponiveis FROM mobilidade WHERE estado = 'disponivel'");
    return {
        totalSalas, salasOcupadas, salasLivres: totalSalas - salasOcupadas,
        totalEquipamentos, totalUtilizadores, reservasHoje,
        sensoresAtivos, estacionamentosLivres, veiculosDisponiveis
    };
};
module.exports = { obterEstatisticas };
