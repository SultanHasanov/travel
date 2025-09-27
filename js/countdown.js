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
      const titleElement = document.querySelector('.introduction__booking-title');
      if (titleElement) {
        titleElement.textContent = 'Запись на хадж завершена';
      }
      return;
    }
    
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;
    
    // Обновляем значения на странице
    const dayElement = document.querySelector('.introduction__booking-time__measurement:nth-child(1) .booking-time__measurement-int');
    const hourElement = document.querySelector('.introduction__booking-time__measurement:nth-child(2) .booking-time__measurement-int');
    const minuteElement = document.querySelector('.introduction__booking-time__measurement:nth-child(3) .booking-time__measurement-int');
    const secondElement = document.querySelector('.introduction__booking-time__measurement:nth-child(4) .booking-time__measurement-int');
    
    if (dayElement) dayElement.textContent = days.toString().padStart(2, '0');
    if (hourElement) hourElement.textContent = hours.toString().padStart(2, '0');
    if (minuteElement) minuteElement.textContent = minutes.toString().padStart(2, '0');
    if (secondElement) secondElement.textContent = seconds.toString().padStart(2, '0');
    
    totalSeconds--;
  }
  
  // Обновляем сразу и затем каждую секунду
  updateDisplay();
  const countdownInterval = setInterval(updateDisplay, 1000);
}

// Функция для показа сообщения об отсутствии активных туров
function showNoActiveToursMessage() {
  const countdownContainer = document.querySelector('.introduction__booking-time');
  const titleElement = document.querySelector('.introduction__booking-title');
  const bookingButton = document.querySelector('.introduction__booking-button');
  
  if (countdownContainer) countdownContainer.style.display = 'none';
  if (bookingButton) bookingButton.style.display = 'none';
  
  if (titleElement) {
    titleElement.textContent = 'Пока нет активных туров';
    titleElement.style.textAlign = 'center';
    titleElement.style.width = '100%';
    titleElement.style.fontSize = '24px';
    titleElement.style.color = '#ffb800';
    titleElement.style.marginTop = '20px';
  }
}

// Запускаем один раз при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  // Проверяем, есть ли на странице элементы таймера
  const countdownElements = document.querySelector('.introduction__booking-time');
  if (countdownElements) {
    initCountdown();
  }
});