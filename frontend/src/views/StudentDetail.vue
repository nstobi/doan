<template>
  <div>
    <div class="page-header">
      <div style="display:flex;align-items:center;gap:12px">
        <button class="btn btn-ghost btn-sm" @click="$router.back()">← Quay lại</button>
        <h1 class="page-title">Hồ sơ Sinh viên</h1>
      </div>
      <button v-if="student" class="btn btn-primary" @click="advance" :disabled="advancing">
        {{ advancing ? 'Đang xử lý...' : '⬆️ Nâng kỳ học' }}
      </button>
    </div>

    <div v-if="loading" class="loading-wrap"><div class="spinner"></div></div>

    <div v-else-if="student">
      <div class="card" style="margin-bottom:20px">
        <div class="card-body">
          <div style="display:flex;gap:20px;align-items:flex-start">
            <div class="avatar">{{ student.name?.charAt(0) }}</div>
            <div>
              <h2>{{ student.name }}</h2>
              <p class="text-muted">{{ student.studentId }} · {{ student.email }}</p>
              <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
                <span class="badge badge-info">{{ student.major?.name }}</span>
                <span class="badge badge-success">Kỳ {{ student.currentSemester }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h3>📚 Môn học theo kỳ</h3></div>
        <div class="card-body">
          <div v-for="group in groupedSubjects" :key="group.semester" style="margin-bottom:20px">
            <div class="semester-label">
              Kỳ {{ group.semester }}
              <span v-if="group.semester === student.currentSemester" class="badge badge-success" style="margin-left:8px">Đang học</span>
            </div>
            <table>
              <thead><tr><th>Mã môn</th><th>Tên môn</th><th>Tín chỉ</th><th>Trạng thái</th></tr></thead>
              <tbody>
                <tr v-for="es in group.subjects" :key="es._id">
                  <td><span class="badge badge-info">{{ es.subject?.code }}</span></td>
                  <td>{{ es.subject?.name }}</td>
                  <td>{{ es.subject?.credits }} TC</td>
                  <td><span class="badge" :class="subjectClass(es.status)">{{ subjectLabel(es.status) }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { studentAPI } from '@/api'

const route    = useRoute()
const student  = ref(null)
const loading  = ref(true)
const advancing= ref(false)

const subjectClass = (s) => ({ in_progress:'badge-info', passed:'badge-success', failed:'badge-danger' }[s])
const subjectLabel = (s) => ({ in_progress:'Đang học', passed:'Đã qua', failed:'Không đạt' }[s])

const groupedSubjects = computed(() => {
  if (!student.value?.enrolledSubjects) return []
  const map = {}
  student.value.enrolledSubjects.forEach(es => {
    if (!map[es.semester]) map[es.semester] = []
    map[es.semester].push(es)
  })
  return Object.entries(map).map(([sem, subjects]) => ({ semester: parseInt(sem), subjects })).sort((a,b) => a.semester - b.semester)
})

const load = async () => {
  const { data } = await studentAPI.getOne(route.params.id)
  student.value = data; loading.value = false
}

const advance = async () => {
  if (!confirm(`Nâng lên kỳ ${student.value.currentSemester + 1}? Hệ thống tự động đăng ký môn học kỳ mới.`)) return
  advancing.value = true
  try {
    const { data } = await studentAPI.advanceSemester(route.params.id)
    student.value = data
    alert(`✅ Đã nâng lên Kỳ ${data.currentSemester}!`)
  } catch(e) {
    alert(e.response?.data?.message || 'Có lỗi xảy ra')
  } finally { advancing.value = false }
}

onMounted(load)
</script>

<style scoped>
.avatar { width:64px; height:64px; border-radius:50%; background:var(--primary); color:white; display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:700; flex-shrink:0; }
.semester-label { font-size:14px; font-weight:700; color:var(--primary); padding:8px 0 10px; display:flex; align-items:center; border-bottom:2px solid var(--primary-50); margin-bottom:8px; }
</style>