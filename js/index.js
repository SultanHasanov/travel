

// TOURS SLIDER
var toursSlider = new Swiper(".tours__cards", {
    slidesPerView: 'auto',
    spaceBetween: 31,
    navigation: {
        nextEl: ".tours-top__next",
    },
    breakpoints: {
        1200: {
            slidesPerView: 2,
        },
    },
    grabCursor: true,
});



      