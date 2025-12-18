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
  let countdownInterval; // ← объявляем здесь
  
  function updateDisplay() {
    if (totalSeconds <= 0) {
      clearInterval(countdownInterval); // ← теперь переменная доступна
      updateTitleElement('Запись на хадж завершена');
      return;
    }
    
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;
    
    updateCountdownElements(days, hours, minutes, seconds);
    
    totalSeconds--;
  }
  
  updateDisplay();
  countdownInterval = setInterval(updateDisplay, 1000); // ← присваиваем значение
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
  
  // Селекторы для второго типа
  const dayElement2 = document.querySelector('.article__aside-booking__time-measurement:nth-child(1) .article__aside-measurement__int');
  const hourElement2 = document.querySelector('.article__aside-booking__time-measurement:nth-child(2) .article__aside-measurement__int');
  const minuteElement2 = document.querySelector('.article__aside-booking__time-measurement:nth-child(3) .article__aside-measurement__int');
  const secondElement2 = document.querySelector('.article__aside-booking__time-measurement:nth-child(4) .article__aside-measurement__int');
  
  // Селекторы для третьего типа (новые из примера)
  const dayElement3 = document.querySelector('.tour__top-timer__measurement:nth-child(1) .timer__measurement-int');
  const hourElement3 = document.querySelector('.tour__top-timer__measurement:nth-child(2) .timer__measurement-int');
  const minuteElement3 = document.querySelector('.tour__top-timer__measurement:nth-child(3) .timer__measurement-int');
  const secondElement3 = document.querySelector('.tour__top-timer__measurement:nth-child(4) .timer__measurement-int');
  
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
  
  // Обновляем третий тип селекторов
  if (dayElement3) dayElement3.textContent = dayStr;
  if (hourElement3) hourElement3.textContent = hourStr;
  if (minuteElement3) minuteElement3.textContent = minuteStr;
  if (secondElement3) secondElement3.textContent = secondStr;
}

// Функция для обновления заголовка
function updateTitleElement(text) {
  const titleElement1 = document.querySelector('.introduction__booking-title');
  const titleElement2 = document.querySelector('.article__aside-booking__title');
  const titleElement3 = document.querySelector('.tour__top-timer__title'); // новый селектор для заголовка
  
  const titleElements = [titleElement1, titleElement2, titleElement3];
  
  titleElements.forEach(element => {
    if (element) {
      element.textContent = text;
      element.style.textAlign = 'center';
      element.style.width = '100%';
      element.style.fontSize = '24px';
      element.style.color = '#ffb800';
      element.style.marginTop = '20px';
    }
  });
}

// Функция для показа сообщения об отсутствии активных туров
function showNoActiveToursMessage() {
  // Скрываем контейнеры отсчета
  const countdownContainer1 = document.querySelector('.introduction__booking-time');
  const countdownContainer2 = document.querySelector('.article__aside-booking__time');
  const countdownContainer3 = document.querySelector('.tour__top-timer__measurements'); // новый селектор
  
  // Скрываем кнопки
  const bookingButton1 = document.querySelector('.introduction__booking-button');
  const bookingButton2 = document.querySelector('.article__aside-booking__button');
  // Добавьте селектор для кнопки в третьем типе, если она есть
  
  const countdownContainers = [countdownContainer1, countdownContainer2, countdownContainer3];
  const bookingButtons = [bookingButton1, bookingButton2];
  
  countdownContainers.forEach(container => {
    if (container) container.style.display = 'none';
  });
  
  bookingButtons.forEach(button => {
    if (button) button.style.display = 'none';
  });
  
  // Обновляем заголовки
  updateTitleElement('Пока нет активных туров');
}

// Запускаем один раз при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  // Проверяем, есть ли на странице элементы таймера
  const countdownElements1 = document.querySelector('.introduction__booking-time');
  const countdownElements2 = document.querySelector('.article__aside-booking__time');
  const countdownElements3 = document.querySelector('.tour__top-timer__measurements');
  
  if (countdownElements1 || countdownElements2 || countdownElements3) {
    initCountdown();
  }
});