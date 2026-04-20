// src/router/index.js - Định nghĩa các trang và bảo vệ route
// ===================================================
// Router: quản lý việc chuyển trang trong Vue app
//
// Mỗi route có meta để kiểm soát quyền truy cập:
//   public: true  → ai cũng vào được (login, forbidden)
//   auth: true    → phải đăng nhập
//   roles: [...]  → phải có role phù hợp
//
// beforeEach: chạy trước mỗi lần chuyển trang để kiểm tra quyền
// ===================================================

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const routes = [
  // ── Trang public (không cần đăng nhập) ──────────
  {
    path: '/login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true }
  },
  {
    path: '/forbidden',
    component: () => import('@/views/ForbiddenView.vue'),
    meta: { public: true }
  },

  // ── Trang Admin + Teacher ────────────────────────
  {
    path: '/',
    component: () => import('@/views/DashboardView.vue'),
    meta: { auth: true, roles: ['admin', 'teacher'] }
  },
  {
    path: '/majors',
    component: () => import('@/views/MajorsView.vue'),
    meta: { auth: true, roles: ['admin'] }          // chỉ admin
  },
  {
    path: '/subjects',
    component: () => import('@/views/SubjectsView.vue'),
    meta: { auth: true, roles: ['admin'] }
  },
  {
    path: '/programs',
    component: () => import('@/views/ProgramsView.vue'),
    meta: { auth: true, roles: ['admin'] }
  },
  {
    path: '/accounts',
    component: () => import('@/views/AccountsView.vue'),
    meta: { auth: true, roles: ['admin'] }          // quản lý tài khoản
  },
  {
    path: '/students',
    component: () => import('@/views/StudentsView.vue'),
    meta: { auth: true, roles: ['admin', 'teacher'] }
  },
  {
    path: '/students/:id',
    component: () => import('@/views/StudentDetail.vue'),
    meta: { auth: true, roles: ['admin', 'teacher'] }
  },
  {
    path: '/classes',
    component: () => import('@/views/ClassesView.vue'),
    meta: { auth: true, roles: ['admin', 'teacher'] }
  },
  {
    path: '/classes/:id',
    component: () => import('@/views/ClassDetail.vue'),
    meta: { auth: true, roles: ['admin', 'teacher'] }
  },
  {
    path: '/attendance/:classId/session/:sessionIndex',
    component: () => import('@/views/AttendanceView.vue'),
    meta: { auth: true, roles: ['admin', 'teacher'] }
  },
  {
    path: '/assignments/:id',
    component: () => import('@/views/AssignmentDetail.vue'),
    meta: { auth: true, roles: ['admin', 'teacher'] }
  },

  // ── Trang Student ────────────────────────────────
  {
    path: '/student-portal',
    component: () => import('@/views/StudentPortal.vue'),
    meta: { auth: true, roles: ['student'] }
  },
  {
    path: '/assignments/:id/submit',
    component: () => import('@/views/SubmitView.vue'),
    meta: { auth: true, roles: ['student'] }
  },

  // Mọi URL không khớp → về trang chủ
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Kiểm tra quyền trước mỗi lần chuyển trang
router.beforeEach((to) => {
  const auth = useAuthStore()

  // Trang public: nếu đã đăng nhập mà vào /login → redirect về trang chính
  if (to.meta.public) {
    if (to.path === '/login' && auth.isLoggedIn) {
      return auth.isStudent ? '/student-portal' : '/'
    }
    return true
  }

  // Chưa đăng nhập → về trang login
  if (to.meta.auth && !auth.isLoggedIn) {
    return '/login'
  }

  // Sai role → trang forbidden
  if (to.meta.roles && !to.meta.roles.includes(auth.user?.role)) {
    return '/forbidden'
  }

  return true
})

export default router
