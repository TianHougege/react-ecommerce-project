import { Drawer } from 'antd';

export default function OrderCreateDrawer({ open, onClose }) {
  return (
    <>
      <Drawer width={800} onClose={onClose} open={open} destroyOnHidden>
        <div>It will be finished</div>
      </Drawer>
    </>
  );
}
