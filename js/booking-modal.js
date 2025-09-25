document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('bookingModal');
  const openButton = document.querySelector('.introduction__booking-button');
  const closeButton = document.querySelector('.modal__close');
  const form = document.getElementById('bookingForm');

  // Проверка кнопки открытия модального окна
  if (openButton) {
    openButton.addEventListener('click', function(e) {
      e.preventDefault();
      if (modal) modal.style.display = 'block';
    });
  }

  // Проверка кнопки закрытия модального окна
  if (closeButton) {
    closeButton.addEventListener('click', function() {
      if (modal) modal.style.display = 'none';
    });
  }

  // Закрытие по клику на overlay
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal || e.target.classList.contains('modal__overlay')) {
        modal.style.display = 'none';
      }
    });
  }

  // Проверка формы перед навешиванием обработчика submit
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log('Форма перехвачена, перезагрузка отменена');

      const formData = {
        name: form.name.value,
        phone: form.phone.value
      };

      try {
        const response = await fetch('https://api.web95.tech/api/v1/trips/buy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          alert('Заявка успешно отправлена!');
          if (modal) modal.style.display = 'none';
          form.reset();
        } else {
          throw new Error('Ошибка отправки заявки');
        }
      } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при отправке заявки. Попробуйте еще раз.');
      }
    });
  } else {
    console.warn('Форма bookingForm не найдена!');
  }
});
