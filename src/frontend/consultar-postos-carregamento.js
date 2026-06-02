async function carregarPostosUtilizador() {
    const resposta = await fetch("/api/postos-carregamento");
    const postos = await resposta.json();

    const lista = document.getElementById("lista-postos-carregamento");
    lista.innerHTML = "";

    const postosPorArea = {};

    postos.forEach(function(posto) {
        if (!postosPorArea[posto.area]) {
            postosPorArea[posto.area] = [];
        }

        postosPorArea[posto.area].push(posto);
    });

    Object.keys(postosPorArea).forEach(function(area, index) {
        const areaId = "area-postos-" + index;
        const div = document.createElement("div");
        div.className = "piso";

        div.innerHTML =
            '<div class="titulo-piso" onclick="toggleSalas(\'' + areaId + '\', this)">' +
            '    <span class="seta-piso">&#9656;</span>' +
            '    <span>' + area + '</span>' +
            '</div>' +
            '<div class="salas" id="' + areaId + '">' +
            postosPorArea[area].map(function(posto) {
                const disponivel = posto.disponibilidade === true || posto.disponibilidade === 1 || posto.disponibilidade === "1";
                const classe = disponivel ? "disponivel" : "indisponivel";
                const texto = disponivel ? "Disponivel" : "Indisponivel";

                return '<div class="lugar">' +
                    '<span>' + posto.id_posto + '</span>' +
                    '<span class="indicador ' + classe + '" title="' + texto + '"></span>' +
                '</div>';
            }).join("") +
            '</div>';

        lista.appendChild(div);
    });
}

document.addEventListener("DOMContentLoaded", function() {
    carregarPostosUtilizador();
    setInterval(carregarPostosUtilizador, 30000);
});
