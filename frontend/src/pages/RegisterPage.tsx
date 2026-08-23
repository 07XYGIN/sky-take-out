import { useState } from "react";
import { Button, Form, Input, Select, message } from "antd";
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  LockKeyhole,
  Phone,
  Store,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import type { RegisterPayload } from "../api/auth";

interface RegisterFormValues extends RegisterPayload {
  confirmPassword: string;
}

export function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFinish = async ({
    confirmPassword,
    ...values
  }: RegisterFormValues) => {
    setLoading(true);
    try {
      await register(values);
      message.success("注册成功，请登录");
      navigate("/login", { replace: true });
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "注册失败，请稍后再试",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page min-h-screen bg-ink">
      <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
          <div className="relative z-10 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-saffron font-black text-ink">
              天
            </span>
            <span className="text-lg font-semibold tracking-tight">
              苍穹外卖
            </span>
          </div>
          <div className="relative z-10 max-w-xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-saffron">
              restaurant operations / 02
            </p>
            <h1 className="max-w-lg text-5xl font-semibold leading-[1.08] tracking-tight xl:text-6xl">
              新的门店账号，
              <br />
              <span className="text-saffron">从第一单开始。</span>
            </h1>
            <p className="mt-7 max-w-md text-base leading-7 text-white/55">
              注册后即可使用运营台管理订单、菜品、套餐和经营数据。
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-3 text-xs text-white/35">
            <span className="h-px w-10 bg-saffron" />{" "}
            <span>运营台 · 注册账号</span>
          </div>
          <div
            className="login-grid absolute inset-0 opacity-30"
            aria-hidden="true"
          />
        </section>
        <section className="flex items-center justify-center bg-canvas px-5 py-10 sm:px-12">
          <div className="w-full max-w-[440px]">
            <Link
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-ink"
              to="/login"
            >
              <ArrowLeft size={16} /> 返回登录
            </Link>
            <div className="mb-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-saffron">
                create account
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-ink">
                注册运营账号
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                填写账号信息后进入登录页
              </p>
            </div>
            <Form<RegisterFormValues>
              layout="vertical"
              size="large"
              onFinish={handleFinish}
              requiredMark={false}
            >
              <Form.Item
                name="username"
                label="账号"
                rules={[
                  { required: true, message: "请输入账号" },
                  { min: 4, message: "账号至少 4 位" },
                ]}
              >
                <Input
                  prefix={<UserRound size={17} />}
                  placeholder="请输入登录账号"
                  autoComplete="username"
                />
              </Form.Item>
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: "请输入姓名" }]}
              >
                <Input
                  prefix={<Store size={17} />}
                  placeholder="请输入员工姓名"
                  autoComplete="name"
                />
              </Form.Item>
              <Form.Item name="phone" label="手机号">
                <Input
                  prefix={<Phone size={17} />}
                  placeholder="请输入手机号"
                  autoComplete="tel"
                />
              </Form.Item>
              <Form.Item
                name="sex"
                label="性别"
              >
                <Select
                  placeholder="请选择性别"
                  options={[
                    { label: "男", value: "1" },
                    { label: "女", value: "0" },
                  ]}
                />
              </Form.Item>
              <Form.Item name="idNumber" label="身份证号">
                <Input
                  prefix={<CreditCard size={17} />}
                  placeholder="请输入18位身份证号"
                  maxLength={18}
                  autoComplete="off"
                />
              </Form.Item>
              <Form.Item name="password" label="密码">
                <Input.Password
                  prefix={<LockKeyhole size={17} />}
                  placeholder="请输入登录密码"
                  autoComplete="new-password"
                />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="确认密码"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "请再次输入密码" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value)
                        return Promise.resolve();
                      return Promise.reject(new Error("两次输入的密码不一致"));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockKeyhole size={17} />}
                  placeholder="请再次输入密码"
                  autoComplete="new-password"
                />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                icon={<ArrowRight size={17} />}
                iconPosition="end"
                className="mt-3 h-11 font-medium"
              >
                创建账号
              </Button>
            </Form>
            <div className="mt-5 text-center text-sm text-slate-500">
              已有账号？{" "}
              <Link
                className="font-medium text-teal transition hover:text-ink"
                to="/login"
              >
                去登录
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
