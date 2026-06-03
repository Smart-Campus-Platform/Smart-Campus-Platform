const abrirTerminalLSS = document.getElementById("abrirTerminalLSS");
const fecharTerminalLSS = document.getElementById("fecharTerminalLSS");
const terminalLSS = document.getElementById("terminalLSS");
const executarComandoLSS = document.getElementById("executarComandoLSS");
const comandoLSS = document.getElementById("comandoLSS");
const resultadoLSS = document.getElementById("resultadoLSS");

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
                JSON.stringify(dados.reservas, null, 2);
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
