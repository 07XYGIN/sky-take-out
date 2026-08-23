import { useEffect, useState } from "react";
import { Button, Card, Form, Input, Modal, Switch, Table, message } from "antd";
import type { TableColumnsType } from "antd";
import { Edit3, Plus, Search } from "lucide-react";
import {
  addEmployee,
  changeEmployeeStatus,
  editEmployee,
  getEmployeePage,
} from "../api/employee";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { StatusPill } from "../components/StatusPill";
import type { Employee } from "../types";

const fallbackEmployees: Employee[] = [
  {
    id: 1,
    username: "admin",
    name: "店长",
    phone: "138****8001",
    status: 1,
    createTime: "2026-08-01 09:20:12",
  },
  {
    id: 2,
    username: "operator01",
    name: "李晓晴",
    phone: "139****6022",
    status: 1,
    createTime: "2026-08-04 10:12:48",
  },
  {
    id: 3,
    username: "operator02",
    name: "王晨",
    phone: "136****1988",
    status: 0,
    createTime: "2026-08-08 15:43:11",
  },
];

export function EmployeePage() {
  const [form] = Form.useForm<Partial<Employee> & { password?: string }>();
  const [rows, setRows] = useState<Employee[]>(fallbackEmployees);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await getEmployeePage({
        page: 1,
        pageSize: 100,
        name: query || undefined,
      });
      setRows(result.records || []);
    } catch {
      // Keep sample records visible until the backend endpoint is available.
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void loadData();
  }, []);

  const openModal = (record?: Employee) => {
    setEditing(record || null);
    form.setFieldsValue(
      record || { username: "", name: "", phone: "", status: 1 },
    );
    setModalOpen(true);
  };

  const submit = async (values: Partial<Employee> & { password?: string }) => {
    try {
      if (editing) await editEmployee({ ...values, id: editing.id });
      else await addEmployee(values);
      message.success(editing ? "员工信息已更新" : "员工已创建");
      setModalOpen(false);
      await loadData();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "保存失败");
    }
  };

  const columns: TableColumnsType<Employee> = [
    {
      title: "账号",
      dataIndex: "username",
      key: "username",
      render: (value) => (
        <span className="font-mono text-xs text-ink">{value}</span>
      ),
    },
    {
      title: "姓名",
      dataIndex: "name",
      key: "name",
      render: (value) => <span className="font-medium text-ink">{value}</span>,
    },
    {
      title: "手机号",
      dataIndex: "phone",
      key: "phone",
      render: (value) => value || "--",
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
                await changeEmployeeStatus(record.id, checked ? 1 : 0);
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
          <StatusPill status={value} />
        </div>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      key: "createTime",
      render: (value) => (
        <span className="text-xs text-slate-500">{value || "--"}</span>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 90,
      render: (_, record) => (
        <Button
          type="text"
          aria-label="编辑员工"
          icon={<Edit3 size={15} />}
          onClick={() => openModal(record)}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="员工管理"
        description="维护门店员工账号、联系方式和可用状态。"
        actions={
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => openModal()}
          >
            新增员工
          </Button>
        }
      />
      <Card className="mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-72">
            <label className="mb-1.5 block text-xs text-slate-500">姓名</label>
            <Input
              allowClear
              prefix={<Search size={15} />}
              placeholder="搜索员工姓名"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
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
          dataSource={rows.filter((row) => !query || row.name.includes(query))}
          locale={{ emptyText: <EmptyState label="暂无员工记录" /> }}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </Card>
      <Modal
        title={editing ? "编辑员工" : "新增员工"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" onFinish={submit}>
          <div className="grid gap-1 sm:grid-cols-2 sm:gap-4">
            <Form.Item
              name="username"
              label="登录账号"
              rules={[{ required: true, message: "请输入登录账号" }]}
            >
              <Input disabled={Boolean(editing)} />
            </Form.Item>
            <Form.Item
              name="name"
              label="员工姓名"
              rules={[{ required: true, message: "请输入员工姓名" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="手机号">
              <Input />
            </Form.Item>
            <Form.Item
              name="password"
              label={editing ? "重置密码（选填）" : "初始密码"}
              rules={
                editing ? [] : [{ required: true, message: "请输入初始密码" }]
              }
            >
              <Input.Password />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
