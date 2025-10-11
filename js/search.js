// search.js
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация поиска
    initSearch();
     // Инициализация даты
     initDate();
});

function initDate() {
    // Находим элементы даты
    const dateContainer = document.querySelector('.header__middle-date');
    if (!dateContainer) return;

    // Элементы для обновления
    const gregorianElement = document.querySelector('.header__middle-date__gregorian');
    const hijriElement = document.querySelector('.header__middle-date__hijri');
    
    // Временно показываем индикатор загрузки
    if (gregorianElement) gregorianElement.textContent = 'Загрузка...';
    if (hijriElement) hijriElement.textContent = '...';

    // Запрашиваем данные с сервера
    fetch('https://api.web95.tech/api/v1/date/today')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сети: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            if (data.success && data.data && data.data.date) {
                updateDateDisplay(data.data.date, gregorianElement, hijriElement);
            } else {
                throw new Error('Неверный формат данных');
            }
        })
        .catch(error => {
            console.error('Ошибка загрузки даты:', error);
            // В случае ошибки оставляем исходную дату или показываем сообщение
            if (gregorianElement) gregorianElement.textContent = '1 августа';
            if (hijriElement) hijriElement.textContent = '10 зуль-хиджа';
        });
}

function updateDateDisplay(dateString, gregorianElement, hijriElement) {
    // Разделяем дату по символу "/"
    const dateParts = dateString.split(' / ');
    
    if (dateParts.length === 2) {
        // Обновляем григорианскую дату (первая часть)
        if (gregorianElement) {
            gregorianElement.textContent = dateParts[0].trim();
        }
        
        // Обновляем хиджру (вторая часть)
        if (hijriElement) {
            hijriElement.textContent = dateParts[1].trim();
        }
    } else {
        console.warn('Неожиданный формат даты:', dateString);
    }
}

function initSearch() {
    // Находим элементы поиска в header и footer
    const headerSearchForm = document.querySelector('.header__middle-form');
    const footerSearchForm = document.querySelector('.footer__middle-form');
    
    if (headerSearchForm) {
        const headerInput = headerSearchForm.querySelector('input');
        const headerButton = headerSearchForm.querySelector('button');
        const headerMiddle = document.querySelector('.header__middle');
        
        headerButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Если инпут еще не открыт - открываем его
            if (!headerMiddle.classList.contains('show-input')) {
                headerMiddle.classList.add('show-input');
                headerInput.focus();
            } else {
                // Если инпут открыт и есть текст - выполняем поиск
                if (headerInput.value && headerInput.value.trim() !== '') {
                    performSearch(headerInput.value);
                } else {
                    headerInput.focus();
                }
            }
        });
        
        headerInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (headerInput.value && headerInput.value.trim() !== '') {
                    performSearch(headerInput.value);
                }
            }
        });

        // Закрытие инпута при клике вне области
        document.addEventListener('click', function(e) {
            if (!headerMiddle.contains(e.target) && headerMiddle.classList.contains('show-input')) {
                headerMiddle.classList.remove('show-input');
                headerInput.value = '';
            }
        });

        // Предотвращаем закрытие при клике внутри формы
        headerSearchForm.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    if (footerSearchForm) {
        const footerInput = footerSearchForm.querySelector('input');
        const footerButton = footerSearchForm.querySelector('button');
        
        footerButton.addEventListener('click', function(e) {
            e.preventDefault();
            // Если в инпуте есть текст - выполняем поиск, иначе фокусируемся на инпуте
            if (footerInput.value && footerInput.value.trim() !== '') {
                performSearch(footerInput.value);
            } else {
                footerInput.focus();
            }
        });
        
        footerInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (footerInput.value && footerInput.value.trim() !== '') {
                    performSearch(footerInput.value);
                }
            }
        });
    }
    
}

function performSearch(query) {
    if (!query || query.trim() === '') {
        return;
    }
    
    const searchQuery = query.trim();
    const apiUrl = `https://api.web95.tech/api/v1/search?q=${encodeURIComponent(searchQuery)}`;
    
    // Показываем индикатор загрузки
    showLoadingIndicator();
    
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сети: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            hideLoadingIndicator();
            
            if (data.success && data.data && data.data.length > 0) {
                displaySearchResults(data.data);
            } else {
                displayNoResults();
            }
        })
        .catch(error => {
            hideLoadingIndicator();
            console.error('Ошибка поиска:', error);
            alert('Произошла ошибка при выполнении поиска. Пожалуйста, попробуйте позже.');
        });
}

function showLoadingIndicator() {
    // Создаем индикатор загрузки
    let loadingIndicator = document.getElementById('search-loading');
    
    if (!loadingIndicator) {
        loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'search-loading';
        loadingIndicator.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                z-index: 10000;
                text-align: center;
            ">
                <div style="margin-bottom: 10px;">Поиск...</div>
                <div style="width: 20px; height: 20px; border: 2px solid #f3f3f3; border-top: 2px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(loadingIndicator);
    }
    
    loadingIndicator.style.display = 'block';
}

function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('search-loading');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}

function displaySearchResults(results) {
    // Создаем или обновляем контейнер для результатов
    let resultsContainer = document.getElementById('search-results');
    
    if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.id = 'search-results';
        resultsContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            background: white;
            border-radius: 8px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            z-index: 10001;
            overflow: hidden;
            display: none;
        `;
        
        document.body.appendChild(resultsContainer);
    }
    
    // Создаем содержимое результатов
    resultsContainer.innerHTML = `
        <div style="
            background: #f8f9fa;
            padding: 20px;
            border-bottom: 1px solid #e9ecef;
            display: flex;
            justify-content: space-between;
            align-items: center;
        ">
            <h3 style="margin: 0; color: #333;">Результаты поиска</h3>
            <button id="close-search-results" style="
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            ">×</button>
        </div>
        <div style="padding: 0; max-height: calc(80vh - 80px); overflow-y: auto;">
            ${results.map((item, index) => `
                <div class="search-result-item" style="
                    padding: 16px 20px;
                    border-bottom: 1px solid #f0f0f0;
                    cursor: pointer;
                    transition: background-color 0.2s;
                " data-link="${item.link}" data-index="${index}" data-id="${item.id}" data-type="${item.trip_type}">
                    <div style="
                        font-weight: 500;
                        margin-bottom: 4px;
                        color: #333;
                        line-height: 1.4;
                    ">${item.title}</div>
                    <div style="
                        font-size: 12px;
                        color: #666;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    ">
                        <span>${getTypeLabel(item.type)}</span>
                        <span>${formatDate(item.date)}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Добавляем обработчики событий
    const closeButton = document.getElementById('close-search-results');
    closeButton.addEventListener('click', function() {
        resultsContainer.style.display = 'none';
    });
    
    const resultItems = resultsContainer.querySelectorAll('.search-result-item');
    resultItems.forEach(item => {
        item.addEventListener('click', function() {
            const id = this.dataset.id;
            const type = this.dataset.trup_type;

            const page = type === 'Умра' ? 'tour-umra.html' : 'tour-hadj.html';
            if (page) {
                window.location.href = `${page}?id=${id}`;
            }
        });
        
        // Добавляем эффект при наведении
        item.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f8f9fa';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'white';
        });
    });
    
    // Добавляем обработчик для закрытия по клику вне области результатов
    document.addEventListener('click', function closeResults(e) {
        if (!resultsContainer.contains(e.target) && 
            !e.target.closest('.header__middle-form') && 
            !e.target.closest('.footer__middle-form')) {
            resultsContainer.style.display = 'none';
        }
    });
    
    // Показываем результаты
    resultsContainer.style.display = 'block';
}

function displayNoResults() {
    let resultsContainer = document.getElementById('search-results');
    
    if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.id = 'search-results';
        resultsContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 400px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            z-index: 10001;
            overflow: hidden;
        `;
        document.body.appendChild(resultsContainer);
    }
    
    resultsContainer.innerHTML = `
        <div style="
            background: #f8f9fa;
            padding: 20px;
            border-bottom: 1px solid #e9ecef;
            display: flex;
            justify-content: space-between;
            align-items: center;
        ">
            <h3 style="margin: 0; color: #333;">Результаты поиска</h3>
            <button id="close-search-results" style="
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
            ">×</button>
        </div>
        <div style="padding: 40px 20px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
            <div style="color: #666; margin-bottom: 8px;">Ничего не найдено</div>
            <div style="color: #999; font-size: 14px;">Попробуйте изменить поисковый запрос</div>
        </div>
    `;
    
    const closeButton = document.getElementById('close-search-results');
    closeButton.addEventListener('click', function() {
        resultsContainer.style.display = 'none';
    });
    
    resultsContainer.style.display = 'block';
}

function getTypeLabel(type) {
    const typeLabels = {
        'news': 'Новость',
        'trip': 'Поездка',
        'article': 'Статья'
    };
    
    return typeLabels[type] || type;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Добавляем CSS стили для поиска
const searchStyles = `
    .search-result-item:hover {
        background-color: #f8f9fa !important;
    }
    
    #search-results {
        animation: fadeIn 0.3s ease-in-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translate(-50%, -48%); }
        to { opacity: 1; transform: translate(-50%, -50%); }
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = searchStyles;
document.head.appendChild(styleSheet);