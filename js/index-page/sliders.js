// NEWS(HADJ) SLIDER
var hadjNewsSlider = new Swiper(".hadj-news__cards", {
    slidesPerView: 3,
    spaceBetween: 30,
    navigation: {
        nextEl: ".hadj-news__cards-next",
    },
    loop: true,
    grabCursor: true,
    breakpoints: {
        320: {
            slidesPerView: 'auto',
        },
        1400: {
            slidesPerView: 3,
        }
    },
});

// NEWS(COMPANY) SLIDER
var companyNewsSlider = new Swiper(".company-news__cards", {
    slidesPerView: 3,
    spaceBetween: 30,
    navigation: {
        nextEl: ".company-news__cards-next",
    },
    loop: true,
    grabCursor: true,
    breakpoints: {
        320: {
            slidesPerView: 'auto',
        },
        1400: {
            slidesPerView: 3,
        }
    },
});

// REVIEWS(REGULAR) SLIDER
var regularReviewsSlider = new Swiper(".reviews__regular-inner", {
    slidesPerView: 1,
    navigation: {
        prevEl: ".reviews__regular-arrow--left",
        nextEl: ".reviews__regular-arrow--right",
    },
    grabCursor: true,
    breakpoints: {
        320: {
            slidesPerView: 'auto',
            spaceBetween: 20,
        },
        1400: {
            slidesPerView: 1,
        }
    },
});

// REVIEWS(SOCIAL-MEDIA) SLIDER
var socialMediaReviewsSlider = new Swiper(".reviews__social_media-inner", {
    slidesPerView: 3,
    spaceBetween: 30,
    centeredSlides: true,
    loop: true,
    initialSlide: 1,
    navigation: {
        prevEl: ".reviews__social_media-arrow--left",
        nextEl: ".reviews__social_media-arrow--right",
    },
    breakpoints: {
        320: {
            slidesPerView: 'auto',
            spaceBetween: 20,
            initialSlide: 0,
            loop: false,
            centeredSlides: false,
        },
        768: {
            slidesPerView: 3,
        }
    },
});

// REVIEWS(VIDEO) SLIDER
var videoReviewsSlider = new Swiper(".reviews__video-inner", {
    slidesPerView: 3,
    spaceBetween: 30,
    centeredSlides: true,
    loop: true,
    initialSlide: 1,
    navigation: {
        prevEl: ".reviews__video-arrow--left",
        nextEl: ".reviews__video-arrow--right",
    },
    breakpoints: {
        320: {
            slidesPerView: 'auto',
            spaceBetween: 20,
            initialSlide: 0,
            loop: false,
            centeredSlides: false,
        },
        1200: {
            slidesPerView: 3,
        }
    },
});

// PARTNERS SLIDER
var partnersSlider = new Swiper(".partners__cards", {
    slidesPerView: 'auto',
    spaceBetween: 15,
    navigation: {
        nextEl: ".partners__top-next",
    },
    grabCursor: true,
});

// CERTIFICATES(INFO) SLIDER
var certificatesInfoSlider = new Swiper(".certificates__info-inner", {
    slidesPerView: 1,
    effect: 'fade',
    navigation: {
        nextEl: ".certificates__info-elem__next",
    },
    loop: true,
});

// CERTIFICATES(IMAGES) SLIDER
var certificatesImagesSlider = new Swiper(".certificates__images", {
    slidesPerView: 2,
    spaceBetween: 68,
    allowTouchMove: false,
    loop: true,
});

certificatesInfoSlider.controller.control = certificatesImagesSlider;