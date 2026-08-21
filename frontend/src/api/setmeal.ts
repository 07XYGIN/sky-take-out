import { requestData } from '../lib/http'
import type { Category, PageResult, Setmeal } from '../types'

export function getSetmealPage(params: Record<string, unknown>) {
  return requestData<PageResult<Setmeal>>({ method: 'get', url: '/setmeal/page', params })
}

export function getSetmeal(id: number) {
  return requestData<Setmeal>({ method: 'get', url: `/setmeal/${id}` })
}

export function addSetmeal(data: Partial<Setmeal>) {
  return requestData<unknown>({ method: 'post', url: '/setmeal', data })
}

export function editSetmeal(data: Partial<Setmeal>) {
  return requestData<unknown>({ method: 'put', url: '/setmeal', data })
}

export function deleteSetmeal(ids: number[]) {
  return requestData<unknown>({ method: 'delete', url: '/setmeal', params: { ids: ids.join(',') } })
}

export function changeSetmealStatus(id: number, status: number) {
  return requestData<unknown>({ method: 'post', url: `/setmeal/status/${status}`, params: { id } })
}

export function getSetmealCategories() {
  return requestData<Category[]>({ method: 'get', url: '/category/list', params: { type: 2 } })
}
