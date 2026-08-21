import { requestData } from '../lib/http'
import type { Employee, PageResult } from '../types'

export function getEmployeePage(params: Record<string, unknown>) {
  return requestData<PageResult<Employee>>({ method: 'get', url: '/employee/page', params })
}

export function addEmployee(data: Partial<Employee> & { password?: string }) {
  return requestData<unknown>({ method: 'post', url: '/employee', data })
}

export function editEmployee(data: Partial<Employee>) {
  return requestData<unknown>({ method: 'put', url: '/employee', data })
}

export function changeEmployeeStatus(id: number, status: number) {
  return requestData<unknown>({ method: 'post', url: `/employee/status/${status}`, params: { id } })
}

export function getEmployee(id: number) {
  return requestData<Employee>({ method: 'get', url: `/employee/${id}` })
}
