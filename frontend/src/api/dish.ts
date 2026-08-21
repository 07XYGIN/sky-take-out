import { requestData } from '../lib/http'
import type { Category, Dish, PageResult } from '../types'

export function getDishPage(params: Record<string, unknown>) {
  return requestData<PageResult<Dish>>({ method: 'get', url: '/dish/page', params })
}

export function getDish(id: number) {
  return requestData<Dish>({ method: 'get', url: `/dish/${id}` })
}

export function addDish(data: Partial<Dish>) {
  return requestData<unknown>({ method: 'post', url: '/dish', data })
}

export function editDish(data: Partial<Dish>) {
  return requestData<unknown>({ method: 'put', url: '/dish', data })
}

export function deleteDish(ids: number[]) {
  return requestData<unknown>({ method: 'delete', url: '/dish', params: { ids: ids.join(',') } })
}

export function changeDishStatus(id: number, status: number) {
  return requestData<unknown>({ method: 'post', url: `/dish/status/${status}`, params: { id } })
}

export function getDishCategories() {
  return requestData<Category[]>({ method: 'get', url: '/category/list', params: { type: 1 } })
}
