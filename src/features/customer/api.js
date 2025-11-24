import http from '../../lib/http';

/**
 *订单的拉取和部分渲染
 * @param {*} opt 搜索数据
 * @returns
 */
export default async function customerApi(opt = {}) {
  const { search } = opt;
  const res = await http.get('/customers');
  let items = Array.isArray(res.data) ? res.data : [];
  const s = (search ?? '').toString().trim().toLowerCase();
  const sDigits = s.replace(/\D/g, '');
  if (s.length > 0) {
    items = items.filter((o) => {
      //filter name
      const cusName = (o?.name ?? '').toString().trim().toLowerCase();
      const nameOk = cusName.includes(s);
      //filter country
      const cusCountry = (o?.country ?? '').toString().trim().toLowerCase();
      const countryOk = cusCountry.includes(s);
      //filter createdAt
      const iso = (o?.createdAt ?? '').toString();
      const full = iso.toLowerCase();
      const date10 = iso.slice(0, 10).toLowerCase();
      const month = date10.slice(0, 7);
      const digits = date10.replace(/\D/g, '');
      const creatOK =
        full.includes(s) ||
        date10.includes(s) ||
        month.includes(s) ||
        (sDigits.length >= 4 && digits.includes(sDigits));

      return nameOk || countryOk || creatOK;
    });
  }
  return items;
}

export async function customerDetail(customerId) {
  const id =
    customerId && typeof customerId === 'object' ? customerId.id : customerId;
  const res = await http.get(`/customers/${id}`);
  return res.data;
}

export async function ordersApi(customerId) {
  const id =
    customerId && typeof customerId === 'object' ? customerId.id : customerId;
  if (!id) return [];
  const res = await http.get(`/orders`, { params: { customerId: id } });
  return res.data;
}

export async function createCustomer(payload) {
  const res = await http.post('/customers', payload);
  return res.data;
}

export async function fetchAllCustomers() {
  const res = await http.get('/customers');
  return Array.isArray(res.data) ? res.data : [];
}
