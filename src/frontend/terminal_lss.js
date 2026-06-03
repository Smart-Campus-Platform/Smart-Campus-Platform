const abrirTerminalLSS = document.getElementById("abrirTerminalLSS");
const fecharTerminalLSS = document.getElementById("fecharTerminalLSS");
const terminalLSS = document.getElementById("terminalLSS");
const executarComandoLSS = document.getElementById("executarComandoLSS");
const comandoLSS = document.getElementById("comandoLSS");
const resultadoLSS = document.getElementById("resultadoLSS");

function formatarReservas(titulo, reservas) {
    if (!reservas || reservas.length === 0) {
        return `${titulo}\nSem reservas.`;
    }

    const linhas = reservas.map((reserva) => {
        return [
            `ID: ${reserva.id_reserva}`,
            `Recurso: ${reserva.recurso_nome}`,
            `Inicio: ${reserva.data_inicio}`,
            `Fim: ${reserva.data_fim}`,
            `Estado: ${reserva.estado}`
        ].join("\n");
    });

    return `${titulo}\n\n${linhas.join("\n\n")}`;
}

function formatarDisponiveis(disponiveis) {
    if (!disponiveis || disponiveis.length === 0) {
        return "Sem recursos disponiveis.";
    }

    return disponiveis.map((recurso) => {
        const nome = recurso.nome || recurso.tipo_equipamento;
        const detalhes = [`Recurso: ${nome}`];

        if (recurso.piso !== undefined) {
            detalhes.push(`Piso: ${recurso.piso}`);
        }

        if (recurso.estado !== undefined) {
            detalhes.push(`Estado: ${recurso.estado}`);
        }

        return detalhes.join("\n");
    }).join("\n\n");
}

abrirTerminalLSS.addEventListener("click", () => {
    terminalLSS.hidden = false;
    comandoLSS.focus();
});

fecharTerminalLSS.addEventListener("click", () => {
    terminalLSS.hidden = true;
});

executarComandoLSS.addEventListener("click", async() => {
    const comando = comandoLSS.value.trim();

    if(!comando){
        resultadoLSS.textContent = "Escreva um comando primeiro.";
        return;
    }

    resultadoLSS.textContent = "A enviar comando ...";

    try{
        const resposta = await fetch("/api/lss", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({comando})
        });

        const dados = await resposta.json();

        if(!resposta.ok){
            resultadoLSS.textContent = dados.erro || "Erro ao executar comando.";
            return;
        }

        if (dados.reservas) {
            resultadoLSS.textContent =
                `Comando: ${dados.comando}\n\n` +
                `${dados.mensagem}\n\n` +
                formatarReservas("Reserva de salas", dados.reservas_sala) +
                "\n\n" +
                formatarReservas("Reserva de equipamentos", dados.reservas_equipamento);
            return;
        }

        if (dados.disponiveis) {
            resultadoLSS.textContent =
                `Comando: ${dados.comando}\n\n` +
                `${dados.mensagem}\n\n` +
                formatarDisponiveis(dados.disponiveis);
            return;
        }

        resultadoLSS.textContent =
            `Comando: ${dados.comando}\n\n` +
            `${dados.mensagem}\n\n` +
            `ID Reserva: ${dados.id_reserva}\n\n` +
            JSON.stringify(dados.resultado, null, 2);
  
    } catch (erro) {
        resultadoLSS.textContent = "Erro de ligação ao servidor.";
    }
});
