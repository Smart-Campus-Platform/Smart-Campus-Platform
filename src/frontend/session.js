function getUser() {
    try { return JSON.parse(localStorage.getItem('smartcampus_user')); } catch { return null; }
}

function getUserId() {
    const u = getUser();
    return u ? u.id : null;
}

function getUserTipo() {
    const u = getUser();
    return u ? u.tipo : null;
}

function requireLogin() {
    if (!getUser()) { window.location.href = '/login'; return false; }
    return true;
}

function logout() {
    localStorage.removeItem('smartcampus_user');
    window.location.href = '/login';
}

function apiFetch(url, options) {
    options = options || {};
    options.headers = options.headers || {};
    if (!options.headers['Content-Type'] && !(options.body instanceof FormData)) {
        options.headers['Content-Type'] = 'application/json';
    }
    const id = getUserId();
    if (id) options.headers['X-User-Id'] = id;
    return fetch(url, options);
}
