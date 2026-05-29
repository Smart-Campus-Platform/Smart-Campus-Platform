const express = require('express');
const path = require('path');

const db = require("./config/db");

const app = express();
const PORT = 3000;

const frontendPath = path.join(__dirname, 'frontend');

app.use(express.json());
app.use(express.static(frontendPath));

const utilizadorTeste = {
    email: "teste@upt.pt"
};

const {spawn} = require("child_process"); //aqui estou a importar um modulo do node para permitir criar e controlar outros processos do sistema operativo

function callPythonLSS(comando) { // esta é a função que vai permitir receber um comando do LSS, executar em python, com o ply, espera pela resposta e devolve o resultado
    return new Promise((resolve, reject) => { //permite que seja assíncrono, ou seja com o promise libertamos o node para continuar a responder a pedidos enquanto espera obrigatoriamente pela resposta do python para poder fechar este processo
        const python = spawn("py", ["compiladores/main.py", comando]); // envia o comando para ser executado no main.py

        let output = ""; //o que for enviado para stdout
        let error = "";  //para stderr

        python.stdout.on("data", (data) => {
            output += data.toString();
        });

        python.stderr.on("data", (data) => {
            error += data.toString();
        });

        python.on("close", (code) => {
            if (code !== 0) {
                reject(new Error(error || "Erro ao executar comando"));
                return;
            }

            try {
                resolve(JSON.parse(output));
            } catch {
                reject(new Error("Python não devolveu um JSON válido"));
            }
        });
    });
}

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

app.get('/gestor-reservas', (req, res) => {
    sendFrontendFile(res, 'GestorReservasFuncionario.html');
});

app.get('/sensores', (req, res) => {
    sendFrontendFile(res, 'SensoresAdministrador.html');
});

app.get('/alterar-informacao', (req, res) => {
    sendFrontendFile(res, 'alterar_informacao.html');
});

app.get('/alterar-password', (req, res) => {
    sendFrontendFile(res, 'alterar_password.html');
});

app.get('/menu_utilizador', (req, res) => {
    sendFrontendFile(res, 'menu_utilizador.html');
});

app.get('/acessibilidade', (req, res) => {
    sendFrontendFile(res, 'acessibildade.html');
});

app.get('/sensores-funcionario', (req, res) => {
    sendFrontendFile(res, 'SensoresFuncionario.html');
});

app.get('/gestao-utilizadores', (req, res) => {
    sendFrontendFile(res, 'gestao_utilizadores.html');
});

app.get('/registar-utilizador', (req, res) => {
    sendFrontendFile(res, 'registar_utilizador.html');
});

app.get('/reservar-trotinetes', (req, res) => {
    sendFrontendFile(res, 'reservar_trotinetes.html');
});

app.get('/reservar-sala', (req, res) => {
    sendFrontendFile(res, 'reservar_sala.html');
});

app.get('/reservar-bicicletas', (req, res) => {
    sendFrontendFile(res, 'reservar_bicicletas.html');
});

app.get('/consultar-estacionamentos', (req, res) => {
    sendFrontendFile(res, 'consultar_estacionamentos.html');
});

app.get('/consultar-postos-carregamento', (req, res) => {
    sendFrontendFile(res, 'consultar_postos_carregamento.html');
});

app.get('/dashboard', (req, res) => {
    sendFrontendFile(res, 'dashboard.html');
});

app.get('/reservar-equipamento', (req, res) => {
    sendFrontendFile(res, 'reservar_equipamento.html');
});

app.get('/gestor-reservas-utilizador', (req, res) => {
    sendFrontendFile(res, 'GestorReservasUtilizador.html');
});

app.get('/gestor-sala-docente', (req, res) => {
    sendFrontendFile(res, 'GestorSalaDocente.html');
});

app.get('/salas-administrador', (req, res) => {
    sendFrontendFile(res, 'SalasAdministrador.html');
});

app.get('/equipamentos-administrador', (req, res) => {
    sendFrontendFile(res, 'EquipamentosAdministrador.html');
});

app.get('/trotinetes-administrador', (req, res) => {
    sendFrontendFile(res, 'TrotinetesAdministrador.html');
});

app.get('/bicicletas-administrador', (req, res) => {
    sendFrontendFile(res, 'BicicletasAdministrador.html');
});

app.get('/parque-estacionamento-administrador', (req, res) => {
    sendFrontendFile(res, 'ParqueEstacionamentoAdministrador.html');
});

app.get('/posto-carregamento-administrador', (req, res) => {
    sendFrontendFile(res, 'PostoCarregamentoAdministrador.html');
});

app.get('/gerir-relatorios', (req, res) => {
    sendFrontendFile(res, 'GerirRelatorios.html');
});


app.post('/api/lss', async (req, res) => { //é para aqui que são enviados os comandos do frontend
    const { comando } = req.body;

    if (!comando || comando.trim() === "") {
        return res.status(400).json({
            erro: "Comando vazio"
        });
    }

    try {
        console.log("Comando recebido:", comando); 
        const resultado = await callPythonLSS(comando); //Node chama o python, espera e recebe o resultado
        const [utilizadores] = await db.promise().query(
            "SELECT id_utilizador FROM utilizador WHERE email = ?", [utilizadorTeste.email]
        );

        if(utilizadores.length === 0){
            throw new Error("Utilizador não encontrado");
        }

        const utilizador = utilizadores[0];

        const [salas] = await db.promise().query(
            "SELECT id_sala FROM sala WHERE nome = ?",
            [resultado.recurso_nome]
        );

        if (salas.length === 0) {
            throw new Error("Sala não encontrada");
        }

        const sala = salas[0];

        const dataInicio = `${resultado.data} ${resultado.inicio}:00`; //00 é por causa dos segundos do formato datetime
        const dataFim = `${resultado.data} ${resultado.fim}:00`;

        //inserir a reserva na base de dados
        const [reserva] = await db.promise().query(
            `INSERT INTO reserva_sala
            (u_id_utilizador, s_id_sala, data_inicio, data_fim)
            VALUES (?, ?, ?, ?)`,
            [
                utilizador.id_utilizador,
                sala.id_sala,
                dataInicio,
                dataFim
            ]
        );

        res.json({
            mensagem: "Reserva efetuada",
            comando: comando,
            resultado: resultado,
            id_reserva: reserva.insertId
        });


    } catch (erro) {
        res.status(400).json({
            erro: erro.message
        });
    }

});


app.listen(PORT, () => {
    console.log(`Servidor na porta ${PORT}`);
});
