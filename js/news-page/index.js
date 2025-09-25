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
const API_URL = 'https://api.web95.tech/api/v1/news';
const ITEMS_PER_PAGE = 4;

// Элементы DOM
const newsCardsContainer = document.querySelector('.news__cards');
const filters = document.querySelectorAll('.news__filter');
const paginationContainer = document.querySelector('.pagination__pages');

// Состояние
let currentPage = 1;
let currentFilter = 'all';
let allNews = [];

// Загрузка новостей
async function loadNews() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Ошибка загрузки новостей');
        
        const responseData = await response.json();
        allNews = responseData.data.items || [];
        renderNews();
    } catch (error) {
        console.error('Error loading news:', error);
        newsCardsContainer.innerHTML = '<p>Ошибка загрузки новостей</p>';
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
function renderNews() {
    const filteredNews = getFilteredNews();
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedNews = filteredNews.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    
    newsCardsContainer.innerHTML = '';
    
    paginatedNews.forEach(newsItem => {
        const newsCard = createNewsCard(newsItem);
        newsCardsContainer.appendChild(newsCard);
    });
    
    renderPagination(filteredNews.length);
}

// Создание карточки новости
function createNewsCard(newsItem) {
    const article = document.createElement('article');
    const isHadj = newsItem.category_id === 2;
    const isVideo = newsItem.type === 'video'; // предполагаем поле type в API
    
    article.className = `news__card news__card--${isVideo ? 'video' : 'photo'} news__card--${isHadj ? 'black' : 'orange'}`;
    article.setAttribute('data-news-type', isHadj ? 'hadj' : 'company');
    
    article.innerHTML = `
        <div class="news__card-date">${formatDate(newsItem.published_at)}</div>
        <div class="news__card-preview">
            ${isVideo ? 
                `<iframe width="520" height="217" src="${newsItem.video_url}" frameborder="0" allowfullscreen></iframe>` :
                `<img src="${newsItem.preview_url}" alt="${newsItem.title}">`
            }
        </div>
        <div class="news__card-info">
            <h2 class="news__card-title">${newsItem.title}</h2>
            ${newsItem.description ? `<p class="news__card-description">${newsItem.description}</p>` : ''}
            <div class="news__card-bottom">
                <div class="news__card-bottom__stats">
                    <div class="news__card-bottom__stat">
                        <img src="assets/icons/comment.svg" alt="Comments">
                        <span>${newsItem.comments_count || 0}</span>
                    </div>
                    <div class="news__card-bottom__stat">
                        <img src="assets/icons/repost.svg" alt="Reposts">
                        <span>${newsItem.shares_count || 0}</span>
                    </div>
                    <div class="news__card-bottom__stat">
                        <img src="assets/icons/view.svg" alt="Views">
                        <span>${newsItem.views_count || 0}</span>
                    </div>
                </div>
                <a href="${newsItem.detail_url}" class="news__card-bottom__link">подробнее</a>
            </div>
        </div>
    `;
    
    return article;
}

// Пагинация
function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    paginationContainer.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.className = `pagination__page ${i === currentPage ? 'pagination__page--current' : ''}`;
        button.textContent = i.toString().padStart(2, '0');
        button.addEventListener('click', () => {
            currentPage = i;
            renderNews();
        });
        paginationContainer.appendChild(button);
    }
}

// Форматирование даты
function formatDate(dateString) {
    // Реализуйте форматирование даты по необходимости
    return new Date(dateString).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Обработчики фильтров
filters.forEach(filter => {
    filter.addEventListener('click', () => {
        filters.forEach(f => f.classList.remove('news__filter--active'));
        filter.classList.add('news__filter--active');
        
        currentFilter = filter.classList.contains('news__filter--hadj') ? 'hadj' :
                       filter.classList.contains('news__filter--company') ? 'company' : 'all';
        currentPage = 1;
        renderNews();
    });
});

// Инициализация
document.addEventListener('DOMContentLoaded', loadNews);