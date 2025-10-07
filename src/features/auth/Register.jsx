import { Form, Input, Button, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import http from '../../lib/http';

const INVITE = (import.meta.env.VITE_INVITE_CODE || '').trim();

export default function Register() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ username, password, invite }) => {
      // 1) Validate invite code: prefer .env, fallback to /settings
      let expected = INVITE;
      if (!expected) {
        try {
          const s = await http.get('/settings');
          expected = (s?.data?.inviteCode || '').trim();
        } catch {}
      }
      if (!expected || invite !== expected) throw new Error('INVITE_INVALID');

      // 2) Username duplication check
      const existed = await http.get('/users', { params: { username } });
      if (Array.isArray(existed.data) && existed.data.length > 0) {
        throw new Error('USERNAME_TAKEN');
      }

      // 3) Create user (json-server will assign id)
      const res = await http.post('/users', {
        username,
        password,
        role: 'staff',
        createdAt: new Date().toISOString(),
      });
      return res.data;
    },
    onSuccess() {
      message.success('Registration successful. Please log in.');
      navigate('/login', { replace: true });
    },
    onError(err) {
      if (err?.message === 'INVITE_INVALID')
        message.error('Invalid invite code');
      else if (err?.message === 'USERNAME_TAKEN')
        message.error('Username already exists');
      else message.error('Network error');
    },
  });

  const onFinish = async () => {
    const { username, password, confirm, invite } = await form.validateFields();
    if (password !== confirm) return message.error('Passwords do not match');
    mutate({ username, password, invite });
  };

  return (
    <div
      style={{
        maxWidth: 380,
        margin: '64px auto',
        background: '#fff',
        padding: 24,
        borderRadius: 8,
      }}
    >
      <Typography.Title level={3} style={{ textAlign: 'center' }}>
        Sign Up
      </Typography.Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
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
            autoComplete="new-password"
          />
        </Form.Item>
        <Form.Item
          label="Confirm Password"
          name="confirm"
          rules={[{ required: true, message: 'Please confirm password' }]}
        >
          <Input.Password
            placeholder="Confirm password"
            autoComplete="new-password"
          />
        </Form.Item>
        <Form.Item
          label="Invite Code"
          name="invite"
          rules={[{ required: true, message: 'Please enter invite code' }]}
        >
          <Input placeholder="e.g. HELLO2025" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={isPending}>
            Sign Up
          </Button>
        </Form.Item>
        <div style={{ textAlign: 'center' }}>
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </Form>
    </div>
  );
}
