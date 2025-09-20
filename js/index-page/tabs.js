// REVIEWS TABS
const reviewsTabsContent = document.querySelectorAll('.reviews__tab-content');
const reviewsTabs = document.querySelectorAll('.reviews__tabs-button');
const reviewsRegularTab = document.querySelector('.reviews__tabs-button--regular');
const reviewsSocialMediaTab = document.querySelector('.reviews__tabs-button--social_media');
const reviewsVideoTab = document.querySelector('.reviews__tabs-button--video');
const reviewsRegularTabContent = document.querySelector('.reviews__regular');
const socialReviewsTabContent = document.querySelector('.reviews__social_media');
const reviewsVideoTabContent = document.querySelector('.reviews__video');

const closeAllReviewsTabs = () => {
    reviewsTabsContent.forEach(tabContent => {
        tabContent.classList.remove('reviews__tab-content--active');
    });
    reviewsTabs.forEach(tab => {
        tab.classList.remove('reviews__tabs-button--active');
    });
}

reviewsRegularTab.addEventListener('click', () => {
    closeAllReviewsTabs();
    reviewsRegularTab.classList.add('reviews__tabs-button--active');
    reviewsRegularTabContent.classList.add('reviews__tab-content--active');
});

reviewsSocialMediaTab.addEventListener('click', () => {
    closeAllReviewsTabs();
    reviewsSocialMediaTab.classList.add('reviews__tabs-button--active');
    socialReviewsTabContent.classList.add('reviews__tab-content--active');
});

reviewsVideoTab.addEventListener('click', () => {
    closeAllReviewsTabs();
    reviewsVideoTab.classList.add('reviews__tabs-button--active');
    reviewsVideoTabContent.classList.add('reviews__tab-content--active');
});