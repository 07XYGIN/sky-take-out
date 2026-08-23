import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  DatePicker,
  Descriptions,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  message,
} from "antd";
import type { TableColumnsType } from "antd";
import { Ban, Check, Eye, PackageCheck, Search, Truck } from "lucide-react";
import {
  acceptOrder,
  cancelOrder,
  completeOrder,
  deliverOrder,
  getOrder,
  getOrderPage,
  getOrderStatusStatistics,
  rejectOrder,
} from "../api/order";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { formatCurrency, formatDateTime, toPageParams } from "../lib/format";
import type { OrderSummary } from "../types";

const { RangePicker } = DatePicker;

const statusMeta: Record<string, { label: string; color: string }> = {
  "1": { label: "待付款", color: "default" },
  "2": { label: "待接单", color: "gold" },
  "3": { label: "待派送", color: "blue" },
  "4": { label: "派送中", color: "cyan" },
  "5": { label: "已完成", color: "green" },
  "6": { label: "已取消", color: "red" },
};

const fallbackOrders: OrderSummary[] = [
  {
    id: 10482,
    number: "20260821010482",
    orderTime: "2026-08-21 14:25:18",
    consignee: "林先生",
    phone: "13800138001",
    address: "软件园 A 座 18 层",
    orderDishes: "招牌卤肉饭 x1；柠檬茶 x1",
    amount: 43,
    status: 2,
    remark: "少辣，餐具 1 份",
    tablewareNumber: 1,
    estimatedDeliveryTime: "2026-08-21 15:05:00",
  },
  {
    id: 10481,
    number: "20260821010481",
    orderTime: "2026-08-21 14:18:07",
    consignee: "周女士",
    phone: "13900139002",
    address: "创客中心 3 号楼",
    orderDishes: "双人分享餐 x1",
    amount: 68,
    status: 3,
    tablewareNumber: 2,
    estimatedDeliveryTime: "2026-08-21 14:55:00",
  },
  {
    id: 10480,
    number: "20260821010480",
    orderTime: "2026-08-21 14:12:44",
    consignee: "陈同学",
    phone: "13600136003",
    address: "大学城 5 栋 602",
    orderDishes: "青花椒鸡腿饭 x2；芝士薯角 x1",
    amount: 80,
    status: 4,
    remark: "到楼下请电话联系",
    tablewareNumber: 2,
    estimatedDeliveryTime: "2026-08-21 14:50:00",
  },
  {
    id: 10479,
    number: "20260821010479",
    orderTime: "2026-08-21 13:58:21",
    consignee: "许先生",
    phone: "13700137004",
    address: "金融港 B6",
    orderDishes: "午间轻食餐 x1",
    amount: 42,
    status: 5,
    deliveryTime: "2026-08-21 14:31:12",
  },
  {
    id: 10478,
    number: "20260821010478",
    orderTime: "2026-08-21 13:44:09",
    consignee: "罗女士",
    phone: "13500135005",
    address: "幸福里 2 期 8 栋",
    orderDishes: "芝士薯角 x2",
    amount: 32,
    status: 6,
    cancelTime: "2026-08-21 13:47:31",
    cancelReason: "用户取消",
  },
];

const rejectReasons = [
  "订单量较多，暂时无法接单",
  "菜品已销售完，暂时无法接单",
  "餐厅已打烊，暂时无法接单",
];
const cancelReasons = ["用户取消", "联系不上用户", "配送异常", "菜品售罄"];

interface QueryState {
  number: string;
  phone: string;
  beginTime?: string;
  endTime?: string;
}

interface ReasonFormValues {
  reason: string;
  customReason?: string;
}

function getStatusLabel(status: OrderSummary["status"]) {
  return statusMeta[String(status)]?.label || "未知";
}

function getStatusColor(status: OrderSummary["status"]) {
  return statusMeta[String(status)]?.color || "default";
}

function nextStatusText(status: number) {
  if (status === 2) return "接单";
  if (status === 3) return "派送";
  if (status === 4) return "完成";
  return "";
}

export function OrderPage() {
  const [reasonForm] = Form.useForm<ReasonFormValues>();
  const [rows, setRows] = useState<OrderSummary[]>(fallbackOrders);
  const [selected, setSelected] = useState<OrderSummary | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [reasonTarget, setReasonTarget] = useState<{
    type: "reject" | "cancel";
    order: OrderSummary;
  } | null>(null);
  const [query, setQuery] = useState<QueryState>({ number: "", phone: "" });
  const [activeStatus, setActiveStatus] = useState(0);
  const [loading, setLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [statusCounts, setStatusCounts] = useState({
    waiting: 0,
    confirmed: 0,
    delivering: 0,
  });

  const loadData = async (status = activeStatus) => {
    setLoading(true);
    try {
      const result = await getOrderPage(
        toPageParams(1, 100, {
          number: query.number || undefined,
          phone: query.phone || undefined,
          beginTime: query.beginTime,
          endTime: query.endTime,
          status: status || undefined,
        }),
      );
      setRows(result.records || []);
      setUsingFallback(false);
      const statistics = await getOrderStatusStatistics().catch(
        () => undefined,
      );
      if (statistics) {
        setStatusCounts({
          waiting: statistics.toBeConfirmed || 0,
          confirmed: statistics.confirmed || 0,
          delivering: statistics.deliveryInProgress || 0,
        });
      }
    } catch {
      setUsingFallback(true);
      const localRows = fallbackOrders
        .filter((order) => !status || Number(order.status) === status)
        .filter(
          (order) => !query.number || order.number?.includes(query.number),
        )
        .filter((order) => !query.phone || order.phone?.includes(query.phone));
      setRows(localRows);
      setStatusCounts({
        waiting: fallbackOrders.filter((order) => Number(order.status) === 2)
          .length,
        confirmed: fallbackOrders.filter((order) => Number(order.status) === 3)
          .length,
        delivering: fallbackOrders.filter((order) => Number(order.status) === 4)
          .length,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData(0);
  }, []);

  const tabs = useMemo(
    () => [
      { key: "0", label: "全部订单" },
      { key: "2", label: `待接单 ${statusCounts.waiting}` },
      { key: "3", label: `待派送 ${statusCounts.confirmed}` },
      { key: "4", label: `派送中 ${statusCounts.delivering}` },
      { key: "5", label: "已完成" },
      { key: "6", label: "已取消" },
    ],
    [statusCounts],
  );

  const patchOrderStatus = (
    id: OrderSummary["id"],
    status: number,
    extra?: Partial<OrderSummary>,
  ) => {
    setRows((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status, ...extra } : item,
      ),
    );
    setSelected((current) =>
      current?.id === id ? { ...current, status, ...extra } : current,
    );
  };

  const runOrderAction = async (
    order: OrderSummary,
    action: "accept" | "deliver" | "complete",
  ) => {
    const status = Number(order.status);
    try {
      if (action === "accept") await acceptOrder(order.id);
      if (action === "deliver") await deliverOrder(order.id);
      if (action === "complete") await completeOrder(order.id);
      message.success(`${nextStatusText(status)}成功`);
    } catch {
      message.warning("后端接口暂未可用，已在本地预览状态变更");
    }
    if (action === "accept") patchOrderStatus(order.id, 3);
    if (action === "deliver") patchOrderStatus(order.id, 4);
    if (action === "complete")
      patchOrderStatus(order.id, 5, {
        deliveryTime: new Date().toLocaleString("zh-CN", { hour12: false }),
      });
  };

  const openDetail = async (record: OrderSummary) => {
    setSelected(record);
    setDetailOpen(true);
    try {
      const detail = await getOrder(record.id);
      setSelected({ ...record, ...detail });
    } catch {
      setSelected(record);
    }
  };

  const openReasonModal = (type: "reject" | "cancel", order: OrderSummary) => {
    setReasonTarget({ type, order });
    reasonForm.setFieldsValue({
      reason: type === "reject" ? rejectReasons[0] : cancelReasons[0],
      customReason: "",
    });
  };

  const submitReason = async (values: ReasonFormValues) => {
    if (!reasonTarget) return;
    const reason =
      values.reason === "custom"
        ? values.customReason || "自定义原因"
        : values.reason;
    try {
      if (reasonTarget.type === "reject")
        await rejectOrder(reasonTarget.order.id, reason);
      else await cancelOrder(reasonTarget.order.id, reason);
      message.success(
        reasonTarget.type === "reject" ? "订单已拒绝" : "订单已取消",
      );
    } catch {
      message.warning("后端接口暂未可用，已在本地预览状态变更");
    }
    patchOrderStatus(reasonTarget.order.id, 6, {
      cancelReason: reason,
      rejectionReason: reasonTarget.type === "reject" ? reason : undefined,
      cancelTime: new Date().toLocaleString("zh-CN", { hour12: false }),
    });
    setReasonTarget(null);
  };

  const columns: TableColumnsType<OrderSummary> = [
    {
      title: "订单号",
      dataIndex: "number",
      key: "number",
      fixed: "left",
      width: 175,
      render: (value) => (
        <span className="font-mono text-xs text-ink">{value || "--"}</span>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 105,
      render: (value) => (
        <Tag color={getStatusColor(value)}>{getStatusLabel(value)}</Tag>
      ),
    },
    {
      title: "订单菜品",
      dataIndex: "orderDishes",
      key: "orderDishes",
      width: 240,
      render: (value) => (
        <span className="text-sm text-slate-600">{value || "--"}</span>
      ),
    },
    {
      title: "顾客",
      dataIndex: "consignee",
      key: "consignee",
      width: 120,
      render: (value) => (
        <span className="font-medium text-ink">{value || "--"}</span>
      ),
    },
    {
      title: "手机号",
      dataIndex: "phone",
      key: "phone",
      width: 130,
      render: (value) => value || "--",
    },
    {
      title: "地址",
      dataIndex: "address",
      key: "address",
      width: 220,
      render: (value) => (
        <span className="text-slate-500">{value || "--"}</span>
      ),
    },
    {
      title: "金额",
      dataIndex: "amount",
      key: "amount",
      width: 105,
      render: (value) => (
        <span className="font-medium text-ink">{formatCurrency(value)}</span>
      ),
    },
    {
      title: "下单时间",
      dataIndex: "orderTime",
      key: "orderTime",
      width: 170,
      render: (value) => (
        <span className="text-xs text-slate-500">{formatDateTime(value)}</span>
      ),
    },
    {
      title: "备注",
      dataIndex: "remark",
      key: "remark",
      width: 160,
      render: (value) => value || "--",
    },
    {
      title: "操作",
      key: "actions",
      fixed: "right",
      width: 180,
      render: (_, record) => (
        <Space size="small">
          {Number(record.status) === 2 && (
            <Tooltip title="接单">
              <Button
                type="text"
                aria-label="接单"
                icon={<Check size={15} />}
                onClick={() => void runOrderAction(record, "accept")}
              />
            </Tooltip>
          )}
          {Number(record.status) === 2 && (
            <Tooltip title="拒单">
              <Button
                danger
                type="text"
                aria-label="拒单"
                icon={<Ban size={15} />}
                onClick={() => openReasonModal("reject", record)}
              />
            </Tooltip>
          )}
          {Number(record.status) === 3 && (
            <Tooltip title="派送">
              <Button
                type="text"
                aria-label="派送"
                icon={<Truck size={15} />}
                onClick={() => void runOrderAction(record, "deliver")}
              />
            </Tooltip>
          )}
          {Number(record.status) === 4 && (
            <Tooltip title="完成">
              <Button
                type="text"
                aria-label="完成"
                icon={<PackageCheck size={15} />}
                onClick={() => void runOrderAction(record, "complete")}
              />
            </Tooltip>
          )}
          {[1, 3, 4, 5].includes(Number(record.status)) && (
            <Tooltip title="取消">
              <Button
                danger
                type="text"
                aria-label="取消订单"
                icon={<Ban size={15} />}
                onClick={() => openReasonModal("cancel", record)}
              />
            </Tooltip>
          )}
          <Tooltip title="查看">
            <Button
              type="text"
              aria-label="查看订单"
              icon={<Eye size={15} />}
              onClick={() => void openDetail(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="订单管理"
        description="跟踪订单履约状态，处理接单、拒单、派送、完成与取消。"
        actions={
          usingFallback ? (
            <Tag color="orange">接口未连接 · 展示样例数据</Tag>
          ) : undefined
        }
      />
      <Card className="mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-60">
            <label className="mb-1.5 block text-xs text-slate-500">
              订单号
            </label>
            <Input
              allowClear
              prefix={<Search size={15} />}
              placeholder="搜索订单号"
              value={query.number}
              onChange={(event) =>
                setQuery({ ...query, number: event.target.value })
              }
            />
          </div>
          <div className="w-full sm:w-52">
            <label className="mb-1.5 block text-xs text-slate-500">
              手机号
            </label>
            <Input
              allowClear
              placeholder="搜索手机号"
              value={query.phone}
              onChange={(event) =>
                setQuery({ ...query, phone: event.target.value })
              }
            />
          </div>
          <div className="w-full sm:w-[320px]">
            <label className="mb-1.5 block text-xs text-slate-500">
              下单时间
            </label>
            <RangePicker
              className="w-full"
              showTime
              onChange={(_, dateStrings) =>
                setQuery({
                  ...query,
                  beginTime: dateStrings[0] || undefined,
                  endTime: dateStrings[1] || undefined,
                })
              }
            />
          </div>
          <Button onClick={() => void loadData(activeStatus)}>查询</Button>
        </div>
      </Card>
      <Card bodyStyle={{ padding: 0 }}>
        <div className="border-b border-slate-100 px-4 pt-3">
          <Tabs
            activeKey={String(activeStatus)}
            items={tabs}
            onChange={(key) => {
              const next = Number(key);
              setActiveStatus(next);
              void loadData(next);
            }}
          />
        </div>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={rows}
          locale={{ emptyText: <EmptyState label="暂无订单记录" /> }}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          scroll={{ x: 1420 }}
        />
      </Card>
      <Modal
        width={760}
        title="订单详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
      >
        {selected && (
          <Descriptions column={{ xs: 1, sm: 2 }} size="small" bordered>
            <Descriptions.Item label="订单号">
              {selected.number || "--"}
            </Descriptions.Item>
            <Descriptions.Item label="订单状态">
              <Tag color={getStatusColor(selected.status)}>
                {getStatusLabel(selected.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="顾客">
              {selected.consignee || "--"}
            </Descriptions.Item>
            <Descriptions.Item label="手机号">
              {selected.phone || "--"}
            </Descriptions.Item>
            <Descriptions.Item label="地址" span={2}>
              {selected.address || "--"}
            </Descriptions.Item>
            <Descriptions.Item label="订单菜品" span={2}>
              {selected.orderDishes || "--"}
            </Descriptions.Item>
            <Descriptions.Item label="实收金额">
              {formatCurrency(selected.amount)}
            </Descriptions.Item>
            <Descriptions.Item label="餐具数量">
              {selected.tablewareNumber ?? "--"}
            </Descriptions.Item>
            <Descriptions.Item label="下单时间">
              {formatDateTime(selected.orderTime)}
            </Descriptions.Item>
            <Descriptions.Item label="预计送达">
              {formatDateTime(selected.estimatedDeliveryTime)}
            </Descriptions.Item>
            <Descriptions.Item label="取消原因" span={2}>
              {selected.cancelReason || selected.rejectionReason || "--"}
            </Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {selected.remark || "--"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
      <Modal
        title={reasonTarget?.type === "reject" ? "拒绝订单" : "取消订单"}
        open={Boolean(reasonTarget)}
        onCancel={() => setReasonTarget(null)}
        onOk={() => reasonForm.submit()}
        okText="确认"
        cancelText="取消"
      >
        <Form form={reasonForm} layout="vertical" onFinish={submitReason}>
          <Form.Item
            name="reason"
            label="原因"
            rules={[{ required: true, message: "请选择原因" }]}
          >
            <Select
              options={[
                ...(reasonTarget?.type === "reject"
                  ? rejectReasons
                  : cancelReasons
                ).map((reason) => ({ label: reason, value: reason })),
                { label: "自定义原因", value: "custom" },
              ]}
            />
          </Form.Item>
          <Form.Item shouldUpdate noStyle>
            {() =>
              reasonForm.getFieldValue("reason") === "custom" && (
                <Form.Item
                  name="customReason"
                  label="自定义原因"
                  rules={[{ required: true, message: "请输入原因" }]}
                >
                  <Input.TextArea rows={3} maxLength={80} showCount />
                </Form.Item>
              )
            }
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
