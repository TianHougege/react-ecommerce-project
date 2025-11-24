import { Drawer, Form, Input, Button, InputNumber, Switch } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProducts } from './api';

export default function ProductCreateDrawer({ open, onClose }) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: createProducts,
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      form.resetFields();
      onClose();
    },
  });

  const handleFinish = (values) => {
    const payload = {
      ...values,
      price: Number(values.price) || 0,
      rating: Number(values.rating) || 0,
      createdAt: new Date().toISOString(),
    };
    mutate(payload);
  };

  return (
    <Drawer
      width={800}
      open={open}
      onClose={onClose}
      title="Add Product"
      destroyOnHidden
    >
      <Form form={form} onFinish={handleFinish} layout="vertical">
        {/* name: 必填，可重复 */}
        <Form.Item
          name="name"
          label="Product name"
          rules={[{ required: true, message: 'Please enter product name' }]}
        >
          <Input />
        </Form.Item>

        {/* sku: 必填，应唯一（暂时只做必填校验） */}
        <Form.Item
          name="sku"
          label="SKU"
          rules={[{ required: true, message: 'Please enter SKU' }]}
        >
          <Input />
        </Form.Item>

        {/* categoryId: 必填，这里先用数字输入，后面你可以换成下拉 */}
        <Form.Item
          name="categoryId"
          label="Category ID"
          rules={[{ required: true, message: 'Please enter category ID' }]}
        >
          <InputNumber style={{ width: '100%' }} min={1} />
        </Form.Item>

        {/* price: 必填 > 0，做一个简单的数字校验 */}
        <Form.Item
          name="price"
          label="Price"
          rules={[
            { required: true, message: 'Please enter price' },
            {
              validator: (_, value) => {
                if (value === undefined || value === null || value === '') {
                  return Promise.resolve();
                }
                const n = Number(value);
                if (Number.isNaN(n) || n <= 0) {
                  return Promise.reject(
                    new Error('Price must be a number greater than 0')
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>

        {/* cost: 可选，如果填了就要求 > 0 */}
        <Form.Item
          name="cost"
          label="Cost"
          rules={[
            {
              validator: (_, value) => {
                if (value === undefined || value === null || value === '') {
                  return Promise.resolve();
                }
                const n = Number(value);
                if (Number.isNaN(n) || n <= 0) {
                  return Promise.reject(
                    new Error('Cost must be a number greater than 0')
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>

        {/* stock: 必填 >= 0，这里简单要求必填 + 非负数 */}
        <Form.Item
          name="stock"
          label="Stock"
          rules={[{ required: true, message: 'Please enter stock' }]}
        >
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>

        {/* rating: 可选 0-5，这里简单要求 0-5 之间的数字 */}
        <Form.Item
          name="rating"
          label="Rating"
          rules={[
            {
              validator: (_, value) => {
                if (value === undefined || value === null || value === '') {
                  return Promise.resolve();
                }
                const n = Number(value);
                if (Number.isNaN(n) || n < 0 || n > 5) {
                  return Promise.reject(
                    new Error('Rating must be a number between 0 and 5')
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber style={{ width: '100%' }} min={0} max={5} step={0.1} />
        </Form.Item>

        {/* active: 必填（你可以自己决定默认 true/false），这里不做强校验，只给一个开关 */}
        <Form.Item name="active" label="Active" valuePropName="checked">
          <Switch />
        </Form.Item>

        {/* thumbnail: 可选，简单做一个 URL 校验 */}
        <Form.Item
          name="thumbnail"
          label="Thumbnail URL"
          rules={[
            {
              type: 'url',
              message: 'Please enter a valid URL',
            },
          ]}
        >
          <Input placeholder="https://..." />
        </Form.Item>

        <Form.Item>
          <Button htmlType="submit" type="primary" block>
            Save
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
}
