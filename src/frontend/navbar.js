function toggleDropdown() {
    var menu = document.getElementById('dropdown-menu');
    var toggle = document.getElementById('dropdown-toggle');
    if (!menu) return;
    var isHidden = menu.classList.toggle('hidden');
    if (toggle) toggle.setAttribute('aria-expanded', isHidden ? 'false' : 'true');
}

function logout() {
    window.location.href = 'login.html';
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
