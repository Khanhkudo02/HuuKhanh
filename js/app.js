const content = document.getElementById("content");

// ===== PAGES =====
const pages = {
    home: `
        <div class="welcome fade">
            <h1>Nguyễn Hữu Khánh</h1>
            <p>Nơi lưu trữ tài liệu học tập</p>
            <p>D5S-VB2A</p>
        </div>
    `,

    psychology: `
        <div class="fade">
            <h1>🧠 Tâm lý học</h1>
            <p>Đây là nội dung môn Tâm lý học</p>
        </div>
    `,

    english: `
        <div class="fade">
            <h1>🇬🇧 Tiếng Anh</h1>
            <p>Đây là nội dung môn Tiếng Anh</p>
        </div>
    `
};

// ===== NAVIGATE =====
function navigate(page){

    window.location.hash = page; // đổi URL

    render(page);

    if(window.innerWidth <= 768){
        document.getElementById("sidebar").classList.remove("show");
    }
}

// ===== RENDER =====
function render(page){

    if(!pages[page]) page = "home";

    content.innerHTML = pages[page];

    setActive(page);
}

// ===== ACTIVE MENU =====
function setActive(page){

    document.querySelectorAll(".sidebar li").forEach(li => {
        li.classList.remove("active");
    });

    const active = document.getElementById("nav-" + page);
    if(active){
        active.classList.add("active");
    }
}

// ===== SIDEBAR =====
function toggleSidebar(){
    document.getElementById("sidebar").classList.toggle("show");
}

// ===== HANDLE BACK/FORWARD =====
window.addEventListener("hashchange", () => {
    const page = window.location.hash.replace("#", "") || "home";
    render(page);
});

// ===== INIT =====
window.addEventListener("load", () => {
    const page = window.location.hash.replace("#", "") || "home";
    render(page);
});