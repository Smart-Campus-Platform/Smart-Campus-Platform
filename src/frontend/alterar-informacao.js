var perfilNomeAtual = '';

document.addEventListener('DOMContentLoaded', function () {
    carregarPerfil();

    var form = document.querySelector('.perfil-form');
    if (form) form.addEventListener('submit', function (e) {
        e.preventDefault();
        guardarPerfil();
    });
});

function carregarPerfil() {
    apiFetch('/api/me').then(function (r) { return r.json(); }).then(function (u) {
        perfilNomeAtual = u.nome || '';
        var emailEl = document.getElementById('email');
        var contactoEl = document.getElementById('contacto');
        var moradaEl = document.getElementById('morada');
        if (emailEl) emailEl.value = u.email || '';
        if (contactoEl) contactoEl.value = u.contacto || '';
        if (moradaEl) moradaEl.value = u.morada || '';
    }).catch(function () {});
}

function guardarPerfil() {
    var nomeEl = document.getElementById('nome');
    var nome = nomeEl ? nomeEl.value : perfilNomeAtual;
    var email = document.getElementById('email') ? document.getElementById('email').value : '';
    var contacto = document.getElementById('contacto') ? document.getElementById('contacto').value : '';
    var morada = document.getElementById('morada') ? document.getElementById('morada').value : '';

    apiFetch('/api/me', {
        method: 'PUT',
        body: JSON.stringify({ nome: nome, email: email, contacto: contacto, morada: morada })
    }).then(function (r) { return r.json(); }).then(function (dados) {
        if (dados.erro) {
            alert('Erro: ' + dados.erro);
        } else {
            alert('Perfil atualizado com sucesso!');
            // update localStorage name/email
            var user = getUser();
            if (user) {
                if (email) user.email = email;
                if (nome) user.nome = nome;
                localStorage.setItem('smartcampus_user', JSON.stringify(user));
            }
        }
    }).catch(function () {
        alert('Erro ao guardar perfil.');
    });
}
