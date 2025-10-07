import http from '../../lib/http';

export async function fetchOrdersAll() {
  const res = await http.get('/orders');
  return res.data;
}
