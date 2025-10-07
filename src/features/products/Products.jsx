import { useQuery } from '@tanstack/react-query';
import http from '../../lib/http';
import { Table, Typography, Input, Select, Checkbox, Space, Tag } from 'antd';
import { useState, useMemo, useCallback, useEffect } from 'react';

// --- simple debounce hook ---
function useDebounce(value, delay = 500) {
  const [v, setV] = useState(value);
  useEffect(() => {
    // If cleared (empty string/null/undefined), update immediately
    if (value === '' || value === null || value === undefined) {
      setV(value);
      return;
    }
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function Products() {
  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // sorting (server-side)
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  // search & filters (UI state)
  const [searchText, setSearchText] = useState(''); // Name / SKU only
  const [category, setCategory] = useState('');
  const [active, setActive] = useState(''); // '' | 'true' | 'false'
  const [lowStockOnly, setLowStockOnly] = useState(false); // stock < 10

  // debounce the free-text search
  const debouncedSearch = useDebounce(searchText, 600);

  // stable filter options for queryKey (do NOT pass q here)
  const queryOpts = useMemo(() => {
    return {
      // search term is used to decide client-side filtering logic
      search:
        (typeof debouncedSearch === 'string' && debouncedSearch.trim()) ||
        undefined,
      // filters passed to server
      category: category.trim() || undefined,
      // coerce to boolean to match json-server boolean field
      active:
        active === ''
          ? undefined
          : active === 'true'
          ? true
          : active === 'false'
          ? false
          : undefined,
      lowStock: !!lowStockOnly,
    };
  }, [debouncedSearch, category, active, lowStockOnly]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      'products',
      { page, pageSize, sortField, sortOrder, opts: queryOpts },
    ],
    queryFn: async ({ queryKey, signal }) => {
      const [_key, q] = queryKey;
      const { page, pageSize, sortField, sortOrder, opts } = q;
      const { search, category, active, lowStock } = opts;

      // Build base params for server filters/sort
      const baseParams = {
        _sort: sortField,
        _order: sortOrder,
        ...(category ? { category } : {}),
        ...(typeof active === 'boolean' ? { active } : {}),
        ...(lowStock ? { stock_lte: 9 } : {}),
      };

      // If there is a search term, fetch all matching by server filters,
      // then do Name/SKU OR filtering on the client, and paginate client-side.
      if (search) {
        const resAll = await http.get('/products', {
          signal,
          params: baseParams, // note: no _page/_limit when searching
        });
        const s = search.toLowerCase();
        const all = Array.isArray(resAll.data) ? resAll.data : [];
        const filtered = all.filter((item) => {
          const name = (item?.name ?? '').toString().toLowerCase();
          const sku = (item?.sku ?? '').toString().toLowerCase();
          return name.includes(s) || sku.includes(s);
        });
        const total = filtered.length;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const items = filtered.slice(start, end);
        return { items, total };
      }

      // No search term → keep server-side pagination for performance
      const res = await http.get('/products', {
        signal,
        params: {
          _page: page,
          _limit: pageSize,
          ...baseParams,
        },
      });
      // Prefer total from header (json-server) but some proxies strip it.
      let headerTotal =
        res?.headers?.['x-total-count'] ?? res?.headers?.['X-Total-Count'];
      let total = headerTotal !== undefined ? Number(headerTotal) : NaN;
      if (!Number.isFinite(total)) {
        // Fallback: fetch all with same filters (no pagination) and count length
        const resCount = await http.get('/products', {
          signal,
          params: { ...baseParams },
        });
        total = Array.isArray(resCount.data) ? resCount.data.length : 0;
      }
      return {
        items: res.data,
        total,
      };
    },
    keepPreviousData: true,
    staleTime: 30_000,
  });

  const onTableChange = useCallback(
    (p, _filters, sorter) => {
      // pagination
      if (p.pageSize !== pageSize) {
        setPageSize(p.pageSize);
        setPage(1);
      } else if (p.current !== page) {
        setPage(p.current);
      }

      // sorting (antd sorter.order is 'ascend' | 'descend' | undefined)
      if (sorter && sorter.field) {
        setSortField(sorter.field);
        setSortOrder(
          sorter.order === 'ascend'
            ? 'asc'
            : sorter.order === 'descend'
            ? 'desc'
            : 'desc'
        );
      }
    },
    [page, pageSize]
  );

  if (isLoading) return 'Loading...';
  if (isError) return 'Error fetching products';

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80, sorter: true },
    { title: 'Name', dataIndex: 'name', sorter: true },
    { title: 'SKU', dataIndex: 'sku', width: 140, sorter: true },
    {
      title: 'Category',
      dataIndex: 'category',
      width: 140,
      sorter: true,
      render: (c) => (c ? <Tag>{c}</Tag> : '-'),
    },
    {
      title: 'Active',
      dataIndex: 'active',
      width: 100,
      sorter: true,
      render: (v) => (v ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>),
    },
    { title: 'Price', dataIndex: 'price', width: 100, sorter: true },
    { title: 'Stock', dataIndex: 'stock', width: 100, sorter: true },
    { title: 'Created', dataIndex: 'createdAt', width: 180, sorter: true },
  ];

  return (
    <>
      <Space style={{ marginBottom: 12 }} wrap>
        <Input.Search
          placeholder="Search by name / SKU"
          allowClear
          value={searchText}
          onChange={(e) => {
            const val = e.target.value;
            setSearchText(val);
            setPage(1);
            if (val === '') {
              // force immediate reload of full list when cleared
              refetch();
            }
          }}
          style={{ width: 260 }}
        />
        <Input
          placeholder="Category"
          allowClear
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          style={{ width: 160 }}
        />
        <Select
          placeholder="Active"
          allowClear
          value={active === '' ? undefined : active}
          onChange={(val) => {
            setActive(val ?? '');
            setPage(1);
          }}
          options={[
            { label: 'Yes', value: 'true' },
            { label: 'No', value: 'false' },
          ]}
          style={{ width: 120 }}
        />
        <Checkbox
          checked={lowStockOnly}
          onChange={(e) => {
            setLowStockOnly(e.target.checked);
            setPage(1);
          }}
        >
          Stock &lt; 10
        </Checkbox>
      </Space>

      <Typography.Title level={4} style={{ marginBottom: 16 }}>
        Products (count: {data?.items?.length || 0} / total: {data?.total || 0})
      </Typography.Title>

      <Table
        rowKey="id"
        dataSource={data?.items || []}
        columns={columns}
        loading={isLoading}
        pagination={{
          current: page,
          pageSize,
          total: data?.total || 0,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50],
        }}
        onChange={onTableChange}
      />
    </>
  );
}
