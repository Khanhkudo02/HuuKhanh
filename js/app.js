const content = document.getElementById("content");

function savePage(page){
localStorage.setItem("lastPage", page);
}

function loadPage(page){

fetch(page)
.then(r=>r.text())
.then(html=>{

content.innerHTML = `
<button class="back-home" onclick="goHome()">
🏠 Trang chủ
</button>
${html}
`;

savePage(page);

if(window.innerWidth <= 768){
document.getElementById("sidebar")
.classList.remove("show");
}

window.scrollTo(0,0);

})
.catch(()=>{
content.innerHTML="<h2>Lỗi tải file</h2>";
});
}

function goHome(){

localStorage.removeItem("lastPage");

content.innerHTML=`
<div class="welcome">
<h1>Nguyễn Hữu Khánh</h1>
<p>Nơi lưu trữ tài liệu học tập</p>
</div>
`;

}

function toggleSidebar(){
document.getElementById("sidebar")
.classList.toggle("show");
}

window.addEventListener("load",()=>{

const lastPage =
localStorage.getItem("lastPage");

if(lastPage){
loadPage(lastPage);
}

});