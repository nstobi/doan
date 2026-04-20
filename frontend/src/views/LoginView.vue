<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-logo">🎓</div>
      <h1 class="login-title">Academic Portal</h1>
      <p class="login-sub">Hệ thống Quản lý Đào tạo</p>

      <form @submit.prevent="handleLogin">
        <div v-if="error" class="alert alert-error">{{ error }}</div>

        <div class="form-group">
          <label class="form-label">Email</label>
          <input v-model="form.email" type="email" class="form-control"
            placeholder="admin@school.edu.vn" required :disabled="loading" />
        </div>

        <div class="form-group">
          <label class="form-label">Mật khẩu</label>
          <div class="pw-wrap">
            <input v-model="form.password" :type="showPw ? 'text' : 'password'"
              class="form-control" placeholder="••••••••" required :disabled="loading" />
            <button type="button" class="pw-toggle" @click="showPw = !showPw">
              {{ showPw ? '🙈' : '👁' }}
            </button>
          </div>
        </div>

        <button type="submit" class="btn btn-primary login-btn" :disabled="loading">
          {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable */
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router    = useRouter()
const authStore = useAuthStore()

const form    = reactive({ email: '', password: '' })
const loading = ref(false)
const error   = ref('')
const showPw  = ref(false)

const handleLogin = async () => {
  loading.value = true
  error.value   = ''
  const result  = await authStore.login(form.email, form.password)
  if (result.success) {
    if (authStore.isStudent) router.push('/student-portal')
    else router.push('/')
  } else {
    error.value = result.message
  }
  loading.value = false
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary) 0%, #2c5282 100%);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.login-card {
  background: white; border-radius: 16px; padding: 40px;
  width: 100%; max-width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,.25);
}
.login-logo  { font-size: 52px; text-align: center; margin-bottom: 8px; }
.login-title { font-size: 26px; font-weight: 700; color: var(--primary); text-align: center; margin-bottom: 4px; }
.login-sub   { font-size: 13px; color: var(--gray-400); text-align: center; margin-bottom: 28px; }
.pw-wrap     { position: relative; }
.pw-toggle   { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 16px; }
.login-btn   { width: 100%; justify-content: center; padding: 12px; font-size: 15px; margin-top: 4px; }
</style>
