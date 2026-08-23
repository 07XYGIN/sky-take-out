import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Modal,
  Tag,
  message,
} from "antd";
import { KeyRound, LogOut, ShieldAlert, UserRound } from "lucide-react";
import {
  cancelAccount,
  changePassword,
  getMyProfile,
} from "../api/auth";
import { PageHeader } from "../components/PageHeader";
import { useAuthStore } from "../store/auth";
import type { EmployeeProfile } from "../types";

interface PasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface CancelFormValues {
  password: string;
}

function formatDate(value?: string) {
  return value || "--";
}

function formatSex(value?: string) {
  if (value === "1") return "男";
  if (value === "0") return "女";
  return value || "--";
}

export function ProfilePage() {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [passwordForm] = Form.useForm<PasswordFormValues>();
  const [cancelForm] = Form.useForm<CancelFormValues>();
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    let active = true;
    void getMyProfile()
      .then((result) => {
        if (active) setProfile(result);
      })
      .catch((error) => {
        message.error(error instanceof Error ? error.message : "用户信息加载失败");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleChangePassword = async (values: PasswordFormValues) => {
    try {
      await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success("密码修改成功，请重新登录");
      passwordForm.resetFields();
      setPasswordModalOpen(false);
      clearSession();
      window.location.replace("/login");
    } catch (error) {
      message.error(error instanceof Error ? error.message : "密码修改失败");
    }
  };

  const handleCancelAccount = async (values: CancelFormValues) => {
    try {
      await cancelAccount(values);
      message.success("账号已注销");
      cancelForm.resetFields();
      setCancelModalOpen(false);
      clearSession();
      window.location.replace("/login");
    } catch (error) {
      message.error(error instanceof Error ? error.message : "账号注销失败");
    }
  };

  return (
    <div>
      <PageHeader
        title="账号信息"
        description="查看当前员工账号资料，并管理登录凭证。"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              icon={<KeyRound size={15} />}
              onClick={() => setPasswordModalOpen(true)}
            >
              修改密码
            </Button>
            <Button
              danger
              icon={<ShieldAlert size={15} />}
              onClick={() => setCancelModalOpen(true)}
            >
              注销账号
            </Button>
          </div>
        }
      />

      <Card loading={loading}>
        {profile && (
          <Descriptions
            bordered
            column={{ xs: 1, sm: 2, lg: 3 }}
            items={[
              { key: "id", label: "员工编号", children: profile.id },
              {
                key: "status",
                label: "账号状态",
                children:
                  profile.status === 1 ? (
                    <Tag color="success">正常</Tag>
                  ) : (
                    <Tag color="error">已注销</Tag>
                  ),
              },
              { key: "username", label: "登录账号", children: profile.username },
              { key: "name", label: "姓名", children: profile.name },
              { key: "phone", label: "手机号", children: profile.phone || "--" },
              {
                key: "sex",
                label: "性别",
                children: formatSex(profile.sex),
              },
              {
                key: "idNumber",
                label: "身份证号",
                children: profile.idNumber || "--",
              },
              {
                key: "createTime",
                label: "创建时间",
                children: formatDate(profile.createTime),
              },
              {
                key: "updateTime",
                label: "更新时间",
                children: formatDate(profile.updateTime),
              },
            ]}
          />
        )}
        {!loading && !profile && (
          <div className="flex min-h-40 flex-col items-center justify-center text-slate-400">
            <UserRound size={28} />
            <p className="mt-3">暂无账号信息</p>
          </div>
        )}
      </Card>

      <Card className="mt-4 border-slate-200" title="登录凭证">
        <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>修改密码后，当前登录会话会立即失效。</span>
          <Button
            type="link"
            icon={<LogOut size={15} />}
            onClick={() => setPasswordModalOpen(true)}
          >
            管理密码
          </Button>
        </div>
      </Card>

      <Modal
        title="修改密码"
        open={passwordModalOpen}
        onCancel={() => {
          passwordForm.resetFields();
          setPasswordModalOpen(false);
        }}
        onOk={() => passwordForm.submit()}
        okText="确认修改"
        cancelText="取消"
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            name="oldPassword"
            label="旧密码"
            rules={[{ required: true, message: "请输入旧密码" }]}
          >
            <Input.Password placeholder="请输入当前密码" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: "请输入新密码" },
              { min: 6, max: 64, message: "新密码长度必须为6到64个字符" },
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "请再次输入新密码" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次输入的密码不一致"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="注销账号"
        open={cancelModalOpen}
        onCancel={() => {
          cancelForm.resetFields();
          setCancelModalOpen(false);
        }}
        onOk={() => cancelForm.submit()}
        okText="确认注销"
        okButtonProps={{ danger: true }}
        cancelText="取消"
      >
        <p className="mb-5 text-sm leading-6 text-slate-500">
          注销后账号将无法登录，员工记录会保留但状态变为已注销。
        </p>
        <Form form={cancelForm} layout="vertical" onFinish={handleCancelAccount}>
          <Form.Item
            name="password"
            label="当前密码"
            rules={[{ required: true, message: "请输入当前密码" }]}
          >
            <Input.Password placeholder="请输入当前密码确认注销" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
