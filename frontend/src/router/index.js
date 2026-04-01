import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/views/DashboardView.vue')
  },
  {
    path: '/majors',
    component: () => import('@/views/MajorsView.vue')
  },
  {
    path: '/subjects',
    component: () => import('@/views/SubjectsView.vue')
  },
  {
    path: '/programs',
    component: () => import('@/views/ProgramsView.vue')
  },
  {
    path: '/students',
    component: () => import('@/views/StudentsView.vue')
  },
  {
    path: '/students/:id',
    component: () => import('@/views/StudentDetail.vue')
  },
  {
    path: '/classes',
    component: () => import('@/views/ClassesView.vue')
  },
  {
    path: '/classes/:id',
    component: () => import('@/views/ClassDetail.vue')
  },
  {
    path: '/attendance/:classId/session/:sessionIndex',
    component: () => import('@/views/AttendanceView.vue')
  },
  {
  path: '/assignments/:id',
  component: () => import('@/views/AssignmentDetail.vue')
  },
  {
  path: '/assignments/:id/submit',
  component: () => import('@/views/SubmitView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router