async function loadTourDetails(tourId) {
    try {
        const response = await fetch(`https://api.web95.tech/api/v1/trips/${tourId}/relations`);

        const resRoutes = await fetch(`https://api.web95.tech/api/v1/trips/${tourId}/routes/ui`)
        
        if (!response.ok || !resRoutes.ok) {
            throw new Error('Ошибка загрузки тура');
        }

        
        const data = await response.json();
        const tourData = data.data;

        const dataRoutes = await resRoutes.json();
        const tourRoutes = dataRoutes.data;
        
        // Заполняем данные на странице
        fillTourData(tourData, tourRoutes);
        
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить данные тура');
    }
}

function fillTourData(data, tourRoutes) {
    const tour = data.trip;
    const hotels = data.hotels;
    const routes = tourRoutes;


    //получение изображений отеля
    //получение изображений отеля
    const slidesImg = document.querySelector('.tour__hotel-slides');
    slidesImg.innerHTML = '';

    if(tour.urls && tour.urls.length > 0) {
      tour.urls.forEach((url, index) => {
        const slide = document.createElement('div')
        slide.classList = 'tour__hotel-slide';
        if(index === 0) slide.classList.add('tour__hotel-slide--active');

        const img = document.createElement('img');
        img.src = url;
        img.alt = `Изображения отеля ${index + 1}`;

        slide.appendChild(img);

        slidesImg.appendChild(slide);

        if(tour.urls.length === 1) {
          slidesImg.style.display = 'block';

          img.style.maxWidth = '1300px';
          img.style.height = '550px';
        }
      })
    } else {
        const fallbackSlide = document.createElement('div');
        fallbackSlide.classList.add('tour__hotel-slide', 'tour__hotel-slide--active');

        const img = document.createElement('img');
        img.src = "assets/images/pages/tour/gallery/hotel-1.png";
        img.alt = "Заглушка отеля";

        slidesImg.style.display = 'block';

        img.style.maxWidth = '1300px';
        img.style.height = '550px';

        fallbackSlide.appendChild(img);
        slidesImg.appendChild(fallbackSlide);
    }
    
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

function fillRoute(routeData) {
    const routeContainer = document.querySelector('.tour__top-route__inner');
    const duration = document.querySelector('.tour__top-route__duration');
    routeContainer.innerHTML = '';
    duration.innerHTML = '';

    const items = routeData.items;

    items.forEach((item, index) => {
        if (item.kind === 'city') {
            const isFirst = item.city === routeData.from;
            const isLast = item.city === routeData.to;
            const pointClass = isFirst ? 'from' : isLast ? 'to' : 'transfer';

            const pointDiv = document.createElement('div');
            pointDiv.className = `tour__top-route__point tour__top-route__point--${pointClass}`;

            if (pointClass === 'transfer') {
                pointDiv.innerHTML = `
                    <img src="assets/icons/pages/tour/clock.svg" alt="Clock">
                    <br><strong>${item.city}</strong><br>
                    <span>${item.stop_time_text || ''}</span>
                `;
            } else if (pointClass === 'to') {
                pointDiv.innerHTML = `
                    <img src="assets/icons/pages/tour/white-qibla.svg" alt="Qibla">
                    ${item.city}
                `;
            } else {
                pointDiv.textContent = item.city;
            }

            routeContainer.appendChild(pointDiv);
        } else if (item.kind === 'leg' && index < items.length - 1) {
            const transportDiv = document.createElement('div');
            transportDiv.className = 'tour__top-route__transport';

            const isFirstLeg = index === 1;
            const transportType = isFirstLeg ? 'airplane' : 'bus';
            const transportName = isFirstLeg ? 'Airplane' : 'Bus';

            transportDiv.innerHTML = `
                <div class="tour__top-route__transport-name">
                    <img src="assets/icons/pages/tour/${transportType}.svg" alt="">
                    ${transportName}
                </div>
                <div class="tour__top-route__transport-divider"></div>
                <div class="tour__top-route__transport-duration">
                    ${item.duration_text || ''}
                </div>
            `;
            routeContainer.appendChild(transportDiv);
        }
    });
    duration.innerHTML = `
        <strong>время в пути</strong>
        <br>
        <span>${routeData.total_duration}</span>
    `
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

document.addEventListener("DOMContentLoaded", () => {
  const modalHTML = `
    <div class="modal-overlay" id="tourModalOverlay" style="display:none;">
      <div class="modal" id="tourModal">
        <button class="modal__close" id="closeTourModal">&times;</button>
        <h2 class="modal__title">Заявка на тур</h2>
        <form id="tourRequestForm" class="modal__form">
          <div class="modal__form-group">
            <label>Название тура</label>
            <input type="text" id="modalTourName" name="tour_name" readonly>
          </div>
          <div class="modal__form-group">
            <label>Маршрут тура</label>
            <input type="text" id="modalTourRoute" name="tour_route" readonly>
          </div>
          <div class="modal__form-group">
            <label>Даты поездки</label>
            <input type="text" id="modalTourDate" name="tour_date" readonly>
          </div>
          <div class="modal__form-group">
            <label>Цена</label>
            <input type="text" id="modalTourPrice" name="tour_price" readonly>
          </div>
          <div class="modal__form-group">
            <label>Ваше имя</label>
            <input type="text" id="modalUserName" name="user_name" placeholder="Введите имя" required>
          </div>
          <div class="modal__form-group">
            <label>Телефон</label>
            <input type="tel" id="modalUserPhone" name="user_phone" placeholder="+7 (___) ___-__-__" required>
          </div>
          <button type="submit" class="modal__submit">Отправить заявку</button>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
  initModalLogic();
});

function initModalLogic() {
  const overlay = document.getElementById("tourModalOverlay");
  const form = document.getElementById("tourRequestForm");
  const closeBtn = document.getElementById("closeTourModal");

  // Клик по кнопке "Забронировать"
  document.body.addEventListener("click", (event) => {
    const button = event.target.closest(".tour__details-price__book_button");
    if (!button) return;

    event.preventDefault();

    // Достаём данные из верстки
    const tourName =
      document.querySelector(".tour__top-info__block-title")?.textContent.trim() || "";

    const tourRoute =
      document
        .querySelector(".tour__details-card__main-elem:nth-child(1) strong")
        ?.textContent.trim() || "";

    const tourDate =
      document
        .querySelector(".tour__details-card__main-elems:nth-child(2) .tour__details-card__main-elem strong")
        ?.textContent.trim() || "";

    const tourPrice =
      document
        .querySelector(".tour__details-price__discounted-number")
        ?.textContent.replace(/\s+/g, " ")
        .trim() || "";

    // Заполняем модалку
    document.getElementById("modalTourName").value = tourName;
    document.getElementById("modalTourRoute").value = tourRoute;
    document.getElementById("modalTourDate").value = tourDate;
    document.getElementById("modalTourPrice").value = tourPrice;

    // Показываем модалку
    overlay.style.display = "flex";
    setTimeout(() => overlay.classList.add("active"), 10);
  });

  // Закрытие
  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  function closeModal() {
    overlay.classList.remove("active");
    setTimeout(() => (overlay.style.display = "none"), 200);
  }

  // Отправка формы
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      name: form.tour_name.value,
      route: form.tour_route.value,
      date: form.tour_date.value,
      price: form.tour_price.value,
      username: form.user_name.value,
      phone: form.user_phone.value,
    };

    try {
      const response = await fetch("https://api.web95.tech/api/v1/trips/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Ошибка при отправке заявки");

      alert("Ваша заявка успешно отправлена!");
      form.reset();
      closeModal();
    } catch (error) {
      console.error(error);
      alert("❌ Не удалось отправить заявку. Попробуйте позже.");
    }
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