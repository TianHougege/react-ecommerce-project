import { Row, Col } from 'antd';
import KpiRow from './kpiRow';
import CustomerByCountry from './CustomerByCountry';
import MonthlySalesChart from './MonthlySalesChart';
import OrdersStatusBar from './OrderStatusBar';
import ProductRatingPie from './ProductRatingPie';

export default function DashboardPage() {
  return (
    <Row gutter={[16, 16]}>
      {/* Row 1: KPI + Top 5 (内部由 KpiRow 自己排版) */}
      <Col span={24}>
        <KpiRow />
      </Col>

      {/* Row 2: 月度销售趋势 + 评分环形图 */}
      <Col span={16}>
        <MonthlySalesChart />
      </Col>
      <Col span={8}>
        <ProductRatingPie />
      </Col>

      {/* Row 3: 订单状态统计 + 客户国家分布 */}
      <Col span={12}>
        <OrdersStatusBar />
      </Col>
      <Col span={12}>
        <CustomerByCountry />
      </Col>
    </Row>
  );
}
