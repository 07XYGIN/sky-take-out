import { requestData } from '../lib/http'
import type { EmployeeProfile, SessionUser } from '../types'

export interface LoginPayload {
  username: string
  password: string
}

export interface RegisterPayload {
  username: string
  password: string
  name: string
  phone: string
  sex: string
  idNumber: string
}

export interface LoginResult {
  token?: string
  authorization?: string
  user?: SessionUser
  name?: string
  avatar?: string
  [key: string]: unknown
}

export interface EmployeeCancelPayload {
  password: string
}

export interface EmployeePasswordPayload {
  oldPassword: string
  newPassword: string
}

export function login(data: LoginPayload) {
  return requestData<LoginResult>({ method: 'post', url: '/employee/login', data })
}

export function register(data: RegisterPayload) {
  return requestData<unknown>({ method: 'post', url: '/employee/register', data })
}

export function logout() {
  return requestData<unknown>({ method: 'post', url: '/employee/logout' })
}

export function getMyProfile() {
  return requestData<EmployeeProfile>({ method: 'get', url: '/employee/me' })
}

export function cancelAccount(data: EmployeeCancelPayload) {
  return requestData<unknown>({ method: 'post', url: '/employee/cancel', data })
}

export function changePassword(data: EmployeePasswordPayload) {
  return requestData<unknown>({ method: 'put', url: '/employee/password', data })
}
