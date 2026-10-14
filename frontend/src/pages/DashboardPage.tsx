import { useEffect, useMemo, useState } from "react";
import { Card, Col, Row, Skeleton, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import ReactECharts from "echarts-for-react";
import {
  ClipboardCheck,
  Clock3,
  ReceiptText,
  TrendingUp,
  Utensils,
} from "lucide-react";
import {
  getBusinessData,
  getOverviewDishes,
  getBusinessEcharts,
  getBusinessStatus
} from "../api/dashboard";
import { EmptyState } from "../components/EmptyState";
import { MetricCard } from "../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import { formatCurrency, formatDateTime } from "../lib/format";
import type { BusinessDataEcharts, DashboardData, Dish, OrderSummary, ProductOverview } from "../types";

const fallbackSummary: DashboardData = {};

const stateResult:ProductOverview = {}
const statusMap: Record<string, { label: string; color: string }> = {
  2: { label: "待接单", color: "gold" },
  3: { label: "已接单", color: "blue" },
  4: { label: "配送中", color: "cyan" },
  5: { label: "已完成", color: "green" },
};

export function DashboardPage() {
  const [summary, setSummary] = useState(fallbackSummary);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [echarts,setEcharts] = useState<BusinessDataEcharts[]>()
  const [state,setState] = useState<ProductOverview>()
  useEffect(() => {
    let active = true;
    Promise.allSettled([
      getBusinessData(),
      getOverviewDishes(),
      getBusinessEcharts(),
      getBusinessStatus()
    ]).then((results) => {
      if (!active) return;
      const [summaryResult, dishesResult,echarts,states] =
        results;
      let hasFailure = false;
      if (summaryResult.status === "fulfilled" && summaryResult.value)
        setSummary({ ...fallbackSummary, ...summaryResult.value });        
      else hasFailure = true;
      if (
        dishesResult.status === "fulfilled" &&
        Array.isArray(dishesResult.value)
      )
        setDishes(dishesResult.value); 
        else hasFailure = true;
      if (echarts.status ==="fulfilled" && Array.isArray(echarts.value))
        setEcharts(echarts.value)
      else hasFailure = true;
      if(states.status ==="fulfilled" && states.value)
        setState({...stateResult,...states.value})
      else hasFailure = true;
      setUsingFallback(hasFailure);
      setLoading(false);      
    });
    return () => {
      active = false;
    };
  }, []);
const salesOption = useMemo(
  () => ({
    color: ["#2e8780", "#e9a92f"],
    tooltip: { trigger: "axis" },
    grid: { left: 8, right: 8, top: 18, bottom: 8, containLabel: true },
    xAxis: {
      type: "category",
      data: echarts?.map(i=>i.day)||[],
      axisLine: { lineStyle: { color: "#dce2e1" } },
      axisLabel: { color: "#8b9799" },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "#edf0ef" } },
      axisLabel: { color: "#8b9799" },
    },
    series: [
      {
        name: "营业额",
        type: "bar",
        barWidth: 18,
        data:echarts?.map(i=>i.turnover) || [],
        itemStyle: { borderRadius: [4, 4, 0, 0] },
      },
    ],
  }),
  [echarts],
);

  const orderColumns: TableColumnsType<any> = [
    {
      title: "订单号",
      dataIndex: "number",
      key: "number",
      render: (value) => (
        <span className="font-mono text-xs text-ink">{value || "--"}</span>
      ),
    },
    {
      title: "顾客",
      dataIndex: "userName",
      key: "userName",
      render: (value) => value || "--",
    },
    {
      title: "金额",
      dataIndex: "amount",
      key: "amount",
      render: (value) => (
        <span className="font-medium text-ink">{formatCurrency(value)}</span>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (value, record:any) => (
        <Tag color={statusMap[String(value)]?.color || "default"}>
          {record.statusName ||
            statusMap[String(value)]?.label ||
            String(value || "未知")}
        </Tag>
      ),
    },
    {
      title: "下单时间",
      dataIndex: "orderTime",
      key: "orderTime",
      render: (value) => (
        <span className="text-xs text-slate-500">{formatDateTime(value)}</span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="今天 · 门店经营"
        title="工作台"
        description="看清门店今天的节奏，把精力留给真正需要处理的订单。"
        actions={
          usingFallback ? (
            <Tag color="orange">_</Tag>
          ) : undefined
        }
      />
      {loading ? (
        <div className="space-y-5">
          <Skeleton active />
          <Skeleton active />
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} xl={6}>
              <MetricCard
                label="今日营业额"
                value={formatCurrency(summary.amount)}
                note="较昨日实时汇总"
                icon={<TrendingUp size={18} />}
                tone="saffron"
              />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <MetricCard
                label="有效订单"
                value={summary?.status}
                note="已完成及配送中订单"
                icon={<ReceiptText size={18} />}
                tone="teal"
              />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <MetricCard
                label="平均客单价"
                value={formatCurrency(summary.avgAmount)}
                note="按有效订单计算"
                icon={<Utensils size={18} />}
                tone="coral"
              />
            </Col>
          </Row>
          <Row gutter={[16, 16]} className="mt-0 sm:mt-1">
            <Col xs={24} xl={15}>
              <Card
                title="营业趋势"
                extra={<span className="text-xs text-slate-400">近 7 日</span>}
              >
                <ReactECharts option={salesOption} style={{ height: 265 }} />
              </Card>
            </Col>
            <Col xs={24} xl={9}>
              <Card
                title="订单状态"
                extra={<Clock3 size={16} className="text-slate-400" />}
              >
                <div className="space-y-4 py-2">
                  {[
                    ["待接单", summary.waitingOrders, "text-saffron"],
                    ["配送中", summary.deliveredOrders, "text-teal"],
                    ["已完成", summary.completedOrders, "text-ink"],
                    ["已取消", summary.cancelledOrders, "text-coral"],
                  ].map(([label, value, color]) => (
                    <div
                      className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                      key={String(label)}
                    >
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span
                          className={`h-2 w-2 rounded-full bg-current ${color}`}
                        />
                        {label}
                      </div>
                      <span className="text-lg font-semibold text-ink">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>
          <Row gutter={[16, 16]} className="mt-0 sm:mt-1">
            <Col xs={24} xl={15}>
              <Card
                title="最新订单"
                extra={<span className="text-xs text-slate-400">实时队列</span>}
              >
                <Table
                  rowKey="Id"
                  size="middle"
                  columns={orderColumns}
                  dataSource={dishes}
                  pagination={false}
                  locale={{ emptyText: <EmptyState /> }}
                  scroll={{ x: 660 }}
                />
              </Card>
            </Col>
            <Col xs={24} xl={9}>
              <Card
                title="商品概览"
                extra={<ClipboardCheck size={16} className="text-slate-400" />}
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md bg-[#f4f7f6] p-4">
                    <p className="text-xs text-slate-500">在售菜品</p>
                    <p className="mt-2 text-2xl font-semibold text-ink">
                      {state?.dishes}
                    </p>
                  </div>
                  <div className="rounded-md bg-[#fff7e7] p-4">
                    <p className="text-xs text-slate-500">在售套餐</p>
                    <p className="mt-2 text-2xl font-semibold text-ink">
                      {state?.setmeals}
                    </p>
                  </div>
                </div>
                <div className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-500">
                  今日建议：优先处理待接单队列，平均响应时间保持在 3 分钟以内。
                </div>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
