async function loadTourDetails(tourId) {
    try {
        const response = await fetch(`https://api.web95.tech/api/v1/trips/${tourId}/relations`);
        
        if (!response.ok) {
            throw new Error('Ошибка загрузки тура');
        }
        
        const data = await response.json();
        const tourData = data.data;
        
        // Заполняем данные на странице
        fillTourData(tourData);
        
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить данные тура');
    }
}

function fillTourData(data) {
    const tour = data.trip;
    const hotels = data.hotels;
    const routes = data.routes.route_cities;
    
    // Заголовок и описание
    document.querySelector('.tour__top-info__block-title').innerHTML = 
        `${tour.trip_type} программа<br>"${tour.title}"`;
    
    // Тип тура
    document.querySelector('.tour__top-info__stats-type').textContent = 
        tour.trip_type === 'Хадж' ? 'хадж тур' : 'умра тур';
    
    // Маршрут
    fillRoute(routes);
    
    // Отели
    fillHotels(hotels);
    
    // Цены
    document.querySelector('.tour__details-price__discounted-number').innerHTML = 
        `${tour.final_price.toLocaleString()} <span>руб.</span>`;
    
    if (tour.discount_percent > 0) {
        document.querySelector('.tour__details-price__undiscounted-number').innerHTML = 
            `${tour.price.toLocaleString()} <span>руб.</span>`;
    }
    
    // Даты
    const startDate = new Date(tour.start_date).toLocaleDateString('ru-RU');
    const endDate = new Date(tour.end_date).toLocaleDateString('ru-RU');
    document.querySelector('.tour__details-card__main-elem:nth-child(1) strong').textContent = 
        `${startDate} - ${endDate}`;
    
    // Город вылета
    document.querySelector('.tour__details-card__main-elem:nth-child(2) strong').textContent = 
        tour.departure_city;
    
    // Описание
    document.querySelector('.tour__description-paragraph').textContent = tour.description;
}

function fillRoute(routeCities) {
    const routeContainer = document.querySelector('.tour__top-route__inner');
    routeContainer.innerHTML = '';
    
    const cities = Object.values(routeCities);
    
    cities.forEach((city, index) => {
        // Точка маршрута
        const pointClass = index === 0 ? 'from' : 
                          index === cities.length - 1 ? 'to' : 'transfer';
        
        const pointDiv = document.createElement('div');
        pointDiv.className = `tour__top-route__point tour__top-route__point--${pointClass}`;
        
        if (pointClass === 'transfer') {
            pointDiv.innerHTML = `
                <img src="assets/icons/pages/tour/clock.svg" alt="Clock">
                <br><strong>${city.city}</strong><br>
                <span>${city.stop_time || ''}</span>
            `;
        } else {
            pointDiv.textContent = city.city;
            if (pointClass === 'to') {
                pointDiv.innerHTML = `
                    <img src="assets/icons/pages/tour/white-qibla.svg" alt="Qibla">
                    ${city.city}
                `;
            }
        }
        
        routeContainer.appendChild(pointDiv);
        
        // Транспорт между точками
        if (index < cities.length - 1) {
            const transportDiv = document.createElement('div');
            transportDiv.className = 'tour__top-route__transport';
            transportDiv.innerHTML = `
                <div class="tour__top-route__transport-name">
                    <img src="assets/icons/pages/tour/${index === 0 ? 'airplane' : 'bus'}.svg" alt="">
                    ${index === 0 ? 'Airplane' : 'Bus'}
                </div>
                <div class="tour__top-route__transport-divider"></div>
                <div class="tour__top-route__transport-duration">
                    ${city.duration || ''}
                </div>
            `;
            routeContainer.appendChild(transportDiv);
        }
    });
}

function fillHotels(hotels) {
    const cardsContainer = document.querySelector('.tour__details-cards');
    
    // Очищаем существующие карточки отелей
    const existingHotelCards = cardsContainer.querySelectorAll('.tour__details-card:not(.tour__details-card--long)');
    existingHotelCards.forEach(card => card.remove());
    
    hotels.forEach(hotel => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'tour__details-card';
        cardDiv.innerHTML = `
            <div class="tour__details-card__city">${hotel.city}</div>
            <div class="tour__details-card__hotel">
                <div class="tour__details-card__hotel-name">${hotel.name}</div>
                <img src="assets/icons/pages/tours/${hotel.city.toLowerCase() === 'мекка' ? 'mecca' : 'medina'}-hotel-rating.svg" 
                     alt="" class="tour__details-card__hotel-rating">
            </div>
            <div class="tour__details-card__mosque">${hotel.distance}км до Мечети</div>
            <div class="tour__details-card__amenities">
                ${hotel.transfer ? `
                <div class="tour__details-card__amenity">
                    <img src="assets/icons/pages/tours/bus-side-view.svg" alt="">
                    <span>трансфер</span> <strong>${hotel.transfer}</strong>
                </div>` : ''}
                <div class="tour__details-card__amenity">
                    <img src="assets/icons/pages/tours/plate-with-cutlery.svg" alt="">
                    <span>питание</span> <strong>${hotel.meals}</strong>
                </div>
            </div>
            <div class="tour__details-card__stay_info">
                <div class="tour__details-card__nights">
                    <img src="assets/icons/pages/tours/crescent.svg" alt="">
                    ${hotel.nights} ночей
                </div>
                <div class="tour__details-card__guests">
                    <img src="assets/icons/pages/tours/people.svg" alt="">
                    ${hotel.guests}
                </div>
            </div>
        `;
        
        // Вставляем перед длинной карточкой с дополнительными опциями
        const longCard = cardsContainer.querySelector('.tour__details-card--long');
        cardsContainer.insertBefore(cardDiv, longCard);
    });
}

// Запускаем загрузку при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tourId = urlParams.get('id');
    
    if (tourId) {
        loadTourDetails(tourId);
    }
});