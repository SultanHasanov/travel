// RECENT NEWS SLIDER
var recentNewsSlider = new Swiper(".recent-news__cards", {
    slidesPerView: 3,
    spaceBetween: 30,
    navigation: {
        nextEl: ".recent-news__top-next",
    },
    grabCursor: true,
    breakpoints: {
        320: {
            slidesPerView: 'auto',
        },
        1100: {
            slidesPerView: 3,
        }
    }
});