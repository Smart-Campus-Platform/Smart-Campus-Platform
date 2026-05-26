function toggleDropdown() {
    var menu = document.getElementById('dropdown-menu');
    var toggle = document.getElementById('dropdown-toggle');
    var isHidden = menu.classList.toggle('hidden');
    toggle.setAttribute('aria-expanded', isHidden ? 'false' : 'true');
}

function logout() {
    window.location.href = 'login.html';
}

document.addEventListener('click', function (e) {
    var wrapper = document.querySelector('.dropdown-wrapper');
    if (wrapper && !wrapper.contains(e.target)) {
        document.getElementById('dropdown-menu').classList.add('hidden');
        document.getElementById('dropdown-toggle').setAttribute('aria-expanded', 'false');
    }
});
