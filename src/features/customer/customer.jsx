import React, { useEffect, useMemo, useState } from 'react';
import { Space, Table, Tag, Input, Select, Button, Form } from 'antd';
import customerApi from './api';
import { useQuery } from '@tanstack/react-query';
import CustomerDrawer from './cusDrawer';
import CreateCustomer from './CreateCustomer';

export default function Customer() {
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [open, setOpen] = useState(false);
  const [selecteCus, setSelectCust] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSearch(draft.trim()), 300);
    return () => {
      clearTimeout(t);
    };
  }, [draft]);

  const {
    isPending,
    error,
    data: customer = [],
  } = useQuery({
    queryKey: ['customer', search],
    queryFn: () => customerApi({ search }),
  });

  const cusList = useMemo(() => {
    return customer.map((o) => ({
      id: String(o.id),
      name: o.name,
      gender: o.gender,
      country: o.country,
      createdAt: o.createdAt ?? null,
    }));
  }, [customer]);

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

  //gender transform
  const GENDER_LABEL = {
    male: 'male',
    female: 'female',
    prefer_not_to_say: 'secret',
  };

  //gender color
  const statusColor = (s) =>
    ({
      male: 'blue',
      secret: 'gold',
      female: 'red',
    }[s] || 'default');

  const column = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      width: '6%',
    },
    {
      title: 'NAME',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      width: '28%',
      onCell: () => ({
        style: { whiteSpace: 'normal', wordBreak: 'break-word' },
      }),
    },
    {
      title: 'GENDER',
      dataIndex: 'gender',
      key: 'gender',
      align: 'center',
      width: '10%',
      render: (value) => {
        const key = value?.toLowerCase?.();
        const Label = GENDER_LABEL[key] ?? value ?? '-';
        const color = statusColor(Label);
        return <Tag color={color}>{Label}</Tag>;
      },
    },
    {
      title: 'COUNTRY',
      dataIndex: 'country',
      key: 'country',
      align: 'center',
      width: '36%',
      onCell: () => ({
        style: { whiteSpace: 'normal', wordBreak: 'break-word' },
      }),
    },
    {
      title: 'CREATED',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      width: '20%',
      render: (v) => fmtDate(v),
    },
  ];

  return (
    <>
      <Table
        title={() => {
          return (
            <Space size="small" wrap>
              <Input.Search
                style={{ width: 260 }}
                placeholder="Name/Country/Create"
                allowClear
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onSearch={(val) => {
                  setDraft(val);
                  setSearch((val || '').trim());
                }}
              ></Input.Search>
              <Button type="primary" onClick={() => setCreateOpen(true)}>
                Add Customer
              </Button>
            </Space>
          );
        }}
        columns={column}
        dataSource={cusList}
        tableLayout="fixed"
        onRow={(record) => {
          return {
            onClick: () => {
              setOpen(true);
              setSelectCust(record);
            },
          };
        }}
      />
      <CustomerDrawer
        open={open}
        onClose={() => setOpen(false)}
        selecteCus={selecteCus}
      />
      <CreateCustomer open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
