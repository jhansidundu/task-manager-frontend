import { BASE_URL } from "./util/constants.js";
// Select all tabs and tab contents
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const loadingSpinner = document.querySelector('.loader-container')

// Add click event listener to each tab link
document.querySelectorAll('.tab-link').forEach(tabLink => {
  tabLink.addEventListener('click', () => {
    // Remove active class from all tab links
    document.querySelectorAll('.tab-link').forEach(link => {
      link.classList.remove('active');
    });
    // Add active class to clicked tab link
    tabLink.classList.add('active');
    // Hide all tab contents
    tabs.forEach(tab => {
      tab.classList.remove('active');
    });
    // Show the selected tab content
    const tabId = tabLink.getAttribute('data-tab');
    document.getElementById(tabId).classList.add('active');
  });
});

// Add submit event listener to login form
document.getElementById('login-form').addEventListener('submit', async (event) => {
  event.preventDefault(); // prevent default form submission
  const loginErrorMessage = document.getElementById('login-error-message')
  if (!loginErrorMessage.classList.contains('invisible')) {
    loginErrorMessage.classList.add('invisible')
  }
  const formData = new FormData(event.target); // get form data
  const email = formData.get('email');
  const password = formData.get('password');
  // validate email and password and perform login action
  try {
    const payload = { email, password }
    loadingSpinner.classList.remove('invisible')
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })
    loadingSpinner.classList.add('invisible')
    const responseBody = await response.json()
    if (responseBody.success) {
      localStorage.setItem("jwtToken", `token=${responseBody.data.token};expires=${new Date().getTime() + (3600 * 1000)}`)
      window.location.href = "home.html"
    } else {
      loginErrorMessage.classList.remove('invisible')
      loginErrorMessage.textContent = 'Invalid Username/Password'
    }
  } catch (err) {
    console.log(err)
  }
});

// Add submit event listener to signup form
document.getElementById('signup-form').addEventListener('submit', async (event) => {
  event.preventDefault(); // prevent default form submission

  const registerErrorMessage = document.getElementById('register-error-message')
  if (!registerErrorMessage.classList.contains('invisible')) {
    registerErrorMessage.classList.add('invisible')
    registerErrorMessage.textContent = ''
  }

  const formData = new FormData(event.target); // get form data
  const username = formData.get('username');
  const password = formData.get('password');
  const email = formData.get('email');
  // validate username, password, and confirmPassword and perform signup
  try {
    const payload = { username, password, email }
    loadingSpinner.classList.remove('invisible')
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    loadingSpinner.classList.add('invisible')
    const responseBody = await response.json()
    if (responseBody.success) {
      localStorage.setItem("jwtToken", `token=${responseBody.data.token};expires=${new Date().getTime() + (3600 * 1000)}`)
      window.location.href = "home.html"
    } else {
      registerErrorMessage.classList.remove('invisible')
      if (typeof responseBody.message === 'string') {
        registerErrorMessage.textContent = responseBody.message
      } else {
        registerErrorMessage.textContent = responseBody.message[0].message
      }
    }
  } catch (err) {
    console.log(err)
  }
}
);
