function toggleDropdown() {
    var menu = document.getElementById('dropdown-menu');
    var toggle = document.getElementById('dropdown-toggle');
    if (!menu) return;
    var isHidden = menu.classList.toggle('hidden');
    if (toggle) toggle.setAttribute('aria-expanded', isHidden ? 'false' : 'true');
}

function logout() {
    localStorage.removeItem('smartcampus_user');
    window.location.href = '/login';
}

document.addEventListener('click', function (e) {
    var wrapper = document.querySelector('.dropdown-wrapper');
    if (wrapper && !wrapper.contains(e.target)) {
        var menu = document.getElementById('dropdown-menu');
        var toggle = document.getElementById('dropdown-toggle');
        if (menu) menu.classList.add('hidden');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('a[href="login.html"], a[href="/login"]').forEach(function (a) {
        if (a.querySelector('i.fa-right-from-bracket')) {
            a.addEventListener('click', function (e) {
                e.preventDefault();
                logout();
            });
        }
    });

    atualizarLinkMenu();
    iniciarNotificacoes();
});

function atualizarLinkMenu() {
    var btn = document.querySelector('.btn-casa');
    if (!btn) return;
    var tipo = typeof getUserTipo === 'function' ? getUserTipo() : null;
    if (!tipo) return;
    var menus = {
        'admin': 'menu_administrador.html',
        'docente': 'menu_docente.html',
        'funcionario': 'menu_funcionario.html',
        'funcionário': 'menu_funcionario.html',
        'estudante': 'menu_utilizador.html',
        'aluno': 'menu_utilizador.html'
    };
    btn.href = menus[tipo] || 'menu_utilizador.html';
}

function iniciarNotificacoes() {
    var sino = document.querySelector('span[aria-label="Notificações"]');
    if (!sino) return;

    var wrapper = document.createElement('span');
    wrapper.style.cssText = 'position:relative;display:inline-block;cursor:pointer;';
    sino.parentNode.insertBefore(wrapper, sino);
    wrapper.appendChild(sino);

    var panel = document.createElement('div');
    panel.id = 'notif-panel';
    panel.style.cssText = 'display:none;position:absolute;top:32px;right:0;background:#e8f6fb;border:1px solid #33add6;border-radius:6px;box-shadow:0 4px 12px rgba(51,173,214,.18);min-width:280px;max-width:340px;z-index:9999;max-height:360px;overflow-y:auto;';
    wrapper.appendChild(panel);

    wrapper.addEventListener('click', function (e) {
        e.stopPropagation();
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });

    document.addEventListener('click', function () {
        panel.style.display = 'none';
    });

    verificarAlertas();
    setInterval(verificarAlertas, 30000);
}

function verificarAlertas() {
    var sino = document.querySelector('span[aria-label="Notificações"]');
    var panel = document.getElementById('notif-panel');
    if (!sino || !panel) return;

    fetch('/api/alertas')
        .then(function (r) { return r.json(); })
        .then(function (alertas) {
            if (!Array.isArray(alertas) || alertas.length === 0) {
                panel.innerHTML = '<div style="padding:14px 16px;font-size:13px;color:#666;text-align:center;">Sem alertas nas últimas 24h</div>';
                return;
            }

            panel.innerHTML = '<div style="padding:10px 14px;border-bottom:1px solid #33add6;font-weight:700;font-size:13px;color:#1a7a9a;">Alertas de Sensores</div>';
            alertas.forEach(function (a) {
                var item = document.createElement('div');
                item.style.cssText = 'padding:9px 14px;border-bottom:1px solid #c0e8f5;font-size:12px;line-height:1.5;';
                var hora = a.data_hora ? new Date(a.data_hora).toLocaleString('pt-PT') : '';
                item.innerHTML =
                    '<strong>' + a.local + '</strong> &mdash; Sensor ' + a.id_sensor + ' (' + a.tipo_nome + ')' +
                    '<br><span style="color:#5ba3b8;font-size:11px;">' + hora + '</span>';
                panel.appendChild(item);
            });
        })
        .catch(function () {});
}
