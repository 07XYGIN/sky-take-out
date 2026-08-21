import { requestData } from '../lib/http'
import type { SessionUser } from '../types'

export interface LoginPayload {
  username: string
  password: string
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

export function logout() {
  return requestData<unknown>({ method: 'post', url: '/employee/logout' })
}
