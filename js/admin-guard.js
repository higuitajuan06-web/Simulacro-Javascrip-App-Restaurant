/**
 * ADMIN GUARD
 * ===========
 * Técnica:
 * - Verifica sesión
 * - Verifica rol
 *
 * Humano:
 * - Solo los admins pueden estar aquí
 */

const user = JSON.parse(localStorage.getItem("user"));

if (!user || user.role !== "admin") {
  window.location.href = "index.html";
}
