// Функции для управления отелями
async function loadHotels() {
    try {
        const token = localStorage.getItem("authToken");
        if (!token) {
            window.location.href = "/auth.html";
            return;
        }

        const response = await fetch("https://api.web95.tech/api/v1/admin/hotels", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (response.status === 401) {
            localStorage.removeItem("authToken");
            window.location.href = "/auth.html";
            alert("Требуется авторизация. Пожалуйста, войдите в систему.");
            return;
        }

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const responseData = await response.json();
        const hotels = responseData.data || [];

        const tbody = document.getElementById("hotelsTableBody");
        tbody.innerHTML = "";

        hotels.forEach((hotel) => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${hotel.id}</td>
                <td>${hotel.name}</td>
                <td>${hotel.city}</td>
                <td>${'★'.repeat(hotel.stars)}</td>
                <td>${hotel.distance} км</td>
                <td>${hotel.meals || '-'}</td>
                <td>${hotel.guests || '-'}</td>
                <td>${new Date(hotel.created_at).toLocaleDateString("ru-RU")}</td>
                <td class="admin-table__actions">
                    <button class="admin-table__btn admin-table__btn--edit" onclick="editHotel(${hotel.id})">
                        Редактировать
                    </button>
                    <button class="admin-table__btn admin-table__btn--delete" onclick="deleteHotel(${hotel.id})">
                        Удалить
                    </button>
                </td>
            `;
        });
    } catch (error) {
        console.error("Ошибка загрузки отелей:", error);
        alert("Не удалось загрузить список отелей");
    }
}

async function submitHotelForm(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const hotelData = {
        name: formData.get("name"),
        city: formData.get("city"),
        stars: parseInt(formData.get("stars")),
        distance: parseFloat(formData.get("distance")),
        distance_text: formData.get("distance_text"),
        meals: formData.get("meals"),
        guests: formData.get("guests"),
        photo_url: formData.get("photo_url")
    };

    try {
        const token = localStorage.getItem("authToken");
        const response = await fetch("https://api.web95.tech/api/v1/admin/hotels", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(hotelData),
        });

        if (response.status === 401) {
            localStorage.removeItem("authToken");
            window.location.href = "/auth.html";
            return;
        }

        if (response.ok) {
            closeModal("hotelModal");
            event.target.reset();
            loadHotels();
            alert("Отель успешно создан!");
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || "Ошибка при создании отеля");
        }
    } catch (error) {
        console.error("Ошибка:", error);
        alert("Не удалось создать отель: " + error.message);
    }
}

async function editHotel(hotelId) {
    try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`https://api.web95.tech/api/v1/admin/hotels/${hotelId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (response.status === 401) {
            localStorage.removeItem("authToken");
            window.location.href = "/auth.html";
            return;
        }

        const responseData = await response.json();
        const hotelData = responseData.data;

        // Заполняем форму редактирования
        document.querySelector('#editHotelModal input[name="hotel_id"]').value = hotelId;
        document.querySelector('#editHotelModal input[name="name"]').value = hotelData.name || "";
        document.querySelector('#editHotelModal input[name="city"]').value = hotelData.city || "";
        document.querySelector('#editHotelModal input[name="stars"]').value = hotelData.stars || "";
        document.querySelector('#editHotelModal input[name="distance"]').value = hotelData.distance || "";
        document.querySelector('#editHotelModal input[name="distance_text"]').value = hotelData.distance_text || "";
        document.querySelector('#editHotelModal input[name="meals"]').value = hotelData.meals || "";
        document.querySelector('#editHotelModal input[name="guests"]').value = hotelData.guests || "";
        document.querySelector('#editHotelModal input[name="photo_url"]').value = hotelData.photo_url || "";

        openModal("editHotelModal");
    } catch (error) {
        console.error("Ошибка:", error);
        alert("Не удалось загрузить данные отеля");
    }
}

async function submitEditHotelForm(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const hotelId = formData.get("hotel_id");

    const hotelData = {
        name: formData.get("name"),
        city: formData.get("city"),
        stars: parseInt(formData.get("stars")),
        distance: parseFloat(formData.get("distance")),
        distance_text: formData.get("distance_text"),
        meals: formData.get("meals"),
        guests: formData.get("guests"),
        photo_url: formData.get("photo_url")
    };

    try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`https://api.web95.tech/api/v1/admin/hotels/${hotelId}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(hotelData),
        });

        if (response.status === 401) {
            localStorage.removeItem("authToken");
            window.location.href = "/auth.html";
            return;
        }

        if (response.ok) {
            closeModal("editHotelModal");
            loadHotels();
            alert("Отель успешно обновлен!");
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || "Ошибка при обновлении отеля");
        }
    } catch (error) {
        console.error("Ошибка:", error);
        alert("Не удалось обновить отель: " + error.message);
    }
}

async function deleteHotel(hotelId) {
    if (confirm(`Вы уверены, что хотите удалить отель #${hotelId}?`)) {
        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(`https://api.web95.tech/api/v1/admin/hotels/${hotelId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                localStorage.removeItem("authToken");
                window.location.href = "/auth.html";
                return;
            }

            if (response.ok) {
                loadHotels();
                alert("Отель успешно удален!");
            } else {
                throw new Error("Ошибка при удалении отеля");
            }
        } catch (error) {
            console.error("Ошибка:", error);
            alert("Не удалось удалить отель");
        }
    }
}

// Modal functions (копируем из основного файла)
function openModal(modalId) {
    document.getElementById(modalId).classList.add("active");
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove("active");
}

// Close modal when clicking outside
window.addEventListener("click", function (e) {
    if (e.target.classList.contains("modal")) {
        e.target.classList.remove("active");
    }
});

// Загружаем отели при загрузке страницы
document.addEventListener("DOMContentLoaded", function() {
    loadHotels();
});