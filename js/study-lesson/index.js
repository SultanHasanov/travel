// LESSON CONTENT SLIDER
var lessonContentSlider = new Swiper(".lesson__content-slider__inner", {
    slidesPerView: 3,
    spaceBetween: 10,
    centeredSlides: true,
    initialSlide: 1,
    navigation: {
        prevEl: ".lesson__content-slider__arrow--left",
        nextEl: ".lesson__content-slider__arrow--right",
    },
    grabCursor: true,
    breakpoints: {
        320: {
            slidesPerView: 'auto',
            centeredSlides: false,
            initialSlide: 0,
        },
        1100: {
            slidesPerView: 3,
        }
    }
});

// RECOMMENDATIONS SLIDER
var recommendationsSlider = new Swiper(".recommendations__cards", {
    slidesPerView: 2,
    spaceBetween: 30,
    navigation: {
        nextEl: ".recommendations__top-next",
    },
    breakpoints: {
        320: {
            slidesPerView: 'auto',
        },
        1200: {
            slidesPerView: 2,
        },
    },
    grabCursor: true,
});