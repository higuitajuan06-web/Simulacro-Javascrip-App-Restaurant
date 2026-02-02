/**
 * ===============================
 * USER GUARD
 * ===============================
 * Valida sesión y expone el usuario
 */

(() => {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    window.location.href = "login.html";
    return;
  }

  try {
    const parsedUser = JSON.parse(storedUser);

    // CLAVE
    window.user = {
      id: parsedUser.id,
      nombre: parsedUser.nombre,
      email: parsedUser.email,
      role: parsedUser.role
    };

  } catch (error) {
    console.error("Sesión corrupta");
    localStorage.removeItem("user");
    window.location.href = "login.html";
  }
})();
