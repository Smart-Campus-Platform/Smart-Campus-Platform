const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server in port ${PORT}`);
});
