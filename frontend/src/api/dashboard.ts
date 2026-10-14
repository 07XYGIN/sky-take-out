import { requestData } from '../lib/http'
import type { DashboardData, OrderSummary, Setmeal, Dish, BusinessDataEcharts } from '../types'

export function getBusinessData() {
  return requestData<DashboardData>({ method: 'get', url: '/workspace/businessData' })
}

export function getOverviewOrders() {
  return requestData<OrderSummary[]>({ method: 'get', url: '/workspace/overviewOrders' })
}

export function getOverviewDishes() {
  return requestData<Dish[]>({ method: 'get', url: '/workspace/overviewDishes' })
}

export function getOverviewSetmeals() {
  return requestData<Setmeal[]>({ method: 'get', url: '/workspace/overviewSetmeals' })
}

export function getBusinessEcharts(){
  return requestData<BusinessDataEcharts>({method:"get",url:"/workspace/businessDataEcharts"})
}

export function getBusinessStatus(){
  return requestData<BusinessDataEcharts>({method:"get",url:"/workspace/businessStatus"})

}