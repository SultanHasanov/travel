// tours.js
const TOURS_API_BASE = "https://api.web95.tech/api/v1/admin/trips";

// Загрузка всех туров
async function loadTours() {
  try {
    const token = localStorage.getItem("authToken");

    const response = await fetch(TOURS_API_BASE, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      localStorage.removeItem("authToken");
      // Токен недействителен или отсутствует
      // Перенаправление на страницу входа
      window.location.href = "/auth.html";

      return;
    }

    const responseData = await response.json();
    const tours = responseData.data.items;

    renderToursTable(tours);
  } catch (error) {
    console.error("Ошибка загрузки туров:", error);
    alert("Не удалось загрузить туры");
  }
}

// Функция для переключения основного тура
async function toggleMainTour(tourId, isMain) {
  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`${TOURS_API_BASE}/${tourId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ main: isMain }),
    });

    if (response.status === 401) {
      localStorage.removeItem("authToken");
      // Токен недействителен или отсутствует
      // Перенаправление на страницу входа
      window.location.href = "/auth.html";

      return;
    }

    // Перезагружаем список туров
    loadTours();
  } catch (error) {
    console.error("Ошибка:", error);
    alert("Не удалось обновить тур");
  }
}

// Рендеринг таблицы туров
function renderToursTable(tours) {
  const tbody = document.getElementById("toursTableBody");
  tbody.innerHTML = "";

  tours.forEach((tour) => {
    const row = tbody.insertRow();
    row.innerHTML = `
            <td>${tour.id}</td>
            <td>${tour.title}</td>
            <td>${tour.trip_type}</td>
            <td>${Number(tour.price).toLocaleString("ru-RU")} ${
      tour.currency
    }</td>
            <td>${new Date(tour.start_date).toLocaleDateString("ru-RU")}</td>
            <td>${new Date(tour.end_date).toLocaleDateString("ru-RU")}</td>
            <td>
              <label class="checkbox-container">
                <input type="checkbox" ${
                  tour.main ? "checked" : ""
                } onchange="toggleMainTour(${tour.id}, this.checked)">
                <span class="checkmark"></span>
              </label>
            </td>
            <td class="admin-table__actions">
                <button class="admin-table__btn admin-table__btn--edit" onclick="editTour(${
                  tour.id
                })">
                    Редактировать
                </button>
                <button class="admin-table__btn admin-table__btn--delete" onclick="deleteTour(${
                  tour.id
                })">
                    Удалить
                </button>
            </td>
        `;
  });
}

// Редактирование тура
async function editTour(tourId) {
  try {
    const token = localStorage.getItem("authToken");

    // Получаем данные тура
    const response = await fetch(`${TOURS_API_BASE}/${tourId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      localStorage.removeItem("authToken");
      // Токен недействителен или отсутствует
      // Перенаправление на страницу входа
      window.location.href = "/auth.html";

      return;
    }

    const responseData = await response.json();
    const tourData = responseData.data;

    // Заполняем форму редактирования
    document.querySelector('#editTourModal input[name="title"]').value =
      tourData.title || "";
    document.querySelector('#editTourModal select[name="trip_type"]').value =
      tourData.trip_type || "";
    document.querySelector(
      '#editTourModal textarea[name="description"]'
    ).value = tourData.description || "";

    document.querySelector('#editTourModal input[name="price"]').value =
      tourData.price || "";
    document.querySelector('#editTourModal select[name="currency"]').value =
      tourData.currency || "RUB";
    document.querySelector(
      '#editTourModal input[name="departure_city"]'
    ).value = tourData.departure_city || "";
    document.querySelector('#editTourModal input[name="start_date"]').value =
      tourData.start_date.split("T")[0];
    document.querySelector('#editTourModal input[name="end_date"]').value =
      tourData.end_date.split("T")[0];
    document.querySelector(
      '#editTourModal input[name="booking_deadline"]'
    ).value = tourData.booking_deadline.split("T")[0];

    document.querySelector('#editTourModal input[name="season"]').value =
      tourData.season || "";
    document.querySelector('#editTourModal input[name="photo_url"]').value =
      tourData.photo_url || "";
    document.querySelector('#editTourModal input[name="tour_id"]').value =
      tourId;

    // Открываем модальное окно
    openModal("editTourModal");
  } catch (error) {
    console.error("Ошибка:", error);
    alert("Не удалось загрузить данные тура");
  }
}

// Отправка формы редактирования тура
async function submitEditTourForm(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const tourId = formData.get("tour_id");

  const tourData = {
    title: formData.get("title"),
    trip_type: formData.get("trip_type"),
    description: formData.get("description"),
    price: parseFloat(formData.get("price")),
    currency: formData.get("currency"),
    departure_city: formData.get("departure_city"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    booking_deadline: formData.get("booking_deadline"),
    season: formData.get("season"),
    photo_url: formData.get("photo_url"),
  };

  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`${TOURS_API_BASE}/${tourId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tourData),
    });

    if (response.status === 401) {
      localStorage.removeItem("authToken");
      // Токен недействителен или отсутствует
      // Перенаправление на страницу входа
      window.location.href = "/auth.html";

      return;
    }

    if (response.ok) {
      closeModal("editTourModal");
      loadTours();
      alert("Тур обновлен успешно!");
    } else {
      throw new Error("Ошибка при обновлении тура");
    }
  } catch (error) {
    console.error("Ошибка:", error);
    alert("Не удалось обновить тур");
  }
}

// Удаление тура
async function deleteTour(tourId) {
  if (confirm(`Вы уверены, что хотите удалить тур #${tourId}?`)) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${TOURS_API_BASE}/${tourId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 401) {
        localStorage.removeItem("authToken");
        // Токен недействителен или отсутствует
        // Перенаправление на страницу входа
        window.location.href = "/auth.html";

        return;
      }

      if (response.ok) {
        loadTours();
        alert("Тур удален успешно!");
      } else {
        throw new Error("Ошибка при удалении тура");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      alert("Не удалось удалить тур");
    }
  }
}

// Создание нового тура
async function submitTourForm(event) {
  event.preventDefault();

  const formData = new FormData(event.target);

  const tourData = {
    title: formData.get("title"),
    trip_type: formData.get("trip_type"),
    description: formData.get("description"),
    price: parseFloat(formData.get("price")),
    currency: formData.get("currency"),
    departure_city: formData.get("departure_city"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    booking_deadline: formData.get("booking_deadline"),
    season: formData.get("season"),
    photo_url: formData.get("photo_url"),
  };

  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch(TOURS_API_BASE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tourData),
    });

    if (response.status === 401) {
      localStorage.removeItem("authToken");
      // Токен недействителен или отсутствует
      // Перенаправление на страницу входа
      window.location.href = "/auth.html";

      return;
    }

    if (response.ok) {
      closeModal("tourModal");
      event.target.reset();
      loadTours();
      alert("Тур создан успешно!");
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || "Ошибка при создании тура");
    }
  } catch (error) {
    console.error("Ошибка:", error);
    alert("Не удалось создать тур: " + error.message);
  }
}

function renderToursForHome(tours) {
  const wrapper = document.getElementById("toursSwiperWrapper");
  const noToursMessage = document.getElementById("noToursMessage");
  wrapper.innerHTML = "";

  if (!tours || tours.length === 0) {
    noToursMessage.style.display = "block";
    return;
  }
  noToursMessage.style.display = "none";

  tours.forEach((tour) => {
    const slide = document.createElement("div");
    slide.classList.add("tours__card", "swiper-slide");
    slide.innerHTML = `
  <div class="tours__card-name">${tour.title}</div>
  <div class="tours__card-buy">
    <div class="tours__card-buy__price">
      ${Number(tour.price).toLocaleString("ru-RU")} <span>${
      tour.currency
    }</span>
    </div>
    <button class="tours__card-buy__button" id="orders_booking">купить путевку</button>
  </div>
`;

    slide.style.backgroundImage = tour.photo_url
      ? `url(${tour.photo_url})`
      : "none";

    wrapper.appendChild(slide);
  });

  // Инициализация Swiper
  new Swiper(".tours__cards", {
    slidesPerView: 3,
    spaceBetween: 20,
    navigation: {
      nextEl: ".tours-top__next",
    },
    // breakpoints: {
    //   768: { slidesPerView: 2 },
    //   480: { slidesPerView: 1 },
    // },
  });
}

async function loadToursForHome() {
  try {
    const response = await fetch("https://api.web95.tech/api/v1/trips", {
      method: "GET",
    });

    if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
    const responseData = await response.json();
    const tours = responseData.data;
    renderToursForHome(tours);
  } catch (error) {
    console.error("Ошибка загрузки туров:", error);
    document.getElementById("noToursMessage").style.display = "block";
  }
}

// Константы и глобальные переменные

let currentFilters = {
  trip_type: "",
  departure_city: "",
  season: "",
};

// Функция для загрузки всех туров
async function loadAllTours() {
  try {
    const response = await fetch("https://api.web95.tech/api/v1/trips", {
      method: "GET",
    });

    if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);

    const dataResp = await response.json();
    return dataResp.data.items;
  } catch (error) {
    console.error("Ошибка загрузки туров:", error);
    return [];
  }
}
// Функция для извлечения уникальных значений для фильтров
function extractFilterValues(tours) {
  const filters = {
    trip_types: new Set(),
    departure_cities: new Set(),
    seasons: new Set(),
  };

  tours.forEach((tour) => {
    if (tour.trip_type) filters.trip_types.add(tour.trip_type);
    if (tour.departure_city) filters.departure_cities.add(tour.departure_city);
    if (tour.season) filters.seasons.add(tour.season);
  });

  return {
    trip_types: Array.from(filters.trip_types),
    departure_cities: Array.from(filters.departure_cities),
    seasons: Array.from(filters.seasons),
  };
}

// Функция для заполнения фильтров данными
function populateFilters(filterValues) {
  // Заполняем фильтр типов туров
  const tripTypeFilter = document.getElementById("tripTypeFilter");
  filterValues.trip_types.forEach((type) => {
    const li = document.createElement("li");
    li.textContent = type;
li.dataset.value = type;

    tripTypeFilter.appendChild(li);
  });

  // Заполняем фильтр городов вылета
  const cityFilter = document.getElementById("departureCityFilter");
  filterValues.departure_cities.forEach((city) => {
    const li = document.createElement("li");
    li.textContent = city;
    li.dataset.value = city;
    cityFilter.appendChild(li);
  });

  // Заполняем фильтр сезонов
  const seasonFilter = document.getElementById("seasonFilter");
  filterValues.seasons.forEach((season) => {
    const li = document.createElement("li");
    li.textContent = season;
    li.dataset.value = season;
    seasonFilter.appendChild(li);
  });

  // Добавляем обработчики событий для фильтров
  setupFilterEventListeners();
}

// Настройка обработчиков событий для фильтров
function setupFilterEventListeners() {
  // Обработчики для dropdown
  document
    .querySelectorAll(".custom-dropdown__options-list li")
    .forEach((item) => {
      item.addEventListener("click", function () {
        const dropdown = this.closest(".custom-dropdown");
        const selectedSpan = dropdown.querySelector(
          ".custom-dropdown__options-selected"
        );
        selectedSpan.textContent = this.textContent;

        // Обновляем текущие фильтры
        const filterType = dropdown
          .querySelector(".custom-dropdown__label")
          .textContent.toLowerCase();
        let filterKey;

        if (filterType.includes("тур")) filterKey = "trip_type";
        else if (filterType.includes("город")) filterKey = "departure_city";
        else if (filterType.includes("сезон")) filterKey = "season";

        if (filterKey) {
          currentFilters[filterKey] = this.dataset.value || "";
        }

      });
    });

  // Фильтрация только по кнопке "искать туры"
  document.getElementById("searchForm").addEventListener("submit", function (e) {
    e.preventDefault();
    filterTours();
  });
}

// Функция фильтрации туров
// Функция фильтрации туров через запрос к серверу
async function filterTours() {
  try {
    // Собираем параметры для запроса
    const params = new URLSearchParams();
    
    if (currentFilters.trip_type) params.append('trip_type', currentFilters.trip_type);
    if (currentFilters.departure_city) params.append('departure_city', currentFilters.departure_city);
    if (currentFilters.season) params.append('season', currentFilters.season);

    const response = await fetch(`https://api.web95.tech/api/v1/trips?${params.toString()}`, {
      method: "GET",
    });

    if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);

    const responseData = await response.json();
    const filteredTours = responseData.data.items;

    renderToursForHome(filteredTours);
  } catch (error) {
    console.error("Ошибка фильтрации туров:", error);
    alert("Не удалось загрузить туры по выбранным фильтрам");
  }
}
// Модифицированная функция рендеринга туров
function renderToursForHome(tours) {
  const wrapper = document.getElementById("toursSwiperWrapper");
  const noToursMessage = document.getElementById("noToursMessage");
  wrapper.innerHTML = "";

  if (!tours || tours.length === 0) {
    noToursMessage.style.display = "block";
    noToursMessage.textContent = "Туры по выбранным фильтрам не найдены";
    return;
  }

  noToursMessage.style.display = "none";

  tours.forEach((tour, index) => {
    const slide = document.createElement("div");
    slide.classList.add("tours__card", "swiper-slide");
    slide.innerHTML = `
      <div class="tours__card-name">${tour.title}</div>
      <div class="tours__card-buy">
        <div class="tours__card-buy__price">
          ${Number(tour.price).toLocaleString("ru-RU")} <span>${
      tour.currency
    }</span>
        </div>
        <button class="tours__card-buy__button" id="tour_booking_${
          tour.id
        }_${index}">купить путевку</button>
      </div>
    `;

    slide.style.backgroundImage = tour.urls
      ? `url(${tour.urls[0]})`
      : "none";
    wrapper.appendChild(slide);
  });

  // Переинициализация Swiper
  if (window.toursSwiper) {
    window.toursSwiper.destroy();
  }

  window.toursSwiper = new Swiper(".tours__cards", {
    slidesPerView: 3,
    spaceBetween: 20,
    navigation: {
      nextEl: ".tours-top__next",
    },
    // breakpoints: {
    //   768: { slidesPerView: 2 },
    //   480: { slidesPerView: 1 },
    // },
  });

  // Добавляем обработчики для новых кнопок
  addTourButtonHandlers(tours);
}

// Функция для добавления обработчиков на кнопки туров
function addTourButtonHandlers(tours) {
  const tourButtons = document.querySelectorAll(
    '.tours__card-buy__button[id^="tour_booking_"]'
  );

  tourButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();

      // Извлекаем ID тура из кнопки
      const tourId = this.id.split("_")[2];
      const tour = tours.find(item => item.id == tourId);
      console.log("Переход к туру ID:", tourId);

      // Переход на страницу хаджа с передачей ID тура в URL
      const page = tour.trip_type === "Умра" ? "tour-umra.html" : "tour-hadj.html"
      window.location.href = `${page}?id=${tourId}`;
    });
  });
}


// Функция для обновления обратного отсчета
async function initCountdown() {
  try {
    const response = await fetch("https://api.web95.tech/api/v1/trips/main");
    const respData = await response.json();
    const data = respData.data.countdown;

    if (data) {
      const { days, hours, minutes, seconds } = data;

      // Конвертируем в общее количество секунд
      let totalSeconds =
        parseInt(days) * 24 * 60 * 60 +
        parseInt(hours) * 60 * 60 +
        parseInt(minutes) * 60 +
        parseInt(seconds);

      // Запускаем обратный отсчет на фронте
      startCountdown(totalSeconds);
    } else {
      // Нет активных туров - показываем сообщение
      showNoActiveToursMessage(countdownContainer, titleElement, bookingButton);
    }
  } catch (error) {
    console.error("Ошибка загрузки времени:", error);
    // При ошибке тоже показываем сообщение
    const countdownContainer = document.querySelector(
      ".introduction__booking-time"
    );
    const titleElement = document.querySelector(".introduction__booking-title");
    const bookingButton = document.querySelector(
      ".introduction__booking-button"
    );
    showNoActiveToursMessage(countdownContainer, titleElement, bookingButton);
  }
}

// Функция для показа сообщения об отсутствии активных туров
function showNoActiveToursMessage(
  countdownContainer,
  titleElement,
  bookingButton
) {
  // Скрываем отсчет и кнопку
  countdownContainer.style.display = "none";
  bookingButton.style.display = "none";

  // Показываем сообщение
  titleElement.textContent = "Пока нет активных туров";
  titleElement.style.textAlign = "center";
  titleElement.style.width = "100%";

  // Добавляем стиль для сообщения
  titleElement.style.fontSize = "24px";
  titleElement.style.color = "#ffb800";
  titleElement.style.marginTop = "20px";
}

// Функция для фронтенд-отсчета
function startCountdown(totalSeconds) {
  function updateDisplay() {
    if (totalSeconds <= 0) {
      clearInterval(countdownInterval);
      // Можно добавить действие по окончании отсчета
      document.querySelector(".introduction__booking-title").textContent =
        "Запись на хадж завершена";
      return;
    }

    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    // Обновляем значения на странице
    document.querySelector(
      ".introduction__booking-time__measurement:nth-child(1) .booking-time__measurement-int"
    ).textContent = days.toString().padStart(2, "0");
    document.querySelector(
      ".introduction__booking-time__measurement:nth-child(2) .booking-time__measurement-int"
    ).textContent = hours.toString().padStart(2, "0");
    document.querySelector(
      ".introduction__booking-time__measurement:nth-child(3) .booking-time__measurement-int"
    ).textContent = minutes.toString().padStart(2, "0");
    document.querySelector(
      ".introduction__booking-time__measurement:nth-child(4) .booking-time__measurement-int"
    ).textContent = seconds.toString().padStart(2, "0");

    totalSeconds--;
  }

  // Обновляем сразу и затем каждую секунду
  updateDisplay();
  const countdownInterval = setInterval(updateDisplay, 1000);
}

// Запускаем один раз при загрузке страницы
initCountdown();

// Основная функция инициализации
async function initSearchFilters() {
  try {
    const tours = await loadAllTours();
    const filterValues = extractFilterValues(tours);
    populateFilters(filterValues);
    renderToursForHome(tours);
  } catch (error) {
    console.error("Ошибка инициализации фильтров:", error);
  }
}

// Добавьте CSS для стилизации активных фильтровfff
const style = document.createElement("style");
style.textContent = `
  .custom-dropdown__options-list li.active {
    background-color: #f0f0f0;
    font-weight: bold;
  }
  
  .custom-dropdown__options-selected.active-filter {
    color: #007bff;
    font-weight: bold;
  }
`;
document.head.appendChild(style);

document.addEventListener("DOMContentLoaded", async function () {
  const currentPage = window.location.pathname.split("/").pop();
  if (currentPage !== "admin.html") {
    const tours = await loadAllTours();
    const filterValues = extractFilterValues(tours);
    populateFilters(filterValues);
    renderToursForHome(tours);
  } else {
    loadTours(); // для админки
  }
});
