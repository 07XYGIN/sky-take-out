import { requestData } from '../lib/http'
import type { OrderSummary, PageResult } from '../types'

export interface OrderStatusStatistics {
  toBeConfirmed?: number
  confirmed?: number
  deliveryInProgress?: number
}

export function getOrderPage(params: Record<string, unknown>) {
  return requestData<PageResult<OrderSummary>>({ method: 'get', url: '/order/conditionSearch', params })
}

export function getOrder(id: number | string) {
  return requestData<OrderSummary>({ method: 'get', url: `/order/details/${id}` })
}

export function acceptOrder(id: number | string) {
  return requestData<unknown>({ method: 'put', url: '/order/confirm', data: { id } })
}

export function rejectOrder(id: number | string, cancelReason: string) {
  return requestData<unknown>({ method: 'put', url: '/order/rejection', data: { id, rejectionReason: cancelReason } })
}

export function cancelOrder(id: number | string, cancelReason: string) {
  return requestData<unknown>({ method: 'put', url: '/order/cancel', data: { id, cancelReason } })
}

export function deliverOrder(id: number | string) {
  return requestData<unknown>({ method: 'put', url: `/order/delivery/${id}` })
}

export function completeOrder(id: number | string) {
  return requestData<unknown>({ method: 'put', url: `/order/complete/${id}` })
}

export function getOrderStatusStatistics() {
  return requestData<OrderStatusStatistics>({ method: 'get', url: '/order/statistics' })
}
