import { requestData } from '../lib/http'
import type { SessionUser } from '../types'

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
  roles?: string[]
  name?: string
  avatar?: string
  [key: string]: unknown
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
