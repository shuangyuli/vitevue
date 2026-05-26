import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const username = ref<string>(localStorage.getItem('username') || '')
  const isAuthenticated = ref<boolean>(!!token.value)

  const login = async (user: string, password: string, remember: boolean): Promise<void> => {
    // Mock API — replace with real request
    await new Promise(resolve => setTimeout(resolve, 800))

    if (user === 'admin' && password === 'admin123') {
      const fakeToken = 'token_' + Date.now()
      token.value = fakeToken
      username.value = user
      isAuthenticated.value = true

      if (remember) {
        localStorage.setItem('token', fakeToken)
        localStorage.setItem('username', user)
      } else {
        sessionStorage.setItem('token', fakeToken)
        sessionStorage.setItem('username', user)
      }
      return
    }

    throw new Error('用户名或密码错误')
  }

  const logout = () => {
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
