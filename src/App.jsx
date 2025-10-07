import React from 'react';
import { Layout, Menu, Button, message, Dropdown, Avatar } from 'antd';
import { UserOutlined, LogoutOutlined, DownOutlined } from '@ant-design/icons';
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  Link,
  Outlet,
} from 'react-router-dom';
import Products from './features/products/Products.jsx';
import Dashboard from './features/dashboard/Dashboard.jsx';
import Login from './features/auth/Login.jsx';
import Register from './features/auth/Register.jsx';
import Orders from './features/orders/orders.jsx';
import Ordersp from './features/orders/ordersp.jsx';

const { Header, Sider, Content } = Layout;

// --- Auth Guard ---
function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// --- App Shell (layout only, NO <Routes> here) ---
function Shell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const username = user?.username || 'User';

  const menuItems = [
    { key: 'profile', label: 'My Profile', icon: <UserOutlined /> },
    { type: 'divider' },
    {
      key: 'logout',
      label: 'Login Out',
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  const selected = pathname.startsWith('/products')
    ? ['products']
    : pathname.startsWith('/dashboard')
    ? ['dashboard']
    : [];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div style={{ color: '#fff', padding: 16, fontWeight: 600 }}>Admin</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selected}
          items={[
            { key: 'dashboard', label: <Link to="/dashboard">Dashboard</Link> },
            { key: 'products', label: <Link to="/products">Products</Link> },
            { key: 'orders', label: <Link to="/orders">Orders</Link> },
            { key: 'ordersp', label: <Link to="/ordersp">Orders</Link> },
          ]}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
          }}
        >
          <span style={{ fontWeight: 600 }}>E-commerce Admin</span>
          <Dropdown
            menu={{
              items: menuItems,
              onClick: ({ key }) => {
                if (key === 'logout') {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  message.success('Logged out');
                  navigate('/login', { replace: true });
                }
                if (key === 'profile') {
                  message.info('个人信息：待接入');
                }
              },
            }}
            placement="bottomRight"
            trigger={['click']}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
              }}
            >
              <Avatar size="small" icon={<UserOutlined />} />
              <span>{username}</span>
              <DownOutlined />
            </div>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: 16,
            background: '#fff',
            padding: 16,
            borderRadius: 8,
          }}
        >
          {/* Render child routes here */}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected area: Shell + nested routes */}
      <Route
        element={
          <RequireAuth>
            <Shell />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        {/* Default redirect inside protected area */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/ordersp" element={<Ordersp />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<div>404</div>} />
    </Routes>
  );
}
