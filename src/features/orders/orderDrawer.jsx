import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Drawer,
  Descriptions,
  Table,
  Typography,
  Tag,
  Space,
  Divider,
  Button,
} from 'antd';
import { fetchOrderDetail } from './api';

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

/**
 * 订单详情抽屉
 * @param {{
 *  open: boolean,
 *  onClose: () => void,
 *  order: any | null, // 从列表行传入的轻量订单（至少包含 id, customerId, status, total, currency, createdAt）
 * }} props
 */
export default function OrderDrawer({ open, onClose, order }) {
  const orderId = order?.id;

  // 打开时才请求：并行拉 items 与 customer（fetcher 内部已处理）
  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ['orders.detail', orderId],
    queryFn: () => fetchOrderDetail(order),
    enabled: open && !!orderId,
    staleTime: 30_000,
  });

  // 兜底：没有返回的字段用传入的 order 顶上
  const o = data?.order || order || {};
  const items = data?.items || [];
  const customer = data?.customer || null;

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
        render: (v) => fmtMoney(v, o.currency),
      },
      {
        title: 'Subtotal',
        key: 'subtotal',
        width: 160,
        render: (_, r) => fmtMoney((r.qty || 0) * (r.price || 0), o.currency),
      },
    ],
    [o.currency]
  );

  const titleNode = (
    <Space size={8} wrap>
      <Typography.Text strong>Order #{o?.id ?? ''}</Typography.Text>
      {o?.status ? (
        <Tag
          color={statusColor(o.status)}
          style={{ textTransform: 'capitalize' }}
        >
          {o.status}
        </Tag>
      ) : null}
      <Typography.Text type="secondary">
        {fmtDate(o?.createdAt)}
      </Typography.Text>
    </Space>
  );
  return (
    <Drawer
      title={titleNode}
      width={800}
      onClose={onClose}
      open={open}
      destroyOnClose
    >
      {/* 顶部要点信息 */}
      <Descriptions
        bordered
        size="small"
        column={2}
        labelStyle={{ width: 140 }}
      >
        <Descriptions.Item label="Customer">
          {customer ? (
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
        <Descriptions.Item label="Address">
          {customer
            ? `${customer.country || ''} ${customer.city || ''}`.trim() || '-'
            : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Payment">
          {o?.paymentMethod ? o.paymentMethod.toUpperCase() : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Currency">
          {o?.currency || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Subtotal">
          {fmtMoney(o?.subtotal, o?.currency)}
        </Descriptions.Item>
        <Descriptions.Item label="Tax">
          {fmtMoney(o?.tax, o?.currency)}
        </Descriptions.Item>
        <Descriptions.Item label="Shipping">
          {fmtMoney(o?.shipping, o?.currency)}
        </Descriptions.Item>
        <Descriptions.Item label="Total">
          <Typography.Text strong>
            {fmtMoney(o?.total, o?.currency)}
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

      {isError && (
        <Space style={{ marginTop: 16 }}>
          <Typography.Text type="danger">
            Failed to load details.
          </Typography.Text>
          <Button onClick={() => refetch()}>Retry</Button>
        </Space>
      )}
    </Drawer>
  );
}
