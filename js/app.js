/* =========================================================
   KHO HỌC TẬP CÁ NHÂN - APP.JS (OPTIMIZED FOR RESPONSIVE)
========================================================= */

let injectedStyles = [];
let editingNoteIndex = null;

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
                <div class="subject-top-bar">
                    <button class="back-home" onclick="goHome()">🏠 Trang chủ</button>
                    <button class="btn-note-toggle" onclick="toggleNoteSidebar()">📝 Note Môn Học</button>
                </div>
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
            renderNotes();
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

/* =========================================================
   XỬ LÝ QUẢN LÝ GHI CHÚ (NOTE MANAGEMENT)
========================================================= */

function getNotesKey() {
    const currentPage = sessionStorage.getItem("current_page") || "global";
    return "notes_" + currentPage;
}

function getNotes() {
    const key = getNotesKey();
    return JSON.parse(localStorage.getItem(key) || "[]");
}

function renderNotes() {
    const container = document.getElementById("note-list-container");
    if (!container) return;

    const notes = getNotes();
    if (notes.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); font-size: 0.82rem; margin-top: 20px;">Chưa có ghi chú nào cho môn này</div>`;
        return;
    }

    container.innerHTML = notes.map((note, index) => `
        <div class="note-item">
            <div class="note-item-text">${escapeHtml(note)}</div>
            <div class="note-actions">
                <button class="note-btn-action" onclick="editNote(${index})">✏️ Sửa</button>
                <button class="note-btn-action delete" onclick="deleteNote(${index})">🗑️ Xoá</button>
            </div>
        </div>
    `).join("");
}

function saveNewNote() {
    const input = document.getElementById("note-input");
    const saveBtn = document.getElementById("note-save-btn");
    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    let notes = getNotes();

    if (editingNoteIndex !== null) {
        notes[editingNoteIndex] = text;
        editingNoteIndex = null;
        if (saveBtn) saveBtn.textContent = "➕ Thêm Ghi Chú";
    } else {
        notes.unshift(text);
    }

    localStorage.setItem(getNotesKey(), JSON.stringify(notes));
    input.value = "";
    renderNotes();
}

function editNote(index) {
    const notes = getNotes();
    const input = document.getElementById("note-input");
    const saveBtn = document.getElementById("note-save-btn");

    if (notes[index] !== undefined && input) {
        input.value = notes[index];
        editingNoteIndex = index;
        if (saveBtn) saveBtn.textContent = "💾 Cập Nhật Ghi Chú";
        input.focus();
    }
}

function deleteNote(index) {
    if (!confirm("Bạn có chắc chắn muốn xoá ghi chú này?")) return;

    let notes = getNotes();
    notes.splice(index, 1);
    localStorage.setItem(getNotesKey(), JSON.stringify(notes));

    if (editingNoteIndex === index) {
        editingNoteIndex = null;
        const input = document.getElementById("note-input");
        const saveBtn = document.getElementById("note-save-btn");
        if (input) input.value = "";
        if (saveBtn) saveBtn.textContent = "➕ Thêm Ghi Chú";
    }

    renderNotes();
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
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
