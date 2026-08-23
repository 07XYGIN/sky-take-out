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

const SUCCESS_CODES = new Set(['1', '200'])

function isApiResponse(body: unknown): body is ApiResponse {
  return typeof body === 'object' && body !== null && 'code' in body
}

function clearAuthSession() {
  removeToken()
  removeStoredUser()
  window.dispatchEvent(new Event('sky-auth-expired'))
}

function toApiError(body: unknown) {
  if (!isApiResponse(body) || body.code === undefined) {
    return null
  }

  const code = String(body.code)
  if (SUCCESS_CODES.has(code)) {
    return null
  }

  if (code === '401') {
    clearAuthSession()
  }

  return new Error(body.msg || body.message || '请求失败')
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
  (response) => {
    const apiError = toApiError(response.data)
    if (apiError) {
      return Promise.reject(apiError)
    }
    return response
  },
  (error) => {
    const apiError = toApiError(error.response?.data)
    if (apiError) {
      return Promise.reject(apiError)
    }
    return Promise.reject(error)
  },
)

export async function requestData<T>(config: AxiosRequestConfig) {
  const response = await request.request<ApiResponse<T> | T>(config)
  const body = response.data
  if (body && typeof body === 'object' && 'data' in body && 'code' in body) {
    const envelope = body as ApiResponse<T>
    if (envelope.code !== undefined && !SUCCESS_CODES.has(String(envelope.code))) {
      throw new Error(envelope.msg || envelope.message || '请求失败')
    }
    return envelope.data
  }
  return body as T
}

export default request
