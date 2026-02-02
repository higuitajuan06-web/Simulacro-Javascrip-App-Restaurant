const btn = document.getElementById("btnHam");
const menu = document.getElementById("navbarMenu");

  btn.onclick = function() {
    menu.classList.toggle("show");
  };


/**
 * ===============================
 * LOGOUT CON CONFIRMACIÓN
 * ===============================
 * UX:
 * - Confirmación antes de salir
 * Técnica:
 * - Promesa (Swal)
 * - Limpieza total de sesión
 */

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    Swal.fire({
      title: "Log out",
      text: "Do you really want to leave?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, log out",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#198754",
      cancelButtonColor: "#6c757d"
    }).then(result => {
      if (result.isConfirmed) {
        //  Limpieza de sesión
        localStorage.removeItem("user");
        localStorage.removeItem("cart");

        // Feedback final
        Swal.fire({
          icon: "success",
          title: "Session closed",
          text: "See you soon 👋",
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          window.location.href = "index.html";
        });
      }
    });
  });
}

/**
 * ===============================
 * MY ORDERS – BASE ESTABLE
 * ===============================
 * Requiere:
 * - user-guard.js → window.user
 */

(() => {
  if (!window.user || !window.user.id) {
    console.error("Usuario no autenticado");
    return;
  }

  /**
   * ENDPOINT
   */
  const API_ORDERS = `http://localhost:3000/pedido?userId=${user.id}`;

  /**
   * DOM
   */
  const ordersContainer = document.getElementById("ordersContainer");
  const totalOrdersEl = document.getElementById("totalOrders");
  const userNameEl = document.getElementById("userName");
  const userEmailEl = document.getElementById("userEmail");

  // UI usuario
  userNameEl.textContent = user.nombre;
  userEmailEl.textContent = user.email;

  /**
   * MAPA UX POR ESTADO
   * (admin controla el estado)
   */
  const ORDER_STATUS_UI = {
    pendiente: {
      icon: "bi-hourglass-split",
      text: "Your order has been received",
      class: "status-pending",
      cancellable: true
    },
    preparando: {
      icon: "bi-egg-fried",
      text: "Your order is being prepared",
      class: "status-prepared",
      cancellable: false
    },
    entregado: {
      icon: "bi-check-circle",
      text: "Your order was delivered",
      class: "status-delivered",
      cancellable: false
    },
    cancelado: {
      icon: "bi-x-circle",
      text: "Your order was cancelled",
      class: "status-cancelled",
      cancellable: false
    }
  };

  /**
   * FETCH ORDERS
   */
  fetch(API_ORDERS)
    .then(res => {
      if (!res.ok) throw new Error("Error HTTP");
      return res.json();
    })
    .then(orders => {
      renderOrders(orders);
      totalOrdersEl.textContent = orders.length;
    })
    .catch(err => {
      console.error(err);
      ordersContainer.innerHTML =
        `<p class="text-danger">Error loading orders.</p>`;
    });

  /**
   * RENDER LISTA
   */
  function renderOrders(orders) {
    ordersContainer.innerHTML = "";

    if (!orders.length) {
      ordersContainer.innerHTML =
        `<p class="text-muted">You don’t have any orders yet.</p>`;
      return;
    }

    orders.forEach(order => {
      ordersContainer.innerHTML += createOrderCard(order);
    });

    bindOrderActions();
  }

  /**
   * CARD
   */
  function createOrderCard(order) {
    const statusUI = ORDER_STATUS_UI[order.estado];

    return `
      <div class="order-card">

        <div class="order-header">
          <div>
            <h6 class="order-id">
              <i class="bi bi-bag"></i> Order #${order.id}
            </h6>
            <span class="order-date">
              ${formatDate(order.fecha)}
            </span>
          </div>

          <span class="order-status ${statusUI.class}">
            <i class="bi ${statusUI.icon}"></i>
            ${order.estado}
          </span>
        </div>

        <p class="order-text mt-2">${statusUI.text}</p>

        <div class="order-footer d-flex justify-content-between align-items-center">
          <span class="order-total">$${order.total.toFixed(2)}</span>

          <div class="order-actions">
            ${
              statusUI.cancellable
                ? `<button class="btn btn-sm btn-outline-danger cancel-order"
                     data-id="${order.id}">
                     Cancel
                   </button>`
                : ""
            }

            <button class="btn btn-sm btn-outline-success reorder"
              data-id="${order.id}">
              Reorder
            </button>
          </div>
        </div>

      </div>
    `;
  }

  /**
   * EVENTOS
   */
  function bindOrderActions() {
    document.querySelectorAll(".cancel-order")
      .forEach(btn =>
        btn.addEventListener("click", cancelOrder)
      );

    document.querySelectorAll(".reorder")
      .forEach(btn =>
        btn.addEventListener("click", reorder)
      );
  }

  /**
   * 1️⃣ CANCELAR PEDIDO (solo pendiente)
   */
  function cancelOrder(e) {
  const orderId = e.target.dataset.id;

  Swal.fire({
    title: "Cancel order?",
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, cancel it",
    cancelButtonText: "Keep order",
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d"
  }).then(result => {
    if (!result.isConfirmed) return;

    // PATCH solo si confirma
    fetch(`http://localhost:3000/pedido/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        estado: "cancelado",
        cancelledBy: {
          userId: user.id,
          email: user.email,
          date: new Date().toISOString()
        }
      })
    })
      .then(res => {
        if (!res.ok) throw new Error("Error cancelling order");
        return res.json();
      })
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Order cancelled",
          text: "Your order has been cancelled successfully.",
          timer: 1500,
          showConfirmButton: false
        });

        // Refrescar pedidos SIN recargar página
        refreshOrders();
      })
      .catch(err => {
        console.error(err);
        Swal.fire("Error", "Could not cancel order.", "error");
      });
  });
}

function refreshOrders() {
  fetch(API_ORDERS)
    .then(res => res.json())
    .then(orders => {
      renderOrders(orders);
      totalOrdersEl.textContent = orders.length;
    });
}


  /**
   * 2️⃣ REORDER (copiar items al carrito)
   */
  function reorder(e) {
    const orderId = e.target.dataset.id;

    fetch(`http://localhost:3000/pedido/${orderId}`)
      .then(res => res.json())
      .then(order => {
        localStorage.setItem("cart", JSON.stringify(order.items));
        window.location.href = "menu.html";
      });
  }

  /**
   * HELPERS
   */
  function formatDate(value) {
    const date = new Date(value);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

})();

