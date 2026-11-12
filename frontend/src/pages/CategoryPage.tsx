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
import type { TableColumnsType, TablePaginationConfig } from "antd";
import { Edit3, Plus, Search, Trash2 } from "lucide-react";
import {
  addCategory,
  changeCategoryStatus,
  deleteCategory,
  editCategory,
  getCategoryPage,
} from "../api/category";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { StatusPill } from "../components/StatusPill";
import type { Category } from "../types";

const fallbackCategories: Category[] = [];

export function CategoryPage() {
  const [form] = Form.useForm<Partial<Category>>();
  const [rows, setRows] = useState<Category[]>(fallbackCategories);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [query, setQuery] = useState({
    name: "",
    type: undefined as number | undefined,
  });

  const loadData = async (currentPage = page, currentSize = pageSize) => {
    setLoading(true);
    try {
      const result = await getCategoryPage({
        page: currentPage,
        pageSize: currentSize,
        ...query,
      });
      setRows(result.list || []);
      setTotal(result.total || 0);
    } catch {
      // Keep the local sample list visible while the zero-based backend is being built.
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    const nextPage = pagination.current || 1;
    const nextSize = pagination.pageSize || pageSize;
    setPage(nextPage);
    setPageSize(nextSize);
    void loadData(nextPage, nextSize);
  };

  useEffect(() => {
    void loadData();
  }, []);

  const openModal = (record?: Category) => {
    form.resetFields();
    setEditing(record || null);
    form.setFieldsValue(record || { name: "", type: 1, sort: 1, status: 1 });
    setModalOpen(true);
  };

  const submit = async (values: Partial<Category>) => {
    try {
      if (editing) await editCategory({ ...values, id: editing.id });
      else await addCategory(values);
      message.success(editing ? "分类已更新" : "分类已创建");
      setModalOpen(false);
      setPage(1);
      await loadData(1, pageSize);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "保存失败");
    }
  };

  const columns: TableColumnsType<Category> = [
    {
      title: "分类名称",
      dataIndex: "name",
      key: "name",
      render: (value) => <span className="font-medium text-ink">{value}</span>,
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      render: (value) => (value === 1 ? "菜品分类" : "套餐分类"),
    },
    { title: "排序", dataIndex: "sort", key: "sort", width: 100 },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (value, record) => (
        <Switch
          size="small"
          checked={value === 1}
          onChange={async (checked) => {
            try {
              await changeCategoryStatus(record.id, checked ? 1 : 0);
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
      ),
    },
    {
      title: "状态说明",
      dataIndex: "statusText",
      key: "statusText",
      render: (_, record) => <StatusPill status={record.status} />,
    },
    {
      title: "操作",
      key: "action",
      width: 130,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            aria-label="编辑分类"
            icon={<Edit3 size={15} />}
            onClick={() => openModal(record)}
          />
          <Popconfirm
            title="确认删除这个分类吗？"
            onConfirm={async () => {
              try {
                await deleteCategory(record.id);
                const nextPage = rows.length === 1 && page > 1 ? page - 1 : page;
                setPage(nextPage);
                await loadData(nextPage, pageSize);
                message.success("分类已删除");
              } catch (error) {
                message.error(error instanceof Error ? error.message : "删除失败");
              }
            }}
          >
            <Button
              danger
              type="text"
              aria-label="删除分类"
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
        title="分类管理"
        description="统一维护菜品和套餐的分类结构。"
        actions={
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => openModal()}
          >
            新建分类
          </Button>
        }
      />
      <Card className="mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-64">
            <label className="mb-1.5 block text-xs text-slate-500">
              分类名称
            </label>
            <Input
              allowClear
              prefix={<Search size={15} />}
              value={query.name}
              placeholder="搜索分类"
              onChange={(event) =>
                setQuery({ ...query, name: event.target.value })
              }
            />
          </div>
          <div className="w-full sm:w-40">
            <label className="mb-1.5 block text-xs text-slate-500">
              分类类型
            </label>
            <Select
              allowClear
              className="w-full"
              placeholder="全部类型"
              value={query.type}
              options={[
                { label: "菜品分类", value: 1 },
                { label: "套餐分类", value: 2 },
              ]}
              onChange={(type) => setQuery({ ...query, type })}
            />
          </div>
          <Button
            onClick={() => {
              setPage(1);
              void loadData(1, pageSize);
            }}
          >
            查询
          </Button>
        </div>
      </Card>
      <Card bodyStyle={{ padding: 0 }}>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={rows}
          locale={{ emptyText: <EmptyState label="没有匹配的分类" /> }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            showTotal: (count) => `共 ${count} 条`,
          }}
          onChange={handleTableChange}
        />
      </Card>
      <Modal
        title={editing ? "编辑分类" : "新建分类"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: "请输入分类名称" }]}
          >
            <Input placeholder="例如：主食" maxLength={20} />
          </Form.Item>
          <Form.Item name="type" label="分类类型" rules={[{ required: true }]}>
            <Select
              options={[
                { label: "菜品分类", value: 1 },
                { label: "套餐分类", value: 2 },
              ]}
            />
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <InputNumber min={1} max={99} className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
