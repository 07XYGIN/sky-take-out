import { requestData } from '../lib/http'

export interface StatisticsPoint {
  date?: string
  turnover?: number
  orderCount?: number
  validOrderCount?: number
  unitPrice?: number
  newUsers?: number
  totalUsers?: number
  day:string
  amount:number
  number:number
  valid:number
  total:number
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
  return requestData<StatisticsPoint[]>({ method: 'get', url: '/workspace/report/turnoverStatistics', params })
}

