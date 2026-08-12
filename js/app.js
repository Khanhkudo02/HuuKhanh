/* =========================================================
   KHO HỌC TẬP CÁ NHÂN - APP.JS
========================================================= */

let injectedStyles = [];

function cleanupStyles() {
    injectedStyles.forEach(style => {
        if (style && style.parentNode) {
            style.parentNode.removeChild(style);
        }
    });
    injectedStyles = [];
}

function savePage(page) {
    sessionStorage.setItem("current_page", page);
}

function loadPage(page) {
    if (!page) return;

    const content = document.getElementById("content");
    if (!content) return;

    fetch(page + "?t=" + Date.now())
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP " + response.status + " - " + page);
            }
            return response.text();
        })
        .then(html => {
            cleanupStyles();

            content.innerHTML = `
                <button class="back-home" onclick="goHome()">🏠 Trang chủ</button>
                <div id="page-container"></div>
            `;

            const container = document.getElementById("page-container");
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            // Nạp CSS
            doc.querySelectorAll("head style").forEach(style => {
                const styleEl = document.createElement("style");
                styleEl.textContent = style.textContent;
                document.head.appendChild(styleEl);
                injectedStyles.push(styleEl);
            });

            // Tách Script
            const scripts = [];
            doc.querySelectorAll("script").forEach(script => {
                const src = script.getAttribute("src");
                if (src && src.includes("app.js")) {
                    script.remove();
                    return;
                }
                scripts.push({
                    src: src,
                    text: script.textContent
                });
                script.remove();
            });

            container.innerHTML = doc.body.innerHTML;

            // Thực thi JS môn học
            setTimeout(() => {
                scripts.forEach(script => {
                    if (script.src) {
                        const newScript = document.createElement("script");
                        let scriptSrc = script.src;

                        if (!scriptSrc.startsWith("http://") && !scriptSrc.startsWith("https://") && !scriptSrc.startsWith("/")) {
                            const pageDir = page.substring(0, page.lastIndexOf("/") + 1);
                            scriptSrc = pageDir + scriptSrc;
                        }

                        newScript.src = scriptSrc + (scriptSrc.includes("?") ? "&" : "?") + "t=" + Date.now();
                        document.body.appendChild(newScript);
                    } else if (script.text && script.text.trim()) {
                        try {
                            const fn = new Function(script.text);
                            fn();
                        } catch (error) {
                            console.error("✗ Lỗi JavaScript:", error);
                        }
                    }
                });
            }, 0);

            savePage(page);
            closeSidebar();
            window.scrollTo({ top: 0, behavior: "instant" });
        })
        .catch(error => {
            console.error("loadPage error:", error);
            content.innerHTML = `
                <div class="welcome">
                    <h2>⚠️ Lỗi tải nội dung</h2>
                    <p>Không thể tải: <strong>${page}</strong></p>
                    <p>Hãy kiểm tra lại file trong thư mục <strong>data/</strong>.</p>
                    <button class="pill-btn" onclick="goHome()" style="margin-top:15px; width: 100%; justify-content: center;">🏠 Về trang chủ</button>
                </div>
            `;
        });
}

/* KHỞI TẠO ỨNG DỤNG DUY NHẤT */
window.addEventListener("DOMContentLoaded", () => {
    if (typeof initTheme === "function") initTheme();

    const currentPage = sessionStorage.getItem("current_page");

    if (currentPage && currentPage !== "home") {
        loadPage(currentPage);
    } else {
        if (typeof goHome === "function") goHome();
    }
});
