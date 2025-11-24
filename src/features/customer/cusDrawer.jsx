import {
  Drawer,
  Descriptions,
  Space,
  Typography,
  Tag,
  Divider,
  Table,
} from 'antd';
import { customerDetail, ordersApi } from './api';
import { useQuery } from '@tanstack/react-query';
import { getGenderMeta } from './gender';
import { useMemo } from 'react';

export default function customerDrawer({ open, onClose, selecteCus }) {
  const cusId = selecteCus?.id;

  const { data, error } = useQuery({
    queryKey: ['customer-detail', cusId],
    queryFn: () => customerDetail({ id: cusId }),
    enabled: open && !!cusId,
  });

  const { label: genderAlter, color } = getGenderMeta(data?.gender) || {};

  const { data: orders = [], isPending } = useQuery({
    queryKey: ['customer-orders', cusId],
    queryFn: () => ordersApi(cusId),
    enabled: open && !!cusId,
  });

  const cusOrders = useMemo(() => {
    return orders.map((o) => ({
      id: String(o.id),
      paymentmethod: o.paymentMethod,
      status: o.status,
      total: o.total,
      updatedat: o.updatedAt ?? null,
    }));
  }, [orders]);

  const statusColor = (s) =>
    ({
      paid: 'green',
      pending: 'gold',
      shipped: 'blue',
      cancelled: 'red',
      refunded: 'purple',
    }[s] || 'default');

  const titleNode = (
    <Space size={8} wrap>
      <Typography.Text strong>
        Customer Name: {data?.name ?? ''}
      </Typography.Text>
      {data ? (
        <Tag color={color} style={{ textTransform: 'capitalize' }}>
          {genderAlter}
        </Tag>
      ) : null}
    </Space>
  );

  const orderColumns = useMemo(
    () => [
      { title: 'ID', dataIndex: 'id', key: 'id', width: 90 },
      {
        title: 'PaymentMethod',
        dataIndex: 'paymentmethod',
        key: 'paymentmethod',
        width: 160,
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 90,
        render: (status) => {
          let color = statusColor(status);
          return (
            <Tag color={color} status={status}>
              {status}
            </Tag>
          );
        },
      },
      {
        title: 'Total',
        dataIndex: 'total',
        key: 'total',
        width: 160,
      },
      {
        title: 'UpdatedAt',
        dataIndex: 'updatedat',
        key: 'updatedat',
        width: 140,
      },
    ],
    [open]
  );

  return (
    <>
      <Drawer open={open} onClose={onClose} title={titleNode} width={800}>
        <Descriptions
          bordered
          size="small"
          column={2}
          labelStyle={{ width: 140 }}
        >
          <Descriptions.Item label="Customer">
            {data ? (
              <Space direction="vertical" size={0}>
                {data.name}
              </Space>
            ) : (
              <Typography.Text type="secondary">-</Typography.Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {data ? data.email : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Phone">
            {data ? data.phone : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Country">
            {data ? data.country : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="City">
            {data ? data.city : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="CreatedAt">
            {data ? data.createdAt : '-'}
          </Descriptions.Item>
        </Descriptions>

        <Divider>Orders</Divider>
        <Table columns={orderColumns} dataSource={cusOrders} />
      </Drawer>
    </>
  );
}
