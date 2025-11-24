import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Card } from 'antd';
import { useMonthRevenue } from './hooks';
const MONTH_ABBR = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export default function MonthlySalesChart() {
  const getChart = useRef(null);

  const { monthData } = useMonthRevenue();

  const summaryArr = [...monthData.entries()];
  const monthKeys = summaryArr.map(([key]) => key);
  const revenue = summaryArr.map(([, v]) => Number(v.toFixed(2)));

  const alphabetMon = monthKeys.map((o) => {
    const mm = o.slice(5, 7);
    const index = Number(mm) - 1;
    return MONTH_ABBR[index] || o;
  });

  const { showRate, rateColor, lastRevenue } = rateNmuber(revenue);

  function rateNmuber() {
    const lastRevenue = revenue.length > 0 ? revenue[revenue.length - 1] : 0;
    const preRevenue = revenue.length > 1 ? revenue[revenue.length - 2] : null;

    let rate = 0;
    if ((preRevenue !== null) & (lastRevenue !== 0)) {
      rate = ((lastRevenue - preRevenue) / preRevenue) * 100;
    }

    const showRate = rate > 0 ? `+${rate.toFixed(2)}%` : `${rate.toFixed(2)}%`;
    const rateColor = rate > 0 ? '#16A34A' : rate < 0 ? '#DC2626' : '#6B7280';
    return {
      showRate,
      rateColor,
      lastRevenue,
    };
  }

  const option = {
    // 让图离边缘有点留白
    grid: {
      left: '3%',
      right: '3%',
      top: 30,
      bottom: 24,
      containLabel: true,
    },

    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line' },
    },

    xAxis: {
      type: 'category',
      boundaryGap: false, // 线从坐标轴起点开始
      data: alphabetMon,
      axisLine: { show: false }, // 不要 x 轴轴线
      axisTick: { show: false }, // 不要刻度小短线
      axisLabel: {
        color: '#9CA3AF', // 灰一点的文字
      },
    },

    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          color: '#E5E7EB', // 虚线网格
        },
      },
      axisLabel: {
        color: '#9CA3AF',
      },
    },

    series: [
      {
        type: 'line',
        data: revenue,
        smooth: true, // 平滑曲线
        showSymbol: false, // 去掉每个点的小圆点
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(79,70,229,0.35)' }, // 顶部颜色
            { offset: 1, color: 'rgba(79,70,229,0)' }, // 底部透明
          ]),
        },
        areaStyle: {
          // 简单版：用默认颜色 + 半透明即可，先这样
          opacity: 0.18,
        },
      },
    ],
  };

  useEffect(() => {
    const myChart = echarts.init(getChart.current);
    myChart.setOption(option);

    const handleResize = () => {
      myChart.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      myChart.dispose();
    };
  }, [option]);

  return (
    <>
      <Card style={{ height: 380 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, color: '#6B7280' }}>
            Monthly Sales Trend
          </div>
          <div style={{ fontSize: 28, fontWeight: 600 }}>
            ${lastRevenue}
            <span style={{ color: rateColor, marginLeft: 8, fontSize: 12 }}>
              {showRate}
            </span>
          </div>

          <div style={{ fontSize: 12, color: '#6B7280' }}>
            Last {revenue.length ? revenue.length : 0} Months
          </div>
        </div>

        <div ref={getChart} style={{ width: '100%', height: 260 }} />
      </Card>
    </>
  );
}
