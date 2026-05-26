let menu = document.getElementById("menuPerfil");
let seta = document.querySelector(".seta");

function abrirMenu(){
    if(menu.style.display === "block"){
        menu.style.display = "none";
    }
    else{
        menu.style.display = "block";
    }
}

document.addEventListener("click", function(event){
    if(!menu.contains(event.target) && !seta.contains(event.target)){
        menu.style.display = "none";
    }
});