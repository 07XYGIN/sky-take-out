import { requestData } from '../lib/http'

export interface StatisticsPoint {
  date?: string
  turnover?: number
  orderCount?: number
  validOrderCount?: number
  unitPrice?: number
  newUsers?: number
  totalUsers?: number
}

export interface SeriesStatistics {
  dateList?: string[] | string
  turnoverList?: number[] | string
  totalUserList?: number[] | string
  newUserList?: number[] | string
  orderCountList?: number[] | string
  validOrderCountList?: number[] | string
  totalOrderCount?: number
  validOrderCount?: number
  orderCompletionRate?: number
}

export interface TopStatistics {
  nameList?: string[] | string
  numberList?: number[] | string
}

export function getTurnoverStatistics(params: Record<string, unknown>) {
  return requestData<SeriesStatistics | StatisticsPoint[]>({ method: 'get', url: '/report/turnoverStatistics', params })
}

export function getUserStatistics(params: Record<string, unknown>) {
  return requestData<SeriesStatistics | StatisticsPoint[]>({ method: 'get', url: '/report/userStatistics', params })
}

export function getOrderStatistics(params: Record<string, unknown>) {
  return requestData<SeriesStatistics | StatisticsPoint[]>({ method: 'get', url: '/report/ordersStatistics', params })
}

export function getTopStatistics(params: Record<string, unknown>) {
  return requestData<TopStatistics | Array<{ name: string; number: number }>>({ method: 'get', url: '/report/top10', params })
}
