import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const username = ref<string>(localStorage.getItem('username') || '')
  const isAuthenticated = ref<boolean>(!!token.value)

  const login = async (user: string, password: string, remember: boolean): Promise<void> => {
    const { data } = await api.post('/auth/login', { username: user, password, remember })
    if (data.code === 200) {
      const t = data.data.token
      const u = data.data.username
      token.value = t
      username.value = u
      isAuthenticated.value = true

      if (remember) {
        localStorage.setItem('token', t)
        localStorage.setItem('username', u)
      } else {
        sessionStorage.setItem('token', t)
        sessionStorage.setItem('username', u)
      }
      return
    }
    throw new Error(data.message || '登录失败')
  }

  const logout = () => {
    api.post('/auth/logout').catch(() => {})
    token.value = ''
    username.value = ''
    isAuthenticated.value = false
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    sessionStorage.clear()
  }

  const restoreSession = () => {
    const t = localStorage.getItem('token') || sessionStorage.getItem('token')
    const u = localStorage.getItem('username') || sessionStorage.getItem('username')
    if (t) {
      token.value = t
      username.value = u || ''
      isAuthenticated.value = true
    }
  }

  return { token, username, isAuthenticated, login, logout, restoreSession }
})
