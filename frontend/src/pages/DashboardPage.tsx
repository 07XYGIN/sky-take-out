import { useEffect, useMemo, useState } from 'react'
import { Card, Col, Row, Skeleton, Table, Tag } from 'antd'
import type { TableColumnsType } from 'antd'
import ReactECharts from 'echarts-for-react'
import { ClipboardCheck, Clock3, ReceiptText, TrendingUp, UserRound, Utensils } from 'lucide-react'
import { getBusinessData, getOverviewDishes, getOverviewOrders, getOverviewSetmeals } from '../api/dashboard'
import { EmptyState } from '../components/EmptyState'
import { MetricCard } from '../components/MetricCard'
import { PageHeader } from '../components/PageHeader'
import { formatCurrency, formatDateTime } from '../lib/format'
import type { DashboardData, Dish, OrderSummary, Setmeal } from '../types'

const fallbackSummary: DashboardData = {
  turnover: 12860.5,
  validOrderCount: 186,
  unitPrice: 69.14,
  newUsers: 42,
  waitingOrders: 8,
  deliveredOrders: 12,
  completedOrders: 166,
  cancelledOrders: 3,
}

const fallbackOrders: OrderSummary[] = [
  { id: 10482, number: '20260821010482', consignee: '林先生', amount: 86, status: 2, orderTime: '2026-08-21 14:25:18' },
  { id: 10481, number: '20260821010481', consignee: '周女士', amount: 52, status: 3, orderTime: '2026-08-21 14:18:07' },
  { id: 10480, number: '20260821010480', consignee: '陈同学', amount: 118, status: 4, orderTime: '2026-08-21 14:12:44' },
]

const statusMap: Record<string, { label: string; color: string }> = {
  '1': { label: '待接单', color: 'gold' },
  '2': { label: '制作中', color: 'blue' },
  '3': { label: '配送中', color: 'cyan' },
  '4': { label: '已完成', color: 'green' },
}

export function DashboardPage() {
  const [summary, setSummary] = useState(fallbackSummary)
  const [orders, setOrders] = useState<OrderSummary[]>(fallbackOrders)
  const [dishes, setDishes] = useState<Dish[]>([])
  const [setmeals, setSetmeals] = useState<Setmeal[]>([])
  const [loading, setLoading] = useState(true)
  const [usingFallback, setUsingFallback] = useState(false)

  useEffect(() => {
    let active = true
    Promise.allSettled([getBusinessData(), getOverviewOrders(), getOverviewDishes(), getOverviewSetmeals()]).then((results) => {
      if (!active) return
      const [summaryResult, ordersResult, dishesResult, setmealResult] = results
      let hasFailure = false
      if (summaryResult.status === 'fulfilled' && summaryResult.value) setSummary({ ...fallbackSummary, ...summaryResult.value })
      else hasFailure = true
      if (ordersResult.status === 'fulfilled' && Array.isArray(ordersResult.value)) setOrders(ordersResult.value)
      else hasFailure = true
      if (dishesResult.status === 'fulfilled' && Array.isArray(dishesResult.value)) setDishes(dishesResult.value)
      if (setmealResult.status === 'fulfilled' && Array.isArray(setmealResult.value)) setSetmeals(setmealResult.value)
      setUsingFallback(hasFailure)
      setLoading(false)
    })
    return () => { active = false }
  }, [])

  const salesOption = useMemo(() => ({
    color: ['#2e8780', '#e9a92f'],
    tooltip: { trigger: 'axis' },
    grid: { left: 8, right: 8, top: 18, bottom: 8, containLabel: true },
    xAxis: { type: 'category', data: ['08/15', '08/16', '08/17', '08/18', '08/19', '08/20', '08/21'], axisLine: { lineStyle: { color: '#dce2e1' } }, axisLabel: { color: '#8b9799' } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#edf0ef' } }, axisLabel: { color: '#8b9799' } },
    series: [{ name: '营业额', type: 'bar', barWidth: 18, data: [10200, 11840, 9650, 14100, 12700, 13580, summary.turnover], itemStyle: { borderRadius: [4, 4, 0, 0] } }],
  }), [summary.turnover])

  const orderColumns: TableColumnsType<OrderSummary> = [
    { title: '订单号', dataIndex: 'number', key: 'number', render: (value) => <span className="font-mono text-xs text-ink">{value || '--'}</span> },
    { title: '顾客', dataIndex: 'consignee', key: 'consignee', render: (value) => value || '--' },
    { title: '金额', dataIndex: 'amount', key: 'amount', render: (value) => <span className="font-medium text-ink">{formatCurrency(value)}</span> },
    { title: '状态', dataIndex: 'status', key: 'status', render: (value, record) => <Tag color={statusMap[String(value)]?.color || 'default'}>{record.statusName || statusMap[String(value)]?.label || String(value || '未知')}</Tag> },
    { title: '下单时间', dataIndex: 'orderTime', key: 'orderTime', render: (value) => <span className="text-xs text-slate-500">{formatDateTime(value)}</span> },
  ]

  return (
    <div>
      <PageHeader eyebrow="今天 · 门店经营" title="工作台" description="看清门店今天的节奏，把精力留给真正需要处理的订单。" actions={usingFallback ? <Tag color="orange">接口未连接 · 展示样例数据</Tag> : undefined} />
      {loading ? <div className="space-y-5"><Skeleton active /><Skeleton active /></div> : <>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} xl={6}><MetricCard label="今日营业额" value={formatCurrency(summary.turnover)} note="较昨日实时汇总" icon={<TrendingUp size={18} />} tone="saffron" /></Col>
          <Col xs={24} sm={12} xl={6}><MetricCard label="有效订单" value={summary.validOrderCount ?? 0} note="已完成及配送中订单" icon={<ReceiptText size={18} />} tone="teal" /></Col>
          <Col xs={24} sm={12} xl={6}><MetricCard label="平均客单价" value={formatCurrency(summary.unitPrice)} note="按有效订单计算" icon={<Utensils size={18} />} tone="coral" /></Col>
          <Col xs={24} sm={12} xl={6}><MetricCard label="新增用户" value={summary.newUsers ?? 0} note="今日首次下单用户" icon={<UserRound size={18} />} tone="ink" /></Col>
        </Row>
        <Row gutter={[16, 16]} className="mt-0 sm:mt-1">
          <Col xs={24} xl={15}><Card title="营业趋势" extra={<span className="text-xs text-slate-400">近 7 日</span>}><ReactECharts option={salesOption} style={{ height: 265 }} /></Card></Col>
          <Col xs={24} xl={9}><Card title="订单状态" extra={<Clock3 size={16} className="text-slate-400" />}><div className="space-y-4 py-2">{[['待接单', summary.waitingOrders, 'text-saffron'], ['配送中', summary.deliveredOrders, 'text-teal'], ['已完成', summary.completedOrders, 'text-ink'], ['已取消', summary.cancelledOrders, 'text-coral']].map(([label, value, color]) => <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0" key={String(label)}><div className="flex items-center gap-2 text-sm text-slate-500"><span className={`h-2 w-2 rounded-full bg-current ${color}`} />{label}</div><span className="text-lg font-semibold text-ink">{value}</span></div>)}</div></Card></Col>
        </Row>
        <Row gutter={[16, 16]} className="mt-0 sm:mt-1">
          <Col xs={24} xl={15}><Card title="最新订单" extra={<span className="text-xs text-slate-400">实时队列</span>}><Table rowKey="id" size="middle" columns={orderColumns} dataSource={orders} pagination={false} locale={{ emptyText: <EmptyState /> }} scroll={{ x: 660 }} /></Card></Col>
          <Col xs={24} xl={9}><Card title="商品概览" extra={<ClipboardCheck size={16} className="text-slate-400" />}><div className="grid grid-cols-2 gap-3"><div className="rounded-md bg-[#f4f7f6] p-4"><p className="text-xs text-slate-500">在售菜品</p><p className="mt-2 text-2xl font-semibold text-ink">{dishes.length || 28}</p></div><div className="rounded-md bg-[#fff7e7] p-4"><p className="text-xs text-slate-500">在售套餐</p><p className="mt-2 text-2xl font-semibold text-ink">{setmeals.length || 6}</p></div></div><div className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-500">今日建议：优先处理待接单队列，平均响应时间保持在 3 分钟以内。</div></Card></Col>
        </Row>
      </>}
    </div>
  )
}
