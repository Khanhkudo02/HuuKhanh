const content = document.getElementById("content");

function savePage(page) {
    localStorage.setItem("lastPage", page);
}

function loadPage(page) {

    fetch(page + "?t=" + Date.now())
        .then(response => response.text())
        .then(html => {

            content.innerHTML = `
                <button class="back-home" onclick="goHome()">
                    🏠 Trang chủ
                </button>
                <div id="page-container"></div>
            `;

            const container = document.getElementById("page-container");

            // Parse HTML, tách script ra
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            const scriptContents = [];
            doc.querySelectorAll("script").forEach(s => {
                scriptContents.push({
                    src: s.getAttribute("src") || null,
                    text: s.textContent
                });
                s.remove();
            });

            // Gán HTML (không có script) vào DOM trước
            container.innerHTML = doc.body.innerHTML;

            // Đợi DOM render xong rồi mới chạy script
            setTimeout(() => {
                scriptContents.forEach(s => {
                    if (s.src) {
                        const el = document.createElement("script");
                        el.src = s.src + "?t=" + Date.now();
                        document.body.appendChild(el);
                    } else {
                        try {
                            // eval chạy trong global scope, có access DOM
                            // Wrap IIFE để tránh redeclare const/let
                            eval(`(function(){ ${s.text} })()`);
                        } catch(e) {
                            console.error("Script error:", e);
                        }
                    }
                });
            }, 0);

            savePage(page);

            if (window.innerWidth <= 768) {
                document.getElementById("sidebar").classList.remove("show");
            }

            window.scrollTo(0, 0);
        })

        .catch(error => {
            console.error(error);
            content.innerHTML = `
                <div class="welcome">
                    <h2>⚠️ Lỗi tải nội dung</h2>
                    <p>Không thể tải file: ${page}</p>
                </div>
            `;
        });
}

function goHome() {

    localStorage.removeItem("lastPage");

    content.innerHTML = `
        <div class="welcome">
            <h1>Nguyễn Hữu Khánh D5S-VB2A</h1>
            <p>Nơi lưu trữ tài liệu học tập</p>
            <p>📚 Lý thuyết các môn học</p>
            <p>🎧 Audio ôn tập</p>
        </div>
    `;

    if (window.innerWidth <= 768) {
        document.getElementById("sidebar").classList.remove("show");
    }

    window.scrollTo(0, 0);
}

function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("show");
}

window.addEventListener("load", () => {
    const lastPage = localStorage.getItem("lastPage");
    if (lastPage) {
        loadPage(lastPage);
    }
});
