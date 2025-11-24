import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Drawer, Form, Input, Button, Select } from 'antd';
import { createCustomer, fetchAllCustomers } from './api';

export default function CreateCustomer({ open, onClose }) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['customers'],
    queryFn: fetchAllCustomers,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries(['customers']);
      form.resetFields();
      onClose();
    },
  });

  const handleFinish = (values) => {
    const customers = Array.isArray(data) ? data : [];
    const maxId = customers.reduce((max, o) => {
      const n = Number(o.id) || 0;
      return n > max ? n : max;
    }, 0);
    const newId = String(maxId + 1);
    const payload = {
      id: newId,
      ...values,
      createdAt: new Date().toISOString(),
    };
    mutate(payload);
  };

  return (
    <Drawer
      width={600}
      title="Add Customer"
      open={open}
      onClose={onClose}
      destroyOnHidden
    >
      <Form layout="vertical" form={form} onFinish={handleFinish}>
        {/* Name: 必填 */}
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please enter customer name' }]}
        >
          <Input placeholder="Customer name" />
        </Form.Item>

        {/* Email: 必填 + 邮箱格式 */}
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please enter email' },
            { type: 'email', message: 'Please enter a valid email address' },
          ]}
        >
          <Input placeholder="email@example.com" />
        </Form.Item>

        {/* Phone: 可选 */}
        <Form.Item name="phone" label="Phone">
          <Input placeholder="Phone number" />
        </Form.Item>

        {/* Country: 必填 */}
        <Form.Item
          name="country"
          label="Country"
          rules={[{ required: true, message: 'Please enter country' }]}
        >
          <Input placeholder="Country" />
        </Form.Item>

        {/* City: 可选 */}
        <Form.Item name="city" label="City">
          <Input placeholder="City" />
        </Form.Item>

        {/* Gender: 可选 */}
        <Form.Item name="gender" label="Gender">
          <Select
            allowClear
            placeholder="Select gender"
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'prefer_not_to_say', label: 'Prefer not to say' },
            ]}
          />
        </Form.Item>

        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isPending}>
              Save
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Drawer>
  );
}
