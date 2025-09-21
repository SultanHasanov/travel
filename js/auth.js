// Константы API
const API_BASE = "http://212.193.51.76:8080/api/v1";
const REGISTER_URL = `${API_BASE}/auth/register`;
const LOGIN_URL = `${API_BASE}/auth/login`;

// Элементы DOM
const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");

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

  // Очистка сообщений при переключении вкладок
  hideMessages();
}

function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const toggle = input.nextElementSibling;

  if (input.type === "password") {
    input.type = "text";
    toggle.textContent = "🔒";
  } else {
    input.type = "password";
    toggle.textContent = "👁";
  }
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = "block";
  successMessage.style.display = "none";
}

function showSuccess(message) {
  successMessage.textContent = message;
  successMessage.style.display = "block";
  errorMessage.style.display = "none";
}

function hideMessages() {
  errorMessage.style.display = "none";
  successMessage.style.display = "none";
}

function setLoading(state) {
  const form = document.querySelector(".auth-form");
  const submitBtn = document.querySelector(".form-submit");

  if (state) {
    form.classList.add("loading");
    submitBtn.textContent = "Загрузка...";
    submitBtn.disabled = true;
  } else {
    form.classList.remove("loading");
    const currentTab = form.getAttribute("data-tab");
    submitBtn.textContent =
      currentTab === "login" ? "Войти" : "Зарегистрироваться";
    submitBtn.disabled = false;
  }
}

function validateForm() {
  const form = document.querySelector(".auth-form");
  const currentTab = form.getAttribute("data-tab");
  let isValid = true;

  // Очистка предыдущих ошибок
  const inputs = form.querySelectorAll("input");
  inputs.forEach((input) => {
    input.style.borderColor = "rgba(255, 184, 0, 0.3)";
  });

  // Проверка email
  const emailInput = document.getElementById(
    currentTab === "login" ? "loginEmail" : "loginEmail"
  );
  const email = emailInput.value.trim();
  if (!email) {
    emailInput.style.borderColor = "red";
    showError("Email обязателен для заполнения");
    isValid = false;
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    emailInput.style.borderColor = "red";
    showError("Введите корректный email");
    isValid = false;
  }

  // Проверка пароля
  const passwordInput = document.getElementById(
    currentTab === "login" ? "loginPassword" : "loginPassword"
  );
  const password = passwordInput.value.trim();
  if (!password) {
    passwordInput.style.borderColor = "red";
    showError("Пароль обязателен для заполнения");
    isValid = false;
  } else if (password.length < 6) {
    passwordInput.style.borderColor = "red";
    showError("Пароль должен содержать минимум 6 символов");
    isValid = false;
  }

  // Для регистрации проверяем имя
  if (currentTab === "register") {
    const nameInput = document.getElementById("registerName");
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.style.borderColor = "red";
      showError("Имя обязательно для заполнения");
      isValid = false;
    }

    // Проверка соглашения
    const agreementCheckbox = document.getElementById("agreement");
    if (!agreementCheckbox.checked) {
      showError("Необходимо принять условия пользовательского соглашения");
      isValid = false;
    }
  }

  return isValid;
}

async function handleRegister() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const full_name = document.getElementById("registerName").value.trim();

  try {
    const response = await fetch(REGISTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        full_name,
        password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      showSuccess("Регистрация прошла успешно! Теперь вы можете войти.");
      // Переключаем на вкладку входа после успешной регистрации
      setTimeout(() => switchTab("login"), 2000);
    } else {
      showError(data.message || "Ошибка при регистрации");
    }
  } catch (error) {
    showError("Ошибка сети. Проверьте подключение к интернету.");
  }
}

async function handleLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    const response = await fetch(LOGIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Сохраняем токен в localStorage
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userEmail", email);

      showSuccess("Вход выполнен успешно!");

      // Перенаправляем на главную страницу или личный кабинет
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } else {
      showError(data.message || "Ошибка при входе");
    }
  } catch (error) {
    showError("Ошибка сети. Проверьте подключение к интернету.");
  }
}

async function handleSubmit() {
  hideMessages();

  if (!validateForm()) {
    return;
  }

  setLoading(true);

  const currentTab = document
    .querySelector(".auth-form")
    .getAttribute("data-tab");

  if (currentTab === "register") {
    await handleRegister();
  } else {
    await handleLogin();
  }

  setLoading(false);
}

// Проверяем, авторизован ли пользователь при загрузке страницы
function checkAuth() {
  const token = localStorage.getItem("authToken");
  if (token) {
    // Если пользователь уже авторизован, перенаправляем
    window.location.href = "/";
  }
}

// Инициализация
document.addEventListener("DOMContentLoaded", function () {
  checkAuth();

  // Обработка нажатия Enter в формах
  document.querySelectorAll(".form-input").forEach((input) => {
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        handleSubmit();
      }
    });
  });
});
