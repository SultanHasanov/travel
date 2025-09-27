


// Рендеринг таблицы туров
function renderToursTable(tours) {
  const tbody = document.getElementById("toursTableBody");
  tbody.innerHTML = "";

  tours.forEach((tour) => {
    const row = tbody.insertRow();
    row.innerHTML = `
            <td>${tour.id}</td>
            <td>${tour.title}</td>
            <td>${tour.trip_type === "hajj" ? "Хадж" : "Умра"}</td>
            <td>${Number(tour.price).toLocaleString("ru-RU")} ${tour.currency}</td>
            <td>${new Date(tour.start_date).toLocaleDateString("ru-RU")}</td>
            <td>${new Date(tour.end_date).toLocaleDateString("ru-RU")}</td>
            <td>
              <label class="checkbox-container">
                <input type="checkbox" ${tour.main ? 'checked' : ''} onchange="toggleMainTour(${tour.id}, this.checked)">
                <span class="checkmark"></span>
              </label>
            </td>
            <td class="admin-table__actions">
                <button class="admin-table__btn admin-table__btn--edit" onclick="editTour(${tour.id})">
                    Редактировать
                </button>
                <button class="admin-table__btn admin-table__btn--delete" onclick="deleteTour(${tour.id})">
                    Удалить
                </button>
            </td>
        `;
  });
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
    breakpoints: {
      768: { slidesPerView: 2 },
      480: { slidesPerView: 1 },
    },
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


// Функция для загрузки всех туров
async function loadAllTours() {
  try {
    const response = await fetch("https://api.web95.tech/api/v1/trips", {
      method: "GET",
    });

    if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);

    const dataResp = await response.json();
    allTours = dataResp.data; // сохраняем в глобальную переменную!
    return allTours;
  } catch (error) {
    console.error("Ошибка загрузки туров:", error);
    return [];
  }
}







document.addEventListener("DOMContentLoaded", async function () {
    // Загружаем туры для главной страницы
    await loadToursForHome();
    
    // Если нужны все туры для других целей, можно оставить эту строку
    await loadAllTours();
});