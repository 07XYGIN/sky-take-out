import { ConfigProvider } from 'antd'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from '../layout/AdminLayout'
import { useAuthStore } from '../store/auth'
import { CategoryPage } from '../pages/CategoryPage'
import { DashboardPage } from '../pages/DashboardPage'
import { DishPage } from '../pages/DishPage'
import { EmployeePage } from '../pages/EmployeePage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { OrderPage } from '../pages/OrderPage'
import { SetmealPage } from '../pages/SetmealPage'
import { StatisticsPage } from '../pages/StatisticsPage'

const demoMode = import.meta.env.VITE_DEMO_MODE === 'true'

function ProtectedRoutes() {
  const token = useAuthStore((state) => state.token)
  if (!token && !demoMode) return <Navigate to="/login" replace />
  return <AdminLayout />
}

export function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2e8780',
          colorLink: '#2e8780',
          borderRadius: 6,
          fontFamily: 'Inter, "PingFang SC", "Microsoft YaHei", sans-serif',
        },
        components: {
          Button: { controlHeight: 38 },
          Input: { controlHeight: 38 },
          Select: { controlHeight: 38 },
        },
      }}
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/orders" element={<OrderPage />} />
          <Route path="/setmeals" element={<SetmealPage />} />
          <Route path="/dishes" element={<DishPage />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/employees" element={<EmployeePage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ConfigProvider>
  )
}
