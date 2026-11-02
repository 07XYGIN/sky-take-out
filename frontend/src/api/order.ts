import { requestData } from '../lib/http'
import type { OrderSummary, PageResult } from '../types'

export interface OrderStatusStatistics {
  allOrders?:number,
  waiting?: number,
  confirmed?: number,
  delivering?: number,
  completed?:number,
  cancelled?:number
}

export function getOrderPage(params: Record<string, unknown>) {
  return requestData<PageResult<OrderSummary>>({ method: 'get', url: '/order/conditionSearch', params })
}

export function getOrder(id: number | string) {
  return requestData<OrderSummary>({ method: 'get', url: `/order/details/${id}` })
}

export function acceptOrder(number: string) {
  return requestData<unknown>({ method: 'put', url: '/order/confirm', data: { id: number } })
}

export function rejectOrder(number: string, cancelReason: string) {
  return requestData<unknown>({ method: 'put', url: '/order/rejection', data: { id: number, cancelReason } })
}

export function cancelOrder(number: string, cancelReason: string) {
  return requestData<unknown>({ method: 'put', url: '/order/cancel', data: { id: number, cancelReason } })
}

export function deliverOrder(number: string) {
  return requestData<unknown>({ method: 'put', url: `/order/delivery/${encodeURIComponent(number)}` })
}

export function completeOrder(number: string) {
  return requestData<unknown>({ method: 'put', url: `/order/complete/${encodeURIComponent(number)}` })
}

export function getOrderStatusStatistics() {
  return requestData<OrderStatusStatistics>({ method: 'get', url: '/order/statistics' })
}
