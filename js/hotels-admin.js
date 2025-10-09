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
                <td>${hotel.transfer || '-'}</td>
                <td>${new Date(hotel.created_at).toLocaleDateString("ru-RU")}</td>
                <td class="admin-table__actions">
                    <button class="admin-table__btn admin-table__btn--edit" onclick="editHotel(${hotel.id})">
                        ✏️
                    </button>
                    <button class="admin-table__btn admin-table__btn--delete" onclick="deleteHotel(${hotel.id})">
                        🗑️
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
        transfer: formData.get("transfer"),
        urls: formData.get("urls")
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
        document.querySelector('#editHotelModal input[name="transfer"]').value = hotelData.transfer || "";
        document.querySelector('#editHotelModal input[name="photo_url"]').value = hotelData.urls || "";

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
    const urlsText = formData.get("urls");
    const urlsArray = urlsText ? urlsText.split('\n').filter(url => url.trim() !== '') : [];

    const hotelData = {
        name: formData.get("name"),
        city: formData.get("city"),
        stars: parseInt(formData.get("stars")),
        distance: parseFloat(formData.get("distance")),
        distance_text: formData.get("distance_text"),
        meals: formData.get("meals"),
        guests: formData.get("guests"),
        transfer: formData.get("transfer"),
        urls: urlsArray
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

// Функция для загрузки нескольких фото отеля
async function uploadHotelPhotos(files) {
    if (!files || files.length === 0) return;
    
    const token = localStorage.getItem("authToken");
    const urlsTextarea = document.querySelector('#hotelModal textarea[name="urls"]');
    const currentUrls = urlsTextarea.value ? urlsTextarea.value.split('\n') : [];

    try {
        for (let file of files) {
            const formData = new FormData();
            formData.append('files', file);

            const response = await fetch('https://api.web95.tech/api/v1/admin/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                if (result.data && result.data.length > 0) {
                    currentUrls.push(result.data[0].url);
                }
            } else {
                throw new Error('Ошибка загрузки фото');
            }
        }

        // Обновляем textarea с URL
        urlsTextarea.value = currentUrls.join('\n');
        alert('Фото успешно загружены!');
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить фото');
    }
}

// Обновите функцию submitHotelForm для работы с массивом URL
async function submitHotelForm(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    // Получаем URL из textarea и преобразуем в массив
    const urlsText = formData.get("urls");
    const urlsArray = urlsText ? urlsText.split('\n').filter(url => url.trim() !== '') : [];

    const hotelData = {
        name: formData.get("name"),
        city: formData.get("city"),
        stars: parseInt(formData.get("stars")),
        distance: parseFloat(formData.get("distance")),
        distance_text: formData.get("distance_text"),
        meals: formData.get("meals"),
        guests: formData.get("guests"),
        transfer: formData.get("transfer"),
        urls: urlsArray // Теперь это массив
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

// Аналогично обновите функцию для редактирования отеля
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
        document.querySelector('#editHotelModal input[name="transfer"]').value = hotelData.transfer || "";
        
        // Заполняем textarea с URL (преобразуем массив в строку)
        const urlsArray = hotelData.urls || [];
        document.querySelector('#editHotelModal textarea[name="urls"]').value = urlsArray.join('\n');

        openModal("editHotelModal");
    } catch (error) {
        console.error("Ошибка:", error);
        alert("Не удалось загрузить данные отеля");
    }
}

// Добавьте функцию для загрузки фото в форме редактирования
async function uploadEditHotelPhotos(files) {
    if (!files || files.length === 0) return;
    
    if (!confirm('При загрузке новых фото старые URL будут удалены. Продолжить?')) {
        return;
    }
    
    const token = localStorage.getItem("authToken");
    const urlsTextarea = document.querySelector('#editHotelModal textarea[name="urls"]');
    
    try {
        const newUrls = [];
        
        for (let file of files) {
            const formData = new FormData();
            formData.append('files', file);

            const response = await fetch('https://api.web95.tech/api/v1/admin/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                if (result.data && result.data.length > 0) {
                    newUrls.push(result.data[0].url);
                }
            } else {
                throw new Error('Ошибка загрузки фото');
            }
        }

        // Заменяем старые URL на новые
        urlsTextarea.value = newUrls.join('\n');
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить фото');
    }
}
async function uploadPhoto(file) {
    if (!file) return;
    
    const token = localStorage.getItem("authToken");
    const formData = new FormData();
    formData.append('files', file);

    try {
        const response = await fetch('https://api.web95.tech/api/v1/admin/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            // Вставляем полученный URL в инпут для фото
            document.querySelector('input[name="photo_url"]').value = result.data[0].url;
            alert('Фото успешно загружено!');
        } else {
            throw new Error('Ошибка загрузки фото');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить фото');
    }
}

// Modal functions
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