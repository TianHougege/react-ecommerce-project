import { Space, Table, Tag, Select } from 'antd';
import { useState, useMemo, useEffect } from 'react';
import { fetchOrdersAll } from './apis';
import { useQuery } from '@tanstack/react-query';

export default function ordersp() {
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: null });
  const statusList = ['paid', 'pending', 'shipped', 'cancelled', 'refunded'];

  const {
    data: apiData = [],
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ['all-orders'],
    queryFn: fetchOrdersAll,
  });

  const rawList = useMemo(() => {
    return apiData
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
      }));
  }, [apiData]);

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
    const dtf = iso
      ? Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Taipei',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
      : '-';
    return dtf.format(new Date(iso));
  };
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
  const handleOrder = useMemo(() => {});

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
              <Select
                style={{ width: '120px' }}
                defaultValue={' '}
                onChange={handleOrder}
                options={statusSelect}
              ></Select>
              <Tag>
                All Orders :{' '}
                <span style={{ marginLeft: 8 }}>{rawList.length}</span>
              </Tag>
            </Space>
          );
        }}
        rowKey="id"
        columns={columns}
        dataSource={chooseStatus}
        loading={isLoading || isFetching}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: rawList.length,
          pageSizeOptions: ['5', '10', '20', '30'],
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
    </>
  );
}
