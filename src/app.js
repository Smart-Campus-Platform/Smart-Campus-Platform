require('dotenv').config();
const express = require('express');
const path = require('path');
const sensorSimulator = require('./frontend/sensorSimulador');

const utilizadorRouter = require('./routes/utilizadorRoutes');
const salaRouter = require('./routes/salaRoutes');
const equipamentoRouter = require('./routes/equipamentoRoutes');
const mobilidadeRouter = require('./routes/mobilidadeRoutes');
const reservaRouter = require('./routes/reservaRoutes');
const estacionamentoRouter = require('./routes/estacionamentoRoutes');
const postoCarregamentoRouter = require('./routes/postoCarregamentoRoutes');
const sensorRouter = require('./routes/sensorRoutes');
const dashboardRouter = require('./routes/dashboardRoutes');
const lssRouter = require('./routes/lssRoutes');
const relatorioRouter = require('./routes/relatorioRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const frontendPath = path.join(__dirname, 'frontend');

app.use(express.json());
app.use(express.static(frontendPath));

function sendFrontendFile(res, fileName) {
    res.sendFile(path.join(frontendPath, fileName));
}

app.get('/', (req, res) => sendFrontendFile(res, 'login.html'));
app.get('/login', (req, res) => sendFrontendFile(res, 'login.html'));
app.get('/menu-utilizador', (req, res) => sendFrontendFile(res, 'menu_utilizador.html'));
app.get('/menu-docente', (req, res) => sendFrontendFile(res, 'menu_docente.html'));
app.get('/menu-funcionario', (req, res) => sendFrontendFile(res, 'menu_funcionario.html'));
app.get('/menu-administrador', (req, res) => sendFrontendFile(res, 'menu_administrador.html'));
app.get('/gestor-reservas', (req, res) => sendFrontendFile(res, 'GestorReservasFuncionario.html'));
app.get('/sensores', (req, res) => sendFrontendFile(res, 'SensoresAdministrador.html'));
app.get('/alterar-informacao', (req, res) => sendFrontendFile(res, 'alterar_informacao.html'));
app.get('/alterar-password', (req, res) => sendFrontendFile(res, 'alterar_password.html'));
app.get('/menu_utilizador', (req, res) => sendFrontendFile(res, 'menu_utilizador.html'));
app.get('/acessibilidade', (req, res) => sendFrontendFile(res, 'acessibildade.html'));
app.get('/sensores-funcionario', (req, res) => sendFrontendFile(res, 'SensoresFuncionario.html'));
app.get('/gestao-utilizadores', (req, res) => sendFrontendFile(res, 'gestao_utilizadores.html'));
app.get('/registar-utilizador', (req, res) => sendFrontendFile(res, 'registar_utilizador.html'));
app.get('/reservar-trotinetes', (req, res) => sendFrontendFile(res, 'reservar_trotinetes.html'));
app.get('/reservar-sala', (req, res) => sendFrontendFile(res, 'reservar_sala.html'));
app.get('/reservar-bicicletas', (req, res) => sendFrontendFile(res, 'reservar_bicicletas.html'));
app.get('/consultar-estacionamentos', (req, res) => sendFrontendFile(res, 'consultar_estacionamentos.html'));
app.get('/consultar-postos-carregamento', (req, res) => sendFrontendFile(res, 'consultar_postos_carregamento.html'));
app.get('/dashboard', (req, res) => sendFrontendFile(res, 'dashboard.html'));
app.get('/dashboard-docente', (req, res) => sendFrontendFile(res, 'dashboardDocente.html'));
app.get('/reservar-equipamento', (req, res) => sendFrontendFile(res, 'reservar_equipamento.html'));
app.get('/gestor-reservas-utilizador', (req, res) => sendFrontendFile(res, 'GestorReservasUtilizador.html'));
app.get('/gestor-sala-docente', (req, res) => sendFrontendFile(res, 'GestorSalaDocente.html'));
app.get('/salas-administrador', (req, res) => sendFrontendFile(res, 'SalasAdministrador.html'));
app.get('/equipamentos-administrador', (req, res) => sendFrontendFile(res, 'EquipamentosAdministrador.html'));
app.get('/trotinetes-administrador', (req, res) => sendFrontendFile(res, 'TrotinetesAdministrador.html'));
app.get('/bicicletas-administrador', (req, res) => sendFrontendFile(res, 'BicicletasAdministrador.html'));
app.get('/parque-estacionamento-administrador', (req, res) => sendFrontendFile(res, 'ParqueEstacionamentoAdministrador.html'));
app.get('/posto-carregamento-administrador', (req, res) => sendFrontendFile(res, 'PostoCarregamentoAdministrador.html'));
app.get('/gerir-relatorios', (req, res) => sendFrontendFile(res, 'GerirRelatorios.html'));


app.use('/api', utilizadorRouter);
app.use('/api', salaRouter);
app.use('/api', equipamentoRouter);
app.use('/api', mobilidadeRouter);
app.use('/api', reservaRouter);
app.use('/api', estacionamentoRouter);
app.use('/api', postoCarregamentoRouter);
app.use('/api', sensorRouter);
app.use('/api', dashboardRouter);
app.use('/api', lssRouter);
app.use('/api', relatorioRouter);

app.use("/api", postoCarregamentoRoutes);


app.listen(PORT, () => {
    console.log(`Servidor na porta ${PORT}`);
    sensorSimulator.iniciar();
});
