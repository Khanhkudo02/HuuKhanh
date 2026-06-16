const content = document.getElementById("content");

// Lưu lại các <style> đã inject để xóa khi chuyển trang
let injectedStyles = [];

function cleanupStyles() {
    injectedStyles.forEach(s => {
        if (s && s.parentNode) s.parentNode.removeChild(s);
    });
    injectedStyles = [];
}

function savePage(page) {
    localStorage.setItem("lastPage", page);
}

function loadPage(page) {

    fetch(page + "?t=" + Date.now())
        .then(response => response.text())
        .then(html => {

            // Dọn style cũ của trang trước
            cleanupStyles();

            content.innerHTML = `
                <button class="back-home" onclick="goHome()">
                    🏠 Trang chủ
                </button>
                <div id="page-container"></div>
            `;

            const container = document.getElementById("page-container");

            // Parse toàn bộ HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            // 1. Inject <style> từ <head> vào <head> trang chính
            doc.querySelectorAll("head style").forEach(s => {
                const styleEl = document.createElement("style");
                styleEl.textContent = s.textContent;
                document.head.appendChild(styleEl);
                injectedStyles.push(styleEl);
            });

            // 2. Tách script ra khỏi body
            const scriptContents = [];
            doc.querySelectorAll("body script, script").forEach(s => {
                scriptContents.push({
                    src: s.getAttribute("src") || null,
                    text: s.textContent
                });
                s.remove();
            });

            // 3. Gán HTML (không script) vào container
            container.innerHTML = doc.body.innerHTML;

            // 4. Chạy script sau khi DOM đã sẵn sàng
            setTimeout(() => {
                scriptContents.forEach(s => {
                    if (s.src) {
                        const el = document.createElement("script");
                        el.src = s.src + "?t=" + Date.now();
                        document.body.appendChild(el);
                    } else {
                        try {
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

    // Dọn style của trang con khi về trang chủ
    cleanupStyles();

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
