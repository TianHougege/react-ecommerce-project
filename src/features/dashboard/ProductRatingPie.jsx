import * as echarts from 'echarts';
import { useRef, useEffect } from 'react';
import { Card } from 'antd';
import { useProductsRating } from './hooks';

export default function OrderStatusBar() {
  const doughnut = useRef(null);
  const { ratingData, loading } = useProductsRating();

  const COLORS = ['#0EA5E9', '#22C55E', '#F97316', '#EAB308', '#EF4444'];

  const doughnutArr = Array.from(ratingData.entries());

  const doughnutData = doughnutArr.map(([key, value]) => ({
    name: `${key} Stars`,
    value: value,
  }));

  const legendItems = doughnutData.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length],
  }));

  //total rating count
  const totalCount = doughnutArr.reduce((sum, [, value]) => sum + value, 0);

  //total weight
  const totalWeighted = doughnutArr.reduce(
    (sum, [key, value]) => sum + Number(key) * value,
    0
  );

  //average rating
  const avgRating = totalCount
    ? (totalWeighted / totalCount).toFixed(1)
    : '0.0';

  const option = {
    color: COLORS,
    tooltip: {
      trigger: 'item',
    },
    series: [
      {
        name: 'Product Rating',
        type: 'pie',
        radius: ['60%', '85%'],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: 'center',
          formatter: `{score|${avgRating}/5}\n{hint|Average rating}\n{count|${totalCount} ratings}`,
          rich: {
            score: {
              fontSize: 28,
              fontWeight: '600',
              lineHeight: 32,
            },
            hint: {
              fontSize: 12,
              color: '#6B7280',
              lineHeight: 18,
            },
            count: {
              fontSize: 12,
              color: '#9CA3AF',
              lineHeight: 18,
            },
          },
        },
        emphasis: {
          label: {
            show: false,
          },
        },
        labelLine: {
          show: false,
        },
        data: doughnutData,
      },
    ],
  };

  useEffect(() => {
    const myDoughnut = echarts.init(doughnut.current);
    myDoughnut.setOption(option);
    const handleResize = () => {
      myDoughnut.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      myDoughnut.dispose();
    };
  }, [option]);

  return (
    <>
      <Card
        title="Product Rating Statistics"
        style={{ height: 380 }} // 调整为和 Monthly Sales Trend 一样的高度
      >
        <div
          ref={doughnut}
          style={{
            width: '100%',
            height: 220, // 留出底部空间放 legend
          }}
        />
        <div
          style={{
            marginTop: 16,
            display: 'flex',
            flexWrap: 'wrap',
            rowGap: 8,
            columnGap: 16,
          }}
        >
          {legendItems.map((item) => (
            <div
              key={item.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: 12,
                color: '#4B5563',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 10,
                  height: 10,
                  borderRadius: 4,
                  backgroundColor: item.color,
                  marginRight: 6,
                }}
              />
              <span style={{ marginRight: 4 }}>{item.name}</span>
              <span style={{ color: '#9CA3AF' }}>({item.value})</span>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
