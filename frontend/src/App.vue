<template>
  <!-- Trang public (login, forbidden): không có sidebar -->
  <router-view v-if="isPublicRoute" />

  <!-- Sinh viên: trang riêng, không có sidebar -->
  <router-view v-else-if="authStore.isStudent" />

  <!-- Admin / Teacher: có sidebar -->
  <div v-else class="app-layout">

    <!-- Thanh bên trái -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span>🎓</span>
        <span class="logo-text">EduManager</span>
      </div>

      <nav class="sidebar-nav">
        <!-- Tổng quan: ai cũng thấy -->
        <!-- Thay trong App.vue -->
      <router-link to="/majors" class="nav-item" active-class="active">
        <span>📋</span><span>Chương trình</span>    <!-- Ngành học → Chương trình -->
      </router-link>
      <router-link to="/subjects" class="nav-item" active-class="active">
        <span>🎯</span><span>Kỹ năng</span>          <!-- Môn học → Kỹ năng -->
      </router-link>
      <router-link to="/programs" class="nav-item" active-class="active">
        <span>🗺️</span><span>Lộ trình học</span>    <!-- Chương trình đào tạo → Lộ trình -->
      </router-link>
      <router-link to="/accounts" class="nav-item" active-class="active">
        <span>👥</span><span>Tài khoản</span>
      </router-link>
      <router-link to="/students" class="nav-item" active-class="active">
        <span>👩‍🎓</span><span>Học viên</span>        <!-- Sinh viên → Học viên -->
      </router-link>
      <router-link to="/classes" class="nav-item" active-class="active">
        <span>🏛️</span><span>Lớp học</span>
      </router-link>
      </nav>

      <!-- Thông tin user + nút đăng xuất -->
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">{{ userInitial }}</div>
          <div class="user-meta">
            <div class="user-name">{{ authStore.user?.name }}</div>
            <div class="user-role">{{ roleLabel }}</div>
          </div>
        </div>
        <button class="logout-btn" @click="logout" title="Đăng xuất">⏻</button>
      </div>
    </aside>

    <!-- Nội dung chính -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const route     = useRoute()
const router    = useRouter()
const authStore = useAuthStore()

// Khởi tạo auth khi app load (đọc token từ localStorage)
authStore.initAuth()

const isPublicRoute = computed(() => !!route.meta.public)

// Lấy chữ cái đầu của tên để hiển thị avatar
const userInitial = computed(() => authStore.user?.name?.charAt(0)?.toUpperCase() || 'U')

// Nhãn hiển thị role
const roleLabel = computed(() => ({
  admin:   '👑 Quản trị viên',
  teacher: '👨‍🏫 Giáo viên',
  student: '👩‍🎓 Sinh viên'
}[authStore.user?.role] || ''))

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-layout { display: flex; min-height: 100vh; }

.sidebar {
  width: var(--sidebar-w);
  background: var(--primary);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 100;
}

.sidebar-logo {
  padding: 20px 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255,255,255,.1);
  font-size: 24px;
}
.logo-text { font-size: 16px; font-weight: 700; color: white; }

.sidebar-nav { flex: 1; padding: 12px 8px; overflow-y: auto; }

.nav-section {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .1em;
  color: rgba(255,255,255,.4);
  padding: 14px 10px 6px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 7px;
  color: rgba(255,255,255,.75);
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 500;
  transition: var(--transition);
  margin-bottom: 2px;
}
.nav-item:hover  { background: rgba(255,255,255,.1); color: #fff; }
.nav-item.active { background: var(--accent); color: #fff; }

.sidebar-footer {
  padding: 14px 12px;
  border-top: 1px solid rgba(255,255,255,.1);
  display: flex;
  align-items: center;
  gap: 10px;
}
.user-info   { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.user-avatar {
  width: 34px; height: 34px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 14px; flex-shrink: 0;
}
.user-meta  { min-width: 0; }
.user-name  { font-size: 13px; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role  { font-size: 11px; color: rgba(255,255,255,.55); }

.logout-btn {
  background: rgba(255,255,255,.1);
  border: none;
  color: rgba(255,255,255,.7);
  width: 32px; height: 32px;
  border-radius: 7px;
  cursor: pointer;
  font-size: 16px;
  display: flex; align-items: center; justify-content: center;
  transition: var(--transition);
  flex-shrink: 0;
}
.logout-btn:hover { background: rgba(255,255,255,.2); color: #fff; }

.main-content {
  flex: 1;
  margin-left: var(--sidebar-w);
  padding: 28px 32px;
  min-height: 100vh;
}
</style>
