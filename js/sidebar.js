// Функция для декодирования JWT
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1]; // payload часть
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

async function loadSidebar() {
  const resp = await fetch("sidebar.html");
  const html = await resp.text();
  document.body.insertAdjacentHTML("afterbegin", html);

  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const closeBtn = document.getElementById("sidebarClose");

  // все бургер-кнопки по классу
  const burgerBtns = document.querySelectorAll(".header__left-burger");

  burgerBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      sidebar.classList.add("active");
      overlay.classList.add("active");
    });
  });

  closeBtn.addEventListener("click", () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  });

  overlay.addEventListener("click", () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  });

  // 🔑 Проверяем токен
  const token = localStorage.getItem("authToken");
  const logoutBlock = document.getElementById("sidebarLogout");
  if (token) {
    const data = parseJwt(token);
    if (data && data.full_name) {
      const authBlock = document.querySelector(".sidebar__auth");
      authBlock.innerHTML = `
        <div class="sidebar__auth-title">Добро пожаловать, ${data.full_name}</div>
      `;
      // Показываем кнопку выхода
      logoutBlock.style.display = "block";
    }
  }

  // 🚪 Обработчик выхода
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("authToken");
      logoutBlock.style.display = "none"; // скрываем кнопку после выхода
      window.location.href = "index.html"; // редирект на главную
    });
  }
}

document.addEventListener("DOMContentLoaded", loadSidebar);
