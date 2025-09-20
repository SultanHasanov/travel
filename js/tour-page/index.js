const hotelGallery = document.querySelectorAll('.tour__hotel-slide');

const closeImages = () => {
    hotelGallery.forEach(image => {
        image.classList.remove('tour__hotel-slide--active');
    })
}

hotelGallery.forEach(image => {
    image.addEventListener('click', () => {
        closeImages();
        image.classList.add('tour__hotel-slide--active');
    })
})

// REVIEWS SLIDER
var reviewsSlider = new Swiper(".tour__reviews-cards", {
    slidesPerView: 4,
    spaceBetween: 30,
    navigation: {
        nextEl: ".tour__reviews-top__next",
    },
    loop: true,
    grabCursor: true,
    breakpoints: {
        320: {
            slidesPerView: 'auto',
            spaceBetween: 15,
        },
        1400: {
            slidesPerView: 4,
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