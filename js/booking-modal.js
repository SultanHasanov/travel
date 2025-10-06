

// Функция для отправки заявки
async function sendFeedback(formData) {
  try {
    const response = await fetch('https://api.web95.tech/api/v1/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_name: formData.name,
        user_phone: formData.phone
      })
    });

    if (response.ok) {
      alert('Заявка успешно отправлена!');
      return true;
    } else {
      throw new Error('Ошибка отправки заявки');
    }
  } catch (error) {
    console.error('Ошибка:', error);
    alert('Произошла ошибка при отправке заявки. Попробуйте еще раз.');
    return false;
  }
}

// Обработчик для кнопки в секции contacts
document.addEventListener('DOMContentLoaded', function() {
  // Обработчик для кнопки в contacts form
  const contactsSubmitBtn = document.querySelector('.contacts__form-submit');
  if (contactsSubmitBtn) {
    contactsSubmitBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      const contactsForm = this.closest('.contacts__form');
      const nameInput = contactsForm.querySelector('#contacts_form_name_input');
      const phoneInput = contactsForm.querySelector('#contacts_form_phone_input');
      const agreementCheckbox = contactsForm.querySelector('#contacts_form_agreement_checkbox');
      
      // Проверка согласия на обработку данных
      if (!agreementCheckbox.checked) {
        alert('Необходимо согласие на обработку персональных данных');
        return;
      }
      
      const formData = {
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim()
      };
      
      // Валидация
      if (!formData.name || !formData.phone) {
        alert('Пожалуйста, заполните все поля');
        return;
      }
      
      sendFeedback(formData);
    });
  }

  // Обработчик для кнопки в consultation form
  const consultationSubmitBtn = document.querySelector('.consultation__inputs-button');
  if (consultationSubmitBtn) {
    consultationSubmitBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      const consultationForm = this.closest('.consultation__form');
      const nameInput = consultationForm.querySelector('#consultation_inputs_name');
      const phoneInput = consultationForm.querySelector('#consultation_inputs_phone');
      const agreementCheckbox = consultationForm.querySelector('#consultation_agreement_data_processing');
      
      // Проверка согласия на обработку данных
      if (!agreementCheckbox.checked) {
        alert('Необходимо согласие на обработку персональных данных');
        return;
      }
      
      const formData = {
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim()
      };
      
      // Валидация
      if (!formData.name || !formData.phone) {
        alert('Пожалуйста, заполните все поля');
        return;
      }
      
      sendFeedback(formData);
    });
  }
});

// Функция для базовой валидации телефона
function validatePhone(phone) {
  // Удаляем все нецифровые символы, кроме плюса
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  // Проверяем, что номер содержит от 10 до 15 цифр
  return cleanPhone.replace('+', '').length >= 10;
}

// Обновленная функция отправки с валидацией телефона
async function sendFeedback(formData) {
  // Валидация телефона
  if (!validatePhone(formData.phone)) {
    alert('Пожалуйста, введите корректный номер телефона');
    return false;
  }

  try {
    const response = await fetch('https://api.web95.tech/api/v1/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_name: formData.name,
        user_phone: formData.phone
      })
    });

    if (response.ok) {
      alert('Заявка успешно отправлена!');
      // Очистка формы после успешной отправки
      const activeForm = document.activeElement.closest('form');
      if (activeForm) activeForm.reset();
      return true;
    } else {
      throw new Error('Ошибка отправки заявки');
    }
  } catch (error) {
    console.error('Ошибка:', error);
    alert('Произошла ошибка при отправке заявки. Попробуйте еще раз.');
    return false;
  }
}