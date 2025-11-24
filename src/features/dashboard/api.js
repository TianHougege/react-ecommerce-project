// api.ts（Hint，签名/骨架）
import http from '../../lib/http';

export async function fetchOrders() {
  const res = await http.get('/orders');
  return Array.isArray(res.data) ? res.data : [];
}

export async function fetchProducts() {
  const res = await http.get('/products');
  return Array.isArray(res.data) ? res.data : [];
}

export async function fetchCustomers() {
  const res = await http.get('/customers');
  return Array.isArray(res.data) ? res.data : [];
}

export async function fetchOrderItems() {
  const res = await http.get('/orderItems');
  return Array.isArray(res.data) ? res.data : [];
}
