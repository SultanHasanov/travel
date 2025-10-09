// Функции для управления турами
let selectedHotels = [];
let routeCities = {};
let cityCounter = 1;
let editingTourId = null;

async function loadTours() {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/auth.html";
      return;
    }

    const response = await fetch(
      "https://api.web95.tech/api/v1/trips/relations",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/auth.html";
      return;
    }

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const responseData = await response.json();
    const tours = responseData.data.items || [];

    const tbody = document.getElementById("toursTableBody");
    tbody.innerHTML = "";

    tours.forEach((tour) => {
      const row = tbody.insertRow();
      row.innerHTML = `
                 <td>${tour.trip.id}</td>
  <td>${tour.trip.title}</td>
  <td>${tour.trip.departure_city}</td>
  <td>${tour.trip.price} ${tour.currency}</td>
  <td>${tour.trip.discount_percent || 0}%</td> <!-- Новая колонка -->
  <td>${new Date(tour.trip.start_date).toLocaleDateString("ru-RU")}</td>
  <td>${new Date(tour.trip.end_date).toLocaleDateString("ru-RU")}</td>
  <td>${tour.trip.active ? "✅" : "❌"}</td>
                <td class="admin-table__actions">
                    <button class="admin-table__btn admin-table__btn--edit" onclick="editTour(${
                      tour.trip.id
                    })">
                        ✏️
                    </button>
                    <button class="admin-table__btn admin-table__btn--delete" onclick="deleteTour(${
                      tour.trip.id
                    })">
                        🗑️
                    </button>
                </td>
            `;
    });
  } catch (error) {
    console.error("Ошибка загрузки туров:", error);
    alert("Не удалось загрузить список туров");
  }
}

// Функция: преобразовать дату ISO в формат DD-MM-YYYY
function formatDateToDDMMYYYY(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

// Функция: преобразовать из DD-MM-YYYY обратно в ISO (для отправки)
function parseDateFromDDMMYYYY(dateString) {
  if (!dateString) return "";
  const [day, month, year] = dateString.split("-");
  return `${year}-${month}-${day}`;
}

async function editTour(tourId) {
  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch(
      `https://api.web95.tech/api/v1/admin/trips/${tourId}/full`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error("Ошибка при загрузке тура");

    const data = await response.json();
    const tour = data.data;

    editingTourId = tour.trip.id;
    console.log(editingTourId);

    // Сначала загружаем доступные отели
    const availableHotels = await loadAvailableHotels();

    // Только после загрузки всех данных открываем форму
    openFullscreenTourForm();

    // Даем время DOM обновиться перед заполнением полей
    setTimeout(() => {
      // Устанавливаем заголовки формы
      document.querySelector("#tourFullscreenForm h1").textContent =
        "Редактирование тура";
      document.querySelector(
        ".form-actions button[type='submit']"
      ).textContent = "Сохранить изменения";

      const form = document.getElementById("createTourForm");

      // Заполняем поля
      form.title.value = tour.trip.title || "";
      form.description.value = tour.trip.description || "";
      form.departure_city.value = tour.trip.departure_city || "";
      form.start_date.value = tour.trip.start_date
        ? tour.trip.start_date.split("T")[0]
        : "";
      form.end_date.value = tour.trip.end_date
        ? tour.trip.end_date.split("T")[0]
        : "";
      form.booking_deadline.value = tour.trip.booking_deadline
        ? tour.trip.booking_deadline.split("T")[0]
        : "";
      form.price.value = tour.trip.price || "";
      form.discount_percent.value = tour.trip.discount_percent || 0;
      form.currency.value = tour.trip.currency || "";
      form.trip_type.value = tour.trip.trip_type || "";
      form.season.value = tour.trip.season || "";
      form.photo_url.value = tour.trip.urls[0] || "";

      // Безопасная установка чекбоксов
      const activeCheckbox = form.querySelector('input[name="active"]');
      const mainCheckbox = form.querySelector('input[name="main"]');
      if (activeCheckbox) activeCheckbox.checked = tour.trip.active || false;
      if (mainCheckbox) mainCheckbox.checked = tour.trip.main || false;

      // Отели тура
      selectedHotels = (tour.hotels || []).map((h) => ({
        hotel_id: h.hotel_id,
        nights: h.nights || 1,
        name: h.name || "Неизвестный отель",
      }));
      renderSelectedHotels();

      // Маршрут - преобразуем массив в объект с ключами city_1, city_2 и т.д.
      routeCities = {};
      cityCounter = 1;
      
      (tour.routes || []).forEach((route, index) => {
        const cityKey = `city_${index + 1}`;
        routeCities[cityKey] = {
          city: route.name || route.city || "",
          duration: route.duration || "",
          stop_time: route.stop_time || "",
          transport: route.transport || ""
        };
        cityCounter = index + 2; // Устанавливаем счетчик для следующих городов
      });

      if (Object.keys(routeCities).length === 0) {
        const cityKey = `city_${cityCounter}`;
        routeCities[cityKey] = {
          city: "",
          duration: "",
          stop_time: "",
          transport: ""
        };
        cityCounter++;
      }

      renderRouteCities();

      // Рендерим список отелей для выбора
      renderHotelSelection(availableHotels);
    }, 100);
  } catch (error) {
    console.error("Ошибка редактирования:", error);
    alert("Не удалось загрузить данные тура");
  }
}

async function loadAvailableHotels() {
  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch("https://api.web95.tech/api/v1/admin/hotels", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log(responseData.data);
      return responseData.data || [];
    }
    return [];
  } catch (error) {
    console.error("Ошибка загрузки отелей:", error);
    return [];
  }
}

function openFullscreenTourForm() {
  document.getElementById("tourFullscreenForm").classList.add("active");
  if (!editingTourId) {
    // Если создаем новый тур, то загружаем отели
    routeCities = {}; // Объект вместо массива
    cityCounter = 1;
    renderSelectedHotels();
    renderRouteCities();
    loadAvailableHotels().then((hotels) => {
      renderHotelSelection(hotels);
    });
  }
}

function closeFullscreenTourForm() {
  editingTourId = null;
  document.querySelector("#tourFullscreenForm h1").textContent = "Создание тура";
  document.querySelector(".form-actions button[type='submit']").textContent = "Создать тур";

  document.getElementById("tourFullscreenForm").classList.remove("active");
  document.getElementById("createTourForm").reset();
  selectedHotels = [];
  routeCities = {}; // Объект вместо массива
  cityCounter = 1;
  renderRouteCities();
  
  if (!editingTourId) {
    loadAvailableHotels().then((hotels) => {
      renderHotelSelection(hotels);
    });
  }
}
function renderHotelSelection(hotels) {
  const container = document.getElementById("hotelSelectionList");
  container.innerHTML = "";

  console.log(hotels);

  hotels.forEach((hotel) => {
    const div = document.createElement("div");
    div.className = "hotel-selection-item";
    div.innerHTML = `
            <div class="hotel-selection-info">
                <strong>${hotel.name}</strong>
                <span>${hotel.city} - ${"★".repeat(hotel.stars)}</span>
            </div>
            <div class="hotel-selection-actions">
                <input type="number" min="1" placeholder="Ночей" id="nights_${
                  hotel.id
                }" class="form-input-small" />
                <button type="button" class="btn-small" onclick="addHotelToTour(${
                  hotel.id
                }, '${hotel.name}')"
>
                    Добавить
                </button>
            </div>
        `;
    container.appendChild(div);
  });
}

function addHotelToTour(hotelId, hotelName) {
  const nightsInput = document.getElementById(`nights_${hotelId}`);
  const nights = parseInt(nightsInput.value);

  if (!nights || nights < 1) {
    alert("Укажите количество ночей");
    return;
  }

  const existing = selectedHotels.find((h) => h.hotel_id === hotelId);
  if (existing) {
    alert("Этот отель уже добавлен");
    return;
  }

  selectedHotels.push({
    hotel_id: hotelId,
    nights: nights,
    name: hotelName,
  });

  nightsInput.value = "";
  renderSelectedHotels();
}

function renderSelectedHotels() {
  const container = document.getElementById("selectedHotelsList");
  container.innerHTML = "";

  if (selectedHotels.length === 0) {
    container.innerHTML = "<p style='color: #888;'>Отели не выбраны</p>";
    return;
  }

  selectedHotels.forEach((hotel, index) => {
    console.log(hotel);
    const div = document.createElement("div");
    div.className = "selected-hotel-item";
    div.innerHTML = `
            <span><strong>${hotel.name}</strong> - ${hotel.nights} ночей</span>
            <button type="button" class="btn-remove" onclick="removeHotelFromTour(${index})">
                ✕
            </button>
        `;
    container.appendChild(div);
  });
}

function removeHotelFromTour(index) {
  selectedHotels.splice(index, 1);
  renderSelectedHotels();
}

function addRouteCity() {
  const cityKey = `city_${cityCounter}`;
  routeCities[cityKey] = {
    city: "",
    duration: "",
    stop_time: "", 
    transport: ""
  };
  cityCounter++;
  renderRouteCities();
}

function renderRouteCities() {
  const container = document.getElementById("routeCitiesList");
  container.innerHTML = "";

  // Всегда показываем хотя бы один город
  if (Object.keys(routeCities).length === 0) {
    const cityKey = `city_${cityCounter}`;
    routeCities[cityKey] = {
      city: "",
      duration: "",
      stop_time: "",
      transport: ""
    };
    cityCounter++;
  }

  // Сортируем ключи для правильного порядка отображения
  const sortedKeys = Object.keys(routeCities).sort((a, b) => {
    const numA = parseInt(a.replace('city_', ''));
    const numB = parseInt(b.replace('city_', ''));
    return numA - numB;
  });

  sortedKeys.forEach((cityKey, index) => {
    const city = routeCities[cityKey];
    const div = document.createElement("div");
    div.className = "route-city-item";

    div.innerHTML = `
      <div class="route-city-header">
        <strong>Город ${index + 1}</strong>
        ${
          index > 0
            ? `<button type="button" class="btn-remove" onclick="removeRouteCity('${cityKey}')">✕</button>`
            : ""
        }
      </div>
      <div class="route-city-inputs">
        <input type="text" class="form-input" placeholder="Название города" 
            value="${city.city}" 
            onchange="updateRouteCity('${cityKey}', 'city', this.value)" 
            required />
        <input type="text" class="form-input" placeholder="Длительность (например: 5 дней)" 
            value="${city.duration || ""}" 
            onchange="updateRouteCity('${cityKey}', 'duration', this.value)" />
        <input type="text" class="form-input" placeholder="Время остановки (например: 2 часа)" 
            value="${city.stop_time || ""}" 
            onchange="updateRouteCity('${cityKey}', 'stop_time', this.value)" />
        <input type="text" class="form-input" placeholder="Транспорт" 
            value="${city.transport || ""}" 
            onchange="updateRouteCity('${cityKey}', 'transport', this.value)" />
      </div>
    `;
    container.appendChild(div);
  });
}


function updateRouteCity(cityKey, field, value) {
  if (routeCities[cityKey]) {
    routeCities[cityKey][field] = value;
  }
}

function removeRouteCity(cityKey) {
  delete routeCities[cityKey];
  renderRouteCities();
}

async function submitTourForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);

  // Валидация выпадающих списков
  const tripType = formData.get("trip_type");
  const season = formData.get("season");

  if (!tripType) {
    alert("Пожалуйста, выберите тип тура");
    return;
  }

  if (!season) {
    alert("Пожалуйста, выберите сезон");
    return;
  }

  // Собираем данные тура
  const tripData = {
    title: formData.get("title"),
    description: formData.get("description"),
    departure_city: formData.get("departure_city"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    price: parseFloat(formData.get("price")),
    discount_percent: parseFloat(formData.get("discount_percent")) || 0,
    currency: formData.get("currency"),
    season: season,
    trip_type: tripType,
    booking_deadline: formData.get("booking_deadline"),
    urls: formData.get("photo_url") 
      ? formData.get("photo_url").split(',').map(url => url.trim()).filter(url => url)
      : [],
    active: formData.get("active") === "on",
    main: formData.get("main") === "on",
    hotels: selectedHotels.map((h) => ({
      hotel_id: h.hotel_id,
      nights: h.nights,
    })),
  };

  // Собираем маршрут - фильтруем только заполненные города
  const routes = {};
  Object.keys(routeCities).forEach(cityKey => {
    const city = routeCities[cityKey];
    if (city.city && city.city.trim() !== "") {
      routes[cityKey] = city;
    }
  });

  // Собираем новые отели
  const newHotels = [];
  const newHotelName = formData.get("new_hotel_name");
  if (newHotelName) {
    newHotels.push({
      name: newHotelName,
      city: formData.get("new_hotel_city"),
      stars: parseInt(formData.get("new_hotel_stars")),
      distance: parseFloat(formData.get("new_hotel_distance")),
      distance_text: formData.get("new_hotel_distance_text"),
      meals: formData.get("new_hotel_meals"),
      guests: formData.get("new_hotel_guests"),
      transfer: formData.get("new_hotel_transfer"),
      photo_url: formData.get("new_hotel_photo_url"),
    });
  }

  const allHotels = [
    ...selectedHotels.map((h) => ({ hotel_id: h.hotel_id, nights: h.nights })),
    ...newHotels,
  ];

  const requestData = {
    trip: tripData,
    routes: routes, // Теперь это объект с ключами city_1, city_2 и т.д.
    hotels: allHotels,
  };

  console.log("Отправляемые данные:", requestData);

  try {
    const token = localStorage.getItem("authToken");

    // Проверяем — редактируем или создаём новый тур
    const method = editingTourId ? "PUT" : "POST";
    const url = editingTourId
      ? `https://api.web95.tech/api/v1/admin/trips/${editingTourId}/full`
      : "https://api.web95.tech/api/v1/admin/tours";

    const response = await fetch(url, {
      method: method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (response.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/auth.html";
      return;
    }

    if (response.ok) {
      closeFullscreenTourForm();
      loadTours();
      alert(editingTourId ? "Тур успешно обновлён!" : "Тур успешно создан!");
      editingTourId = null;
    } else {
      const errorData = await response.json();
      throw new Error(
        errorData.message ||
          (editingTourId
            ? "Ошибка при обновлении тура"
            : "Ошибка при создании тура")
      );
    }
  } catch (error) {
    console.error("Ошибка:", error);
    alert(
      (editingTourId
        ? "Не удалось обновить тур: "
        : "Не удалось создать тур: ") + error.message
    );
  }
}
async function deleteTour(tourId) {
  if (confirm(`Вы уверены, что хотите удалить тур #${tourId}?`)) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `https://api.web95.tech/api/v1/admin/trips/${tourId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("authToken");
        window.location.href = "/auth.html";
        return;
      }

      if (response.ok) {
        loadTours();
        alert("Тур успешно удален!");
      } else {
        throw new Error("Ошибка при удалении тура");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      alert("Не удалось удалить тур");
    }
  }
}

// Загружаем туры при загрузке страницы
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("toursTableBody")) {
    loadTours();
  }
});
