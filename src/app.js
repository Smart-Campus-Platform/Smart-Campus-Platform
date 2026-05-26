const express = require('express');
const path = require('path');

const db = require("./config/db");

const app = express();
const PORT = 3000;

const frontendPath = path.join(__dirname, 'frontend');

app.use(express.json());
app.use(express.static(frontendPath));

const sendFrontendFile = (res, fileName) => {
    res.sendFile(path.join(frontendPath, fileName));
};

app.get('/', (req, res) => {
    sendFrontendFile(res, 'login.html');
});

app.get('/login', (req, res) => {
    sendFrontendFile(res, 'login.html');
});

app.get('/menu-utilizador', (req, res) => {
    sendFrontendFile(res, 'menu_utilizador.html');
});

app.get('/menu-docente', (req, res) => {
    sendFrontendFile(res, 'menu_docente.html');
});

app.get('/menu-funcionario', (req, res) => {
    sendFrontendFile(res, 'menu_funcionario.html');
});

app.get('/menu-administrador', (req, res) => {
    sendFrontendFile(res, 'menu_administrador.html');
});

app.get('/gestor-funcionario', (req, res) => {
    sendFrontendFile(res, 'GestorFuncionario.html');
});

app.get('/sensores', (req, res) => {
    sendFrontendFile(res, 'Sensores.html');
});

app.listen(PORT, () => {
    console.log(`Servidor na porta ${PORT}`);
});
