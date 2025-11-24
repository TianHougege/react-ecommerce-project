import { Space, Table, Tag, Select, Input, Button } from 'antd';
import { useState, useMemo } from 'react';
import { fetchOrdersAll } from './apis';
import { useQuery } from '@tanstack/react-query';
import DrawerP from './drawerP';
import OrderCreateDrawer from './orderCreateDrawer';

export default function ordersp() {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: null });
  const statusList = ['paid', 'pending', 'shipped', 'cancelled', 'refunded'];
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(null);

  const {
    data: { items = [] } = {},
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['orders.list', search],
    queryFn: () => fetchOrdersAll({ search }),
  });
  const allTotal = items.length;

  const rawList = useMemo(() => {
    return items
      .filter((o) => o && o.id != null)
      .map((o) => ({
        id: String(o.id),
        createdAt: o.createdAt ?? null,
        status: String(o.status ?? '')
          .trim()
          .toLowerCase(),
        total: Number(o.total),
        currency: o.currency ?? 'USD',
        customerId: o.customerId ?? null,
        __raw: o,
      }));
  }, [items]);

  //filter status function
  const chooseStatus = useMemo(() => {
    if (!filters.status) return rawList;
    return rawList.filter((o) => o.status === filters.status);
  }, [rawList, filters.status]);

  //status amount count
  const statusObj = Object.fromEntries(statusList.map((s) => [s, 0]));

  const counts = useMemo(() => {
    const acc = { ...statusObj };
    for (let o of rawList) {
      const k = String(o.status ?? '')
        .trim()
        .toLowerCase();
      if (k in acc) {
        acc[k] += 1;
      }
    }
    return acc;
  }, [rawList]);

  //title color
  const statusColor = (s) =>
    ({
      paid: 'green',
      pending: 'gold',
      shipped: 'blue',
      cancelled: 'red',
      refunded: 'purple',
    }[s] || 'default');

  //time rule
  const fmtDate = (iso) => {
    if (!iso) return '-';
    const dtf = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return dtf.format(new Date(iso));
  };
  const totalVisible = chooseStatus.length;
  //total currency
  const fmtMoney = (total, currency, locale = 'en-US') => {
    const n = Number(total);
    if (!Number.isFinite(n)) return '-';
    const dtf = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return dtf.format(n);
  };

  //status list
  const statusSelect = statusList.map((o) => ({
    value: o,
    label: o,
  }));

  //choice status list
  const handleOrder = (val) => {
    setFilters((prev) => ({ ...prev, status: val || null }));
    setPage(1);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => fmtDate(createdAt),
    },
    {
      title: 'Customer',
      dataIndex: 'customerId',
      key: 'customer',
      render: (v) => (v ? `# ${v}` : '-'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = statusColor(status);
        return (
          <>
            <Tag color={color} key={status}>
              {status}
            </Tag>
          </>
        );
      },
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (value, record) => fmtMoney(value, record.currency),
    },
  ];

  return (
    <>
      <Table
        title={() => {
          return (
            <Space size="small" wrap>
              <Input.Search
                allowClear
                style={{ width: 260 }}
                placeholder="Search date / customer / currency"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onSearch={(val) => setSearch((val || '').trim())}
              />
              <Select
                style={{ width: '120px' }}
                allowClear
                value={filters.status ?? undefined}
                onChange={handleOrder}
                options={statusSelect}
                placeholder="STATUS"
              ></Select>
              <Tag>
                Orders Amount :{' '}
                <span style={{ marginLeft: 8 }}>{allTotal}</span>
              </Tag>
              <Button type="primary" onClick={() => setOpen(true)}>
                Add Orders
              </Button>
            </Space>
          );
        }}
        rowKey="id"
        columns={columns}
        dataSource={chooseStatus}
        loading={isLoading || isFetching}
        onRow={(record) => {
          return {
            onClick: () => {
              setSelectedOrder(record.__raw || record);
              setDrawerOpen(true);
            },
          };
        }}
        pagination={{
          current: page,
          pageSize: pageSize,
          pageSizeOptions: [5, 10, 20, 30],
          showSizeChanger: true,
        }}
        onChange={(p) => {
          if (p.pageSize !== pageSize) {
            setPageSize(p.pageSize);
            setPage(1);
          } else if (p.current !== page) {
            setPage(p.current);
          }
        }}
      ></Table>
      <DrawerP
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        orders={selectedOrder}
      />
      <OrderCreateDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
