// src/composables/useApi.js
import { ref } from 'vue'

const API_URL = process.env.VUE_APP_API_URL
const API_KEY = process.env.VUE_APP_API_KEY
const IS_DEV = process.env.VUE_APP_API_ENV !== 'production'

export function useApi() {
  const loading = ref(false)
  const error = ref(null)

  const request = async (endpoint, options = {}, useMock = false) => {
    if (IS_DEV && useMock) {
      console.warn(`[useApi] Mock模式启用: ${endpoint}`)
      return null
    }

    loading.value = true
    error.value = null

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY || '',
          ...(options.headers || {})
        }
      })

      const result = await res.json()

      if (!res.ok) {
        console.error(`[useApi] 请求失败: ${res.status}`, result)
        error.value = result.message || '请求失败'
        return null
      }

      return result
    } catch (err) {
      console.error(`[useApi] 网络错误:`, err)
      error.value = err.message || '网络错误'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    request,
    loading,
    error
  }
}
