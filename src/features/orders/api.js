// src/features/orders/api.js
// 依赖你已有的 axios 实例：src/lib/http.js（baseURL: '/api'）
import http from '../../lib/http';

/**
 * 列表查询（分页 + 可选筛选/排序）
 * @param {Object} opts
 * @param {number} opts.page          // 页码(1-based)
 * @param {number} opts.limit         // 每页条数
 * @param {'pending'|'paid'|'shipped'|'cancelled'|'refunded'|undefined} [opts.status]
 * @param {number|undefined} [opts.customerId]
 * @param {string|undefined} [opts.paymentMethod]  // 'card'|'paypal'|'cod'
 * @param {string} [opts.sort='createdAt']         // 排序字段
 * @param {'asc'|'desc'} [opts.order='desc']       // 排序方向
 * @param {string|undefined} [opts.dateFrom]       // ISO，例如 '2025-08-01T00:00:00.000Z'（json-server 支持 *_gte/_lte）
 * @param {string|undefined} [opts.dateTo]         // ISO
 * @returns {Promise<{items: any[], total: number}>}
 */
export async function fetchOrders({
  page = 1,
  limit = 10,
  status,
  customerId,
  paymentMethod,
  sort = 'createdAt',
  order = 'desc',
  dateFrom,
  dateTo,
} = {}) {
  const params = {
    _page: page,
    _limit: limit,
    _sort: sort,
    _order: order,
  };
  if (status) params.status = status;
  if (customerId) params.customerId = customerId;
  if (paymentMethod) params.paymentMethod = paymentMethod;
  if (dateFrom) params.createdAt_gte = dateFrom; // json-server 支持 *_gte/_lte，ISO 字符串可比较
  if (dateTo) params.createdAt_lte = dateTo;

  const res = await http.get('/orders', { params });
  return {
    items: res.data,
    total: Number(res.headers['x-total-count'] || 0),
  };
}

/**
 * 单拉订单（如需确保新鲜）
 * @param {number} id
 * @returns {Promise<any>}
 */
export async function fetchOrder(id) {
  const res = await http.get(`/orders/${id}`);
  return res.data;
}

/**
 * 拉取订单明细（orderItems）
 * @param {number} orderId
 * @returns {Promise<any[]>}
 */
export async function fetchOrderItems(orderId) {
  const res = await http.get('/orderItems', { params: { orderId } });
  return res.data;
}

/**
 * 拉取客户信息
 * @param {number} customerId
 * @returns {Promise<any>}
 */
export async function fetchCustomer(customerId) {
  const res = await http.get(`/customers/${customerId}`);
  return res.data;
}

/**
 * 汇总详情：并行拉 items 与 customer，必要时可刷新 order 本体
 * @param {number|{id:number, customerId:number}} orderOrId
 * @param {Object} [opts]
 * @param {boolean} [opts.refreshOrder=false]  // 是否额外 GET /orders/:id
 * @returns {Promise<{order:any, items:any[], customer:any}>}
 */
export async function fetchOrderDetail(
  orderOrId,
  { refreshOrder = false } = {}
) {
  const base =
    typeof orderOrId === 'number' ? { id: orderOrId } : orderOrId || {};

  const [orderFresh, items, customer] = await Promise.all([
    refreshOrder ? fetchOrder(base.id) : Promise.resolve(base),
    fetchOrderItems(base.id),
    base.customerId ? fetchCustomer(base.customerId) : Promise.resolve(null),
  ]);

  return { order: orderFresh, items, customer };
}

/**
 * 更新订单状态（含最小校验）
 * @param {number} id
 * @param {'pending'|'paid'|'shipped'|'cancelled'|'refunded'} nextStatus
 * @returns {Promise<any>}
 */
export async function updateOrderStatus(id, nextStatus) {
  // 最小可用的“状态机”校验（前端兜底；页面里还会做按钮禁用控制）
  const allowed = {
    pending: ['paid', 'cancelled'],
    paid: ['shipped', 'refunded'],
    shipped: [],
    cancelled: [],
    refunded: [],
  };
  // 若不在允许列表里，直接抛错（也可以选择直接 PATCH，让服务端判定）
  // 这里走软校验：不阻止，但给出警告
  if (!allowed[await getCurrentStatus(id)]?.includes(nextStatus)) {
    console.warn(`Illegal transition attempted: ${id} → ${nextStatus}`);
  }
  const res = await http.patch(`/orders/${id}`, { status: nextStatus });
  return res.data;
}

/**（可选）读取当前状态，供前端校验/乐观更新前使用 */
async function getCurrentStatus(id) {
  const res = await http.get(`/orders/${id}`);
  return res.data?.status;
}

export async function createOrders() {
  const res = await http.post('/orders');
  return res.data;
}
