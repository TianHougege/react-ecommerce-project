import http from '../../lib/http';

/**
 * 拉取订单信息
 * @param {Object} opt
 * @returns
 */
export async function fetchOrdersAll(opt = {}) {
  const { search } = opt;
  const params = { _expand: 'customer' };
  const res = await http.get('/orders', { params });
  let items = Array.isArray(res.data) ? res.data : [];
  if (search && String(search).trim()) {
    const s = String(search).trim().toLowerCase();
    items = items.filter((o) => {
      const createdStr = String(o.createdAt ?? '');
      const createdShort = createdStr.slice(0, 10);
      const createdOk =
        createdStr.toLowerCase().includes(s) ||
        createdShort.toLowerCase().includes(s);

      const custName = (o.customer?.name || o.customerName || '')
        .toString()
        .toLowerCase();
      const custIdStr = String(o.customerId ?? '');
      const custOk = custName.includes(s) || custIdStr.includes(s);

      const currencyOk = String(o.currency ?? '')
        .toLowerCase()
        .includes(s);

      return createdOk || custOk || currencyOk;
    });
  }

  return {
    items,
  };
}

/**
 *为抽屉服务的订单拉取数据
 * @param {*} id 订单ID
 * @param {*} param1
 * @returns
 */
export async function fetchOrders(id, { signal } = {}) {
  const res = await http.get(`/orders/${id}`, { signal });
  return res.data;
}

/**
 *拉取客户信息
 * @param {Number} id
 * @param {Object} param1
 * @returns
 */
export async function fetchCustomer(id, { signal } = {}) {
  const res = await http.get(`/customers/${id}`, { signal });
  return res.data;
}

/**
 * 拉取订单详情信息
 * @param {Number} orderId
 * @returns
 */
export async function fetchCustomerItems(orderId) {
  const res = await http.get('/orderItems', { params: { orderId } });
  return res.data;
}

export async function fetchOrderDetail(orderId, { refreshOrder = false } = {}) {
  const base =
    typeof orderId === 'number' || typeof orderId === 'string'
      ? { id: orderId }
      : orderId || {};

  const order = refreshOrder ? await fetchOrders(base.id) : base;

  const [items, customer] = await Promise.all([
    fetchCustomerItems(base.id),
    order.customerId ? fetchCustomer(order.customerId) : Promise.resolve(null),
  ]);
  return { order, items, customer };
}
