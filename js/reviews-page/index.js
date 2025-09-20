// REVIEWS TABS
const reviewsTabsContent = document.querySelectorAll('.reviews__main-tab_content');
const reviewsTabs = document.querySelectorAll('.reviews__top-content__tab');
const reviewsRegularTab = document.querySelector('.reviews__top-content__tab--regular');
const reviewsSocialMediaTab = document.querySelector('.reviews__top-content__tab--social_media');
const reviewsVideoTab = document.querySelector('.reviews__top-content__tab--video');
const reviewsRegularTabContent = document.querySelector('.reviews__regular');
const socialReviewsTabContent = document.querySelector('.reviews__social');
const reviewsVideoTabContent = document.querySelector('.reviews__videos');

const closeAllReviewsTabs = () => {
    reviewsTabsContent.forEach(tabContent => {
        tabContent.classList.remove('reviews__main-tab_content--active');
    });
    reviewsTabs.forEach(tab => {
        tab.classList.remove('reviews__top-content__tab--active');
    });
}

reviewsRegularTab.addEventListener('click', () => {
    closeAllReviewsTabs();
    reviewsRegularTab.classList.add('reviews__top-content__tab--active');
    reviewsRegularTabContent.classList.add('reviews__main-tab_content--active');
});

reviewsSocialMediaTab.addEventListener('click', () => {
    closeAllReviewsTabs();
    reviewsSocialMediaTab.classList.add('reviews__top-content__tab--active');
    socialReviewsTabContent.classList.add('reviews__main-tab_content--active');
});

reviewsVideoTab.addEventListener('click', () => {
    closeAllReviewsTabs();
    reviewsVideoTab.classList.add('reviews__top-content__tab--active');
    reviewsVideoTabContent.classList.add('reviews__main-tab_content--active');
});


// REGULAR REVIEWS
const expandReviewButtons = document.querySelectorAll('.reviews__regular-card__button');
const collapseReviewButtons = document.querySelectorAll('.reviews__regular-opened__button_back');
const regularReviewsList = document.querySelector('.reviews__regular-list');
const expandedReview = document.querySelector('.reviews__regular-opened');

expandReviewButtons.forEach(button => {
    button.addEventListener('click', () => {
        expandedReview.style.display = 'block';
        regularReviewsList.style.display = 'none';
    });
})

collapseReviewButtons.forEach(button => {
    button.addEventListener('click', () => {
        expandedReview.style.display = 'none';
        regularReviewsList.style.display = 'flex';
    });
})