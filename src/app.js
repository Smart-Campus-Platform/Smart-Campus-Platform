require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const sensorSimulator = require('./frontend/sensorSimulador');
const { requireLogin, requireTipo } = require('./middleware/auth');

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

app.use(session({
    secret: process.env.SESSION_SECRET || 'smart-campus-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 8 * 60 * 60 * 1000 }
}));

// bloqueia acesso direto a ficheiros .html (ex: menu_administrador.html na barra de pesquisa)
// login.html é a única página pública
app.use((req, res, next) => {
    if (req.path.endsWith('.html') && req.path !== '/login.html') {
        if (!req.session.utilizador) return res.redirect('/login');
    }
    next();
});

app.use(express.static(frontendPath));

function sendFrontendFile(res, fileName) {
    res.sendFile(path.join(frontendPath, fileName));
}

// páginas públicas
app.get('/', (req, res) => sendFrontendFile(res, 'login.html'));
app.get('/login', (req, res) => sendFrontendFile(res, 'login.html'));

// menus por tipo
app.get('/menu-administrador', requireLogin, requireTipo('admin'), (req, res) => sendFrontendFile(res, 'menu_administrador.html'));
app.get('/menu-docente', requireLogin, requireTipo('docente'), (req, res) => sendFrontendFile(res, 'menu_docente.html'));
app.get('/menu-funcionario', requireLogin, requireTipo('funcionario', 'funcionário'), (req, res) => sendFrontendFile(res, 'menu_funcionario.html'));
app.get('/menu-utilizador', requireLogin, requireTipo('estudante', 'aluno'), (req, res) => sendFrontendFile(res, 'menu_utilizador.html'));
app.get('/menu_utilizador', requireLogin, requireTipo('estudante', 'aluno'), (req, res) => sendFrontendFile(res, 'menu_utilizador.html'));

// páginas de administrador
app.get('/sensores', requireLogin, requireTipo('admin'), (req, res) => sendFrontendFile(res, 'SensoresAdministrador.html'));
app.get('/gestao-utilizadores', requireLogin, requireTipo('admin'), (req, res) => sendFrontendFile(res, 'gestao_utilizadores.html'));
app.get('/registar-utilizador', requireLogin, requireTipo('admin'), (req, res) => sendFrontendFile(res, 'registar_utilizador.html'));
app.get('/salas-administrador', requireLogin, requireTipo('admin'), (req, res) => sendFrontendFile(res, 'SalasAdministrador.html'));
app.get('/equipamentos-administrador', requireLogin, requireTipo('admin'), (req, res) => sendFrontendFile(res, 'EquipamentosAdministrador.html'));
app.get('/trotinetes-administrador', requireLogin, requireTipo('admin'), (req, res) => sendFrontendFile(res, 'TrotinetesAdministrador.html'));
app.get('/bicicletas-administrador', requireLogin, requireTipo('admin'), (req, res) => sendFrontendFile(res, 'BicicletasAdministrador.html'));
app.get('/parque-estacionamento-administrador', requireLogin, requireTipo('admin'), (req, res) => sendFrontendFile(res, 'ParqueEstacionamentoAdministrador.html'));
app.get('/posto-carregamento-administrador', requireLogin, requireTipo('admin'), (req, res) => sendFrontendFile(res, 'PostoCarregamentoAdministrador.html'));
app.get('/gerir-relatorios', requireLogin, requireTipo('admin'), (req, res) => sendFrontendFile(res, 'GerirRelatorios.html'));
app.get('/dashboard', requireLogin, requireTipo('admin', 'funcionario', 'funcionário'), (req, res) => sendFrontendFile(res, 'dashboard.html'));

// páginas de funcionário
app.get('/gestor-reservas', requireLogin, requireTipo('funcionario', 'funcionário'), (req, res) => sendFrontendFile(res, 'GestorReservasFuncionario.html'));
app.get('/sensores-funcionario', requireLogin, requireTipo('funcionario', 'funcionário'), (req, res) => sendFrontendFile(res, 'SensoresFuncionario.html'));

// páginas de docente
app.get('/menu-docente', requireLogin, requireTipo('docente'), (req, res) => sendFrontendFile(res, 'menu_docente.html'));
app.get('/gestor-sala-docente', requireLogin, requireTipo('docente'), (req, res) => sendFrontendFile(res, 'GestorSalaDocente.html'));
app.get('/dashboard-docente', requireLogin, requireTipo('docente'), (req, res) => sendFrontendFile(res, 'dashboardDocente.html'));

// páginas de estudante/aluno
app.get('/gestor-reservas-utilizador', requireLogin, requireTipo('estudante', 'aluno'), (req, res) => sendFrontendFile(res, 'GestorReservasUtilizador.html'));
app.get('/reservar-trotinetes', requireLogin, requireTipo('estudante', 'aluno'), (req, res) => sendFrontendFile(res, 'reservar_trotinetes.html'));
app.get('/reservar-sala', requireLogin, requireTipo('estudante', 'aluno'), (req, res) => sendFrontendFile(res, 'reservar_sala.html'));
app.get('/reservar-bicicletas', requireLogin, requireTipo('estudante', 'aluno'), (req, res) => sendFrontendFile(res, 'reservar_bicicletas.html'));
app.get('/reservar-equipamento', requireLogin, requireTipo('estudante', 'aluno'), (req, res) => sendFrontendFile(res, 'reservar_equipamento.html'));
app.get('/consultar-estacionamentos', requireLogin, requireTipo('estudante', 'aluno'), (req, res) => sendFrontendFile(res, 'consultar_estacionamentos.html'));
app.get('/consultar-postos-carregamento', requireLogin, requireTipo('estudante', 'aluno'), (req, res) => sendFrontendFile(res, 'consultar_postos_carregamento.html'));

// páginas partilhadas (qualquer utilizador autenticado)
app.get('/alterar-informacao', requireLogin, (req, res) => sendFrontendFile(res, 'alterar_informacao.html'));
app.get('/alterar-password', requireLogin, (req, res) => sendFrontendFile(res, 'alterar_password.html'));
app.get('/acessibilidade', requireLogin, (req, res) => sendFrontendFile(res, 'acessibildade.html'));

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

app.listen(PORT, () => {
    console.log(`Servidor na porta ${PORT}`);
    sensorSimulator.iniciar();
});
