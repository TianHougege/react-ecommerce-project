import { Card } from 'antd';
import { useOrdersStatus, useCoumputeMonthGrowth } from './hooks';

// 颜色对象
const STATUS_META = {
  paid: {
    label: 'Paid',
    color: '#EAB308', // 原来 Processing 的黄
  },
  shipped: {
    label: 'Shipped',
    color: '#3B82F6', // 蓝
  },
  cancelled: {
    label: 'Cancelled',
    color: '#EF4444', // 红
  },
  refunded: {
    label: 'Refunded',
    color: '#22C55E', // 绿
  },
  pending: {
    label: 'Pending',
    color: '#A855F7', // 随便给个紫色
  },
};
export default function OrdersStatusBar() {
  const { ordersStatusCourts } = useOrdersStatus();
  const MonthGrowth = useCoumputeMonthGrowth();

  const entries = [...ordersStatusCourts.entries()];
  const summaryStatus = entries.map(([key, value]) => {
    const meta = STATUS_META[key] || { label: key, color: '#9CA3AF' };
    return {
      key,
      label: meta.label,
      color: meta.color,
      value,
    };
  });

  const totalOrders = summaryStatus.reduce((sum, item) => sum + item.value, 0);
  const maxCount = summaryStatus.reduce(
    (max, item) => (item.value > max ? item.value : max),
    0
  );

  const growthText =
    MonthGrowth == null
      ? '--'
      : `${MonthGrowth >= 0 ? '+' : ''}${(MonthGrowth * 100).toFixed(1)}%`;

  return (
    <Card title="Order Status Statistics" style={{ height: 360 }}>
      {/* 顶部文字区域 */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'baseline',
            gap: 8,
          }}
        >
          <span>{totalOrders}</span>
          <span style={{ fontSize: 18 }}>Orders</span>
          <span
            style={{
              fontSize: 14,
              color: '#16A34A',
            }}
          >
            {growthText}
          </span>
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 12,
            color: '#6B7280',
          }}
        >
          This Month
        </div>
      </div>

      {/* 底部四个状态柱子（静态骨架） */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'flex-end',
          height: 190,
          padding: '0 16px 12px',
        }}
      >
        {summaryStatus.map((item) => {
          const ratio = maxCount ? item.value / maxCount : 0;
          const barHeight = 40 + ratio * 80; // 最小 40，最大 120，先随便定一个范围

          return (
            <div
              key={item.key}
              style={{
                flex: '0 0 70px', // 固定每个柱子的占位宽度，让它们更紧凑
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 120,
                  borderRadius: 14,
                  backgroundColor: '#E5E7EB',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: barHeight,
                    backgroundColor: item.color,
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: '#4B5563',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
