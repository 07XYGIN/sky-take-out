import { Button } from "antd";
import { useNavigate } from "react-router-dom";

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <p className="text-6xl font-semibold text-ink">404</p>
      <p className="text-slate-500">页面不存在</p>
      <Button type="primary" onClick={() => navigate("/dashboard")}>
        返回工作台
      </Button>
    </div>
  );
}
