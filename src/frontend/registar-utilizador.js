document.addEventListener('DOMContentLoaded', function () {
    var form = document.querySelector('.perfil-form');
    if (form) form.addEventListener('submit', function (e) {
        e.preventDefault();
        registar();
    });
});

function registar() {
    var nome = document.getElementById('nome') ? document.getElementById('nome').value.trim() : '';
    var email = document.getElementById('email') ? document.getElementById('email').value.trim() : '';
    var contacto = document.getElementById('contacto') ? document.getElementById('contacto').value.trim() : '';
    var NIF = document.getElementById('NIF') ? document.getElementById('NIF').value.trim() : '';
    var morada = document.getElementById('morada') ? document.getElementById('morada').value.trim() : '';
    var password = document.getElementById('password') ? document.getElementById('password').value : '';
    var dataNascimento = document.getElementById('dataNascimento') ? document.getElementById('dataNascimento').value : '';
    var tipo = document.getElementById('tipo') ? document.getElementById('tipo').value : '';

    if (!nome || !email || !password || !tipo || !morada || !NIF || !contacto) {
        alert('Por favor preencha todos os campos obrigatórios.');
        return;
    }

    apiFetch('/api/utilizadores', {
        method: 'POST',
        body: JSON.stringify({ nome: nome, email: email, password: password, tipo: tipo, morada: morada, NIF: NIF, contacto: contacto, dataNascimento: dataNascimento || null })
    }).then(function (r) { return r.json(); }).then(function (dados) {
        if (dados.erro) {
            alert('Erro: ' + dados.erro);
        } else {
            alert('Utilizador "' + nome + '" registado com sucesso!');
            document.querySelector('.perfil-form').reset();
        }
    }).catch(function () {
        alert('Erro ao registar utilizador.');
    });
}
