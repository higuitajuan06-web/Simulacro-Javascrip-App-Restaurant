import { OrdersStore } from "../../js/orders-store.js";
import { fetchOrders } from "../../js/api-admin-order.js";

const tableBody = document.getElementById("ordersTableBody");

// Delegación de eventos (escala bien)
tableBody.addEventListener("click", (e) => {
  const row = e.target.closest("tr");
  if (!row) return;

  const orderId = row.dataset.id;
  const order = OrdersStore.selectOrder(orderId);

  renderOrderDetail(order);
});

function renderOrderDetail(order) {
  if (!order) return;

  document.getElementById("orderId").textContent = `#${order.id}`;
  document.getElementById("orderStatusBadge").textContent = order.estado;

  document.getElementById("customerName").textContent = order.user.nombre;
  document.getElementById("customerEmail").textContent = order.user.email;

  const itemsList = document.getElementById("orderItemsList");
  itemsList.innerHTML = "";

  order.items.forEach(item => {
    itemsList.innerHTML += `
      <li>
        ${item.qty}x ${item.name}
        <span>$${item.price.toFixed(2)}</span>
      </li>
    `;
  });

  document.getElementById("orderSubtotal").textContent = `$${order.subtotal}`;
  document.getElementById("orderTax").textContent = `$${order.tax}`;
  document.getElementById("orderTotal").textContent = `$${order.total}`;

  document.getElementById("orderStatusSelect").value = order.estado;
}

async function initDashboard() {
  try {
    const orders = await fetchOrders();
    OrdersStore.setOrders(orders);
    renderOrdersTable(orders);
  } catch (err) {
    console.error(err);
  }
}

initDashboard();

function renderOrdersTable(orders) {
  tableBody.innerHTML = "";

  orders.forEach(order => {
    tableBody.innerHTML += `
      <tr data-id="${order.id}">
        <td>#${order.id}</td>
        <td>${order.user.nombre}</td>
        <td>${formatDate(order.fecha)}</td>
        <td>
          <span class="status ${order.estado}">
            ${order.estado}
          </span>
        </td>
        <td>$${order.total.toFixed(2)}</td>
      </tr>
    `;
  });
}

function formatDate(date) {
  return new Date(date).toLocaleString();
}

