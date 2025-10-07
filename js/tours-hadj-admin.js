// Функция для загрузки и отображения туров
async function loadHajjTours(params = {}) {
  try {
    // Собираем query string
    const query = new URLSearchParams(params).toString();
    const url = query
      ? `https://api.web95.tech/api/v1/trips/relations?${query}`
      : `https://api.web95.tech/api/v1/trips/relations`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Ошибка загрузки туров");
    }

    const responseData = await response.json();
    const tours = responseData.data.items || [];

    renderTours(tours);
  } catch (error) {
    console.error("Ошибка:", error);
    document.querySelector(".tours-cards__inner").innerHTML = `
      <div class="no-tours">
        <p>Не удалось загрузить туры. Пожалуйста, попробуйте позже.</p>
      </div>
    `;
  }
}

// Функция для отображения туров
function renderTours(tours) {
  const container = document.querySelector(".tours-cards__inner");

  if (tours.length === 0) {
    container.innerHTML = `
            <div class="no-tours">
                <p>На данный момент туры в хадж недоступны.</p>
            </div>
        `;
    return;
  }

  container.innerHTML = tours.map((tour) => createTourCard(tour)).join("");
}

// Функция для инициализации фильтров
// Функция для инициализации фильтров
function initializeFilters() {
  const filterSelects = document.querySelectorAll(".custom-dropdown__options");

  filterSelects.forEach((select) => {
    const selected = select.querySelector(".custom-dropdown__options-selected");
    const optionsList = select.querySelector(".custom-dropdown__options-list");

    // Удаляем старые обработчики
    const oldOptions = optionsList.querySelectorAll("li");
    oldOptions.forEach((option) => {
      option.replaceWith(option.cloneNode(true));
    });

    // Добавляем новые обработчики
    const newOptions = optionsList.querySelectorAll("li");
    newOptions.forEach((option) => {
      option.addEventListener("click", function () {
        selected.textContent = this.textContent;
        filterTours();
      });
    });
  });

  // Сброс фильтров (если еще не инициализирован)
  const resetBtn = document.querySelector(".tours-filters__additional-reset");
  if (resetBtn && !resetBtn.hasAttribute("data-initialized")) {
    resetBtn.setAttribute("data-initialized", "true");
    resetBtn.addEventListener("click", resetFilters);
  }
}
// Функция для фильтрации туров
// Функция для фильтрации туров
// Функция для фильтрации туров
function filterTours() {
  const tourType = getSelectedFilterValue("тип");
  const tourName = getSelectedFilterValue("выбор тура");
  const departureCity = getSelectedFilterValue("город вылета");
  const route = getSelectedFilterValue("маршрут тура");
  const status = getSelectedFilterValue("статус тура");
  const month = getSelectedFilterValue("дата поездки");

  const params = {};

  if (tourName && tourName !== "Выберите тур") params.title = tourName;
  if (departureCity && departureCity !== "Выберите город")
    params.departure_city = departureCity;
  if (tourType && tourType !== "Выберите тип") params.trip_type = tourType;

  // ИСПРАВЛЕНИЕ: передаем только первый город маршрута
  if (route && route !== "маршрут тура") {
    // Берем только первый город из маршрута (разделитель "→")
    const firstCity = route.split("→")[0].trim();
    params.route_city = firstCity;
  }

  if (status && status !== "статус тура")
    params.active = status === "Активный" ? 1 : 0;

  // Исправленная обработка даты поездки
  if (month && month !== "Выберите месяц") {
    // Находим тур с соответствующим месяцем и берем его start_date
    const allTours = document.querySelectorAll(".tours-card");
    let foundDate = null;

    allTours.forEach((card) => {
      const dateElement = card.querySelector(
        ".tours-card__info-main__elem:nth-child(2) span"
      );
      if (dateElement && dateElement.nextSibling) {
        const dateText = dateElement.nextSibling.textContent.trim();
        const date = new Date(dateText.split(".").reverse().join("-"));
        const cardMonth = date.toLocaleString("ru-RU", { month: "long" });

        if (cardMonth === month && !foundDate) {
          foundDate = formatDateForAPI(date);
        }
      }
    });

    if (foundDate) {
      params.start_after = foundDate;
    }
  }

  console.log("Запрос с параметрами:", params);
  loadHajjTours(params);
}

// Вспомогательная функция для форматирования даты в нужный формат
function formatDateForAPI(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Функция для получения выбранного значения фильтра
function getSelectedFilterValue(label) {
  const dropdown = Array.from(
    document.querySelectorAll(".custom-dropdown")
  ).find(
    (dd) =>
      dd
        .querySelector(".custom-dropdown__label")
        ?.textContent.trim()
        .toLowerCase() === label
  );

  if (!dropdown) return null;

  const selected = dropdown.querySelector(".custom-dropdown__options-selected");
  return selected ? selected.textContent.trim() : null;
}

// Функция сброса фильтров
function resetFilters() {
  const selectedSpans = document.querySelectorAll(
    ".custom-dropdown__options-selected"
  );

  selectedSpans.forEach((span) => {
    const parentLabel = span
      .closest(".custom-dropdown")
      .querySelector(".custom-dropdown__label");
    const labelText = parentLabel.textContent.toLowerCase();

    if (labelText === "выбор тура") {
      span.textContent = "Выберите тур";
    } else if (labelText === "дата поездки") {
      span.textContent = "Выберите месяц";
    } else if (labelText === "город вылета") {
      span.textContent = "Выберите город";
    } else if (labelText === "тип") {
      span.textContent = "Выберите тип";
    } else if (labelText === "маршрут тура") {
      span.textContent = "маршрут тура";
    } else if (labelText === "статус тура") {
      span.textContent = "статус тура";
    }
  });

  loadHajjTours(); // без параметров -> все туры
}

// Функция для заполнения фильтров данными из API

function populateFilters(tours) {
  const uniqueTitles = [...new Set(tours.map((tour) => tour.trip.title))];
  const uniqueCities = [
    ...new Set(tours.map((tour) => tour.trip.departure_city)),
  ];
  const uniqueTypes = [...new Set(tours.map((tour) => tour.trip.trip_type))];

  // Даты поездки — собираем месяцы по start_date
  const uniqueMonths = [
    ...new Set(
      tours.map((tour) => {
        const date = new Date(tour.trip.start_date);
        return date.toLocaleString("ru-RU", { month: "long" });
      })
    ),
  ];

  // Маршрут тура — объединяем все города маршрута
  const uniqueRoutes = [
    ...new Set(
      tours.map((tour) => {
        const routeCities = Object.values(tour.routes?.route_cities || {})
          .map((city) => city.city)
          .join(" → ");
        return routeCities;
      })
    ),
  ];

  // Статус тура
  const uniqueStatuses = [
    ...new Set(
      tours.map((tour) => (tour.trip.active ? "Активный" : "Неактивный"))
    ),
  ];
  console.log(uniqueStatuses);
  console.log("Данные для фильтров:", {
    uniqueTitles,
    uniqueCities,
    uniqueTypes,
    uniqueMonths,
    uniqueRoutes,
    uniqueStatuses,
  });

  // Находим фильтры по тексту label
  const dropdowns = document.querySelectorAll(".custom-dropdown");

  dropdowns.forEach((dropdown) => {
    const label = dropdown.querySelector(".custom-dropdown__label");
    if (!label) return;

    const labelText = label.textContent.toLowerCase();
    const optionsList = dropdown.querySelector(
      ".custom-dropdown__options-list"
    );
    if (!optionsList) return;

    if (labelText.includes("выбор тура")) {
      optionsList.innerHTML = uniqueTitles
        .map((title) => `<li>${title}</li>`)
        .join("");
    } else if (labelText.includes("город вылета")) {
      optionsList.innerHTML = uniqueCities
        .map((city) => `<li>${city}</li>`)
        .join("");
    } else if (labelText.includes("тип")) {
      optionsList.innerHTML = uniqueTypes
        .map((type) => `<li>${type}</li>`)
        .join("");
    } else if (labelText.includes("дата поездки")) {
      optionsList.innerHTML = uniqueMonths
        .map((month) => `<li>${month}</li>`)
        .join("");
    } else if (labelText.includes("маршрут тура")) {
      optionsList.innerHTML = uniqueRoutes
        .map((route) => `<li>${route}</li>`)
        .join("");
    } else if (labelText.includes("статус тура")) {
      optionsList.innerHTML = uniqueStatuses
        .map((status) => `<li>${status}</li>`)
        .join("");
    }
  });

  // Переинициализируем обработчики после заполнения фильтров
  initializeFilters();
}

// Обновите функцию renderTours
// Функция для отображения туров
function renderTours(tours) {
  const container = document.querySelector(".tours-cards__inner");

  if (tours.length === 0) {
    container.innerHTML = `
      <div class="no-tours">
        <p>На данный момент туры недоступны.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = tours.map((tour) => createTourCard(tour)).join("");
  populateFilters(tours); // Заполняем фильтры после рендеринга туров
}

// Функция создания карточки тура
function createTourCard(tourData) {
  const trip = tourData.trip;
  const hotels = tourData.hotels || [];
  const routes = tourData.routes?.route_cities || {};
  // Форматируем даты
  const startDate = new Date(trip.start_date).toLocaleDateString("ru-RU");
  const endDate = new Date(trip.end_date).toLocaleDateString("ru-RU");

  // Вычисляем продолжительность
  const start = new Date(trip.start_date);
  const end = new Date(trip.end_date);
  const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

  // Получаем города маршрута
  const routeCities = Object.values(routes)
    .map((city) => city.city)
    .join(" → ");

  // Находим отели для Мекки и Медины
  const meccaHotel = hotels.find((hotel) => hotel.city === "Мекка");
  const medinaHotel = hotels.find((hotel) => hotel.city === "Медина");

  // Форматируем цену
  const formattedPrice = new Intl.NumberFormat("ru-RU").format(
    trip.final_price
  );

  // Создаем стиль с фоновым изображением
 const backgroundStyle =
  hotels.length > 0 && hotels[0].photo_url
    ? `style="background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${hotels[0].photo_url}') no-repeat center; background-size: cover;"`
    : `style="background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(../assets/images/pages/tours/tour-card-bg.png) no-repeat center; background-size: cover;"`;

  return `
    <div class="tours-card ${
      trip.main ? "tours-card--premium" : ""
    }" ${backgroundStyle}>
        <div class="tours-card__info">
            <div class="tours-card__info-top">
                <div class="tours-card__info-rating">
                    <img src="assets/images/pages/tours/tour-rating--${
                      trip.main ? "orange" : "white"
                    }.png" alt="Рейтинг тура" />
                </div>
                <div class="tours-card__info-type">${getTourType(trip)}</div>
            </div>
            <div class="tours-card__info-name">${trip.title}</div>
            <div class="tours-card__info-route">
                <span>маршрут тура</span> ${routeCities || "Не указан"}
            </div>
            
            ${
              trip.main
                ? createPremiumIcons()
                : createDiscountIfApplicable(trip)
            }
            
            <div class="tours-card__info-main">
                <div class="tours-card__info-main__elem">
                    <span>город вылета</span> ${trip.departure_city}
                </div>
                <div class="tours-card__info-main__elem">
                    <span>дата поездки</span> ${startDate}
                </div>
                <div class="tours-card__info-main__elem">
                    <span>продолж-сть</span> ${duration} ${getDaysText(
    duration
  )}
                </div>
                <div class="tours-card__info-main__elem">
                    <span>статус</span> ${
                      trip.active ? "Активный" : "Неактивный"
                    }
                </div>
            </div>
           
        </div>
            <div class="tours-card__details">
                <div class="tours-card__details-blocks">
                    ${createHotelBlock("мекка", meccaHotel)}
                    ${createHotelBlock("медина", medinaHotel)}
                </div>
                 <div class="tours-card__details-buy">
            <div class="tours-card__details-buy__price ${
              trip.discount_percent === 0
                ? "tours-card__details-buy__price--right"
                : ""
            }">
                ${!trip.main ? createDiscountedPrice(trip) : ""}
                <div class="tours-card__details-buy__price-current">
                    <div class="price">${formattedPrice} <span>${getCurrencySymbol(
    trip.currency
  )}</span></div>
                </div>
            </div>
            <a href="/tour-detail.html?id=${
              trip.id
            }" class="tours-card__details-buy__link">
                Забронировать
            </a>
        </div>
    </div>
            </div>
        </div>
    `;
}
// Вспомогательные функции
function getTourType(trip) {
  if (trip.price < 150000) return "эконом тур";
  if (trip.price < 300000) return "стандарт тур";
  return "премиум тур";
}

function getRouteType(routes) {
  const cities = Object.values(routes).map((city) => city.city);
  return cities.join(" → ") || "Самолетно-автобусный";
}

function createPremiumIcons() {
  return `
        <div class="tours-card__info-icons">
            <div class="tours-card__info-icon">
                <div class="tours-card__info-icons__inner">
                    <img src="assets/icons/pages/tours/medal.svg" alt="Премиум" />
                </div>
            </div>
            <div class="tours-card__info-icon">
                <div class="tours-card__info-icons__inner">
                    <img src="assets/icons/pages/tours/stars-amenity.svg" alt="5 звезд" />
                </div>
            </div>
            <div class="tours-card__info-icon">
                <div class="tours-card__info-icons__inner">
                    <img src="assets/icons/pages/tours/purple-plate-amenity.svg" alt="Питание" />
                </div>
            </div>
        </div>
    `;
}

function createDiscountIfApplicable(trip) {
  // Если скидка 0%, скрываем блок
  if (trip.discount_percent === 0) {
    return '';
  }

  const deadline = new Date(trip.booking_deadline);
  const now = new Date();

  if (deadline > now) {
    return `
            <div class="tours-card__info-discount">
                <div class="tours-card__info-discount__icon">
                    <div class="tours-card__info-discount__icon-inner">
                        <img src="assets/icons/pages/tours/percentage.svg" alt="Акция" />
                    </div>
                </div>
                <div class="tours-card__info-discount__text">
                    <strong>акция!</strong>
                    <br />
                    до ${deadline.toLocaleDateString("ru-RU")}
                </div>
            </div>
        `;
  }
  return "";
}

function createDiscountedPrice(trip) {
  // Добавляем проверку на скидку
  if (trip.discount_percent === 0) {
    return ""; // Возвращаем пустую строку, если скидки нет
  }

  const discountedPrice = Math.round(trip.price * 0.8); // 20% скидка для примера
  const formattedDiscounted = new Intl.NumberFormat("ru-RU").format(
    discountedPrice
  );
  const formattedOriginal = new Intl.NumberFormat("ru-RU").format(trip.price);

  return `
        <div class="tours-card__details-buy__price-undiscounted">
            ${formattedOriginal} <span>${getCurrencySymbol(
    trip.currency
  )}</span>
        </div>
    `;
}

function createHotelBlock(city, hotel) {
  // Если отеля нет - возвращаем пустую строку вместо блока
  if (!hotel) {
    return "";
  }

  return `
    <div class="tours-card__details-block">
        <div class="tours-card__details-city">${city}</div>
        <div class="tours-card__details-hotel">
            <div class="tours-card__details-hotel__name">${hotel.name}</div>
            <img src="assets/icons/pages/tours/${
              city === "мекка" ? "mecca" : "medina"
            }-hotel-rating.svg" 
                 alt="Рейтинг отеля" class="tours-card__details-hotel__rating" />
        </div>
        <div class="tours-card__details-mosque">
            ${
              hotel.distance
                ? `${hotel.distance}км до Мечети`
                : "Расстояние не указано"
            }
        </div>
        <div class="tours-card__details-amenities">
            <div class="tours-card__details-amenity">
                <img src="assets/icons/pages/tours/bus-side-view.svg" alt="Трансфер" />
                <span>трансфер</span> <strong>${
                  hotel.transfer || "не указан"
                }</strong>
            </div>
            <div class="tours-card__details-amenity">
                <img src="assets/icons/pages/tours/plate-with-cutlery.svg" alt="Питание" />
                <span>питание</span> <strong>${
                  hotel.meals || "не указано"
                }</strong>
            </div>
        </div>
        <div class="tours-card__details-stay_info">
            <div class="tours-card__details-nights">
                <img src="assets/icons/pages/tours/crescent.svg" alt="Ночи" />
                ${hotel.nights || "0"} ночей
            </div>
            <div class="tours-card__details-guests">
                <img src="assets/icons/pages/tours/people.svg" alt="Гости" />
                ${hotel.guests || "не указано"}
            </div>
        </div>
    </div>
  `;
}

function getDaysText(days) {
  if (days % 10 === 1 && days % 100 !== 11) return "день";
  if (days % 10 >= 2 && days % 10 <= 4 && (days % 100 < 10 || days % 100 >= 20))
    return "дня";
  return "дней";
}

function getCurrencySymbol(currency) {
  const symbols = {
    RUB: "руб.",
    USD: "$",
    EUR: "€",
    SAR: "риял",
  };
  return symbols[currency] || currency;
}

// Создаем HTML модалки (один раз при загрузке страницы)
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
            <label>Дата поездки</label>
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

// ========================== ЛОГИКА МОДАЛКИ ==========================

function initModalLogic() {
  const overlay = document.getElementById("tourModalOverlay");
  const modal = document.getElementById("tourModal");
  const closeBtn = document.getElementById("closeTourModal");
  const form = document.getElementById("tourRequestForm");

  // Открытие модалки при нажатии "Выбрать тур"
  document.body.addEventListener("click", (event) => {
    const link = event.target.closest(".tours-card__details-buy__link");
    if (!link) return;
    event.preventDefault();

    const card = link.closest(".tours-card");
    if (!card) return;

    // Берем данные тура
    const tourName =
      card.querySelector(".tours-card__info-name")?.textContent.trim() || "";
    const tourDate =
      card
        .querySelector(".tours-card__info-main__elem:nth-child(2)")
        ?.textContent.replace("дата поездки", "")
        .trim() || "";
    const tourPrice = card.querySelector(".price")?.textContent.trim() || "";

    // Заполняем модалку
    document.getElementById("modalTourName").value = tourName;
    document.getElementById("modalTourDate").value = tourDate;
    document.getElementById("modalTourPrice").value = tourPrice;

    // Открываем
    overlay.style.display = "flex";
    setTimeout(() => overlay.classList.add("active"), 10);
  });

  // Закрытие окна
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

      alert(
        "✅ Ваша заявка успешно отправлена! Мы свяжемся с вами в ближайшее время."
      );
      form.reset();
      closeModal();
    } catch (error) {
      console.error(error);
      alert("❌ Не удалось отправить заявку. Попробуйте позже.");
    }
  });
}

// Загружаем туры при загрузке страницы
document.addEventListener("DOMContentLoaded", function () {
  loadHajjTours();
  initializeFilters();
});
