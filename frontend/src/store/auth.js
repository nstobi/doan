import { defineStore } from 'pinia'
import api from '@/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token:   localStorage.getItem('token') || null,
    user:    JSON.parse(localStorage.getItem('user') || 'null'),
    loading: false,
    error:   null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin:    (state) => state.user?.role === 'admin',
    isTeacher:  (state) => state.user?.role === 'teacher',
    isStudent:  (state) => state.user?.role === 'student',
    isStaff:    (state) => ['admin', 'teacher'].includes(state.user?.role)
  },

  actions: {
    async login(email, password) {
      this.loading = true
      this.error   = null
      try {
        const { data } = await api.post('/auth/login', { email, password })
        this.token = data.token
        this.user  = data.user
        localStorage.setItem('token', data.token)
        localStorage.setItem('user',  JSON.stringify(data.user))
        return { success: true }
      } catch (err) {
        this.error = err.response?.data?.message || 'Đăng nhập thất bại'
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.token = null
      this.user  = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    initAuth() {
      const token = localStorage.getItem('token')
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
    }
  }
})
