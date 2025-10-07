import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Typography, Tag, Space } from 'antd';
import { fetchOrders } from './api';
import OrderDrawer from './orderDrawer';

// 小工具：格式化
const fmtDate = (iso) => new Date(iso).toLocaleString();
const fmtMoney = (n, c = 'USD') =>
  typeof n === 'number'
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: c }).format(
        n
      )
    : '-';

// 状态颜色
const statusColor = (s) =>
  ({
    pending: 'default',
    paid: 'processing',
    shipped: 'blue',
    cancelled: 'red',
    refunded: 'gold',
  }[s] || 'default');

export default function Orders() {
  // 分页状态
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // 拉列表（最小版：仅分页，默认按创建时间倒序）
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ['orders.list', page, pageSize],
    queryFn: () =>
      fetchOrders({ page, limit: pageSize, sort: 'createdAt', order: 'desc' }),
    keepPreviousData: true,
  });

  // 列定义（最小信息集）
  const columns = useMemo(
    () => [
      { title: 'ID', dataIndex: 'id', width: 90 },
      {
        title: 'Created',
        dataIndex: 'createdAt',
        width: 200,
        render: (v) => fmtDate(v),
      },
      {
        title: 'Customer',
        dataIndex: 'customerId',
        width: 120,
        render: (v) => (v ? `#${v}` : '-'),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        width: 140,
        render: (s) => (
          <Tag color={statusColor(s)} style={{ textTransform: 'capitalize' }}>
            {s}
          </Tag>
        ),
      },
      {
        title: 'Total',
        dataIndex: 'total',
        width: 140,
        render: (_, r) => fmtMoney(r.total, r.currency),
      },
    ],
    []
  );

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Typography.Title level={4} style={{ margin: 0 }}>
        Orders — page {page} / size {pageSize} (showing{' '}
        {data?.items?.length || 0} of {data?.total || 0})
      </Typography.Title>

      <Table
        rowKey="id"
        loading={isFetching || isLoading}
        dataSource={data?.items || []}
        columns={columns}
        onRow={(record) => ({
          onClick: () => {
            setSelectedOrder(record);
            setDrawerOpen(true);
          },
        })}
        pagination={{
          current: page,
          pageSize,
          total: data?.total || 0,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50],
        }}
        onChange={(p) => {
          if (p.pageSize !== pageSize) {
            setPageSize(p.pageSize);
            setPage(1);
          } else if (p.current !== page) {
            setPage(p.current);
          }
        }}
      />

      <OrderDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        order={selectedOrder}
      />

      {isError && 'Error fetching orders'}
    </Space>
  );
}
