document.addEventListener('DOMContentLoaded', function () {
    var form = document.querySelector('form');
    if (form) form.addEventListener('submit', function (e) {
        e.preventDefault();
        alterarPassword();
    });
});

function alterarPassword() {
    var inputs = document.querySelectorAll('input[type="password"]');
    if (inputs.length < 2) { alert('Erro no formulário.'); return; }
    var passwordNova = inputs[0].value;
    var passwordConfirm = inputs[1].value;

    if (!passwordNova) { alert('Introduza a nova password.'); return; }
    if (passwordNova !== passwordConfirm) { alert('As passwords não coincidem.'); return; }

    var passwordAtual = prompt('Introduza a sua password atual:');
    if (!passwordAtual) return;

    apiFetch('/api/me/password', {
        method: 'PUT',
        body: JSON.stringify({ passwordAtual: passwordAtual, passwordNova: passwordNova })
    }).then(function (r) { return r.json(); }).then(function (dados) {
        if (dados.erro) {
            alert('Erro: ' + dados.erro);
        } else {
            alert('Password alterada com sucesso!');
            inputs[0].value = '';
            inputs[1].value = '';
        }
    }).catch(function () {
        alert('Erro ao alterar password.');
    });
}
