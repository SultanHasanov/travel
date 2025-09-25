// index.js
const headerMiddle = document.querySelector(".header__middle");
const headerFormSearchInput = document.querySelector(".header__middle-form__input");
const headerFormSearchButton = document.querySelector(".header__middle-form__button");

headerFormSearchButton.addEventListener('click', () => {
    if (!headerMiddle.classList.contains('show-input')) {
        headerMiddle.classList.add('show-input');
    } else {
        alert(`Search: ${headerFormSearchInput.value}`)
    }
})

// FOOTER SEARCH INPUT
const footerFormSearchInput = document.querySelector(".footer__middle-form__input");
const footerFormSearchButton = document.querySelector(".footer__middle-form__button");

footerFormSearchButton.addEventListener('click', () => {
    if (!footerFormSearchInput.value) {
        alert('Enter something to search')
    } else {
        alert(`Search: ${footerFormSearchInput.value}`)
    }
})

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



      