import { Card, Row, Col, Typography, List, Skeleton } from 'antd';
import { useKpi, useTopFiveProducts } from './hooks';

const { Title, Text } = Typography;

export default function KpiRow() {
  // 1）拿 KPI
  const { total, monthly, loading: kpiLoading } = useKpi();

  // 2）拿 Top5 商品
  const { items: topProducts = [], loading: topLoading } = useTopFiveProducts(
    5,
    'revenue'
  );

  // 计算最大营收，用来算进度条百分比
  const maxRevenue =
    topProducts.reduce((max, item) => Math.max(max, item?.revenue || 0), 0) ||
    1;

  // 为不同排名准备几种颜色
  const barColors = ['#3b82f6', '#22c55e', '#eab308', '#f97316', '#ef4444'];

  return (
    <Row gutter={[16, 16]} style={{ display: 'flex' }}>
      <Col span={12} style={{ display: 'flex' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            width: '100%',
          }}
        >
          <Card style={{ flex: 1 }}>
            <Text type="secondary">Total Revenue</Text>
            <Title level={3} style={{ marginTop: 8 }}>
              {kpiLoading ? <Skeleton.Input active /> : total.toFixed(2)}
            </Title>
          </Card>
          <Card style={{ flex: 1 }}>
            <Text type="secondary">Average Monthly Revenue</Text>
            <Title level={3} style={{ marginTop: 8 }}>
              {kpiLoading ? <Skeleton.Input active /> : monthly.toFixed(2)}
            </Title>
          </Card>
        </div>
      </Col>
      <Col span={12} style={{ display: 'flex' }}>
        <Card title="Top 5 Selling Products" style={{ flex: 1 }}>
          {topLoading ? (
            <Skeleton active paragraph={{ rows: 5 }} />
          ) : (
            <List
              dataSource={topProducts}
              size="small"
              renderItem={(item, index) => {
                const ratio =
                  maxRevenue > 0 ? (item.revenue || 0) / maxRevenue : 0;
                const width = `${Math.max(ratio * 100, 6)}%`; // 最小宽度防止太短

                return (
                  <List.Item style={{ paddingInline: 0 }}>
                    <div style={{ width: '100%' }}>
                      {/* 上半部分：缩略图 + 名称 + 金额 */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: 6,
                        }}
                      >
                        {/* 左侧图片 */}
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 8,
                            objectFit: 'cover',
                            marginRight: 10,
                          }}
                        />

                        {/* 名称 + 金额 */}
                        <div
                          style={{
                            flex: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                          }}
                        >
                          <Text strong>{item.name}</Text>
                          <Text strong>
                            {item.revenue != null
                              ? item.revenue.toFixed(2)
                              : '-'}
                          </Text>
                        </div>
                      </div>

                      {/* 下半部分：彩色进度条 */}
                      <div
                        style={{
                          height: 8,
                          borderRadius: 999,
                          background: '#e5e7eb',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width,
                            borderRadius: 999,
                            background: barColors[index % barColors.length],
                          }}
                        />
                      </div>
                    </div>
                  </List.Item>
                );
              }}
            />
          )}
        </Card>
      </Col>
    </Row>
  );
}
