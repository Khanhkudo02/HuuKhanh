function toggleSidebar(){
document
.getElementById("sidebar")
.classList.toggle("show");
}

async function loadPage(page){

const res = await fetch(page);

const html = await res.text();

document.getElementById("content").innerHTML = html;

if(window.innerWidth < 768){
document
.getElementById("sidebar")
.classList.remove("show");
}
}