import { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, DatePicker, Row, Skeleton, Tag } from "antd";
import ReactECharts from "echarts-for-react";
import {
  BarChart3,
  CalendarDays,
  ReceiptText,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { getBusinessData } from "../api/dashboard";
import {
  getOrderStatistics,
  getTopStatistics,
  getTurnoverStatistics,
  getUserStatistics,
} from "../api/statistics";
import type {
  SeriesStatistics,
  StatisticsPoint,
  TopStatistics,
} from "../api/statistics";
import { MetricCard } from "../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import { formatCurrency } from "../lib/format";
import type { DashboardData } from "../types";

const { RangePicker } = DatePicker;

const fallbackDates = [
  "08/15",
  "08/16",
  "08/17",
  "08/18",
  "08/19",
  "08/20",
  "08/21",
];
const fallbackTurnover = [10200, 11840, 9650, 14100, 12700, 13580, 12860];
const fallbackOrderTotal = [154, 168, 132, 201, 182, 194, 186];
const fallbackOrderValid = [140, 152, 120, 186, 169, 180, 172];
const fallbackUserTotal = [1320, 1348, 1372, 1408, 1446, 1481, 1518];
const fallbackUserNew = [28, 24, 36, 38, 35, 37, 42];
const fallbackTop = [
  { name: "招牌卤肉饭", number: 86 },
  { name: "青花椒鸡腿饭", number: 74 },
  { name: "双人分享餐", number: 62 },
  { name: "午间轻食餐", number: 48 },
  { name: "芝士薯角", number: 41 },
];

interface ChartSeries {
  dates: string[];
  values: number[];
}

interface UserSeries {
  dates: string[];
  total: number[];
  newlyAdded: number[];
}

interface OrderSeries {
  dates: string[];
  total: number[];
  valid: number[];
  totalOrderCount: number;
  validOrderCount: number;
  completionRate: number;
}

function splitValue<T>(value: T[] | string | undefined, fallback: T[]) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) return value.split(",") as T[];
  return fallback;
}

function toNumberArray(
  value: number[] | string | undefined,
  fallback: number[],
) {
  return splitValue<number>(value, fallback).map((item) => Number(item || 0));
}

function toDateArray(
  value: string[] | string | undefined,
  fallback = fallbackDates,
) {
  return splitValue<string>(value, fallback).map(String);
}

function isSeriesStatistics(
  data: SeriesStatistics | StatisticsPoint[],
): data is SeriesStatistics {
  return !Array.isArray(data);
}

function parseTurnover(
  data: SeriesStatistics | StatisticsPoint[],
): ChartSeries {
  if (isSeriesStatistics(data)) {
    return {
      dates: toDateArray(data.dateList),
      values: toNumberArray(data.turnoverList, fallbackTurnover),
    };
  }
  return {
    dates: data.map((point) => point.date || "").filter(Boolean),
    values: data.map((point) => Number(point.turnover || 0)),
  };
}

function parseUsers(data: SeriesStatistics | StatisticsPoint[]): UserSeries {
  if (isSeriesStatistics(data)) {
    return {
      dates: toDateArray(data.dateList),
      total: toNumberArray(data.totalUserList, fallbackUserTotal),
      newlyAdded: toNumberArray(data.newUserList, fallbackUserNew),
    };
  }
  return {
    dates: data.map((point) => point.date || "").filter(Boolean),
    total: data.map((point) => Number(point.totalUsers || 0)),
    newlyAdded: data.map((point) => Number(point.newUsers || 0)),
  };
}

function parseOrders(data: SeriesStatistics | StatisticsPoint[]): OrderSeries {
  if (isSeriesStatistics(data)) {
    const total = toNumberArray(data.orderCountList, fallbackOrderTotal);
    const valid = toNumberArray(data.validOrderCountList, fallbackOrderValid);
    const totalOrderCount = Number(
      data.totalOrderCount ?? total.reduce((sum, item) => sum + item, 0),
    );
    const validOrderCount = Number(
      data.validOrderCount ?? valid.reduce((sum, item) => sum + item, 0),
    );
    return {
      dates: toDateArray(data.dateList),
      total,
      valid,
      totalOrderCount,
      validOrderCount,
      completionRate: Number(
        data.orderCompletionRate ??
          (totalOrderCount ? validOrderCount / totalOrderCount : 0),
      ),
    };
  }
  const total = data.map((point) => Number(point.orderCount || 0));
  const valid = data.map((point) => Number(point.validOrderCount || 0));
  const totalOrderCount = total.reduce((sum, item) => sum + item, 0);
  const validOrderCount = valid.reduce((sum, item) => sum + item, 0);
  return {
    dates: data.map((point) => point.date || "").filter(Boolean),
    total,
    valid,
    totalOrderCount,
    validOrderCount,
    completionRate: totalOrderCount ? validOrderCount / totalOrderCount : 0,
  };
}

function parseTop(
  data: TopStatistics | Array<{ name: string; number: number }>,
) {
  if (Array.isArray(data)) return data;
  const names = toDateArray(
    data.nameList,
    fallbackTop.map((item) => item.name),
  );
  const numbers = toNumberArray(
    data.numberList,
    fallbackTop.map((item) => item.number),
  );
  return names.map((name, index) => ({ name, number: numbers[index] || 0 }));
}

function todayRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);
  const format = (date: Date) => date.toISOString().slice(0, 10);
  return { begin: format(start), end: format(end) };
}

export function StatisticsPage() {
  const [summary, setSummary] = useState<DashboardData>({});
  const [period, setPeriod] = useState(todayRange);
  const [turnover, setTurnover] = useState<ChartSeries>({
    dates: fallbackDates,
    values: fallbackTurnover,
  });
  const [users, setUsers] = useState<UserSeries>({
    dates: fallbackDates,
    total: fallbackUserTotal,
    newlyAdded: fallbackUserNew,
  });
  const [orders, setOrders] = useState<OrderSeries>({
    dates: fallbackDates,
    total: fallbackOrderTotal,
    valid: fallbackOrderValid,
    totalOrderCount: fallbackOrderTotal.reduce((sum, item) => sum + item, 0),
    validOrderCount: fallbackOrderValid.reduce((sum, item) => sum + item, 0),
    completionRate:
      fallbackOrderValid.reduce((sum, item) => sum + item, 0) /
      fallbackOrderTotal.reduce((sum, item) => sum + item, 0),
  });
  const [topItems, setTopItems] = useState(fallbackTop);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const params = {
      begin: period.begin,
      end: period.end,
      beginTime: period.begin,
      endTime: period.end,
    };
    const results = await Promise.allSettled([
      getBusinessData(),
      getTurnoverStatistics(params),
      getUserStatistics(params),
      getOrderStatistics(params),
      getTopStatistics(params),
    ]);

    let failed = false;
    const [summaryResult, turnoverResult, userResult, orderResult, topResult] =
      results;
    if (summaryResult.status === "fulfilled")
      setSummary(summaryResult.value || {});
    else failed = true;
    if (turnoverResult.status === "fulfilled")
      setTurnover(parseTurnover(turnoverResult.value));
    else failed = true;
    if (userResult.status === "fulfilled")
      setUsers(parseUsers(userResult.value));
    else failed = true;
    if (orderResult.status === "fulfilled")
      setOrders(parseOrders(orderResult.value));
    else failed = true;
    if (topResult.status === "fulfilled")
      setTopItems(parseTop(topResult.value));
    else failed = true;
    setUsingFallback(failed);
    setLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, []);

  const lineGrid = {
    left: 8,
    right: 16,
    top: 24,
    bottom: 8,
    containLabel: true,
  };
  const axisStyle = {
    axisLine: { lineStyle: { color: "#dce2e1" } },
    axisLabel: { color: "#7a878b" },
  };

  const turnoverOption = useMemo(
    () => ({
      color: ["#e9a92f"],
      tooltip: { trigger: "axis" },
      grid: lineGrid,
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: turnover.dates,
        ...axisStyle,
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { color: "#edf0ef" } },
        axisLabel: { color: "#7a878b" },
      },
      series: [
        {
          name: "营业额",
          type: "line",
          smooth: true,
          showSymbol: false,
          data: turnover.values,
          areaStyle: { opacity: 0.12 },
        },
      ],
    }),
    [turnover],
  );

  const userOption = useMemo(
    () => ({
      color: ["#2e8780", "#d9684b"],
      tooltip: { trigger: "axis" },
      grid: lineGrid,
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: users.dates,
        ...axisStyle,
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { color: "#edf0ef" } },
        axisLabel: { color: "#7a878b" },
      },
      series: [
        {
          name: "用户总量",
          type: "line",
          smooth: true,
          showSymbol: false,
          data: users.total,
        },
        {
          name: "新增用户",
          type: "line",
          smooth: true,
          showSymbol: false,
          data: users.newlyAdded,
        },
      ],
    }),
    [users],
  );

  const orderOption = useMemo(
    () => ({
      color: ["#17252c", "#2e8780"],
      tooltip: { trigger: "axis" },
      grid: lineGrid,
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: orders.dates,
        ...axisStyle,
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { color: "#edf0ef" } },
        axisLabel: { color: "#7a878b" },
      },
      series: [
        {
          name: "订单总数",
          type: "line",
          smooth: true,
          showSymbol: false,
          data: orders.total,
        },
        {
          name: "有效订单",
          type: "line",
          smooth: true,
          showSymbol: false,
          data: orders.valid,
        },
      ],
    }),
    [orders],
  );

  const topOption = useMemo(
    () => ({
      color: ["#e9a92f"],
      tooltip: { trigger: "axis" },
      grid: { left: 8, right: 16, top: 4, bottom: 8, containLabel: true },
      xAxis: { type: "value", show: false },
      yAxis: {
        type: "category",
        inverse: true,
        data: topItems.map((item) => item.name),
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: { color: "#58666c" },
      },
      series: [
        {
          name: "销量",
          type: "bar",
          barWidth: 18,
          data: topItems.map((item) => item.number),
          itemStyle: { borderRadius: [0, 4, 4, 0] },
          label: { show: true, position: "right", color: "#17252c" },
        },
      ],
    }),
    [topItems],
  );

  return (
    <div>
      <PageHeader
        title="数据统计"
        description="查看营业额、用户增长、订单转化和热销商品。"
        actions={
          usingFallback ? (
            <Tag color="orange">接口未连接 · 展示样例数据</Tag>
          ) : undefined
        }
      />
      <Card className="mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-[320px]">
            <label className="mb-1.5 block text-xs text-slate-500">
              统计时间
            </label>
            <RangePicker
              className="w-full"
              onChange={(_, dateStrings) =>
                setPeriod({
                  begin: dateStrings[0] || period.begin,
                  end: dateStrings[1] || period.end,
                })
              }
            />
          </div>
          <Button
            icon={<CalendarDays size={15} />}
            onClick={() => void loadData()}
          >
            刷新统计
          </Button>
        </div>
      </Card>
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
                label="营业额"
                value={formatCurrency(
                  summary.turnover ?? turnover.values.at(-1),
                )}
                note="所选区间汇总"
                icon={<TrendingUp size={18} />}
                tone="saffron"
              />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <MetricCard
                label="订单完成率"
                value={`${(orders.completionRate * 100).toFixed(1)}%`}
                note={`${orders.validOrderCount} / ${orders.totalOrderCount}`}
                icon={<ReceiptText size={18} />}
                tone="teal"
              />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <MetricCard
                label="有效订单"
                value={summary.validOrderCount ?? orders.validOrderCount}
                note="已完成或履约中订单"
                icon={<BarChart3 size={18} />}
                tone="ink"
              />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <MetricCard
                label="新增用户"
                value={summary.newUsers ?? users.newlyAdded.at(-1) ?? 0}
                note="区间末日新增"
                icon={<UserRound size={18} />}
                tone="coral"
              />
            </Col>
          </Row>
          <Row gutter={[16, 16]} className="mt-0 sm:mt-1">
            <Col xs={24} xl={12}>
              <Card
                title="营业额统计"
                extra={<span className="text-xs text-slate-400">元</span>}
              >
                <ReactECharts option={turnoverOption} style={{ height: 310 }} />
              </Card>
            </Col>
            <Col xs={24} xl={12}>
              <Card
                title="用户统计"
                extra={
                  <span className="text-xs text-slate-400">
                    用户总量 / 新增用户
                  </span>
                }
              >
                <ReactECharts option={userOption} style={{ height: 310 }} />
              </Card>
            </Col>
          </Row>
          <Row gutter={[16, 16]} className="mt-0 sm:mt-1">
            <Col xs={24} xl={14}>
              <Card
                title="订单统计"
                extra={
                  <span className="text-xs text-slate-400">
                    订单总数 / 有效订单
                  </span>
                }
              >
                <ReactECharts option={orderOption} style={{ height: 320 }} />
              </Card>
            </Col>
            <Col xs={24} xl={10}>
              <Card title="销量排名 TOP10">
                <ReactECharts option={topOption} style={{ height: 320 }} />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
