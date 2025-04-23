import { ref } from 'vue'

const TOKEN_KEY = 'token'

export function useAuth() {
  const token = ref(getToken())

  function setToken(value, hours = 6) {
    const expires = new Date()
    expires.setTime(expires.getTime() + hours * 60 * 60 * 1000)
    document.cookie = `${TOKEN_KEY}=${value}; expires=${expires.toUTCString()}; path=/`
    token.value = value
  }

  function getToken() {
    const match = document.cookie.match(new RegExp(`(^| )${TOKEN_KEY}=([^;]+)`))
    return match ? match[2] : ''
  }

  function removeToken() {
    document.cookie = `${TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
    token.value = ''
  }

  function isLoggedIn() {
    return !!getToken()
  }

  function parseJwt(token) {
    try {
      const base64Payload = token.split('.')[1]
      const payload = atob(base64Payload)
      return JSON.parse(payload)
    } catch (e) {
      console.error('解析 JWT 失败:', e)
      return null
    }
  }

  function getUserFromToken() {
    const token = getToken()
    if (!token) return null
    return parseJwt(token)
  }

  return {
    token,
    setToken,
    getToken,
    removeToken,
    isLoggedIn,
    getUserFromToken
  }
}
