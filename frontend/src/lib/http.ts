import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import { getToken, removeStoredUser, removeToken } from './storage'

export interface ApiResponse<T = unknown> {
  code?: number | string
  data: T
  msg?: string
  message?: string
  status?: number
}

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 60_000,
})

request.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
    config.headers.set('token', token)
  }
  return config
})

request.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken()
      removeStoredUser()
      window.dispatchEvent(new Event('sky-auth-expired'))
    }
    return Promise.reject(error)
  },
)

export async function requestData<T>(config: AxiosRequestConfig) {
  const response = await request.request<ApiResponse<T> | T>(config)
  const body = response.data
  if (body && typeof body === 'object' && 'data' in body && 'code' in body) {
    const envelope = body as ApiResponse<T>
    if (envelope.code !== undefined && String(envelope.code) !== '1' && String(envelope.code) !== '200') {
      throw new Error(envelope.msg || envelope.message || '请求失败')
    }
    return envelope.data
  }
  return body as T
}

export default request
