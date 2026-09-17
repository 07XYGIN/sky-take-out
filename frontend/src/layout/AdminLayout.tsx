import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Breadcrumb,
  Button,
  Dropdown,
  Layout,
  Menu,
  Tooltip,
} from "antd";
import type { MenuProps } from "antd";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Package,
  Settings2,
  Tags,
  UserRound,
  UsersRound,
  Utensils,
} from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../api/auth";
import { useAuthStore } from "../store/auth";

const { Header, Sider, Content } = Layout;

const menuItems: MenuProps["items"] = [
  { key: "/dashboard", icon: <LayoutDashboard size={17} />, label: "工作台" },
  { key: "/statistics", icon: <BarChart3 size={17} />, label: "数据统计" },
  { key: "/orders", icon: <ClipboardList size={17} />, label: "订单管理" },
  { key: "/setmeals", icon: <Package size={17} />, label: "套餐管理" },
  { key: "/dishes", icon: <Utensils size={17} />, label: "菜品管理" },
  { key: "/categories", icon: <Tags size={17} />, label: "分类管理" },
  { key: "/employees", icon: <UsersRound size={17} />, label: "员工管理" },
];

const routeNames: Record<string, string> = {
  "/dashboard": "工作台",
  "/statistics": "数据统计",
  "/orders": "订单管理",
  "/setmeals": "套餐管理",
  "/dishes": "菜品管理",
  "/categories": "分类管理",
  "/employees": "员工管理",
  "/profile": "账号信息",
};

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearSession } = useAuthStore();
  const selectedKey = `/${location.pathname.split("/")[1] || "dashboard"}`;

  useEffect(() => {
    const onExpired = () => {
      clearSession();
      navigate("/login", { replace: true });
    };
    window.addEventListener("sky-auth-expired", onExpired);
    return () => window.removeEventListener("sky-auth-expired", onExpired);
  }, [clearSession, navigate]);

  const accountItems: MenuProps["items"] = useMemo(
    () => [
      { key: "profile", icon: <UserRound size={15} />, label: "账号信息" },
      { type: "divider" },
      { key: "logout", icon: <LogOut size={15} />, label: "退出登录" },
    ],
    [],
  );

  const handleAccountAction: MenuProps["onClick"] = async ({ key }) => {
    if (key === "profile") {
      navigate("/profile");
      return;
    }
    if (key !== "logout") return;
    try {
      await logout();
    } catch {
      // The local session is still cleared when the API is unavailable.
    }
    clearSession();
    // navigate("/login", { replace: true });
  };

  return (
    <Layout className="min-h-screen bg-canvas">
      <Sider
        breakpoint="lg"
        collapsedWidth={0}
        trigger={null}
        collapsible
        collapsed={collapsed}
        onBreakpoint={(broken) => setMobileOpen(!broken ? false : mobileOpen)}
        className={`admin-sider ${mobileOpen ? "admin-sider-mobile-open" : ""}`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
          {/* <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-saffron text-sm font-black text-ink">
            天
          </div> */}
          {!collapsed && (
            <div className="min-w-0 text-white">
              <p className="truncate text-[15px] font-semibold">苍穹外卖</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-white/45">
                store operations
              </p>
            </div>
          )}
        </div>
        <div className="px-3 pt-5">
          {!collapsed && (
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
              workspace
            </p>
          )}
          <Menu
            theme="dark"
            mode="inline"
            items={menuItems}
            selectedKeys={[selectedKey]}
            onClick={({ key }) => {
              navigate(key);
              setMobileOpen(false);
            }}
          />
        </div>
        <div className="absolute bottom-5 left-4 right-4 border-t border-white/10 pt-4 text-xs text-white/40">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Settings2 size={14} /> <span>门店运营台</span>
            </div>
          )}
        </div>
      </Sider>
      <Layout>
        <Header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-7">
          <div className="flex items-center gap-3">
            <Tooltip title={collapsed ? "展开导航" : "收起导航"}>
              <Button
                type="text"
                aria-label={collapsed ? "展开导航" : "收起导航"}
                icon={
                  collapsed ? (
                    <ChevronRight size={18} />
                  ) : (
                    <ChevronLeft size={18} />
                  )
                }
                onClick={() => setCollapsed(!collapsed)}
              />
            </Tooltip>
            <Button
              className="lg:hidden"
              type="text"
              aria-label="打开导航"
              icon={<MenuIcon size={18} />}
              onClick={() => setMobileOpen(true)}
            />
            <Breadcrumb
              items={[
                { title: "苍穹外卖" },
                { title: routeNames[selectedKey] || "页面" },
              ]}
            />
          </div>
          <Dropdown
            menu={{ items: accountItems, onClick: handleAccountAction }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <button
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition hover:bg-slate-100"
              type="button"
            >
              <Avatar
                size={30}
                src={user?.avatar}
                icon={<UserRound size={16} />}
                className="bg-ink"
              />
              <span className="hidden text-sm font-medium text-ink sm:block">
                {user?.name || user?.username || "管理员"}
              </span>
            </button>
          </Dropdown>
        </Header>
        <Content className="overflow-auto bg-canvas p-4 sm:p-7">
          <div className="mx-auto max-w-[1440px]">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
