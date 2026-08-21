import { requestData } from '../lib/http'
import type { Category, PageResult } from '../types'

export function getCategoryPage(params: Record<string, unknown>) {
  return requestData<PageResult<Category>>({ method: 'get', url: '/category/page', params })
}

export function getCategoryList(params?: Record<string, unknown>) {
  return requestData<Category[]>({ method: 'get', url: '/category/list', params })
}

export function addCategory(data: Partial<Category>) {
  return requestData<unknown>({ method: 'post', url: '/category', data })
}

export function editCategory(data: Partial<Category>) {
  return requestData<unknown>({ method: 'put', url: '/category', data })
}

export function deleteCategory(id: number) {
  return requestData<unknown>({ method: 'delete', url: '/category', params: { id } })
}

export function changeCategoryStatus(id: number, status: number) {
  return requestData<unknown>({ method: 'post', url: `/category/status/${status}`, params: { id } })
}
