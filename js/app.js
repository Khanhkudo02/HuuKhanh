const content = document.getElementById("content");

let loadedScripts = [];

function savePage(page){
    localStorage.setItem("lastPage", page);
}

function clearScripts(){

    loadedScripts.forEach(script => {
        script.remove();
    });

    loadedScripts = [];
}

function executeScripts(container){

    clearScripts();

    const scripts = container.querySelectorAll("script");

    scripts.forEach(oldScript => {

        const newScript = document.createElement("script");

        if(oldScript.src){
            newScript.src = oldScript.src;
        }else{
            newScript.textContent = oldScript.textContent;
        }

        document.body.appendChild(newScript);

        loadedScripts.push(newScript);
    });
}

function loadPage(page){

    fetch(page + "?t=" + Date.now())

    .then(response => response.text())

    .then(html => {

        content.innerHTML = `
        <button class="back-home" onclick="goHome()">
            🏠 Trang chủ
        </button>

        ${html}
        `;

        executeScripts(content);

        savePage(page);

        if(window.innerWidth <= 768){

            document
            .getElementById("sidebar")
            .classList.remove("show");
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

function goHome(){

    clearScripts();

    localStorage.removeItem("lastPage");

    content.innerHTML = `
    <div class="welcome">
        <h1>Nguyễn Hữu Khánh D5S-VB2A</h1>
        <p>Nơi lưu trữ tài liệu học tập</p>
    </div>
    `;

    if(window.innerWidth <= 768){

        document
        .getElementById("sidebar")
        .classList.remove("show");
    }

    window.scrollTo(0,0);
}

function toggleSidebar(){

    document
    .getElementById("sidebar")
    .classList.toggle("show");
}

window.addEventListener("load", () => {

    const lastPage =
    localStorage.getItem("lastPage");

    if(lastPage){
        loadPage(lastPage);
    }
});