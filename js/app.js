const content = document.getElementById("content");

// Theo dõi các script đã inject để xóa sau
let injectedScripts = [];

function cleanupScripts() {
    injectedScripts.forEach(s => {
        if (s && s.parentNode) {
            s.parentNode.removeChild(s);
        }
    });
    injectedScripts = [];
}

function savePage(page) {
    localStorage.setItem("lastPage", page);
}

function loadPage(page) {

    // Dọn script cũ trước khi load trang mới
    cleanupScripts();

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
            container.innerHTML = html;

            // Chạy lại các script trong nội dung vừa load
            const scripts = container.querySelectorAll("script");

            scripts.forEach(oldScript => {

                const newScript = document.createElement("script");

                if (oldScript.src) {
                    newScript.src = oldScript.src + "?t=" + Date.now();
                } else {
                    newScript.textContent = oldScript.textContent;
                }

                document.body.appendChild(newScript);

                // Lưu lại để xóa sau
                injectedScripts.push(newScript);

                oldScript.remove();
            });

            savePage(page);

            if (window.innerWidth <= 768) {
                document
                    .getElementById("sidebar")
                    .classList.remove("show");
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

    // Dọn script khi về trang chủ
    cleanupScripts();

    localStorage.removeItem("lastPage");

    content.innerHTML = `
        <div class="welcome">

            <h1>
                Nguyễn Hữu Khánh D5S-VB2A
            </h1>

            <p>
                Nơi lưu trữ tài liệu học tập
            </p>

            <p>
                📚 Lý thuyết các môn học
            </p>

            <p>
                🎧 Audio ôn tập
            </p>

        </div>
    `;

    if (window.innerWidth <= 768) {
        document
            .getElementById("sidebar")
            .classList.remove("show");
    }

    window.scrollTo(0, 0);
}

function toggleSidebar() {

    document
        .getElementById("sidebar")
        .classList.toggle("show");
}

window.addEventListener("load", () => {

    const lastPage = localStorage.getItem("lastPage");

    if (lastPage) {
        loadPage(lastPage);
    }
});
