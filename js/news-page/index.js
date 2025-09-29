// NEWS FILTERING
const newsCards = document.querySelectorAll('.news__card');
const newsFilters = document.querySelectorAll('.news__filter');
const showAllNewsButton = document.querySelector('.news__filter--all');
const showHadjNewsButton = document.querySelector('.news__filter--hadj');
const showCompanyNewsButton = document.querySelector('.news__filter--company');

const hideAllNews = () => {
    newsCards.forEach(newsCard => newsCard.style.display = 'none');
}

const setActiveFilter = (filter) => {
    newsFilters.forEach(newsFilter => {
        newsFilter.classList.remove('news__filter--active');
    });
    filter.classList.add('news__filter--active');
}

showAllNewsButton.addEventListener('click', () => {
    setActiveFilter(showAllNewsButton);
    newsCards.forEach(newsCard => newsCard.style.display = 'block');
});

showHadjNewsButton.addEventListener('click', () => {
    hideAllNews();
    setActiveFilter(showHadjNewsButton);
    newsCards.forEach(newsCard => {
        if (newsCard.dataset.newsType === 'hadj') {
            newsCard.style.display = 'block'
        }
    })
});

showCompanyNewsButton.addEventListener('click', () => {
    hideAllNews();
    setActiveFilter(showCompanyNewsButton);
    newsCards.forEach(newsCard => {
        if (newsCard.dataset.newsType === 'company') {
            newsCard.style.display = 'block'
        }
    })
});

// Форматирование даты
function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("ru-RU");
}

// Конфигурация
const API_URL = "https://api.web95.tech/api/v1/news";
const newsCardsContainer = document.getElementById("news-cards");
const paginationContainer = document.getElementById("paginationPages");
const prevBtn = document.getElementById("paginationPrev");
const nextBtn = document.getElementById("paginationNext");
const filters = document.querySelectorAll(".news__filter");

let currentPage = 1;
let currentFilter = "all";
let totalPages = 1;

// форматирование даты
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Загрузка новостей
async function loadNews() {
  try {
    const url = new URL(API_URL);
    url.searchParams.set("page", currentPage);
    url.searchParams.set("limit", 6); // <--- фиксированный лимит 4

    if (currentFilter === "hadj") url.searchParams.set("category_id", 2);
    if (currentFilter === "company") url.searchParams.set("category_id", 3);

    const res = await fetch(url);
    if (!res.ok) throw new Error("Ошибка загрузки");

    const data = await res.json();
    renderNews(data.data.items);
    renderPagination(data.data.meta);
  } catch (err) {
    console.error(err);
    newsCardsContainer.innerHTML = "<p>Ошибка загрузки новостей</p>";
  }
}

// Фильтрация новостей
function getFilteredNews() {
    switch(currentFilter) {
        case 'hadj':
            return allNews.filter(item => item.category_id === 2);
        case 'company':
            return allNews.filter(item => item.category_id === 3);
        default:
            return allNews;
    }
}

// Рендер новостей
function renderNews(items) {
  newsCardsContainer.innerHTML = "";
  items.forEach((item) => {
    newsCardsContainer.appendChild(createNewsCard(item));
  });
}
// Создание карточки новости
function createNewsCard(item) {
  const article = document.createElement("article");
  const isHadj = item.category_id === 2;
  const isVideo = item.media_type === "video";

  article.className = `news__card news__card--${isVideo ? "video" : "photo"} news__card--${isHadj ? "black" : "orange"}`;
  article.setAttribute("data-news-type", isHadj ? "hadj" : "company");

  article.innerHTML = `
    <div class="news__card-date">${formatDate(item.published_at)}</div>
    <div class="news__card-preview">
      ${isVideo 
        ? `<iframe width="520" height="217" src="${item.video_url}" frameborder="0" allowfullscreen></iframe>`
        : `<img src="${item.preview_url}" alt="${item.title}">`}
    </div>
    <div class="news__card-info">
      <h2 class="news__card-title">${item.title}</h2>
      <p class="news__card-description">${item.excerpt || ""}</p>
      <div class="news__card-bottom">
        <div class="news__card-bottom__stats">
          <div class="news__card-bottom__stat">
            <img src="assets/icons/comment.svg" alt="Comments">
            <span>${item.comments_count}</span>
          </div>
          <div class="news__card-bottom__stat">
            <img src="assets/icons/repost.svg" alt="Reposts">
            <span>${item.reposts_count}</span>
          </div>
          <div class="news__card-bottom__stat">
            <img src="assets/icons/view.svg" alt="Views">
            <span>${item.views_count}</span>
          </div>
        </div>
        <a href="article.html?slug=${item.slug}" class="recent-news__card-bottom__link">подробнее</a>
      </div>
    </div>
  `;
  return article;
}
// Пагинация
function renderPagination(meta) {
  totalPages = Math.ceil(meta.total / meta.limit);
  paginationContainer.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = `pagination__page ${i === currentPage ? "pagination__page--current" : ""}`;
    btn.textContent = i.toString().padStart(2, "0");
    btn.addEventListener("click", () => {
      currentPage = i;
      loadNews();
    });
    paginationContainer.appendChild(btn);
  }

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}


// обработка стрелок
prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    loadNews();
  }
});

nextBtn.addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    loadNews();
  }
});

// Форматирование даты
function formatDate(dateString) {
    // Реализуйте форматирование даты по необходимости
    return new Date(dateString).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

async function loadHadjNews() {
  try {
    const response = await fetch("https://api.web95.tech/api/v1/news");
    if (!response.ok) throw new Error("Ошибка загрузки новостей");

    const responseData = await response.json();
    const allNews = responseData.data.items || [];

  
    const hadjNews = allNews.filter((item) => item.category_id === 2);
    renderHadjNews(hadjNews);
  } catch (error) {
    console.error("Error loading hadj news:", error);
  }
}

function renderHadjNews(news) {
  const wrapper = document.getElementById("hadjNewsWrapper");
  wrapper.innerHTML = "";

  news.forEach((item) => {
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
          <a href="article.html?slug=${item.slug}" class="recent-news__card-bottom__link">подробнее</a>

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

// Добавьте эту функцию после renderNewsCards()
async function loadNewsCards() {
    try {
        const response = await fetch("https://api.web95.tech/api/v1/news");
        if (!response.ok) throw new Error("Ошибка загрузки новостей");

        const responseData = await response.json();
        const allNews = responseData.data.items || [];
        console.log("All news loaded:", allNews);
        renderNewsCards(allNews);
    } catch (error) {
        console.error("Error loading news cards:", error);
    }
}

async function loadCompanyNews() {
  try {
    const response = await fetch("https://api.web95.tech/api/v1/news");
    if (!response.ok) throw new Error("Ошибка загрузки новостей");

    const responseData = await response.json();
    const allNews = responseData.data.items || [];

    // фильтруем только по category_id === 1 (новости компании)
    const companyNews = allNews.filter(item => item.category_id === 3);
    renderCompanyNews(companyNews);
  } catch (error) {
    console.error("Error loading company news:", error);
  }
}

function renderCompanyNews(news) {
  const wrapper = document.getElementById("companyNewsWrapper");
  wrapper.innerHTML = "";

  news.forEach(item => {
    const slide = document.createElement("div");
    slide.className = "company-news__card swiper-slide";
    slide.innerHTML = `
      <div class="company-news__card-date">${formatDate(item.published_at)}</div>
      <div class="company-news__card-image">
        <img src="${item.preview_url || 'assets/images/pages/index-page/news/article-preview.png'}" alt="${item.title}" />
      </div>
      <div class="company-news__card-info">
        <h3 class="company-news__card-title">${item.title}</h3>
        <p class="company-news__card-description">${item.excerpt}</p>
        <div class="company-news__card-bottom">
          <div class="company-news__card-stats">
            <div class="company-news__card-stat">
              <img src="assets/icons/comment.svg" alt="Comments" />
              <span>${item.comments_count || 0}</span>
            </div>
            <div class="company-news__card-stat">
              <img src="assets/icons/repost.svg" alt="Reposts" />
              <span>${item.reposts_count || 0}</span>
            </div>
            <div class="company-news__card-stat">
              <img src="assets/icons/view.svg" alt="Views" />
              <span>${item.views_count || 0}</span>
            </div>
          </div>
          <a href="article.html/${item.slug}" class="company-news__card-link">подробнее</a>
        </div>
      </div>
    `;
    wrapper.appendChild(slide);
  });
  // обновляем Swiper если он уже инициализирован
  if (typeof companySwiper !== 'undefined') {
    companySwiper.update();
  }
}

// Фильтрация новостей
function setupNewsFilters() {
    const filters = document.querySelectorAll('.news__filter');
    
    filters.forEach(filter => {
        filter.addEventListener('click', function() {
            // Убираем активный класс у всех фильтров
            filters.forEach(f => f.classList.remove('news__filter--active'));
            // Добавляем активный класс текущему фильтру
            this.classList.add('news__filter--active');
            
            const filterType = this.classList.contains('news__filter--hadj') ? 'hadj' : 
                             this.classList.contains('news__filter--company') ? 'company' : 'all';
            
            loadFilteredNews(filterType);
        });
    });
}

// Загрузка отфильтрованных новостей
async function loadFilteredNews(filterType) {
    try {
        const response = await fetch(NEWS_API_URL);
        if (!response.ok) throw new Error("Ошибка загрузки новостей");

        const responseData = await response.json();
        let allNews = responseData.data.items || [];
        
        // Фильтрация по категориям
        if (filterType === 'hadj') {
            allNews = allNews.filter(item => item.category_id === 2);
        } else if (filterType === 'company') {
            allNews = allNews.filter(item => item.category_id === 3);
        }
        // Для 'all' оставляем все новости
        
        renderNewsCards(allNews);
    } catch (error) {
        console.error("Error loading filtered news:", error);
    }
}


// Обработчики фильтров
filters.forEach((btn) => {
  btn.addEventListener("click", () => {
    filters.forEach((b) => b.classList.remove("news__filter--active"));
    btn.classList.add("news__filter--active");

    if (btn.classList.contains("news__filter--hadj")) currentFilter = "hadj";
    else if (btn.classList.contains("news__filter--company")) currentFilter = "company";
    else currentFilter = "all";

    currentPage = 1;
    loadNews();
  });
});

// Инициализация
document.addEventListener('DOMContentLoaded', loadNews);
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById('news-cards')) {
        loadNewsCards();
        setupNewsFilters();
    }
  if (document.getElementById("newsTableBody")) {
    // значит мы в админке
    initNews();
  }

  if (document.getElementById("hadjNewsWrapper")) {
    // значит мы на публичной странице
    loadHadjNews();
  }

  if (document.getElementById("companyNewsWrapper")) {
    // загружаем новости компании
    loadCompanyNews();
  }
});