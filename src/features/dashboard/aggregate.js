//total summary
const Valid = new Set(['paid', 'shipped']);

export function filterValidOrders(orders, currency = 'ALL') {
  return orders.filter(
    (o) =>
      Valid.has(o.status) && (currency === 'ALL' || o.currency === currency)
  );
}

export function totalRevenue(orders) {
  return orders.reduce((s, o) => s + (o?.total ?? 0), 0);
}

export function avgMonthlyByActiveMonths(orders) {
  const byMonth = new Map();
  for (const o of orders) {
    const key = o?.createdAt.slice(0, 7);
    byMonth.set(key, (byMonth.get(key) ?? 0) + (o.total ?? 0));
  }
  const arr = [...byMonth.values()];
  if (!arr.length) return 0;
  return arr.reduce((s, o) => s + o, 0) / arr.length;
}

export function buildTopProducts(
  orderItems,
  products,
  metrics = 'revenue',
  limit
) {
  const map = new Map();

  for (const items of orderItems) {
    if (!items) continue;
    const pid = String(items.productId);
    const qty = Number(items.qty);
    const price = Number(items.price);
    const agg = map.get(pid) || { qty: 0, revenue: 0 };
    agg.qty += qty;
    agg.revenue += qty * price;
    map.set(pid, agg);
  }

  const prodMap = new Map();
  for (const p of products) {
    if (!p) continue;
    prodMap.set(String(p.id), p);
  }

  const arr = [...map.entries()].map(([productId, stats]) => {
    const p = prodMap.get(productId);
    return {
      productId,
      name: p?.name || `#${productId}`,
      qty: stats.qty,
      thumbnail: p?.thumbnail,
      revenue: stats.revenue,
    };
  });

  arr.sort((a, b) =>
    metrics === 'qty' ? b.qty - a.qty : b.revenue - a.revenue
  );

  return arr.slice(0, limit);
}

export function monthlyData(orders) {
  const map = new Map();

  for (const items of orders) {
    if (!items) continue;
    const month = String(items.createdAt.slice(0, 7));

    const prev = map.get(month) ?? 0;
    const cus = items.total ?? 0;
    map.set(month, prev + cus);
  }
  return map;
}

export function productsRating(products) {
  const map = new Map();

  for (const items of products) {
    if (!items) continue;
    const rating = Math.floor(Number(items.rating));
    const courts = map.get(rating) || 0;
    map.set(rating, courts + 1);
  }
  return map;
}

export function ordersStatus(orders) {
  const list = Array.isArray(orders) ? orders : [];
  const map = new Map();

  for (const items of list) {
    if (!items) continue;
    const status = String(items.status);
    const courts = map.get(status) || 0;
    map.set(status, courts + 1);
  }
  return map;
}

export function computeOrdersGrowth(orders) {
  const monthly = new Map();
  const list = Array.isArray(orders) ? orders : [];
  for (const items of list) {
    if (!items) continue;
    const month = items.createdAt.slice(0, 7);
    monthly.set(month, (monthly.get(month) ?? 0) + 1);
  }
  const arr = [...monthly.entries()].sort((a, b) => {
    a[0].localeCompare(b[0]);
  });
  if (arr.length < 2) return null;

  const [, currentCount] = arr[arr.length - 1];
  const [, prevCount] = arr[arr.length - 2];
  if (!prevCount) return null;
  return (currentCount - prevCount) / prevCount;
}

export function customerDistribution(customers) {
  const map = new Map();
  const list = Array.isArray(customers) ? customers : [];

  for (const cus of list) {
    if (!cus) continue;
    const country = cus.country;
    map.set(country, (map.get(country) ?? 0) + 1);
  }
  return map;
}
