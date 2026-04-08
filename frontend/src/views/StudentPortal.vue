<template>
  <div class="portal-wrap">
    <div class="portal-header">
      <div style="display:flex;align-items:center;gap:14px">
        <span style="font-size:40px">🎓</span>
        <div><h2>Xin chào, {{ authStore.user?.name }}!</h2><p class="text-muted">Cổng thông tin sinh viên</p></div>
      </div>
      <button class="btn btn-ghost" @click="logout">⏻ Đăng xuất</button>
    </div>

    <div v-if="loading" class="loading-wrap"><div class="spinner"></div></div>

    <div v-else-if="student">
      <div class="grid-2" style="margin-bottom:20px">
        <div class="card">
          <div class="card-header"><h3>👤 Thông tin cá nhân</h3></div>
          <div class="card-body">
            <div class="info-row"><span class="info-label">Mã SV</span><span>{{ student.studentId }}</span></div>
            <div class="info-row"><span class="info-label">Họ tên</span><span>{{ student.name }}</span></div>
            <div class="info-row"><span class="info-label">Email</span><span>{{ student.email }}</span></div>
            <div class="info-row"><span class="info-label">Ngành</span><span>{{ student.major?.name }}</span></div>
            <div class="info-row"><span class="info-label">Kỳ hiện tại</span><span class="badge badge-info">Kỳ {{ student.currentSemester }}</span></div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h3>📊 Tổng quan</h3></div>
          <div class="card-body">
            <div class="stat-row">
              <div class="stat-item"><div class="stat-val">{{ currentSubjects.length }}</div><div class="stat-lbl">Môn đang học</div></div>
              <div class="stat-item"><div class="stat-val">{{ myClasses.length }}</div><div class="stat-lbl">Lớp học</div></div>
              <div class="stat-item"><div class="stat-val">{{ student.currentSemester }}</div><div class="stat-lbl">Kỳ học</div></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Current subjects -->
      <div class="card" style="margin-bottom:20px">
        <div class="card-header"><h3>📚 Môn học kỳ {{ student.currentSemester }}</h3></div>
        <div class="card-body" style="padding:0">
          <table>
            <thead><tr><th>Mã môn</th><th>Tên môn</th><th>Tín chỉ</th><th>Trạng thái</th></tr></thead>
            <tbody>
              <tr v-for="es in currentSubjects" :key="es._id">
                <td><span class="badge badge-info">{{ es.subject?.code }}</span></td>
                <td>{{ es.subject?.name }}</td>
                <td>{{ es.subject?.credits }} TC</td>
                <td><span class="badge" :class="subClass(es.status)">{{ subLabel(es.status) }}</span></td>
              </tr>
              <tr v-if="!currentSubjects.length"><td colspan="4" class="empty-state">Chưa có môn học</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Classes -->
      <div class="card" style="margin-bottom:20px">
        <div class="card-header"><h3>🏛️ Lớp học của tôi</h3></div>
        <div class="card-body" style="padding:0">
          <div v-if="!myClasses.length" class="empty-state"><p>Chưa có lớp học nào</p></div>
          <table v-else>
            <thead><tr><th>Tên lớp</th><th>Môn học</th><th>Số buổi</th><th>Học liệu</th><th>Bài thi</th></tr></thead>
            <tbody>
              <tr v-for="cls in myClasses" :key="cls._id">
                <td><strong>{{ cls.name }}</strong></td>
                <td>{{ cls.subject?.name }}</td>
                <td>{{ cls.sessions?.length || 0 }} buổi</td>
                <td><button class="btn btn-ghost btn-sm" @click="viewMaterials(cls)">📁 Xem</button></td>
                <td><button class="btn btn-ghost btn-sm" @click="viewAssignments(cls)">📝 Xem</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Materials panel -->
      <div class="card" style="margin-bottom:20px" v-if="selectedClass && showMaterials">
        <div class="card-header"><h3>📁 Học liệu — {{ selectedClass.name }}</h3><button class="btn btn-ghost btn-sm" @click="showMaterials=false">✕</button></div>
        <div class="card-body" style="padding:0">
          <div v-if="loadingMaterials" class="loading-wrap"><div class="spinner"></div></div>
          <div v-else-if="!materials.length" class="empty-state"><p>Chưa có học liệu</p></div>
          <table v-else>
            <thead><tr><th>Tài liệu</th><th>Loại</th><th>Thao tác</th></tr></thead>
            <tbody>
              <tr v-for="m in materials" :key="m._id">
                <td><div style="font-weight:600">{{ m.title }}</div><div class="text-muted">{{ m.originalName }}</div></td>
                <td><span class="badge badge-info">{{ m.type }}</span></td>
                <td><button class="btn btn-primary btn-sm" @click="downloadMaterial(m)">⬇️ Tải về</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Assignments panel -->
      <div class="card" v-if="selectedClass && showAssignments">
        <div class="card-header"><h3>📝 Bài thi — {{ selectedClass.name }}</h3><button class="btn btn-ghost btn-sm" @click="showAssignments=false">✕</button></div>
        <div class="card-body" style="padding:0">
          <div v-if="loadingAssignments" class="loading-wrap"><div class="spinner"></div></div>
          <div v-else-if="!assignments.length" class="empty-state"><p>Chưa có bài thi</p></div>
          <table v-else>
            <thead><tr><th>Tiêu đề</th><th>Loại</th><th>Hạn nộp</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              <tr v-for="a in assignments" :key="a._id">
                <td><strong>{{ a.title }}</strong></td>
                <td><span class="badge" :class="assignClass(a.type)">{{ assignLabel(a.type) }}</span></td>
                <td :style="{ color: isOverdue(a.dueDate) ? 'var(--danger)' : '' }">{{ formatDate(a.dueDate) }}</td>
                <td><span class="badge" :class="a.status==='open' ? 'badge-success' : 'badge-gray'">{{ a.status==='open' ? 'Đang mở' : 'Đã đóng' }}</span></td>
                <td><router-link :to="`/assignments/${a._id}/submit`" class="btn btn-primary btn-sm">📤 Nộp bài</router-link></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-else class="card">
      <div class="card-body empty-state"><div class="icon">⚠️</div><p>Không tìm thấy thông tin sinh viên. Vui lòng liên hệ admin.</p></div>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { studentAPI, classAPI, materialAPI, assignmentAPI } from '@/api'
import api from '@/api'

const router    = useRouter()
const authStore = useAuthStore()

const student          = ref(null)
const myClasses        = ref([])
const materials        = ref([])
const assignments      = ref([])
const loading          = ref(true)
const loadingMaterials = ref(false)
const loadingAssignments = ref(false)
const selectedClass    = ref(null)
const showMaterials    = ref(false)
const showAssignments  = ref(false)

const subClass   = (s) => ({ in_progress:'badge-info', passed:'badge-success', failed:'badge-danger' }[s])
const subLabel   = (s) => ({ in_progress:'Đang học', passed:'Đã qua', failed:'Không đạt' }[s])
const assignClass= (t) => ({ assignment:'badge-info', exam:'badge-danger', quiz:'badge-warning' }[t])
const assignLabel= (t) => ({ assignment:'📋 Bài tập', exam:'📝 Bài thi', quiz:'⚡ Kiểm tra' }[t])
const isOverdue  = (d) => new Date() > new Date(d)
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—'

const currentSubjects = computed(() => {
  if (!student.value) return []
  return student.value.enrolledSubjects?.filter(es => es.semester === student.value.currentSemester) || []
})

const logout = () => { authStore.logout(); router.push('/login') }

const viewMaterials = async (cls) => {
  selectedClass.value = cls; showMaterials.value = true; showAssignments.value = false
  loadingMaterials.value = true
  const { data } = await materialAPI.getByClass(cls._id)
  materials.value = data; loadingMaterials.value = false
}

const viewAssignments = async (cls) => {
  selectedClass.value = cls; showAssignments.value = true; showMaterials.value = false
  loadingAssignments.value = true
  const { data } = await assignmentAPI.getByClass(cls._id)
  assignments.value = data; loadingAssignments.value = false
}

const downloadMaterial = async (material) => {
  try {
    const res  = await api.get(`/materials/${material._id}/download`, { responseType: 'blob' })
    const url  = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href  = url; link.setAttribute('download', material.originalName)
    document.body.appendChild(link); link.click(); link.remove()
    window.URL.revokeObjectURL(url)
  } catch { alert('Không thể tải file') }
}

onMounted(async () => {
  loading.value = true
  try {
    const studentId = authStore.user?.studentRef || authStore.user?.studentInfo?._id
    if (studentId) {
      const { data } = await studentAPI.getOne(studentId)
      student.value = data
      const classRes = await classAPI.getAll()
      myClasses.value = classRes.data.filter(cls =>
        cls.students?.some(s => (s._id || s)?.toString() === student.value._id?.toString())
      )
    }
  } catch(e) { console.error(e) }
  finally { loading.value = false }
})
</script>

<style scoped>
.portal-wrap   { max-width: 1000px; margin: 0 auto; }
.portal-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
.stat-row  { display:flex; gap:16px; }
.stat-item { flex:1; text-align:center; padding:14px; background:var(--gray-50); border-radius:var(--radius); }
.stat-val  { font-size:26px; font-weight:700; color:var(--primary); }
.stat-lbl  { font-size:12px; color:var(--gray-500); margin-top:4px; }
.info-row   { display:flex; align-items:center; gap:8px; margin-bottom:10px; }
.info-label { font-size:12px; color:var(--gray-400); font-weight:600; text-transform:uppercase; min-width:90px; }
</style>
