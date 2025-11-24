import http from '../../lib/http';

export async function createProducts(payload) {
  const res = await http.post('/products', payload);
  return res.data;
}
