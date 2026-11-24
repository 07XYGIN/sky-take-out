import { requestData } from '../lib/http'
import type { DashboardData, Dish, BusinessDataEcharts } from '../types'

export function getBusinessData() {
  return requestData<DashboardData>({ method: 'get', url: '/workspace/businessData' })
}

export function getOverviewDishes() {
  return requestData<Dish[]>({ method: 'get', url: '/workspace/overviewDishes' })
}

export function getBusinessEcharts(){
  return requestData<BusinessDataEcharts>({method:"get",url:"/workspace/businessDataEcharts"})
}

export function getBusinessStatus(){
  return requestData<BusinessDataEcharts>({method:"get",url:"/workspace/businessStatus"})

}
