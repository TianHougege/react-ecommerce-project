import { useQuery } from '@tanstack/react-query';
import {
  filterValidOrders,
  totalRevenue,
  avgMonthlyByActiveMonths,
  buildTopProducts,
  monthlyData,
  productsRating,
  ordersStatus,
  computeOrdersGrowth,
  customerDistribution,
} from './aggregate';
import {
  fetchOrders,
  fetchOrderItems,
  fetchProducts,
  fetchCustomers,
} from './api';

export function useKpi(currency = 'ALL') {
  const { data: orders = [], isPending } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });
  const valid = filterValidOrders(orders, currency);
  const aveMonthly = avgMonthlyByActiveMonths(valid);
  return {
    total: totalRevenue(valid),
    monthly: aveMonthly,
    loading: isPending,
  };
}

export function useTopFiveProducts(limit, metrics) {
  const { data: orderItems = [], isPending: pendingItems } = useQuery({
    queryKey: ['orderItems'],
    queryFn: fetchOrderItems,
  });

  const { data: products = [], isLoading: pendingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
  const loading = pendingItems || pendingProducts;
  const items = loading
    ? []
    : buildTopProducts(orderItems, products, metrics, limit);
  return { items, loading };
}

export function useMonthRevenue() {
  const {
    data: orders = [],
    isPending,
    isLoading,
  } = useQuery({
    queryKey: ['monthRevenue'],
    queryFn: fetchOrders,
  });

  const monthData = monthlyData(orders);

  return {
    monthData,
  };
}

export function useProductsRating() {
  const { data, isPending } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
  const products = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.data)
    ? data.data
    : [];
  const ratingData = productsRating(products);

  return {
    ratingData,
    loading: isPending,
  };
}

export function useOrdersStatus() {
  const { data, isLoading: loading } = useQuery({
    queryKey: ['ordersStatus'],
    queryFn: fetchOrders,
  });
  const orders = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
    ? data.items
    : [];

  const ordersStatusCourts = ordersStatus(orders);
  return {
    ordersStatusCourts,
    loading,
  };
}

export function useCoumputeMonthGrowth() {
  const { data } = useQuery({
    queryKey: ['monthGrowth'],
    queryFn: fetchOrders,
  });
  const MonthGrowth = computeOrdersGrowth(data);
  return MonthGrowth;
}

export function useCustomerDistribution() {
  const { data } = useQuery({
    queryKey: ['customerDistribution'],
    queryFn: fetchCustomers,
  });

  const cusDistibution = customerDistribution(data);
  return cusDistibution;
}
