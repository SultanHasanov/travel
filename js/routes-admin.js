// routes-admin.js - Функции для управления маршрутами

// Global variables
let currentTrips = [];

// Tab switching functionality
function initializeRouteTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            
            // Remove active class from all tabs and sections
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            
            // Add active class to current tab and section
            this.classList.add('active');
            document.getElementById(targetSection).classList.add('active');
            
            // Load data when switching to routes section
            if (targetSection === 'routes') {
                loadTrips();
            }
        });
    });
}

// Load trips for dropdown
async function loadTrips() {
    try {
        const token = localStorage.getItem("authToken");
        if (!token) {
            window.location.href = "/auth.html";
            return;
        }

        const response = await fetch('https://api.web95.tech/api/v1/admin/trips', {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        });

        if (response.status === 401) {
            localStorage.removeItem("authToken");
            window.location.href = "/auth.html";
            alert("Требуется авторизация. Пожалуйста, войдите в систему.");
            return;
        }

        if (!response.ok) {
            throw new Error('Ошибка загрузки туров');
        }
        
        const responseData = await response.json();
        
        // Правильное получение данных
        currentTrips = responseData.data || [];
        console.log('Туры успешно загружены:', currentTrips);
        
        // Populate trip select in routes section
        const tripSelect = document.getElementById('tripSelect');
        if (!tripSelect) {
            console.error('Элемент tripSelect не найден');
            return;
        }
        
        tripSelect.innerHTML = '<option value="">-- Выберите тур --</option>';
        
        // Populate trip select in modal
        const modalTripSelect = document.querySelector('#routeModal select[name="trip_id"]');
        if (modalTripSelect) {
            modalTripSelect.innerHTML = '<option value="">-- Выберите тур --</option>';
        }
        
        currentTrips.forEach(trip => {
            const option = document.createElement('option');
            option.value = trip.id;
            option.textContent = trip.title;
            
            tripSelect.appendChild(option.cloneNode(true));
            if (modalTripSelect) {
                modalTripSelect.appendChild(option.cloneNode(true));
            }
        });
        
        console.log('Туры успешно загружены в селекты, количество:', currentTrips.length);
        
    } catch (error) {
        console.error('Ошибка загрузки туров:', error);
        alert('Ошибка загрузки туров: ' + error.message);
    }
}

// Load routes for selected trip
async function loadRoutesForSelectedTrip() {
    const tripSelect = document.getElementById('tripSelect');
    const tripId = tripSelect.value;
    const routesTableBody = document.getElementById('routesTableBody');
    
    if (!tripId) {
        routesTableBody.innerHTML = '<tr><td colspan="6">Выберите тур для просмотра маршрутов</td></tr>';
        return;
    }
    
    try {
        const token = localStorage.getItem("authToken");
        if (!token) {
            window.location.href = "/auth.html";
            return;
        }

        const response = await fetch(`https://api.web95.tech/api/v1/trips/${tripId}/routes`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        });

        if (response.status === 401) {
            localStorage.removeItem("authToken");
            window.location.href = "/auth.html";
            alert("Требуется авторизация. Пожалуйста, войдите в систему.");
            return;
        }

        if (!response.ok) {
            throw new Error('Ошибка загрузки маршрутов');
        }
        
        const responseData = await response.json();
        console.log('Полный ответ маршрутов:', responseData);
        
        // Исправляем получение маршрутов - берем responseData.data.route
        const routes = responseData.data?.route || [];
        console.log('Загруженные маршруты:', routes);
        
        routesTableBody.innerHTML = '';
        
        if (routes.length === 0) {
            routesTableBody.innerHTML = '<tr><td colspan="6">Маршруты не найдены</td></tr>';
            return;
        }
        
        // Добавляем позицию (index) так как в ответе нет поля position
        routes.forEach((route, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${route.city || '-'}</td>
                <td>${route.duration || '-'}</td>
                <td>${route.stop_time || '-'}</td>
                <td>${route.transport || '-'}</td>
                <td class="admin-table__actions">
                    <button class="admin-table__btn admin-table__btn--edit" onclick="editRoute(${index}, ${tripId})">
                        ✏️
                    </button>
                    <button class="admin-table__btn admin-table__btn--delete" onclick="deleteRoute(${index}, ${tripId})">
                        🗑️
                    </button>
                </td>
            `;
            routesTableBody.appendChild(row);
        });
        
        // Показываем общую длительность если есть
        const totalDuration = responseData.data?.total_duration;
        if (totalDuration) {
            const infoRow = document.createElement('tr');
            infoRow.innerHTML = `<td colspan="6" style="background: #f8f9fa; font-weight: bold;">Общая длительность: ${totalDuration}</td>`;
            routesTableBody.appendChild(infoRow);
        }
        
    } catch (error) {
        console.error('Ошибка загрузки маршрутов:', error);
        routesTableBody.innerHTML = '<tr><td colspan="6">Ошибка загрузки маршрутов: ' + error.message + '</td></tr>';
    }
}

// Submit route form
async function submitRouteForm(event) {
    event.preventDefault();
    
    const token = localStorage.getItem("authToken");
    if (!token) {
        window.location.href = "/auth.html";
        return;
    }

    const form = event.target;
    const formData = new FormData(form);
    const tripId = formData.get('trip_id');
    
    const routeData = {
        routes: [{
            city: formData.get('city'),
            duration: formData.get('duration'),
            position: parseInt(formData.get('position')),
            stop_time: formData.get('stop_time'),
            transport: formData.get('transport')
        }]
    };
    
    try {
        const response = await fetch(`https://api.web95.tech/api/v1/admin/trips/${tripId}/routes/batch`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(routeData)
        });

        if (response.status === 401) {
            localStorage.removeItem("authToken");
            window.location.href = "/auth.html";
            alert("Требуется авторизация. Пожалуйста, войдите в систему.");
            return;
        }
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Ошибка создания маршрута');
        }
        
        alert('Маршрут успешно создан!');
        closeModal('routeModal');
        form.reset();
        
        // Reload routes if the same trip is selected
        const selectedTripId = document.getElementById('tripSelect').value;
        if (selectedTripId === tripId) {
            loadRoutesForSelectedTrip();
        }
        
    } catch (error) {
        console.error('Ошибка создания маршрута:', error);
        alert('Ошибка создания маршрута: ' + error.message);
    }
}

// Edit route
// Обновленные функции для работы с маршрутами
async function editRoute(routeIndex, tripId) {
    try {
        const token = localStorage.getItem("authToken");
        if (!token) {
            window.location.href = "/auth.html";
            return;
        }

        const response = await fetch(`https://api.web95.tech/api/v1/trips/${tripId}/routes`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        });

        if (response.status === 401) {
            localStorage.removeItem("authToken");
            window.location.href = "/auth.html";
            return;
        }

        const responseData = await response.json();
        const routes = responseData.data?.route || [];
        const routeData = routes[routeIndex];

        if (!routeData) {
            alert('Маршрут не найден');
            return;
        }

        // Заполняем форму редактирования
        const modal = document.getElementById('routeModal');
        const form = modal.querySelector('form');
        
        form.querySelector('select[name="trip_id"]').value = tripId;
        form.querySelector('input[name="city"]').value = routeData.city || "";
        form.querySelector('input[name="duration"]').value = routeData.duration || "";
        form.querySelector('input[name="position"]').value = routeIndex;
        form.querySelector('input[name="stop_time"]').value = routeData.stop_time || "";
        form.querySelector('input[name="transport"]').value = routeData.transport || "";
        
        // Изменяем заголовок и обработчик для редактирования
        modal.querySelector('.modal-title').textContent = 'Редактировать маршрут';
        form.onsubmit = function(e) { 
            e.preventDefault();
            updateRoute(e, tripId, routeIndex); 
        };
        
        openModal('routeModal');
        
    } catch (error) {
        console.error('Ошибка загрузки данных маршрута:', error);
        alert('Не удалось загрузить данные маршрута');
    }
}

async function updateRoute(event, tripId, routeIndex) {
    // Реализация обновления маршрута
    // Для этого нужно будет отправить весь обновленный массив маршрутов
}

async function deleteRoute(routeIndex, tripId) {
    if (!confirm('Вы уверены, что хотите удалить этот маршрут?')) {
        return;
    }
    
    // Для удаления нужно будет отправить обновленный массив маршрутов без удаленного элемента
    alert('Функция удаления требует отправки всего массива маршрутов. Реализация зависит от API.');
}
// Submit edit route form
async function submitEditRouteForm(event, routeId, tripId) {
    event.preventDefault();
    
    const token = localStorage.getItem("authToken");
    if (!token) {
        window.location.href = "/auth.html";
        return;
    }

    const form = event.target;
    const formData = new FormData(form);
    
    const routeData = {
        city: formData.get('city'),
        duration: formData.get('duration'),
        position: parseInt(formData.get('position')),
        stop_time: formData.get('stop_time'),
        transport: formData.get('transport')
    };
    
    try {
        const response = await fetch(`https://api.web95.tech/api/v1/admin/trips/${tripId}/routes/${routeId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(routeData)
        });

        if (response.status === 401) {
            localStorage.removeItem("authToken");
            window.location.href = "/auth.html";
            alert("Требуется авторизация. Пожалуйста, войдите в систему.");
            return;
        }
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Ошибка обновления маршрута');
        }
        
        alert('Маршрут успешно обновлен!');
        closeModal('routeModal');
        
        // Сбрасываем форму к исходному состоянию
        const modal = document.getElementById('routeModal');
        const form = modal.querySelector('form');
        modal.querySelector('.modal-title').textContent = 'Добавить маршрут';
        form.onsubmit = submitRouteForm;
        form.reset();
        
        // Reload routes
        loadRoutesForSelectedTrip();
        
    } catch (error) {
        console.error('Ошибка обновления маршрута:', error);
        alert('Ошибка обновления маршрута: ' + error.message);
    }
}

// Delete route
async function deleteRoute(routeId, tripId) {
    if (!confirm('Вы уверены, что хотите удалить этот маршрут?')) {
        return;
    }
    
    const token = localStorage.getItem("authToken");
    if (!token) {
        window.location.href = "/auth.html";
        return;
    }
    
    try {
        const response = await fetch(`https://api.web95.tech/api/v1/admin/trips/${tripId}/routes/${routeId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        if (response.status === 401) {
            localStorage.removeItem("authToken");
            window.location.href = "/auth.html";
            alert("Требуется авторизация. Пожалуйста, войдите в систему.");
            return;
        }
        
        if (!response.ok) {
            throw new Error('Ошибка удаления маршрута');
        }
        
        alert('Маршрут успешно удален!');
        loadRoutesForSelectedTrip();
        
    } catch (error) {
        console.error('Ошибка удаления маршрута:', error);
        alert('Ошибка удаления маршрута: ' + error.message);
    }
}

// Open route modal with trip selection
function openRouteModal() {
    loadTrips().then(() => {
        openModal('routeModal');
    });
}

// Initialize routes functionality when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    initializeRouteTabs();
    
    // Load trips if on routes section
    if (document.getElementById('routes') && document.getElementById('routes').classList.contains('active')) {
        loadTrips();
    }
});