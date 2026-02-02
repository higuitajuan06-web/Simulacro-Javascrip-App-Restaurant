// src/services/orders.api.js

const API_URL = "http://localhost:3000/pedido";

export async function fetchOrders() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error fetching orders");
  return res.json();
}
