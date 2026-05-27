function toggleSalas(id, elemento) {
    const lista = document.getElementById(id);
    const seta = elemento.querySelector(".seta-piso");

    if (lista.style.display === "block") {
        lista.style.display = "none";
        seta.innerHTML = "▸";
    } 
    else {
        lista.style.display = "block";
        seta.innerHTML = "▾";
    }
}

function filtrarSalas(tipo) {
    const salas = document.querySelectorAll(".sala");

    salas.forEach(sala => {
        if (tipo === "Todos") {
            sala.style.display = "block";
        }
        else if (tipo === "Salas") {
            if (sala.classList.contains("sala-normal")) {
                sala.style.display = "block";
            }
            else {
                sala.style.display = "none";
            }
        }
        else if (tipo === "Laboratórios") {
            if (sala.classList.contains("laboratorio")) {
                sala.style.display = "block";
            }
            else {
                sala.style.display = "none";
            }
        }
    });
}