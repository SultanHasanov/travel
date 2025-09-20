const burgerBtn = document.getElementById("burgerBtn");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const sidebarClose = document.getElementById("sidebarClose");

function switchTab(tabName) {
  const tabs = document.querySelectorAll(".auth-tab");
  const authForm = document.querySelector(".auth-form");
  const title = document.querySelector(".auth-form__title");
  const subtitle = document.querySelector(".auth-form__subtitle");
  const submitBtn = document.querySelector(".form-submit");

  tabs.forEach((tab) => tab.classList.remove("active"));
  document
    .querySelector(`[onclick="switchTab('${tabName}')"]`)
    .classList.add("active");

  authForm.setAttribute("data-tab", tabName);

  if (tabName === "register") {
    title.textContent = "Создать аккаунт";
    subtitle.textContent = "Зарегистрируйтесь для доступа к личному кабинету";
    submitBtn.textContent = "Зарегистрироваться";
  } else {
    title.textContent = "Добро пожаловать";
    subtitle.textContent = "Войдите в свой личный кабинет";
    submitBtn.textContent = "Войти";
  }
}

function showAuthForm(type) {
  closeSidebar();
  switchTab(type);
}

function handleSubmit() {
  const form = document.querySelector('.auth-form');
  const inputs = form.querySelectorAll('input[required]');
  let allFilled = true;

  inputs.forEach(input => {
    if (!input.value.trim()) {
      allFilled = false;
      input.style.borderColor = 'red';
    } else {
      input.style.borderColor = 'rgba(255, 184, 0, 0.3)';
    }
  });

  if (!allFilled) {
    return;
  }

  const currentTab = form.getAttribute('data-tab');
  // Здесь будет ваша логика отправки формы
  console.log(`${currentTab === 'login' ? 'Вход' : 'Регистрация'} выполнен`);
}

// Toggle password visibility
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('password-toggle')) {
    const input = e.target.previousElementSibling;
    if (input.type === 'password') {
      input.type = 'text';
      e.target.textContent = '🔒';
    } else {
      input.type = 'password';
      e.target.textContent = '👁';
    }
  }
});

// Close sidebar on escape key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeSidebar();
  }
});

