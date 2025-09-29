// news-detail.js
const NEWS_API_URL = "https://api.web95.tech/api/v1/news";

// Получение ID новости из URL
function getNewsSlugFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("slug");
}

// Получение данных новости по slug
async function getNewsBySlug(slug) {
  try {
    const response = await fetch(`${NEWS_API_URL}/${encodeURIComponent(slug)}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const respData = await response.json();
    const data = respData.data;

    // Обновляем данные на странице
    updatePageContent(data);

    return data;
  } catch (error) {
    console.error("Error fetching news:", error);
    return null;
  }
}

// Функция для обновления контента на странице
function updatePageContent(newsData) {
  if (!newsData) return;


  // Обновляем изображение
  const photoElement = document.querySelector(".article__content-photo img");
  if (photoElement && newsData.preview_url) {
    photoElement.src = newsData.preview_url;
    photoElement.alt = newsData.title || "Изображение новости";
  }

  // Обновляем заголовок
  const title = document.querySelector(".article__content-title");
  if (title) {
    title.textContent = newsData.title || "";
  }

  // Обновляем контент
  const contentSection = document.querySelector(".article__content-section");
  if (contentSection) {
    // Очищаем секцию
    contentSection.innerHTML = '';
    
    // Создаем параграф для контента
    const paragraph = document.createElement('p');
    paragraph.className = 'article__content-paragraph';
    paragraph.textContent = newsData.content || "Контент недоступен";
    
    contentSection.appendChild(paragraph);
  }
}

// ===== Загрузка последних новостей компании =====
async function loadCompanyNews() {
  try {
    const response = await fetch(NEWS_API_URL);
    if (!response.ok) throw new Error("Ошибка загрузки новостей");

    const respData = await response.json();
    const newsItems = respData.data.items || [];

    // Фильтруем только category_id === 3 (новости компании)
    const companyNews = newsItems.filter(item => item.category_id === 3);

    // Контейнер для карточек
    const wrapper = document.querySelector(".recent-news__cards .swiper-wrapper");
    if (!wrapper) return;

    // Очищаем старые (хардкод)
    wrapper.innerHTML = "";

    // Формируем новые карточки
    companyNews.forEach(news => {
      const slide = document.createElement("div");
      slide.className = "recent-news__card swiper-slide";

      slide.innerHTML = `
        <div class="recent-news__card-date">
          ${new Date(news.published_at).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric"
          })}
        </div>
        <div class="recent-news__card-image">
          <img src="${news.preview_url}" alt="${news.title}" />
        </div>
        <div class="recent-news__card-info">
          <h3 class="recent-news__card-title">${news.title}</h3>
          <p class="recent-news__card-description">${news.excerpt || ""}</p>
          <div class="recent-news__card-bottom">
            <div class="recent-news__card-bottom__stats">
              <div class="recent-news__card-bottom__stat">
                <img src="assets/icons/comment.svg" alt="Comments" />
                <span>${news.comments_count}</span>
              </div>
              <div class="recent-news__card-bottom__stat">
                <img src="assets/icons/repost.svg" alt="Reposts" />
                <span>${news.reposts_count}</span>
              </div>
              <div class="recent-news__card-bottom__stat">
                <img src="assets/icons/view.svg" alt="Views" />
                <span>${news.views_count}</span>
              </div>
            </div>
            <a href="article.html?slug=${news.slug}" class="recent-news__card-bottom__link">
              подробнее
            </a>
          </div>
        </div>
      `;

      wrapper.appendChild(slide);
    });

    // Реинициализация/обновление Swiper
    if (window.recentNewsSwiper) {
      window.recentNewsSwiper.update();
    } else {
      window.recentNewsSwiper = new Swiper(".recent-news__cards", {
        slidesPerView: 3,
        spaceBetween: 20,
        navigation: {
          nextEl: ".recent-news__top-next",
        },
        breakpoints: {
          320: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 }
        }
      });
    }
  } catch (err) {
    console.error("Ошибка загрузки новостей компании:", err);
  }
}

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", function () {
    loadCompanyNews();
  const slug = getNewsSlugFromURL();
  console.log('Slug from URL:', slug); // Для отладки

  if (slug) {
    getNewsBySlug(slug);
  } else {
    console.error("Slug not found in URL");
    const contentSection = document.querySelector(".article__content-section");
    if (contentSection) {
      contentSection.innerHTML = '<p class="article__content-paragraph">Новость не найдена</p>';
    }
  }
});