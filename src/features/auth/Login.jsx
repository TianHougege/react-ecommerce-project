import React from 'react';
import { Layout, Form, Input, Button, Typography, message } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import http from '../../lib/http';

const { Content } = Layout;
const TOKEN_KEY = 'token';

function setToken(t) {
  localStorage.setItem(TOKEN_KEY, t);
}

export default function Login() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = React.useState(false);

  const onFinish = async () => {
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      const { username, password } = values;

      // 调用 json-server：/users?username=xxx&password=yyy
      const res = await http.get('/users', { params: { username, password } });
      const users = Array.isArray(res.data) ? res.data : [];

      if (users.length > 0) {
        const user = users[0];
        setToken('demo-token'); // demo token；也可根据需要生成
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: user.id,
            username: user.username,
            role: user.role,
          })
        );
        message.success('Login successful');
        navigate('/dashboard', { replace: true });
      } else {
        message.error('Invalid credentials');
      }
    } catch (e) {
      if (e?.name !== 'Error') {
        message.error('Network error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div
          style={{
            width: 360,
            padding: 24,
            border: '1px solid #eee',
            borderRadius: 8,
            background: '#fff',
          }}
        >
          <Typography.Title
            level={3}
            style={{ textAlign: 'center', marginBottom: 24 }}
          >
            Admin Login
          </Typography.Title>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ username: '', password: '' }}
          >
            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, message: 'Please enter username' }]}
            >
              <Input placeholder="Enter username" autoComplete="username" />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please enter password' }]}
            >
              <Input.Password
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={submitting}
              >
                Login
              </Button>
            </Form.Item>
            <div style={{ textAlign: 'center' }}>
              No account? <Link to="/register">Register</Link>
            </div>
          </Form>
        </div>
      </Content>
    </Layout>
  );
}
