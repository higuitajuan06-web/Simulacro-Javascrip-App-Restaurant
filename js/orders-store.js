// src/store/orders.store.js

let orders = [];
let selectedOrder = null;

export const OrdersStore = {
  setOrders(data) {
    orders = data;
  },

  getOrders() {
    return orders;
  },

  selectOrder(orderId) {
    selectedOrder = orders.find(o => o.id === orderId);
    return selectedOrder;
  },

  getSelectedOrder() {
    return selectedOrder;
  }
};
    