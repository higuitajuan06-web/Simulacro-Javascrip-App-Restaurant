/**
 * ROUTE GUARD
 * ===========
 * Técnica:
 * - Revisa localStorage
 * - Valida sesión
 * - Valida rol
 *
 * Humano:
 * - Evita que entren a páginas que no les corresponden
 */

const user = JSON.parse(localStorage.getItem("user"));

// Si NO hay sesión → fuera
if (!user) {
  window.location.href = "index.html";
}
