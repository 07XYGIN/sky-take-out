import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  message,
} from "antd";
import type { TableColumnsType } from "antd";
import { Edit3, Plus, Search, Trash2 } from "lucide-react";
import {
  changeDishStatus,
  deleteDish,
  addDish,
  editDish,
  getDishCategories,
  getDishPage,
} from "../api/dish";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { StatusPill } from "../components/StatusPill";
import { formatCurrency } from "../lib/format";
import type { Category, Dish } from "../types";

const fallbackDishes: Dish[] = [
  {
    id: 1,
    name: "招牌卤肉饭",
    categoryId: 1,
    categoryName: "主食",
    price: 28,
    status: 1,
    description: "慢火卤香，配温泉蛋和时蔬。",
  },
  {
    id: 2,
    name: "青花椒鸡腿饭",
    categoryId: 1,
    categoryName: "主食",
    price: 32,
    status: 1,
    description: "鲜麻不燥，鸡腿肉嫩。",
  },
  {
    id: 3,
    name: "芝士薯角",
    categoryId: 2,
    categoryName: "小吃",
    price: 16,
    status: 0,
    description: "外酥内松，附芝士蘸酱。",
  },
];

export function DishPage() {
  const [form] = Form.useForm<Partial<Dish>>();
  const [rows, setRows] = useState<Dish[]>(fallbackDishes);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Dish | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await getDishPage({
        page: 1,
        pageSize: 100,
        name: query || undefined,
        categoryId,
      });
      setRows(result.records || []);
    } catch {
      // Sample records keep the management surface useful before the backend is complete.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    getDishCategories()
      .then(setCategories)
      .catch(() => undefined);
  }, []);

  const openModal = (record?: Dish) => {
    setEditing(record || null);
    form.setFieldsValue(
      record || {
        name: "",
        categoryId: undefined,
        price: 0,
        status: 1,
        image: "",
        description: "",
      },
    );
    setModalOpen(true);
  };

  const submit = async (values: Partial<Dish>) => {
    try {
      if (editing) await editDish({ ...values, id: editing.id });
      else await addDish(values);
      message.success(editing ? "菜品已更新" : "菜品已创建");
      setModalOpen(false);
      await loadData();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "保存失败");
    }
  };

  const columns: TableColumnsType<Dish> = [
    {
      title: "菜品",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      width: 220,
      render: (value, record) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#fff7e7] text-sm font-semibold text-saffron">
            {record.image ? (
              <img
                src={record.image}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              value?.slice(0, 1)
            )}
          </div>
          <div>
            <p className="font-medium text-ink">{value}</p>
            <p className="mt-0.5 text-xs text-slate-400">
              {record.description || "暂无描述"}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "分类",
      dataIndex: "categoryName",
      key: "categoryName",
      render: (value) => value || "--",
    },
    {
      title: "售价",
      dataIndex: "price",
      key: "price",
      render: (value) => (
        <span className="font-medium text-ink">{formatCurrency(value)}</span>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (value, record) => (
        <div className="flex items-center gap-3">
          <Switch
            size="small"
            checked={value === 1}
            onChange={async (checked) => {
              try {
                await changeDishStatus(record.id, checked ? 1 : 0);
                setRows((current) =>
                  current.map((item) =>
                    item.id === record.id
                      ? { ...item, status: checked ? 1 : 0 }
                      : item,
                  ),
                );
              } catch {
                message.error("状态更新失败");
              }
            }}
          />
          <StatusPill status={value} activeLabel="在售" inactiveLabel="停售" />
        </div>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 130,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            aria-label="编辑菜品"
            icon={<Edit3 size={15} />}
            onClick={() => openModal(record)}
          />
          <Popconfirm
            title="确认删除这个菜品吗？"
            onConfirm={async () => {
              try {
                await deleteDish([record.id]);
                setRows((current) =>
                  current.filter((item) => item.id !== record.id),
                );
                message.success("菜品已删除");
              } catch {
                message.error("删除失败");
              }
            }}
          >
            <Button
              danger
              type="text"
              aria-label="删除菜品"
              icon={<Trash2 size={15} />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="菜品管理"
        description="管理菜品售价、分类和上架状态。"
        actions={
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => openModal()}
          >
            新增菜品
          </Button>
        }
      />
      <Card className="mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-72">
            <label className="mb-1.5 block text-xs text-slate-500">
              菜品名称
            </label>
            <Input
              allowClear
              prefix={<Search size={15} />}
              placeholder="搜索菜品"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="w-full sm:w-44">
            <label className="mb-1.5 block text-xs text-slate-500">
              菜品分类
            </label>
            <Select
              allowClear
              className="w-full"
              placeholder="全部分类"
              value={categoryId}
              options={categories.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
              onChange={setCategoryId}
            />
          </div>
          <Button onClick={() => void loadData()}>查询</Button>
        </div>
      </Card>
      <Card bodyStyle={{ padding: 0 }}>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={rows
            .filter((row) => !query || row.name.includes(query))
            .filter((row) => !categoryId || row.categoryId === categoryId)}
          locale={{ emptyText: <EmptyState label="暂无菜品记录" /> }}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 850 }}
        />
      </Card>
      <Modal
        width={620}
        title={editing ? "编辑菜品" : "新增菜品"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" onFinish={submit}>
          <div className="grid gap-1 sm:grid-cols-2 sm:gap-4">
            <Form.Item
              name="name"
              label="菜品名称"
              rules={[{ required: true, message: "请输入菜品名称" }]}
            >
              <Input maxLength={30} />
            </Form.Item>
            <Form.Item
              name="categoryId"
              label="菜品分类"
              rules={[{ required: true, message: "请选择分类" }]}
            >
              <Select
                options={categories.map((category) => ({
                  label: category.name,
                  value: category.id,
                }))}
                placeholder="选择分类"
              />
            </Form.Item>
            <Form.Item
              name="price"
              label="售价"
              rules={[{ required: true, message: "请输入售价" }]}
            >
              <InputNumber
                min={0}
                precision={2}
                className="w-full"
                prefix="¥"
              />
            </Form.Item>
            <Form.Item name="image" label="图片地址">
              <Input placeholder="可填写对象存储或本地图片 URL" />
            </Form.Item>
          </div>
          <Form.Item name="description" label="菜品描述">
            <Input.TextArea rows={3} maxLength={120} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
