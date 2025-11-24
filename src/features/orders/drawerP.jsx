import { useQuery } from '@tanstack/react-query';
import {
  Drawer,
  Descriptions,
  Space,
  Typography,
  Tag,
  Divider,
  Table,
} from 'antd';
import { fetchOrderDetail } from './apis';
import { useMemo, useEffect } from 'react';

// 小工具：格式化
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleString() : '-');
const fmtMoney = (n, c = 'USD') =>
  typeof n === 'number'
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: c }).format(
        n
      )
    : '-';
const statusColor = (s) =>
  ({
    pending: 'default',
    paid: 'processing',
    shipped: 'blue',
    cancelled: 'red',
    refunded: 'gold',
  }[s] || 'default');

export default function DrawerP({ open, onClose, orders }) {
  const orderId = orders?.id;

  const { data, isFetching, isLoading, error, refresh } = useQuery({
    queryKey: ['order.detail', orderId],
    enabled: Boolean(orderId && open),
    queryFn: ({ signal }) =>
      fetchOrderDetail(orderId, { refreshOrder: true, signal }),
  });

  const { customer = null, items = [], order: detailOrder } = data ? data : {};
  const o = detailOrder || orders || {};
  const currency = o.currency;

  const itemColumns = useMemo(
    () => [
      { title: 'Product', dataIndex: 'name', key: 'name' },
      { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 160 },
      { title: 'Qty', dataIndex: 'qty', key: 'qty', width: 90 },
      {
        title: 'Price',
        dataIndex: 'price',
        key: 'price',
        width: 140,
        render: (v) => fmtMoney(v, currency),
      },
      {
        title: 'Subtotal',
        key: 'subtotal',
        width: 160,
        render: (_, r) => fmtMoney((r.qty || 0) * (r.price || 0), currency),
      },
    ],
    [currency]
  );

  const titleNode = (
    <Space size={8} wrap>
      <Typography.Text strong>Order: # {orders?.customerId}</Typography.Text>
      <Tag
        color={statusColor(orders?.status)}
        style={{ textTransform: 'capitalize' }}
      >
        {orders?.status}
      </Tag>
      <Typography.Text type="secondary">
        {fmtDate(orders?.createdAt)}
      </Typography.Text>
    </Space>
  );

  return (
    <>
      <Drawer
        width={800}
        open={open}
        onClose={onClose}
        title={titleNode}
        destroyOnHidden
      >
        {/* 顶部要点信息 */}
        <Descriptions bordered size="small" column={2} styles={{ width: 140 }}>
          <Descriptions.Item label="customer">
            {data ? (
              <Space direction="vertical" size={0}>
                <span>{customer.name}</span>
                <Typography.Text type="secondary">
                  {customer.email}
                </Typography.Text>
                <Typography.Text type="secondary">
                  {customer.phone}
                </Typography.Text>
              </Space>
            ) : (
              <Typography.Text type="secondary">-</Typography.Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="address">
            {customer
              ? `${customer.country || ''} ${customer.city || ''}`
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="payment">
            {orders ? orders?.paymentMethod : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Currency">
            {orders?.currency || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Subtotal">
            {fmtMoney(orders?.subtotal, orders?.currency)}
          </Descriptions.Item>
          <Descriptions.Item label="Tax">
            {fmtMoney(orders?.tax, orders?.currency)}
          </Descriptions.Item>
          <Descriptions.Item label="Shipping">
            {fmtMoney(orders?.shipping, orders?.currency)}
          </Descriptions.Item>
          <Descriptions.Item label="Total">
            <Typography.Text strong>
              {fmtMoney(orders?.total, orders?.currency)}
            </Typography.Text>
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left" style={{ marginTop: 24 }}>
          Items
        </Divider>

        <Table
          rowKey="id"
          loading={isFetching || isLoading}
          dataSource={items}
          columns={itemColumns}
          pagination={false}
          size="small"
        />
      </Drawer>
    </>
  );
}
