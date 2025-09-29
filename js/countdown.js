// countdown.js
// Функция для обновления обратного отсчета
async function initCountdown() {
  try {
    const response = await fetch('https://api.web95.tech/api/v1/trips/main');
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
      showNoActiveToursMessage();
    }
  } catch (error) {
    console.error('Ошибка загрузки времени:', error);
    // При ошибке тоже показываем сообщение
    showNoActiveToursMessage();
  }
}

// Функция для фронтенд-отсчета
function startCountdown(totalSeconds) {
  function updateDisplay() {
    if (totalSeconds <= 0) {
      clearInterval(countdownInterval);
      // Можно добавить действие по окончании отсчета
      updateTitleElement('Запись на хадж завершена');
      return;
    }
    
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;
    
    // Обновляем значения на странице для разных селекторов
    updateCountdownElements(days, hours, minutes, seconds);
    
    totalSeconds--;
  }
  
  // Обновляем сразу и затем каждую секунду
  updateDisplay();
  const countdownInterval = setInterval(updateDisplay, 1000);
}

// Функция для обновления элементов отсчета
function updateCountdownElements(days, hours, minutes, seconds) {
  const dayStr = days.toString().padStart(2, '0');
  const hourStr = hours.toString().padStart(2, '0');
  const minuteStr = minutes.toString().padStart(2, '0');
  const secondStr = seconds.toString().padStart(2, '0');
  
  // Селекторы для первого типа (оригинальные)
  const dayElement1 = document.querySelector('.introduction__booking-time__measurement:nth-child(1) .booking-time__measurement-int');
  const hourElement1 = document.querySelector('.introduction__booking-time__measurement:nth-child(2) .booking-time__measurement-int');
  const minuteElement1 = document.querySelector('.introduction__booking-time__measurement:nth-child(3) .booking-time__measurement-int');
  const secondElement1 = document.querySelector('.introduction__booking-time__measurement:nth-child(4) .booking-time__measurement-int');
  
  // Селекторы для второго типа (новые)
  const dayElement2 = document.querySelector('.article__aside-booking__time-measurement:nth-child(1) .article__aside-measurement__int');
  const hourElement2 = document.querySelector('.article__aside-booking__time-measurement:nth-child(2) .article__aside-measurement__int');
  const minuteElement2 = document.querySelector('.article__aside-booking__time-measurement:nth-child(3) .article__aside-measurement__int');
  const secondElement2 = document.querySelector('.article__aside-booking__time-measurement:nth-child(4) .article__aside-measurement__int');
  
  // Обновляем первый тип селекторов
  if (dayElement1) dayElement1.textContent = dayStr;
  if (hourElement1) hourElement1.textContent = hourStr;
  if (minuteElement1) minuteElement1.textContent = minuteStr;
  if (secondElement1) secondElement1.textContent = secondStr;
  
  // Обновляем второй тип селекторов
  if (dayElement2) dayElement2.textContent = dayStr;
  if (hourElement2) hourElement2.textContent = hourStr;
  if (minuteElement2) minuteElement2.textContent = minuteStr;
  if (secondElement2) secondElement2.textContent = secondStr;
}

// Функция для обновления заголовка
function updateTitleElement(text) {
  const titleElement1 = document.querySelector('.introduction__booking-title');
  const titleElement2 = document.querySelector('.article__aside-booking__title'); // предполагаемый селектор для заголовка
  
  if (titleElement1) {
    titleElement1.textContent = text;
    titleElement1.style.textAlign = 'center';
    titleElement1.style.width = '100%';
    titleElement1.style.fontSize = '24px';
    titleElement1.style.color = '#ffb800';
    titleElement1.style.marginTop = '20px';
  }
  
  if (titleElement2) {
    titleElement2.textContent = text;
    titleElement2.style.textAlign = 'center';
    titleElement2.style.width = '100%';
    titleElement2.style.fontSize = '24px';
    titleElement2.style.color = '#ffb800';
    titleElement2.style.marginTop = '20px';
  }
}

// Функция для показа сообщения об отсутствии активных туров
function showNoActiveToursMessage() {
  // Скрываем контейнеры отсчета
  const countdownContainer1 = document.querySelector('.introduction__booking-time');
  const countdownContainer2 = document.querySelector('.article__aside-booking__time');
  
  // Скрываем кнопки
  const bookingButton1 = document.querySelector('.introduction__booking-button');
  const bookingButton2 = document.querySelector('.article__aside-booking__button'); // предполагаемый селектор для кнопки
  
  if (countdownContainer1) countdownContainer1.style.display = 'none';
  if (countdownContainer2) countdownContainer2.style.display = 'none';
  
  if (bookingButton1) bookingButton1.style.display = 'none';
  if (bookingButton2) bookingButton2.style.display = 'none';
  
  // Обновляем заголовки
  updateTitleElement('Пока нет активных туров');
}

// Запускаем один раз при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  // Проверяем, есть ли на странице элементы таймера
  const countdownElements1 = document.querySelector('.introduction__booking-time');
  const countdownElements2 = document.querySelector('.article__aside-booking__time');
  
  if (countdownElements1 || countdownElements2) {
    initCountdown();
  }
});