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

            // Tách script ra khỏi html trước khi gán innerHTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            // Lấy tất cả script và xóa khỏi doc
            const scriptContents = [];
            doc.querySelectorAll("script").forEach(s => {
                scriptContents.push({
                    src: s.src || null,
                    text: s.textContent
                });
                s.remove();
            });

            // Gán HTML không có script
            container.innerHTML = doc.body.innerHTML;

            // Chạy từng script bằng Function() để tránh xung đột scope toàn cục
            scriptContents.forEach(s => {
                try {
                    if (s.src) {
                        const el = document.createElement("script");
                        el.src = s.src + "?t=" + Date.now();
                        document.body.appendChild(el);
                    } else {
                        // Wrap trong IIFE để tránh redeclare const/let toàn cục
                        const fn = new Function(s.text);
                        fn();
                    }
                } catch(e) {
                    console.error("Script error:", e);
                }
            });

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
