/**
 * AUTH.JS
 * -------
 * Maneja:
 * - Toggle login / registro
 * - Validación visual
 * - Registro (POST)
 * - Login (GET)
 * 
 */

const API_USERS = "http://localhost:3000/users";

/* =========================
   ELEMENTOS
========================= */

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

const registerName = document.getElementById("registerName");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");

const toggleText = document.getElementById("toggleText");
const subtitle = document.getElementById("formSubtitle");

/* =========================
   TOGGLE FORMULARIOS
========================= */

document.getElementById("showRegister").addEventListener("click", (e) => {
  e.preventDefault();

  loginForm.classList.add("d-none");
  registerForm.classList.remove("d-none");

  subtitle.textContent = "Create your account";
  toggleText.innerHTML = `
    Already have an account?
    <a href="#" id="showLogin">Sign in</a>
  `;

  document.getElementById("showLogin").addEventListener("click", showLoginForm);
});

function showLoginForm(e) {
  e.preventDefault();

  registerForm.classList.add("d-none");
  loginForm.classList.remove("d-none");

  subtitle.textContent = "Login to your account";
  toggleText.innerHTML = `
    Don't have an account?
    <a href="#" id="showRegister">Sign up</a>
  `;

  document.getElementById("showRegister").addEventListener("click", (e) => {
    e.preventDefault();
    location.reload();
  });
}

/* =========================
   LOGIN
========================= */

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!loginEmail.checkValidity() || !loginPassword.checkValidity()) {
    Swal.fire("Error", "Complete los campos", "error");
    return;
  }

  fetch(API_USERS)
    .then(res => res.json())
    .then(users => {
      const userFound = users.find(
        u => u.email === loginEmail.value && u.password === loginPassword.value
      );

      if (!userFound) {
        Swal.fire("Error", "Credenciales incorrectas", "error");
        return;
      }

      localStorage.setItem("user", JSON.stringify(userFound));

      Swal.fire("Bienvenido", "Inicio de sesión exitoso", "success")
        .then(() => {
          if (userFound.role === "admin") {
            window.location.href = "admin.html";
          } else {
            window.location.href = "menu.html";
          }
        });
    })
    .catch(() => {
      Swal.fire("Error", "No se pudo conectar al servidor", "error");
    });
});

/* =========================
   REGISTRO
========================= */

registerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!registerName.value || !registerEmail.value || !registerPassword.value) {
    Swal.fire("Error", "Todos los campos son obligatorios", "error");
    return;
  }

  const newUser = {
    nombre: registerName.value,
    email: registerEmail.value,
    password: registerPassword.value,
    role: "user"
  };

  fetch(API_USERS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newUser)
  })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(() => {
      Swal.fire("Registro exitoso", "Ahora puedes iniciar sesión", "success");
      registerForm.reset();
      showLoginForm(e);
    })
    .catch(() => {
      Swal.fire("Error", "No se pudo registrar el usuario", "error");
    });
});
