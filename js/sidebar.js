// 🔑 Функция для парсинга JWT токена
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Ошибка парсинга токена:", e);
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
  const adminDropdown = document.querySelector('.sidebar__menu-with-dropdown'); // Получаем выпадающее меню админа

  // Скрываем меню админа если нет токена
  if (!token && adminDropdown) {
    adminDropdown.style.display = "none";
  }

  if (token) {
    const data = parseJwt(token);
    console.log("Расшифрованный токен:", data);

    if (data && data.full_name) {
      const authBlock = document.querySelector(".sidebar__auth");
      authBlock.innerHTML = `
        <div class="sidebar__auth-title">Добро пожаловать, ${data.full_name}</div>
      `;
      
      // Показываем кнопку выхода
      logoutBlock.style.display = "block";
      
      // 🔒 Скрываем меню Админ если role_id === 1 (обычный пользователь)
      if (adminDropdown) {
        if (data.role_id === 1) {
          adminDropdown.style.display = "none";
        } else {
          adminDropdown.style.display = "block";
        }
      }
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

  // ✨ Обработчик для якорной ссылки "часто задаваемые вопросы"
  const faqLink = document.querySelector('a[href="#faq_title"]');
  if (faqLink) {
    faqLink.addEventListener("click", (e) => {
      e.preventDefault();
      
      // Закрываем сайдбар
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
      
      // Ждем немного, чтобы сайдбар успел закрыться (для плавности)
      setTimeout(() => {
        const targetElement = document.getElementById("faq_title");
        if (targetElement) {
          // Плавная прокрутка к элементу
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      }, 300); // Задержка равна времени анимации закрытия сайдбара
    });
  }

  // 🔽 Обработчик для выпадающего меню Админ
  const adminDropdownTrigger = document.querySelector('.sidebar__menu-dropdown');
  
  if (adminDropdownTrigger) {
    adminDropdownTrigger.addEventListener('click', function(e) {
      e.preventDefault();
      const parent = this.parentElement;
      parent.classList.toggle('active');
    });
  }

  // Закрытие выпадающего меню при клике вне его
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.sidebar__menu-with-dropdown')) {
      const dropdowns = document.querySelectorAll('.sidebar__menu-with-dropdown');
      dropdowns.forEach(dropdown => {
        dropdown.classList.remove('active');
      });
    }
  });

  // Автоматически активируем текущую страницу в выпадающем меню
  const currentPage = window.location.pathname.split('/').pop();
  const dropdownItems = document.querySelectorAll('.sidebar__dropdown-item');
  
  dropdownItems.forEach(item => {
    if (item.getAttribute('href') === './' + currentPage) {
      item.classList.add('active');
      // Автоматически раскрываем меню если активен один из подразделов
      const parentDropdown = item.closest('.sidebar__menu-with-dropdown');
      if (parentDropdown) {
        parentDropdown.classList.add('active');
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", loadSidebar);