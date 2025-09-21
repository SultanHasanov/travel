
function updateCurrencyRates() {
  fetch('http://212.193.51.76:8080/api/v1/currency')
  .then(response => {
      if (!response.ok) {
        throw new Error(`Ошибка HTTP! статус: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // Ищем все блоки с курсами
      const currencyElements = document.querySelectorAll('.header__right-currency[data-currency]');
      
      currencyElements.forEach(element => {
        const currencyCode = element.dataset.currency;
        
        if (currencyCode === 'USD') {
          // USD → рубли
          const formatted = data.usd.toFixed(2).replace('.', ',');
          element.innerHTML = `
          1 &nbsp;
          <img src="assets/icons/dollar-sign.svg" alt="Dollar Sign" />
          &nbsp;<span>=</span>&nbsp;
          <span class="rate">${formatted}</span> руб.
          `;
        }
        
        if (currencyCode === 'SAR') {
          // SAR → рубли
          const formatted = data.sar.toFixed(2).replace('.', ',');
          element.innerHTML = `
          1 &nbsp;
          <span>риял =</span>&nbsp;
          <span class="rate">${formatted}</span> руб.
          `;
        }
      });
    })
    .catch(error => {
      console.error('Не удалось получить курсы валют:', error);
    });
  }
  
  // Можно обновлять автоматически раз в час
  // setInterval(updateCurrencyRates, 60 * 60 * 1000);
  
  document.addEventListener('DOMContentLoaded', updateCurrencyRates);