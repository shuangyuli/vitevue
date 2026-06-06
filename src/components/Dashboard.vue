<template>
  <div class="dashboard-container">
    <div class="header">
      <h1>数据大屏</h1>
      <div class="time">{{ currentTime }}</div>
    </div>
    <div class="content">
      <div class="row">
        <el-card class="chart-card glass">
          <div class="card-title"><span class="dot cyan"></span>销售趋势</div>
          <div ref="lineChartRef" class="chart" />
        </el-card>
        <el-card class="chart-card glass">
          <div class="card-title"><span class="dot gold"></span>产品销量</div>
          <div ref="barChartRef" class="chart" />
        </el-card>
      </div>
      <div class="row">
        <el-card class="map-card glass">
          <div class="card-title"><span class="dot teal"></span>中国地图</div>
          <div ref="mapChartRef" v-echarts-resize class="map-chart" />
        </el-card>
        <el-card class="chart-card glass">
          <div class="card-title"><span class="dot purple"></span>实时数据流</div>
          <div class="data-stream">
            <div v-for="item in dataStream" :key="item.id" class="stream-item">
              <span class="stream-time">{{ item.time }}</span>
              <span class="stream-msg">{{ item.message }}</span>
            </div>
          </div>
        </el-card>
      </div>
      <div class="row bottom-row">
        <el-card class="metric-card glass">
          <div class="metric-icon visits">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7"/></svg>
          </div>
          <div class="metric-body">
            <div class="metric-title">总访问量</div>
            <div class="metric-value">{{ metrics.visits.toLocaleString() }}</div>
            <div class="metric-change up">+{{ metrics.visitsChange }}%</div>
          </div>
        </el-card>
        <el-card class="metric-card glass">
          <div class="metric-icon orders">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="8" y1="2" x2="8" y2="4"/><line x1="16" y1="2" x2="16" y2="4"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          </div>
          <div class="metric-body">
            <div class="metric-title">总订单数</div>
            <div class="metric-value">{{ metrics.orders.toLocaleString() }}</div>
            <div class="metric-change up">+{{ metrics.ordersChange }}%</div>
          </div>
        </el-card>
        <el-card class="metric-card glass">
          <div class="metric-icon revenue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div class="metric-body">
            <div class="metric-title">总成交额</div>
            <div class="metric-value">¥{{ Number(metrics.revenue).toLocaleString() }}</div>
            <div class="metric-change up">+{{ metrics.revenueChange }}%</div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import * as echarts from 'echarts'
import api from '../api'

const lineChartRef = ref<HTMLDivElement | null>(null)
const barChartRef = ref<HTMLDivElement | null>(null)
const mapChartRef = ref<HTMLDivElement | null>(null)
const currentTime = ref('')
const metrics = ref({
  visits: 12345,
  visitsChange: 5.2,
  orders: 328,
  ordersChange: 8.1,
  revenue: '98760',
  revenueChange: 12.3,
})

const now = () => {
  const d = new Date()
  return d.toTimeString().slice(0, 8)
}

const dataStream = ref([
  { id: 1, time: now(), message: '新订单：OD1001 - 张三' },
  { id: 2, time: now(), message: '用户注册：李四' },
  { id: 3, time: now(), message: '支付成功：¥1,280' },
  { id: 4, time: now(), message: '新订单：OD1002 - 王五' },
  { id: 5, time: now(), message: '用户登录：赵六' },
])

let timer: number | null = null

const fetchDashboardData = async () => {
  try {
    const [mRes, sRes] = await Promise.all([
      api.get('/dashboard/metrics'),
      api.get('/dashboard/realtime-stream'),
    ])
    if (mRes.data.code === 200) {
      const m = mRes.data.data
      metrics.value = { visits: m.visits, visitsChange: m.visitsChange, orders: m.orders, ordersChange: m.ordersChange, revenue: String(m.revenue), revenueChange: m.revenueChange }
    }
    if (sRes.data.code === 200) {
      dataStream.value = sRes.data.data.map((item: { id: string; time: string; message: string }) => ({
        id: Number(item.id), time: item.time, message: item.message,
      }))
    }
  } catch {}
}

const updateTime = () => {
  currentTime.value = new Date().toLocaleString('zh-CN')
}

const updateMetrics = () => {
  metrics.value.visits += Math.floor(Math.random() * 10)
  metrics.value.orders += Math.floor(Math.random() * 5)
  metrics.value.revenue = (parseInt(metrics.value.revenue) + Math.floor(Math.random() * 1000)).toString()
}

const updateDataStream = () => {
  const messages = [
    '新订单：OD' + Math.floor(Math.random() * 1000) + ' - 用户' + Math.floor(Math.random() * 100),
    '用户注册：用户' + Math.floor(Math.random() * 100),
    '支付成功：¥' + Math.floor(Math.random() * 5000),
    '新订单：OD' + Math.floor(Math.random() * 1000) + ' - 用户' + Math.floor(Math.random() * 100),
    '用户登录：用户' + Math.floor(Math.random() * 100),
  ]
  dataStream.value.unshift({
    id: Date.now(),
    time: now(),
    message: messages[Math.floor(Math.random() * messages.length)],
  })
  if (dataStream.value.length > 8) dataStream.value.pop()
}

const darkTextColor = '#a8c6e8'

const makeLineChart = () => {
  if (!lineChartRef.value) return
  const c = echarts.init(lineChartRef.value)
  c.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(6,18,40,0.92)',
      borderColor: 'rgba(64,158,255,0.3)',
      textStyle: { color: '#e0ecff' },
    },
    legend: { show: false },
    grid: { left: 8, right: 16, top: 12, bottom: 8, containLabel: true },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.12)' } },
      axisTick: { show: false },
      axisLabel: { color: darkTextColor, fontSize: 12 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      axisLabel: { color: darkTextColor, fontSize: 12 },
    },
    series: [{
      name: '销售额',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      lineStyle: { width: 3, color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
        { offset: 0, color: '#00d4ff' }, { offset: 1, color: '#409eff' }
      ])},
      itemStyle: { color: '#00d4ff', borderColor: '#fff', borderWidth: 2 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(0,212,255,0.35)' },
          { offset: 1, color: 'rgba(0,212,255,0.02)' },
        ]),
      },
    }],
  })
}

const makeBarChart = () => {
  if (!barChartRef.value) return
  const c = echarts.init(barChartRef.value)
  c.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(6,18,40,0.92)',
      borderColor: 'rgba(250,173,20,0.3)',
      textStyle: { color: '#e0ecff' },
    },
    legend: { show: false },
    grid: { left: 8, right: 16, top: 12, bottom: 8, containLabel: true },
    xAxis: {
      type: 'category',
      data: ['产品A', '产品B', '产品C', '产品D', '产品E'],
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.12)' } },
      axisTick: { show: false },
      axisLabel: { color: darkTextColor, fontSize: 12 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      axisLabel: { color: darkTextColor, fontSize: 12 },
    },
    series: [{
      name: '销量',
      type: 'bar',
      barWidth: 28,
      data: [120, 200, 150, 80, 70],
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#fad414' }, { offset: 1, color: '#e68a00' },
        ]),
      },
      emphasis: {
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#ffe04c' }, { offset: 1, color: '#ffa500' },
          ]),
        },
      },
    }],
  })
}

const initMapChart = async () => {
  if (!mapChartRef.value) return
  try {
    const chinaJson = await fetch('/china.json').then(r => {
      if (!r.ok) throw new Error('地图数据加载失败')
      return r.json()
    })
    echarts.registerMap('china', chinaJson)
    const c = echarts.init(mapChartRef.value)
    c.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(6,18,40,0.92)',
      borderColor: 'rgba(0,206,209,0.3)',
      textStyle: { color: '#e0ecff' },
      formatter: '{b}<br/>成交：{c} 万元',
    },
    visualMap: {
      min: 0, max: 500,
      text: ['高', '低'],
      textStyle: { color: darkTextColor },
      realtime: false, calculable: true,
      inRange: { color: ['#0a1e3d', '#0b3d6b', '#0e5ea0', '#1a85c4', '#20b2aa'] },
      left: 8, bottom: 8,
    },
    series: [{
      name: '成交量',
      type: 'map', map: 'china', roam: false,
      itemStyle: {
        areaColor: '#0d2847',
        borderColor: 'rgba(64,158,255,0.35)',
        borderWidth: 1.5,
      },
      emphasis: {
        label: { show: true, color: '#fff' },
        itemStyle: { areaColor: '#1a5c9e' },
      },
      data: [
        { name: '河北省', value: 320 }, { name: '黑龙江省', value: 280 },
        { name: '辽宁省', value: 420 }, { name: '浙江省', value: 360 },
        { name: '江苏省', value: 300 }, { name: '山东省', value: 260 },
        { name: '广东省', value: 480 }, { name: '四川省', value: 210 },
        { name: '湖北省', value: 350 }, { name: '湖南省', value: 290 },
      ],
    }],
  })
  } catch {
    if (mapChartRef.value) {
      mapChartRef.value.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#6b8db5;font-size:14px">地图数据加载失败，请稍后重试</div>'
    }
  }
}

let charts: echarts.ECharts[] = []
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  updateTime()
  fetchDashboardData()
  timer = window.setInterval(() => { updateTime(); updateMetrics(); updateDataStream() }, 5000)

  makeLineChart()
  makeBarChart()
  initMapChart()

  charts = [lineChartRef, barChartRef, mapChartRef]
    .map(r => echarts.getInstanceByDom(r.value!))
    .filter(Boolean) as echarts.ECharts[]

  resizeObserver = new ResizeObserver(() => {
    charts.forEach(c => c.resize())
  })
  const container = (document.querySelector('.content') as HTMLElement) || lineChartRef.value?.parentElement?.parentElement
  if (container) resizeObserver.observe(container)
  window.addEventListener('resize', () => charts.forEach(c => c.resize()))
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (resizeObserver) resizeObserver.disconnect()
  charts.forEach(c => c.dispose())
})
</script>

<style scoped>
.dashboard-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #081120;
  background-image:
    radial-gradient(ellipse at 20% 20%, rgba(0,180,255,0.08) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 80%, rgba(0,206,209,0.06) 0%, transparent 55%),
    radial-gradient(ellipse at 50% 50%, rgba(100,80,255,0.04) 0%, transparent 70%);
  color: #fff;
  padding: 16px 20px;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}

.dashboard-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: 0;
}

.header,
.content {
  position: relative;
  z-index: 1;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.header h1 {
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  letter-spacing: 4px;
  background: linear-gradient(90deg, #e0ecff, #80c8ff, #40e0d0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.time {
  font-size: 15px;
  color: #6b8db5;
  letter-spacing: 1px;
}

.content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

.row {
  display: flex;
  gap: 12px;
  flex: 1;
  min-height: 0;
}

.bottom-row {
  flex: none;
  flex-shrink: 0;
}

.glass {
  background: rgba(255,255,255,0.03) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.06) !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04) !important;
  transition: border-color 0.3s, box-shadow 0.3s;
  touch-action: manipulation;
}

.glass:hover {
  border-color: rgba(255,255,255,0.12) !important;
  box-shadow: 0 4px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06) !important;
}

.chart-card {
  flex: 1;
  color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.map-card {
  flex: 1.2;
  color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.metric-card {
  flex: 1;
  color: #fff;
  display: flex;
  flex-direction: row !important;
  align-items: center;
  gap: 20px;
  padding: 16px 24px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #c8ddf8;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.dot.cyan  { background: #00d4ff; box-shadow: 0 0 8px #00d4ff88; }
.dot.gold  { background: #fad414; box-shadow: 0 0 8px #fad41488; }
.dot.teal  { background: #20b2aa; box-shadow: 0 0 8px #20b2aa88; }
.dot.purple { background: #a78bfa; box-shadow: 0 0 8px #a78bfa88; }

.chart,
.map-chart {
  flex: 1;
  min-height: 0;
  width: 100%;
}

/* Metric Cards */
.metric-icon {
  width: 52px; height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-icon svg {
  width: 26px; height: 26px;
}

.metric-icon.visits  { background: linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,212,255,0.05)); color: #00d4ff; }
.metric-icon.orders  { background: linear-gradient(135deg, rgba(250,212,20,0.2), rgba(250,212,20,0.05)); color: #fad414; }
.metric-icon.revenue { background: linear-gradient(135deg, rgba(64,224,208,0.2), rgba(64,224,208,0.05)); color: #40e0d0; }

.metric-body { flex: 1; }

.metric-title {
  font-size: 13px;
  color: #6b8db5;
  margin-bottom: 6px;
}

.metric-value {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 1px;
  line-height: 1.1;
}

.metric-change {
  font-size: 13px;
  margin-top: 4px;
}

.metric-change.up { color: #40e0d0; }

/* Data Stream */
.data-stream {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.stream-item {
  display: flex;
  gap: 14px;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 13px;
  transition: background 0.3s;
  align-items: baseline;
  cursor: default;
}

.stream-item:hover {
  background: rgba(255,255,255,0.04);
}

.stream-item:focus-visible {
  outline: 2px solid rgba(64,158,255,0.6);
  outline-offset: 2px;
  border-radius: 6px;
}

.stream-time {
  color: #4a6d96;
  font-family: ui-monospace, Consolas, monospace;
  font-size: 12px;
  flex-shrink: 0;
  min-width: 64px;
}

.stream-msg {
  color: #b0cce8;
}

/* Override Element Plus card body for flex layout */
:deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
