/* =========================================================
   KHO HỌC TẬP CÁ NHÂN
   APP.JS - QUẢN LÝ LOAD TRANG + KHÔI PHỤC TRANG
========================================================= */

const content = document.getElementById("content");

// Lưu các style của trang môn học
let injectedStyles = [];


/* =========================================================
   XÓA STYLE CỦA TRANG CŨ
========================================================= */

function cleanupStyles() {

    injectedStyles.forEach(style => {

        if (style && style.parentNode) {
            style.parentNode.removeChild(style);
        }

    });

    injectedStyles = [];
}


/* =========================================================
   LƯU TRANG HIỆN TẠI
========================================================= */

function savePage(page) {

    sessionStorage.setItem(
        "current_page",
        page
    );

}


/* =========================================================
   ĐÓNG SIDEBAR
========================================================= */

function closeSidebar() {

    const sidebar =
        document.getElementById("sidebar");

    if (sidebar) {

        sidebar.classList.remove("active");
        sidebar.classList.remove("show");

    }

}


/* =========================================================
   TẢI TRANG MÔN HỌC
========================================================= */

function loadPage(page) {

    if (!page) return;


    fetch(page + "?t=" + Date.now())

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "HTTP " +
                    response.status +
                    " - " +
                    page
                );

            }

            return response.text();

        })

        .then(html => {


            /* =================================================
               XÓA STYLE CŨ
            ================================================= */

            cleanupStyles();


            /* =================================================
               TẠO KHUNG TRANG
            ================================================= */

            content.innerHTML = `

                <button
                    class="back-home"
                    onclick="goHome()">

                    🏠 Trang chủ

                </button>

                <div
                    id="page-container">
                </div>

            `;


            const container =
                document.getElementById(
                    "page-container"
                );


            /* =================================================
               PARSE FILE HTML
            ================================================= */

            const parser =
                new DOMParser();

            const doc =
                parser.parseFromString(
                    html,
                    "text/html"
                );


            /* =================================================
               LẤY CSS <style>
            ================================================= */

            doc
                .querySelectorAll("head style")
                .forEach(style => {

                    const styleEl =
                        document.createElement(
                            "style"
                        );

                    styleEl.textContent =
                        style.textContent;

                    document.head.appendChild(
                        styleEl
                    );

                    injectedStyles.push(
                        styleEl
                    );

                });


            /* =================================================
               LẤY SCRIPT CỦA TRANG MÔN HỌC
            ================================================= */

            const scripts = [];


            doc
                .querySelectorAll("script")
                .forEach(script => {

                    const src =
                        script.getAttribute(
                            "src"
                        );

                    /*
                     * KHÔNG CHẠY LẠI APP.JS
                     */

                    if (
                        src &&
                        src.includes("app.js")
                    ) {

                        script.remove();

                        return;

                    }


                    scripts.push({

                        src: src,

                        text:
                            script.textContent

                    });


                    script.remove();

                });


            /* =================================================
               ĐƯA HTML VÀO TRANG
            ================================================= */

            container.innerHTML =
                doc.body.innerHTML;


            /* =================================================
               CHẠY JAVASCRIPT CỦA MÔN HỌC
            ================================================= */

            setTimeout(() => {

                scripts.forEach(script => {


                    /* =========================================
                       SCRIPT CÓ SRC
                    ========================================= */

                    if (script.src) {

                        const newScript =
                            document.createElement(
                                "script"
                            );


                        /*
                         * Xử lý đường dẫn tương đối
                         *
                         * Ví dụ:
                         * data/psychology.html
                         * có:
                         * js/psychology.js
                         *
                         * thì phải tính từ thư mục data/
                         */

                        let scriptSrc =
                            script.src;


                        if (
                            !scriptSrc.startsWith(
                                "http://"
                            ) &&
                            !scriptSrc.startsWith(
                                "https://"
                            ) &&
                            !scriptSrc.startsWith(
                                "/"
                            )
                        ) {

                            const pageDir =
                                page.substring(
                                    0,
                                    page.lastIndexOf(
                                        "/"
                                    ) + 1
                                );


                            scriptSrc =
                                pageDir +
                                scriptSrc;

                        }


                        newScript.src =
                            scriptSrc +
                            (
                                scriptSrc.includes("?")
                                    ? "&"
                                    : "?"
                            ) +
                            "t=" +
                            Date.now();


                        newScript.onload = () => {

                            console.log(
                                "✓ Script đã chạy:",
                                scriptSrc
                            );

                        };


                        newScript.onerror = () => {

                            console.error(
                                "✗ Không thể tải script:",
                                scriptSrc
                            );

                        };


                        document.body.appendChild(
                            newScript
                        );

                    }


                    /* =========================================
                       SCRIPT INLINE
                    ========================================= */

                    else if (
                        script.text &&
                        script.text.trim()
                    ) {

                        try {

                            const fn =
                                new Function(
                                    script.text
                                );

                            fn();

                        }

                        catch (error) {

                            console.error(
                                "✗ Lỗi JavaScript:",
                                error
                            );

                        }

                    }

                });

            }, 0);


            /* =================================================
               LƯU TRANG HIỆN TẠI
            ================================================= */

            savePage(page);


            /* =================================================
               ĐÓNG MENU
            ================================================= */

            closeSidebar();


            /* =================================================
               VỀ ĐẦU TRANG
            ================================================= */

            window.scrollTo({
                top: 0,
                behavior: "instant"
            });

        })


        /* =====================================================
           XỬ LÝ LỖI
        ===================================================== */

        .catch(error => {

            console.error(
                "loadPage error:",
                error
            );


            content.innerHTML = `

                <div class="welcome">

                    <h2>
                        ⚠️ Lỗi tải nội dung
                    </h2>

                    <p>
                        Không thể tải:
                    </p>

                    <p>
                        <strong>
                            ${page}
                        </strong>
                    </p>

                    <p>
                        Hãy kiểm tra lại file
                        trong thư mục
                        <strong>data/</strong>.
                    </p>

                    <button
                        class="pill-btn"
                        onclick="goHome()"
                        style="margin-top:15px;">

                        🏠 Về trang chủ

                    </button>

                </div>

            `;

        });

}


/* =========================================================
   KHỞI TẠO APP KHI RELOAD
========================================================= */

window.addEventListener(
    "DOMContentLoaded",
    () => {

        const currentPage =
            sessionStorage.getItem(
                "current_page"
            );


        /* =============================================
           ĐANG Ở MỘT MÔN HỌC
        ============================================= */

        if (
            currentPage &&
            currentPage !== "home"
        ) {

            console.log(
                "↻ Khôi phục:",
                currentPage
            );


            loadPage(
                currentPage
            );


            return;

        }


        /* =============================================
           TRANG CHỦ
        ============================================= */

        if (
            typeof goHome === "function"
        ) {

            goHome();

        }

    }
);