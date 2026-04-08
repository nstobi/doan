import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const routes = [
  // Public
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

  // Admin + Teacher
  {
    path: '/',
    component: () => import('@/views/DashboardView.vue'),
    meta: { auth: true, roles: ['admin', 'teacher'] }
  },
  {
    path: '/majors',
    component: () => import('@/views/MajorsView.vue'),
    meta: { auth: true, roles: ['admin'] }
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

  // Student portal
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

  // Catch all
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  // Public routes
  if (to.meta.public) {
    if (to.path === '/login' && auth.isLoggedIn) {
      return auth.isStudent ? '/student-portal' : '/'
    }
    return true
  }

  // Not logged in → login
  if (to.meta.auth && !auth.isLoggedIn) {
    return '/login'
  }

  // Wrong role → forbidden
  if (to.meta.roles && !to.meta.roles.includes(auth.user?.role)) {
    return '/forbidden'
  }

  return true
})

export default router
