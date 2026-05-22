    (function () {
        'use strict';

        var pagina    = document.querySelector('.pagina');
        var painel    = document.getElementById('painel-acessibilidade');
        var botaoAbre = document.getElementById('botao-acessibilidade');

        var zoom      = parseFloat(localStorage.getItem('acc-zoom') || '1');
        var filtro    = localStorage.getItem('acc-filtro') || '';
        var contraste = localStorage.getItem('acc-contraste') === '1';
        var rosa      = localStorage.getItem('acc-rosa') === '1';

        botaoAbre.addEventListener('click', function (e) {
            e.stopPropagation();
            var aberto = painel.classList.toggle('aberto');
            botaoAbre.setAttribute('aria-expanded', aberto ? 'true' : 'false');
        });

        document.addEventListener('click', function (e) {
            if (!painel.contains(e.target) && e.target !== botaoAbre) {
                painel.classList.remove('aberto');
                botaoAbre.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                painel.classList.remove('aberto');
                botaoAbre.setAttribute('aria-expanded', 'false');
                botaoAbre.focus();
            }
        });

        var controloZoom = document.getElementById('controlo-zoom');
        var valorZoom    = document.getElementById('valor-zoom');

        function aplicarZoom() {
            pagina.style.zoom = zoom;
            localStorage.setItem('acc-zoom', zoom);
            var sliderVal = Math.round(zoom * 50);
            sliderVal = Math.max(0, Math.min(100, sliderVal));
            controloZoom.value = sliderVal;
            controloZoom.setAttribute('aria-valuenow', sliderVal);
            valorZoom.textContent = sliderVal;
        }

        controloZoom.addEventListener('input', function () {
            zoom = controloZoom.value / 50;
            aplicarZoom();
        });

        function aplicarFiltro(id) {
            pagina.style.filter = id ? 'url(#' + id + ')' : '';
            filtro = id;
            localStorage.setItem('acc-filtro', id);
            document.querySelectorAll('.botao-filtro').forEach(function (btn) {
                var ativo = btn.dataset.filtro === id;
                btn.classList.toggle('selecionado', ativo);
                btn.setAttribute('aria-pressed', ativo ? 'true' : 'false');
            });
        }

        document.querySelectorAll('.botao-filtro').forEach(function (btn) {
            btn.addEventListener('click', function () {
                aplicarFiltro(btn.dataset.filtro);
            });
        });

        function aplicarContraste(ativo) {
            document.body.classList.toggle('contraste-alto', ativo);
            contraste = ativo;
            localStorage.setItem('acc-contraste', ativo ? '1' : '0');
            var btn = document.getElementById('botao-contraste');
            btn.classList.toggle('selecionado', ativo);
            btn.setAttribute('aria-pressed', ativo ? 'true' : 'false');
        }

        document.getElementById('botao-contraste').addEventListener('click', function () {
            aplicarContraste(!contraste);
        });

        function aplicarRosa(ativo) {
            document.body.classList.toggle('tema-rosa', ativo);
            rosa = ativo;
            localStorage.setItem('acc-rosa', ativo ? '1' : '0');
            var btn = document.getElementById('botao-rosa');
            btn.classList.toggle('selecionado', ativo);
            btn.setAttribute('aria-pressed', ativo ? 'true' : 'false');
        }

        document.getElementById('botao-rosa').addEventListener('click', function () {
            aplicarRosa(!rosa);
        });
        aplicarZoom();
        aplicarFiltro(filtro);
        aplicarContraste(contraste);
        aplicarRosa(rosa);

    })();

