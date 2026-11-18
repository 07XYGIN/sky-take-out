import store from '../store'
import { baseUrl } from './env'

export function request({ url = '', params = {}, method = 'GET' }) {
    const header = { 'Content-Type': 'application/json' }
    if (store.state.token) {
        header.Authorization = 'Bearer ' + store.state.token
    }
    return new Promise((resolve, reject) => {
        uni.request({
            url: baseUrl + url,
            data: params,
            method: method.toUpperCase(),
            header,
            timeout: 15000,
            success(res) {
                const body = res.data || {}
                if (res.statusCode >= 200 && res.statusCode < 300 &&
                    (Number(body.code) === 200 || Number(body.code) === 1)) {
                    // 旧页面使用 code === 1，统一适配后端的 200。
                    const result = { ...body, code: 1 }
                    if (result.data && Array.isArray(result.data.list)) {
                        result.data.records = result.data.list
                    }
                    resolve(result)
                    return
                }
                if (res.statusCode === 401 || Number(body.code) === 401) {
                    store.commit('clearSession')
                }
                const error = new Error(body.msg || body.message || '请求失败，请稍后重试')
                error.msg = error.message
                uni.showToast({ title: error.message, icon: 'none' })
                uni.hideLoading()
                reject(error)
            },
            fail() {
                const error = new Error('无法连接服务器，请检查网络和接口地址')
                error.msg = error.message
                uni.showToast({ title: error.message, icon: 'none' })
                uni.hideLoading()
                reject(error)
            }
        })
    })
}
