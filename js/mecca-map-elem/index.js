// SIMILAR PHOTOS SLIDER
var similarPhotosSlider = new Swiper(".similar-places__cards", {
    slidesPerView: 2,
    spaceBetween: 30,
    navigation: {
        nextEl: ".similar-places__next",
    },
    breakpoints: {
        320: {
            slidesPerView: 'auto',
            spaceBetween: 15,
        },
        1200: {
            slidesPerView: 2,
        }
    },
    grabCursor: true,
});