const content = document.getElementById("content");

// lưu trang cuối
function savePage(page){
    localStorage.setItem("lastPage", page);
}

// chạy script trong file HTML load vào
function executeScripts(container){

    const scripts = container.querySelectorAll("script");

    scripts.forEach(oldScript => {

        const newScript = document.createElement("script");

        if(oldScript.src){
            newScript.src = oldScript.src;
        } else {
            newScript.textContent = oldScript.textContent;
        }

        document.body.appendChild(newScript);
        oldScript.remove();
    });
}

// LOAD TRANG CON
function loadPage(page){

    // reset trước khi load (QUAN TRỌNG)
    content.innerHTML = "";

    fetch(page + "?v=" + new Date().getTime()) // chống cache
    .then(response => response.text())
    .then(html => {

        content.innerHTML = `
            <button class="back-home" onclick="goHome()">
                🏠 Trang chủ
            </button>

            <div id="page-wrapper">
                ${html}
            </div>
        `;

        executeScripts(content);
        savePage(page);

        if(window.innerWidth <= 768){
            document.getElementById("sidebar").classList.remove("show");
        }

        window.scrollTo(0,0);
    })
    .catch(error => {

        console.error(error);

        content.innerHTML = `
            <div class="welcome">
                <h2>⚠️ Lỗi tải nội dung</h2>
            </div>
        `;
    });
}

// QUAY VỀ TRANG CHỦ
function goHome(){

    localStorage.removeItem("lastPage");

    content.innerHTML = `
        <div class="welcome">
            <h1>Nguyễn Hữu Khánh</h1>
            <p>Nơi lưu trữ tài liệu học tập</p>
            <p>D5S-VB2A</p>
        </div>
    `;

    if(window.innerWidth <= 768){
        document.getElementById("sidebar").classList.remove("show");
    }

    window.scrollTo(0,0);
}

// mở/đóng sidebar
function toggleSidebar(){
    document.getElementById("sidebar").classList.toggle("show");
}

// tự load lại trang cuối khi mở web
window.addEventListener("load", () => {

    const lastPage = localStorage.getItem("lastPage");

    if(lastPage){
        loadPage(lastPage);
    }
});