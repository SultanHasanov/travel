function updateCurrencyRates() {
  fetch('https://api.web95.tech/api/v1/currency')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Ошибка HTTP! статус: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // Проверяем успешность ответа и наличие данных
      if (!data.success || !data.data) {
        throw new Error('Неверный формат данных с сервера');
      }
      
      const rates = data.data;
      
      // Ищем все блоки с курсами
      const currencyElements = document.querySelectorAll('.header__right-currency[data-currency]');
      
      currencyElements.forEach(element => {
        const currencyCode = element.dataset.currency;
        let rate, content;
        
        switch(currencyCode) {
          case 'USD':
            rate = rates.usd;
            content = `
              1 &nbsp;
              <img src="assets/icons/dollar-sign.svg" alt="Доллар" />
              &nbsp;<span>=</span>&nbsp;
              <span class="rate">${formatRate(rate)}</span> руб.
            `;
            break;
            
          case 'SAR':
            rate = rates.sar;
            content = `
              1 &nbsp;
              <span>риял =</span>&nbsp;
              <span class="rate">${formatRate(rate)}</span> руб.
            `;
            break;
            
          default:
            console.warn(`Неизвестная валюта: ${currencyCode}`);
            return; // Пропускаем неизвестные валюты
        }
        
        if (rate !== undefined) {
          element.innerHTML = content;
        }
      });
    })
    .catch(error => {
      console.error('Не удалось получить курсы валют:', error);
      showErrorMessage(); // Можно добавить отображение ошибки для пользователя
    });
}

function formatRate(rate) {
  return rate.toFixed(2).replace('.', ',');
}

function showErrorMessage() {
  const currencyElements = document.querySelectorAll('.header__right-currency[data-currency]');
  currencyElements.forEach(element => {
    element.innerHTML = '<span style="color: #999">Курс недоступен</span>';
  });
}

document.addEventListener('DOMContentLoaded', updateCurrencyRates);
