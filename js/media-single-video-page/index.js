// SIMILAR VIDEOS SLIDER
var similarPhotosSlider = new Swiper(".media__cards", {
    slidesPerView: 'auto',
    spaceBetween: 30,
    navigation: {
        nextEl: ".media__link",
    },
    breakpoints: {
        320: {
            slidesPerView: 1,
            spaceBetween: 15,
        },
        680: {
            slidesPerView: 'auto',
            spaceBetween: 30,
        }
    },
    grabCursor: true,
});