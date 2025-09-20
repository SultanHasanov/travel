function updateCurrencyRates() {
  const currencyElements = document.querySelectorAll('.header__right-currency[data-currency]');
  const apiKey = "f67f078a35106646257cec36";
  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      currencyElements.forEach(element => {
        const code = element.dataset.currency;
        const rateElement = element.querySelector('.rate');

        let rate;
        if (code === "USD") {
          rate = data.conversion_rates.RUB; // USD → RUB
        } else {
          rate = data.conversion_rates.RUB / data.conversion_rates[code]; // SAR → RUB
        }

        const formatted = rate.toFixed(2).replace(".", ",");

        if (rateElement) {
          rateElement.textContent = formatted;
        }
      });
    })
    .catch(err => console.error("Ошибка загрузки курсов:", err));
}

document.addEventListener("DOMContentLoaded", updateCurrencyRates);
