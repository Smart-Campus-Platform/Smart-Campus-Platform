const menuPorTipo = {
    'admin': '/menu-administrador',
    'docente': '/menu-docente',
    'funcionario': '/menu-funcionario',
    'funcionário': '/menu-funcionario',
    'estudante': '/menu-utilizador',
    'aluno': '/menu-utilizador'
};

function requireLogin(req, res, next) {
    if (!req.session.utilizador) {
        return res.redirect('/login');
    }
    next();
}

function requireTipo(...tipos) {
    return (req, res, next) => {
        if (!req.session.utilizador) {
            return res.redirect('/login');
        }
        if (!tipos.includes(req.session.utilizador.tipo)) {
            const destino = menuPorTipo[req.session.utilizador.tipo] || '/login';
            return res.redirect(destino);
        }
        next();
    };
}

module.exports = { requireLogin, requireTipo };
