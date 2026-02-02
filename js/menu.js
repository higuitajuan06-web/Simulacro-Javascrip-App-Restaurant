/**
 * ===============================
 * USUARIO ACTIVO
 * ===============================
 * Técnica:
 * - Recuperamos sesión
 * Humano:
 * - Sabemos quién está haciendo el pedido
 */

const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  alert("Session expired. Please login again.");
  window.location.href = "index.html";
}

/**
 * ===============================
 * GUARDAR PEDIDO EN LOCALSTORAGE
 * ===============================
 * Técnica:
 * - Cada usuario tiene su propio historial
 * Humano:
 * - El pedido no se pierde nunca
 */

function saveOrderToLocalStorage(order) {
  const key = `orders_user_${user.id}`;

  // Traemos pedidos previos o array vacío
  const existingOrders = JSON.parse(localStorage.getItem(key)) || [];

  // Agregamos el nuevo pedido
  existingOrders.push(order);

  // Guardamos nuevamente
  localStorage.setItem(key, JSON.stringify(existingOrders));
}

document.addEventListener("DOMContentLoaded", function() {
    const btn = document.getElementById("btnHam");
    const menu = document.getElementById("navbarMenu");

    btn.addEventListener("click", function() {
      // Alternamos la clase 'show' que Bootstrap usa para mostrar el menú
      if (menu.classList.contains("show")) {
        menu.classList.remove("show");
      } else {
        menu.classList.add("show");
      }
    });
  });


/***********************
 * CONFIG & ESTADO
 ***********************/
const API_PRODUCTS = "http://localhost:3000/producto";

const productsContainer = document.getElementById("productsContainer");
const orderContainer = document.getElementById("cartItems");

let products = [];
let order = [];

/***********************
 * FETCH PRODUCTS
 ***********************/
fetch(API_PRODUCTS)
  .then(res => res.json())
  .then(data => {
    products = data;
    renderProducts(products);
  })
  .catch(err => console.error("Error cargando productos", err));

/***********************
 * RENDER MENU
 ***********************/
function createProductCard(product) {
  return `
    <div class="col">
      <div class="card h-100">
        <img src="${product.image}" class="card-img-top" alt="${product.name}">

        <div class="card-body">
          <h6 class="card-title">${product.name}</h6>
          <p class="fw-bold text-success">$${product.price}</p>
        </div>

        <div class="card-footer bg-transparent border-0">
          <button 
            class="btn btn-light w-100 add-to-order"
            data-id="${product.id}">
            🛒 Add to order
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderProducts(list) {
  productsContainer.innerHTML = "";

  list.forEach(product => {
    productsContainer.innerHTML += createProductCard(product);
  });

  document.querySelectorAll(".add-to-order").forEach(btn => {
    btn.addEventListener("click", handleAddToOrder);
  });
}

/***********************
 * ADD TO ORDER
 ***********************/
function handleAddToOrder(e) {
  const id = Number(e.target.dataset.id);
  const product = products.find(p => p.id === id);

  if (!product) return;

  const existingItem = order.find(item => item.id === id);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    order.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }

  renderOrder();
}

/***********************
 * RENDER ORDER (RIGHT)
 ***********************/
function renderOrder() {
  orderContainer.innerHTML = "";

  order.forEach(item => {
    orderContainer.innerHTML += `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <strong>${item.name}</strong><br>
          <small class="text-muted">$${item.price}</small>
        </div>

        <div class="d-flex align-items-center gap-2">
          <button 
            class="btn btn-sm btn-outline-secondary decrease"
            data-id="${item.id}">−</button>

          <span>${item.quantity}</span>

          <button 
            class="btn btn-sm btn-outline-secondary increase"
            data-id="${item.id}">+</button>
        </div>
      </div>
    `;
  });

  bindQuantityButtons();
}

/***********************
 * QUANTITY CONTROLS
 ***********************/
function bindQuantityButtons() {
  document.querySelectorAll(".increase").forEach(btn => {
    btn.addEventListener("click", increaseQty);
  });

  document.querySelectorAll(".decrease").forEach(btn => {
    btn.addEventListener("click", decreaseQty);
  });
}

function increaseQty(e) {
  const id = Number(e.target.dataset.id);
  const item = order.find(i => i.id === id);

  if (item) {
    item.quantity++;
    renderOrder();
  }
}

function decreaseQty(e) {
  const id = Number(e.target.dataset.id);
  const item = order.find(i => i.id === id);

  if (item && item.quantity > 1) {
    item.quantity--;
    renderOrder();
  }
}


function renderOrder() {
  orderContainer.innerHTML = "";

  order.forEach(item => {
    orderContainer.innerHTML += `
      <div class="d-flex justify-content-between align-items-center mb-3">
        
        <div>
          <strong>${item.name}</strong><br>
          <small class="text-muted">$${item.price}</small>
        </div>

        <div class="d-flex align-items-center gap-2">
          <button 
            class="btn btn-sm btn-outline-success decrease"
            data-id="${item.id}">−</button>

          <span>${item.quantity}</span>

          <button 
            class="btn btn-sm btn-outline-success increase"
            data-id="${item.id}">+</button>

          <!-- NUEVO: eliminar -->
          <button 
            class="btn btn-sm btn-outline-danger remove"
            data-id="${item.id}">🗑️</button>
        </div>

      </div>
    `;
  });

  bindQuantityButtons();
  bindRemoveButtons(); // 👈 nuevo
}

/*FUNCIÓN PARA ENLAZAR BOTONES ELIMINAR*/
function bindRemoveButtons() {
  document.querySelectorAll(".remove").forEach(btn => {
    btn.addEventListener("click", removeItem);
  });
}


/*FUNCIÓN ELIMINAR ITEM (EL CORAZÓN)*/
function removeItem(e) {
  const id = Number(e.target.dataset.id);

  // Eliminamos el item del pedido
  order = order.filter(item => item.id !== id);

  renderOrder();
}

/***********************
 * CÁLCULO DE TOTALES- PRODUCTOS
 ***********************/
const subtotalEl = document.getElementById("subtotal");
const taxEl = document.getElementById("tax");
const totalEl = document.getElementById("total");

/*FUNCION DE CALCULO (CLARO Y LIMPIO)*/
function calculateTotals() {
  let subtotal = 0;

  order.forEach(item => {
    subtotal += item.price * item.quantity;
  });

  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  // Mostrar en UI
  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  taxEl.textContent = `$${tax.toFixed(2)}`;
  totalEl.textContent = `$${total.toFixed(2)}`;
}

function renderOrder() {
  orderContainer.innerHTML = "";

  order.forEach(item => {
    orderContainer.innerHTML += `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <strong>${item.name}</strong><br>
          <small class="text-muted">$${item.price}</small>
        </div>

        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-secondary decrease" data-id="${item.id}">−</button>
          <span>${item.quantity}</span>
          <button class="btn btn-sm btn-outline-secondary increase" data-id="${item.id}">+</button>
          <button class="btn btn-sm btn-outline-danger remove" data-id="${item.id}">🗑️</button>
        </div>
      </div>
    `;
  });

  bindQuantityButtons();
  bindRemoveButtons();
  calculateTotals(); // 👈 aquí
}


const API_ORDERS = "http://localhost:3000/pedido";
const confirmBtn = document.getElementById("confirmOrder");

confirmBtn.addEventListener("click", confirmOrder);

/**
 * CONFIRMAR PEDIDO
 * ----------------
 * Técnica:
 * - Construye el pedido desde order[]
 * - Lo asocia al usuario logueado
 * - Hace POST a json-server
 *
 * Humano:
 * - El usuario confirma
 * - Recibe feedback claro
 * - El carrito se limpia
 */
function confirmOrder() {
  // 1. Validar carrito
  if (order.length === 0) {
    Swal.fire({
      icon: "warning",
      title: "Empty order",
      text: "Please add products before confirming"
    });
    return;
  }

  // 2. Mostrar confirmación ANTES del POST
  Swal.fire({
    icon: "question",
    title: "Confirm purchase",
    text: "Do you want to buy the selected products?",
    showCancelButton: true,
    confirmButtonText: "Yes, buy now",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#198754",
    cancelButtonColor: "#6c757d"
  }).then(result => {
    // 3. Si el usuario CANCELA → no pasa nada
    if (!result.isConfirmed) return;

    // 4. Usuario CONFIRMÓ → recién ahora construimos el pedido
    const user = JSON.parse(localStorage.getItem("user"));

    let subtotal = 0;
    order.forEach(item => {
      subtotal += item.price * item.quantity;
    });

    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    const newOrder = {
      userId: user.id,
      items: order.map(item => ({
        productId: item.id,
        nombre: item.name,
        precio: item.price,
        cantidad: item.quantity
      })),
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2)),
      estado: "pendiente",
      fecha: new Date().toISOString()
    };

    // 5. POST al backend
    fetch("http://localhost:3000/pedido", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newOrder)
    })
      .then(res => {
        if (!res.ok) throw new Error("Error saving order");
        return res.json();
      })
      .then(() => {
        // 6. Mensaje FINAL (ahora sí)
        Swal.fire({
          icon: "success",
          title: "Thank you for your order!",
          text: "Your food will be ready very soon 🍔",
          confirmButtonColor: "#198754"
        });

        // 7. Limpiar carrito
        order = [];
        renderOrder();
      })
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong. Please try again."
        });
      });
  });
}

