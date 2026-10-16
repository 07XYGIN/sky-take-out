import { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, DatePicker, Row, Skeleton, Tag } from "antd";
import ReactECharts from "echarts-for-react";
import {
  BarChart3,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import { getBusinessData } from "../api/dashboard";
import {
  getTurnoverStatistics,
} from "../api/statistics";
import { MetricCard } from "../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import { formatCurrency } from "../lib/format";

const { RangePicker } = DatePicker;
interface TurnoverPoint {
  day: string;
  amount: number;     
  valid: number;      
  total: number;   
}interface DashboardSummary {
  amount: number; 
  valid: number;   
  status:number
}
function todayRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);
  const format = (date: Date) => date.toISOString().slice(0, 10);
  return { begin: format(start), end: format(end) };
}

export function StatisticsPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [period, setPeriod] = useState(todayRange);
  const [turnover, setTurnover] = useState<TurnoverPoint[]>([]);
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
    ]);

    let failed = false;
    const [summaryResult, turnoverResult,] =
      results;
    if (summaryResult.status === "fulfilled")
      setSummary(summaryResult.value || []);
    else failed = true;
    if (turnoverResult.status === "fulfilled")
      setTurnover(turnoverResult.value);
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
        data: turnover?.map(_=>_.day),
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
          data: turnover?.map(_=>_.amount),
          areaStyle: { opacity: 0.12 },
        },
      ],
    }),
    [turnover],
  );

  const orderOption = useMemo(
    () => ({
      color: ["#17252c", "#2e8780"],
      tooltip: { trigger: "axis" },
      grid: lineGrid,
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: turnover?.map(_=>_.day),
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
          data: turnover.map(_=>_.total),
        },
        {
          name: "有效订单",
          type: "line",
          smooth: true,
          showSymbol: false,
          data: turnover.map(_=>_.valid),
        },
      ],
    }),
    [turnover],
  );


  return (
    <div>
      <PageHeader
        title="数据统计"
        description="查看营业额、用户增长、订单转化和热销商品。"
        actions={
          usingFallback ? (
            <Tag color="orange">_</Tag>
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
                  summary?.amount,
                )}
                note="所选区间汇总"
                icon={<TrendingUp size={18} />}
                tone="saffron"
              />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <MetricCard
                label="有效订单"
                value={summary?.status}
                note="已完成或履约中订单"
                icon={<BarChart3 size={18} />}
                tone="ink"
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
          </Row>
        </>
      )}
    </div>
  );
}
