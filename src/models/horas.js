function atualizar() {
  const agora = new Date();

  const hora = agora.toLocaleTimeString('pt-BR');
  const data = agora.toLocaleDateString('pt-BR');

  document.getElementById('hora').textContent = hora;
  document.getElementById('data').textContent = data;
}

atualizar();
setInterval(atualizar, 1000)