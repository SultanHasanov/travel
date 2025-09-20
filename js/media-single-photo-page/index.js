// SIMILAR PHOTOS SLIDER
var similarPhotosSlider = new Swiper(".similar-photos__cards", {
    slidesPerView: 'auto',
    spaceBetween: 30,
    navigation: {
        nextEl: ".similar-photos-top__next",
    },
    breakpoints: {
        320: {
            slidesPerView: 1,
            spaceBetween: 15,
        },
        680: {
            slidesPerView: 'auto',
        }
    },
    grabCursor: true,
});