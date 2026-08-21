export interface PageResult<T> {
  records: T[]
  total: number
  page?: number
  pageSize?: number
}

export interface Employee {
  id: number
  username: string
  name: string
  phone?: string
  sex?: string
  idNumber?: string
  status: number
  createTime?: string
}

export interface Category {
  id: number
  name: string
  type: number
  sort: number
  status: number
  createTime?: string
}

export interface Dish {
  id: number
  name: string
  categoryId: number
  categoryName?: string
  price: number
  image?: string
  description?: string
  status: number
  updateTime?: string
}

export interface Setmeal {
  id: number
  name: string
  categoryId: number
  categoryName?: string
  price: number
  image?: string
  description?: string
  status: number
  updateTime?: string
}

export interface OrderSummary {
  id: number | string
  number?: string
  orderTime?: string
  consignee?: string
  phone?: string
  address?: string
  orderDishes?: string
  remark?: string
  tablewareNumber?: number
  estimatedDeliveryTime?: string
  deliveryTime?: string
  cancelTime?: string
  cancelReason?: string
  rejectionReason?: string
  amount?: number
  status?: number | string
  statusName?: string
}

export interface DashboardData {
  turnover?: number
  validOrderCount?: number
  unitPrice?: number
  newUsers?: number
  waitingOrders?: number
  deliveredOrders?: number
  completedOrders?: number
  cancelledOrders?: number
}

export interface SessionUser {
  id?: number
  username?: string
  name?: string
  avatar?: string
  roles?: string[]
}
