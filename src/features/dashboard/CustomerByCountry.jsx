import { useCustomerDistribution } from './hooks';
import { COUNTRY_TO_CONTINENT } from './countryContinentMap';
import { Card } from 'antd';
import { useRef, useEffect } from 'react';
import * as echarts from 'echarts';

export default function CustomerByCountry() {
  const cusDistribution = useCustomerDistribution();
  const getChart = useRef(null);

  const countryArr = [...cusDistribution.entries()];

  const continentMap = new Map();
  for (const [country, count] of countryArr) {
    const continent = COUNTRY_TO_CONTINENT[country] || 'others';
    const prev = continentMap.get(continent) ?? 0;
    continentMap.set(continent, prev + count);
  }

  const continentCount = [...continentMap.values()];
  const continentName = [...continentMap.keys()];

  const sumCustomer = countryArr.reduce((sum, [, count]) => {
    return sum + count;
  }, 0);

  const realMax = Math.max(...continentCount);
  const bgData = continentCount.map(() => realMax);
  const fgData = continentCount.map((v) => v * 0.9);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        // Use axis to trigger tooltip
        type: 'shadow', // 'shadow' as default; can also be 'line' or 'shadow'
      },
    },
    legend: { show: false },
    grid: {
      top: 5,
      bottom: 20,
      left: 10,
      right: 20,
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      max: realMax,
      splitLine: { show: false },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#9CA3AF',
        fontSize: 12,
        formatter: (val) => {
          if (val === realMax - 1) return '';
          return val.toFixed(0);
        },
      },
    },
    yAxis: {
      type: 'category',
      data: continentName,
    },
    series: [
      // 灰色底轨（每一行都是 100%）
      {
        type: 'bar',
        data: bgData, // 比如 [1, 1, 1, 1, 1]
        barWidth: 14,
        itemStyle: {
          color: '#E5E7EB', // 灰色
          borderRadius: 7,
        },
        silent: true, // 不响应 tooltip/hover
        barGap: '0%',
        z: 1,
      },
      // 绿色实际值条（0~0.9），覆盖在灰色上面
      {
        type: 'bar',
        data: fgData, // 比如 [0.9, 0.6, ...]
        barWidth: 14,
        itemStyle: {
          color: '#10B981', // 绿色
          borderRadius: 7,
        },
        barGap: '-100%', // 和底轨完全重叠
        z: 2,
        label: {
          show: true,
          position: 'right',
          formatter: (params) => continentCount[params.dataIndex],
          color: '#374151',
          fontSize: 12,
        },
      },
    ],
  };

  useEffect(() => {
    const dom = getChart.current;
    if (!dom) return;
    // 如果容器当前宽高为 0，先不初始化，避免 ECharts 报错
    if (!dom.clientWidth || !dom.clientHeight) return;

    const myChart = echarts.init(dom);
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
      <Card
        title="Customer Distribution"
        style={{ height: 360 }}
        styles={{ body: { padding: '8px 24px 24px' } }}
      >
        <div style={{ fontSize: 28, fontWeight: 600 }}>
          {sumCustomer} Customers
          <div style={{ fontSize: 14, color: '#6B7280' }}>by continent</div>
        </div>
        <div ref={getChart} style={{ width: '100%', height: 230 }} />
      </Card>
    </>
  );
}
