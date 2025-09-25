const NEWS_API_URL = "https://api.web95.tech/api/v1/admin/news";

// Загрузка всех новостей
async function loadNews() {
  try {
    const response = await fetch("https://api.web95.tech/api/v1/news");
    if (!response.ok) throw new Error("Ошибка загрузки новостей");

    const responseData = await response.json();
    const news = responseData.data.items || [];
    renderNewsTable(news);
  } catch (error) {
    console.error("Error loading news:", error);
    alert("Ошибка загрузки новостей");
  }
}

// Рендер таблицы новостей
function renderNewsTable(news) {
  const tableBody = document.getElementById("newsTableBody");
  tableBody.innerHTML = "";

  news.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${item.id || "-"}</td>
            <td>${item.title}</td>
           <td>${
             item.category_id === 1
               ? "Все новости"
               : item.category_id === 2
               ? "Новости Хаджа"
               : item.category_id === 3
               ? "Новости компании"
               : "Другое"
           }</td>
            <td>${formatDate(item.published_at)}</td>
            <td><span style="color: ${getStatusColor(
              item.status
            )}">${getStatusText(item.status)}</span></td>
            <td class="admin-table__actions">
                <button class="admin-table__btn admin-table__btn--edit" onclick="editNews(${
                  item.id
                })">
                    Редактировать
                </button>
                <button class="admin-table__btn admin-table__btn--delete" onclick="deleteNews(${
                  item.id
                })">
                    Удалить
                </button>
            </td>
        `;
    tableBody.appendChild(row);
  });
}

// Форматирование даты
function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("ru-RU");
}

// Получение цвета статуса
function getStatusColor(status) {
  switch (status) {
    case "published":
      return "#00ff88";
    case "draft":
      return "#ffb800";
    default:
      return "#ffffff";
  }
}

// Получение текста статуса
function getStatusText(status) {
  switch (status) {
    case "published":
      return "Опубликовано";
    case "draft":
      return "Черновик";
    default:
      return status;
  }
}

// Создание новости
async function createNews(newsData) {
  const token = localStorage.getItem("authToken");
  try {
    const response = await fetch(NEWS_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newsData),
    });

    if (!response.ok) throw new Error("Ошибка создания новости");

    const responseData = await response.json();
    const result = responseData.data;
    loadNews();
    closeModal("newsModal");
    alert("Новость успешно создана!");
    return result;
  } catch (error) {
    console.error("Error creating news:", error);
    alert("Ошибка создания новости");
  }
}

// Редактирование новости
async function updateNews(id, newsData) {
  const token = localStorage.getItem("authToken");
  try {
    const response = await fetch(`${NEWS_API_URL}/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newsData),
    });

    if (!response.ok) throw new Error("Ошибка обновления новости");

    const responseData = await response.json();
    const result = responseData.data;
    loadNews();
    closeModal("editNewsModal");
    alert("Новость успешно обновлена!");
    return result;
  } catch (error) {
    console.error("Error updating news:", error);
    alert("Ошибка обновления новости");
  }
}

// Удаление новости
async function deleteNews(id) {
  const token = localStorage.getItem("authToken");
  if (!confirm("Вы уверены, что хотите удалить эту новость?")) return;

  try {
    const response = await fetch(`${NEWS_API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Ошибка удаления новости");

    loadNews();
    alert("Новость успешно удалена!");
  } catch (error) {
    console.error("Error deleting news:", error);
    alert("Ошибка удаления новости");
  }
}

// Получение данных новости по ID
async function getNewsById(id) {
  try {
    const response = await fetch(
      `${"https://api.web95.tech/api/v1/news"}/${id}`
    );
    if (!response.ok) throw new Error("Ошибка загрузки новости");

    const respData = await response.json();
    const data = respData.data;

    return data;
  } catch (error) {
    console.error("Error fetching news:", error);
    alert("Ошибка загрузки новости");
  }
}

// Открытие модального окна для редактирования
async function editNews(id) {
  const newsItem = await getNewsById(id);
  if (!newsItem) return;

  const modal = document.getElementById("editNewsModal");
  const form = modal.querySelector("form");

  form.querySelector('[name="news_id"]').value = newsItem.id;
  form.querySelector('[name="title"]').value = newsItem.title;
  form.querySelector('[name="category"]').value = newsItem.category_id;
  form.querySelector('[name="excerpt"]').value = newsItem.excerpt;
  form.querySelector('[name="content"]').value = newsItem.content;
  form.querySelector('[name="status"]').value = newsItem.status;
  form.querySelector('[name="media_type"]').value = newsItem.media_type || "";
  form.querySelector('[name="preview_url"]').value = newsItem.preview_url || "";
  form.querySelector('[name="video_url"]').value = newsItem.video_url || "";

  openModal("editNewsModal");
}

// Обработка формы создания новости
async function submitNewsForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);

  const newsData = {
    title: formData.get("title"),
    category_id: parseInt(formData.get("category")),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    status: formData.get("status"),
    media_type: formData.get("media_type") || null,
    preview_url: formData.get("preview_url") || null,
    video_url: formData.get("video_url") || null,
    published_at:
      formData.get("status") === "published" ? new Date().toISOString() : null,
  };

  await createNews(newsData);
}

// Обработка формы редактирования новости
async function submitEditNewsForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const id = formData.get("news_id");

  const newsData = {
    title: formData.get("title"),
    category: formData.get("category"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    status: formData.get("status"),
    media_type: formData.get("media_type") || null,
    preview_url: formData.get("preview_url") || null,
    video_url: formData.get("video_url") || null,
  };

  // Если статус изменился на published, обновляем дату публикации
  if (newsData.status === "published") {
    const originalNews = await getNewsById(id);
    if (originalNews.status !== "published") {
      newsData.published_at = new Date().toISOString();
    }
  }

  await updateNews(id, newsData);
}

// Инициализация модуля новостей
function initNews() {
  loadNews();

  // Добавляем обработчики событий
  const newsForm = document.querySelector("#newsModal form");
  if (newsForm) {
    newsForm.addEventListener("submit", submitNewsForm);
  }

  const editNewsForm = document.querySelector("#editNewsModal form");
  if (editNewsForm) {
    editNewsForm.addEventListener("submit", submitEditNewsForm);
  }
}

async function loadHadjNews() {
  try {
    const response = await fetch("https://api.web95.tech/api/v1/news");
    if (!response.ok) throw new Error("Ошибка загрузки новостей");

    const responseData = await response.json();
    const allNews = responseData.data.items || [];

    // фильтруем только по category_id === 2
    const hadjNews = allNews.filter(item => item.category_id === 2);
    renderHadjNews(hadjNews);
  } catch (error) {
    console.error("Error loading hadj news:", error);
  }
}

function renderHadjNews(news) {
  const wrapper = document.getElementById("hadjNewsWrapper");
  wrapper.innerHTML = "";

  news.forEach(item => {
    const slide = document.createElement("div");
    slide.className = "hadj-news__card swiper-slide";
    slide.innerHTML = `
      <div class="hadj-news__card-date">${formatDate(item.published_at)}</div>
      <div class="hadj-news__card-image">
        <img src="${item.preview_url}" alt="${item.title}" />
      </div>
      <div class="hadj-news__card-info">
        <h3 class="hadj-news__card-title">${item.title}</h3>
        <p class="hadj-news__card-description">${item.excerpt}</p>
        <div class="hadj-news__card-bottom">
          <div class="hadj-news__card-stats">
            <div class="hadj-news__card-stat">
              <img src="assets/icons/comment.svg" alt="Comments" />
              <span>${item.comments_count}</span>
            </div>
            <div class="hadj-news__card-stat">
              <img src="assets/icons/repost.svg" alt="Reposts" />
              <span>${item.reposts_count}</span>
            </div>
            <div class="hadj-news__card-stat">
              <img src="assets/icons/view.svg" alt="Views" />
              <span>${item.views_count}</span>
            </div>
          </div>
          <a href="/news/${item.slug}" class="hadj-news__card-link">подробнее</a>
        </div>
      </div>
    `;
    wrapper.appendChild(slide);
  });

  // обновляем готовый Swiper
  if (typeof hadjSwiper !== "undefined") {
    hadjSwiper.update();
  }
}




// Запуск при загрузке страницы
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("newsTableBody")) {
    // значит мы в админке
    initNews();
  }

  if (document.getElementById("hadjNewsWrapper")) {
    // значит мы на публичной странице
    loadHadjNews();
  }
});
