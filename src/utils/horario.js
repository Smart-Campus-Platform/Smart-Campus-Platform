const HORA_ABERTURA = 7;   // 07:00
const HORA_FECHO = 23;     // 23:00

function toDate(str) {
    return new Date(str.replace(' ', 'T'));
}

function minutosDoDia(date) {
    return date.getHours() * 60 + date.getMinutes();
}

function validarHorarioFaculdade(dataInicio, dataFim) {
    const inicio = toDate(dataInicio);
    const aberturaMin = HORA_ABERTURA * 60;
    const fechoMin    = HORA_FECHO    * 60;

    const inicioMin = minutosDoDia(inicio);
    if (inicioMin < aberturaMin || inicioMin >= fechoMin) {
        return `A hora de início deve estar entre as 07:00 e as 23:00 (a faculdade está fechada fora desse período)`;
    }

    if (dataFim) {
        const fim = toDate(dataFim);

        // deteta se a reserva atravessa a meia-noite (ex: 22:00 → 08:00 do dia seguinte)
        const inicioDia = new Date(inicio); inicioDia.setHours(0, 0, 0, 0);
        const fimDia    = new Date(fim);    fimDia.setHours(0, 0, 0, 0);
        if (fimDia > inicioDia) {
            return 'As reservas não podem atravessar a meia-noite';
        }

        const fimMin = minutosDoDia(fim);
        if (fimMin <= aberturaMin || fimMin > fechoMin) {
            return `A hora de fim deve estar entre as 07:00 e as 23:00 (a faculdade está fechada fora desse período)`;
        }
    }

    return null;
}

module.exports = { validarHorarioFaculdade };
