async function loadUsers() {
  try {
    // Получите токен из localStorage или другого места хранения
    const token = localStorage.getItem("authToken"); // или из куков/другого хранилища

    const response = await fetch(
      "https://api.web95.tech/admin/users",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 401) {
      // Токен недействителен или отсутствует
      alert("Требуется авторизация. Пожалуйста, войдите в систему.");
      // Перенаправление на страницу входа
      window.location.href = "/auth.html";
      return;
    }

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const responseData = await response.json();
    const users = responseData.data; // Если данные в свойстве "data"

    const tbody = document.getElementById("usersTableBody");
    tbody.innerHTML = ""; // Очищаем таблицу

    users.forEach((user) => {
      const row = tbody.insertRow();
      // В функции loadUsers обновите строку с кнопками:
      row.innerHTML = `
  <td>${user.id}</td>
  <td>${user.full_name}</td>
  <td>${user.email}</td>
  <td><span style="color: #00ff88">${
    user.role_id === 2 ? "Админ" : "Пользователь"
  }</span></td>
  <td>${new Date(user.created_at).toLocaleDateString("ru-RU")}</td>
  <td class="admin-table__actions">
    <button class="admin-table__btn admin-table__btn--edit" onclick="editUser(${
      user.id
    })">
      Редактировать
    </button>
    <button class="admin-table__btn admin-table__btn--delete" onclick="deleteUser(${
      user.id
    })">
      Удалить
    </button>
  </td>
`;
    });
  } catch (error) {
    console.error("Ошибка загрузки пользователей:", error);
    alert("Не удалось загрузить пользователей");
  }
}

async function loadStats() {
  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch(
      "https://api.web95.tech/admin/stats",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);

    const statsData = await response.json();
    return statsData.data; // Предполагая, что данные в свойстве "data"
  } catch (error) {
    console.error("Ошибка загрузки статистики:", error);
    return null;
  }
}

async function updateStats() {
  const stats = await loadStats();
  if (stats) {
    document.getElementById("totalUsers").textContent = stats.total_users || 0;
    document.getElementById("activeTours").textContent =
      stats.total_trips || 0;
 
    document.getElementById("newNews").textContent = stats.total_news || 0;
  }
}




// Modal functions
function openModal(modalId) {
  document.getElementById(modalId).classList.add("active");
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
}

// Close modal when clicking outside
window.addEventListener("click", function (e) {
  if (e.target.classList.contains("modal")) {
    e.target.classList.remove("active");
  }
});

async function editUser(userId) {
  try {
    const token = localStorage.getItem("authToken");

    // Получаем данные пользователя
    const response = await fetch(
      `https://api.web95.tech/admin/users/${userId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Ошибка при получении данных пользователя");
    }

    const responseData = await response.json();
    const userData = responseData.data;

    // Заполняем форму редактирования
    document.querySelector('#editUserModal input[name="full_name"]').value =
      userData.full_name || "";
    document.querySelector('#editUserModal select[name="role_id"]').value =
      userData.role_id || "1";
    document.querySelector('#editUserModal input[name="user_id"]').value =
      userId;

    // Открываем модальное окно редактирования
    openModal("editUserModal");
  } catch (error) {
    console.error("Ошибка:", error);
    alert("Не удалось загрузить данные пользователя");
  }
}

async function submitEditUserForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const userId = formData.get("user_id");

  const userData = {
    full_name: formData.get("full_name"),
    role_id: parseInt(formData.get("role_id")),
  };

  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch(
      `https://api.web95.tech/admin/users/${userId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      }
    );

    if (response.ok) {
      closeModal("editUserModal");
      loadUsers(); // Перезагружаем список пользователей
      alert("Пользователь обновлен успешно!");
    } else {
      throw new Error("Ошибка при обновлении пользователя");
    }
  } catch (error) {
    console.error("Ошибка:", error);
    alert("Не удалось обновить пользователя");
  }
}

async function deleteUser(userId) {
  if (confirm(`Вы уверены, что хотите удалить пользователя #${userId}?`)) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `https://api.web95.tech/admin/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        loadUsers(); // Перезагружаем список
        alert("Пользователь удален успешно!");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      alert("Не удалось удалить пользователя");
    }
  }
}

async function submitUserForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const userData = {
    email: formData.get("email"),
    full_name: formData.get("full_name"),
    password: formData.get("password"),
    role_id: parseInt(formData.get("role_id")),
  };

  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch(
      "https://api.web95.tech/admin/users",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      }
    );

    if (response.ok) {
      closeModal("userModal");
      event.target.reset();
      loadUsers(); // Перезагружаем список пользователей
      alert("Пользователь добавлен успешно!");
    } else {
      throw new Error("Ошибка при создании пользователя");
    }
  } catch (error) {
    console.error("Ошибка:", error);
    alert("Не удалось создать пользователя");
  }
}

// News Management Functions
function editNews(newsId) {
  alert("Редактирование новости #" + newsId);
}

function deleteNews(newsId) {
  if (confirm("Вы уверены, что хотите удалить новость #" + newsId + "?")) {
    alert("Новость #" + newsId + " удалена");
  }
}

function submitNewsForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const newsData = Object.fromEntries(formData);

  console.log("Данные новости:", newsData);

  const tbody = document.getElementById("newsTableBody");
  const newRow = tbody.insertRow();
  const newId = tbody.rows.length;

  const categoryNames = {
    hajj_news: "Новости Хаджа",
    company_news: "Новости компании",
    umrah_news: "Новости Умры",
  };

  const statusNames = {
    draft: "Черновик",
    published: "Опубликовано",
  };

  const statusColor = newsData.status === "published" ? "#00ff88" : "#FFB800";

  newRow.innerHTML = `
                <td>${newId}</td>
                <td>${newsData.title}</td>
                <td>${categoryNames[newsData.category]}</td>
                <td>${new Date().toLocaleDateString("ru-RU")}</td>
                <td><span style="color: ${statusColor};">${
    statusNames[newsData.status]
  }</span></td>
                <td class="admin-table__actions">
                    <button class="admin-table__btn admin-table__btn--edit" onclick="editNews(${newId})">Редактировать</button>
                    <button class="admin-table__btn admin-table__btn--delete" onclick="deleteNews(${newId})">Удалить</button>
                </td>
            `;

  closeModal("newsModal");
  event.target.reset();
  alert("Новость создана успешно!");
}


// В конец скрипта добавьте:
document.addEventListener("DOMContentLoaded", function () {
  const authTabs = document.querySelectorAll(".auth-tab");
  const sections = document.querySelectorAll(".section");

  // Загружаем пользователей при загрузке страницы
  loadUsers();
  updateStats();

  // Восстановление активной вкладки из localStorage
  const savedSection = localStorage.getItem("activeSection");
  if (savedSection) {
    authTabs.forEach((t) => t.classList.remove("active"));
    sections.forEach((s) => s.classList.remove("active"));

    const savedTab = document.querySelector(`.auth-tab[data-section="${savedSection}"]`);
    const savedContent = document.getElementById(savedSection);

    if (savedTab && savedContent) {
      savedTab.classList.add("active");
      savedContent.classList.add("active");
      
      // 👇 ДОБАВЬ ЭТУ ПРОВЕРКУ ДЛЯ ВОССТАНОВЛЕНИЯ ВКЛАДКИ
      if (savedSection === "dashboard") {
        updateStats();
      }
    }
  } else {
    // Если в localStorage пусто — активируем первую вкладку
    if (authTabs.length > 0 && sections.length > 0) {
      authTabs[0].classList.add("active");
      sections[0].classList.add("active");
    }
  }

  // Обновляем обработчик клика по вкладкам
  authTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      // Снимаем активность
      authTabs.forEach((t) => t.classList.remove("active"));
      sections.forEach((section) => section.classList.remove("active"));

      // Делаем активной текущую
      this.classList.add("active");
      const targetSection = this.getAttribute("data-section");
      document.getElementById(targetSection).classList.add("active");

      // Сохраняем в localStorage
      localStorage.setItem("activeSection", targetSection);

      // 👇 Вставляем сюда проверку
      if (targetSection === "tours") {
        loadTours();
      }
      if (targetSection === "users") {
        loadUsers();
      }
      if (targetSection === "dashboard") {
        updateStats();
      }
    });
  });
});