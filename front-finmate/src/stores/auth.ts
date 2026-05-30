import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

export interface User {
  id: number
  name: string
  email: string
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(
    JSON.parse(localStorage.getItem('user') ?? 'null'),
  )

  const isAuthenticated = computed(() => !!token.value)

  function persist (tokenValue: string, userValue: User) {
    token.value = tokenValue
    user.value = userValue
    localStorage.setItem('token', tokenValue)
    localStorage.setItem('user', JSON.stringify(userValue))
  }

  function clear () {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  async function login (email: string, password: string) {
    const res = await api.post('/auth/login', { email, password })
    const { token: t, user: u } = res.data
    persist(t, u)
    router.push('/dashboard')
  }

  async function register (name: string, email: string, password: string) {
    const res = await api.post('/auth/register', { name, email, password })
    const { token: t, user: u } = res.data
    persist(t, u)
    router.push('/dashboard')
  }

  async function logout () {
    try {
      await api.post('/auth/logout')
    } finally {
      clear()
      router.push('/login')
    }
  }

  return { token, user, isAuthenticated, login, register, logout }
})
