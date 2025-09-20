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