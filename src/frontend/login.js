document.getElementById('form-login').addEventListener('submit', async function (e) {
    e.preventDefault();

    var email = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value;
    var erroEl = document.getElementById('erro-login');
    erroEl.style.display = 'none';

    try {
        var resposta = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
        });

        var dados = await resposta.json();

        if (!resposta.ok) {
            erroEl.textContent = dados.erro || 'Erro ao fazer login';
            erroEl.style.display = 'block';
            return;
        }

        localStorage.setItem('smartcampus_user', JSON.stringify(dados.utilizador));
        window.location.href = dados.redirecionar;
    } catch (err) {
        erroEl.textContent = 'Não foi possível ligar ao servidor';
        erroEl.style.display = 'block';
    }
});
