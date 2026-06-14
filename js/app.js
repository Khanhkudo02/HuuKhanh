function toggleSidebar(){
    document.getElementById("sidebar")
    .classList.toggle("show");
}

async function loadPage(page){

    const content =
    document.getElementById("content");

    try{

        const res = await fetch(page);

        const html = await res.text();

        content.innerHTML = html;

        // chạy lại script trong file html được load

        const scripts =
        content.querySelectorAll("script");

        scripts.forEach(oldScript=>{

            const newScript =
            document.createElement("script");

            newScript.textContent =
            oldScript.textContent;

            document.body.appendChild(newScript);

            oldScript.remove();

        });

    }catch(err){

        content.innerHTML=
        "<h2>Lỗi tải dữ liệu</h2>";

        console.error(err);

    }
}