function toggleSidebar(){

    document
    .getElementById("sidebar")
    .classList
    .toggle("show");

}

async function loadPage(page){

    localStorage.setItem(
        "lastPage",
        page
    );

    document
    .getElementById("backBtn")
    .style.display="inline-block";

    const content=
    document.getElementById("content");

    try{

        const res=
        await fetch(page);

        const html=
        await res.text();

        content.innerHTML=
        `
        <button id="backBtn" onclick="goHome()">
        ⬅ Trang chủ
        </button>
        `+html;

        const scripts=
        content.querySelectorAll("script");

        scripts.forEach(oldScript=>{

            const newScript=
            document.createElement("script");

            if(oldScript.src){

                newScript.src=
                oldScript.src;

            }else{

                newScript.textContent=
                oldScript.textContent;

            }

            document.body.appendChild(
                newScript
            );

        });

        document
        .getElementById("sidebar")
        .classList
        .remove("show");

    }

    catch(error){

        content.innerHTML=
        `
        <h2>Lỗi tải trang</h2>
        <p>${error}</p>
        `;

        console.error(error);

    }

}

function goHome(){

    localStorage.removeItem(
        "lastPage"
    );

    document
    .getElementById("content")
    .innerHTML=
    `
    <button id="backBtn"
    onclick="goHome()"
    style="display:none">
    ⬅ Trang chủ
    </button>

    <div class="welcome">
        <h1>Nguyễn Hữu Khánh</h1>
        <p>Nơi lưu trữ tài liệu học tập</p>
    </div>
    `;

}

window.onload=()=>{

    const lastPage=
    localStorage.getItem(
        "lastPage"
    );

    if(lastPage){

        loadPage(lastPage);

    }

};