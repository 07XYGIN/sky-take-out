import { useState } from "react";
import { Button, Form, Input, message } from "antd";
import { ArrowRight, LockKeyhole, Store, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import type { LoginPayload } from "../api/auth";
import type { SessionUser } from "../types";
import { useAuthStore } from "../store/auth";

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  const handleFinish = async (values: LoginPayload) => {
    setLoading(true);
    try {
      const result = await login(values);
      const token = result.token || result.authorization;
      if (!token) throw new Error("登录响应中缺少 token");
      const user: SessionUser = result.user || {
        username: values.username,
        name: result.name,
        avatar: result.avatar,
      };
      setSession(token, user);
      message.success("登录成功");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "登录失败，请检查账号和密码",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page min-h-screen bg-ink">
      <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
          <div className="relative z-10 flex items-center gap-3">
            {/* <span className="flex h-10 w-10 items-center justify-center rounded-md bg-saffron font-black text-ink">
              天
            </span> */}
            <span className="text-lg font-semibold tracking-tight">
              苍穹外卖
            </span>
          </div>
          <div className="relative z-10 max-w-xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-saffron">
              restaurant operations / 01
            </p>
            <h1 className="max-w-lg text-5xl font-semibold leading-[1.08] tracking-tight xl:text-6xl">
              把每一单，
              <br />
              <span className="text-saffron">送到刚刚好。</span>
            </h1>
            <p className="mt-7 max-w-md text-base leading-7 text-white/55">
              从菜单、库存到订单履约，把门店每天最重要的动作放在同一张工作台上。
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-3 text-xs text-white/35">
            <span className="h-px w-10 bg-saffron" />{" "}
            <span>运营台 · 管理端</span>
          </div>
          <div
            className="login-grid absolute inset-0 opacity-30"
            aria-hidden="true"
          />
        </section>
        <section className="flex items-center justify-center bg-canvas px-5 py-10 sm:px-12">
          <div className="w-full max-w-[420px]">
            <div className="mb-10 lg:hidden">
              <div className="mb-6 flex items-center gap-3">
                {/* <span className="flex h-10 w-10 items-center justify-center rounded-md bg-saffron font-black text-ink">
                  天
                </span> */}
                <span className="text-lg font-semibold text-ink">苍穹外卖</span>
              </div>
              <p className="text-sm text-slate-500">
                门店运营，从今天的第一单开始。
              </p>
            </div>
            <div className="mb-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-saffron">
                welcome back
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-ink">
                登录运营台
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                使用员工账号进入门店管理系统
              </p>
            </div>
            <Form<LoginPayload>
              layout="vertical"
              size="large"
              onFinish={handleFinish}
              requiredMark={false}
            >
              <Form.Item
                name="username"
                label="账号"
                rules={[{ required: true, message: "请输入账号" }]}
              >
                <Input
                  prefix={<UserRound size={17} />}
                  placeholder="请输入员工账号"
                  autoComplete="username"
                />
              </Form.Item>
              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: "请输入密码" }]}
              >
                <Input.Password
                  prefix={<LockKeyhole size={17} />}
                  placeholder="请输入登录密码"
                  autoComplete="current-password"
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
                进入运营台
              </Button>
            </Form>
            <div className="mt-5 flex items-center justify-center gap-2 text-sm text-slate-500">
              <span>还没有账号？</span>
              <Link
                className="font-medium text-teal transition hover:text-ink"
                to="/register"
              >
                去注册
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400">
              <Store size={14} /> <span>苍穹外卖 · 门店管理端</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
