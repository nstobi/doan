<template>
  <div>
    <div class="page-header">
      <div style="display:flex;align-items:center;gap:12px">
        <button class="btn btn-ghost btn-sm" @click="$router.back()">← Quay lại</button>
        <h1 class="page-title">Hồ sơ Học viên</h1>
      </div>
      <button v-if="student" class="btn btn-primary" @click="advance" :disabled="advancing">
        {{ advancing ? 'Đang xử lý...' : '⬆️ Nâng cấp độ' }}
      </button>
    </div>

    <div v-if="loading" class="loading-wrap"><div class="spinner"></div></div>

    <div v-else-if="student">
      <!-- Profile -->
      <div class="card" style="margin-bottom:20px">
        <div class="card-body">
          <div style="display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap">
            <div class="avatar">{{ student.name?.charAt(0) }}</div>
            <div style="flex:1">
              <h2>{{ student.name }}</h2>
              <p class="text-muted">{{ student.studentId }} · {{ student.email }} · {{ student.phone }}</p>
              <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
                <span class="badge" :class="examBadge(student.examType)">{{ student.examType }}</span>
                <span class="badge badge-info">{{ student.major?.name }}</span>
                <span class="badge badge-success">Level {{ student.currentSemester }}</span>
              </div>
            </div>
            <!-- Band score info -->
            <div class="score-box">
              <div class="score-item">
                <div class="score-lbl">Đầu vào</div>
                <div class="score-val entry">{{ student.entryScore ?? '—' }}</div>
              </div>
              <div class="score-arrow">→</div>
              <div class="score-item">
                <div class="score-lbl">Mục tiêu</div>
                <div class="score-val target">{{ student.targetScore ?? '—' }}</div>
              </div>
              <div class="score-arrow">→</div>
              <div class="score-item">
                <div class="score-lbl">Hiện tại</div>
                <div class="score-val current">{{ latestScore ?? '—' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab" :class="{ active: tab === 'skills'    }" @click="tab = 'skills'">📚 Kỹ năng</button>
        <button class="tab" :class="{ active: tab === 'mocktest'  }" @click="tab = 'mocktest'; loadMockTests()">📊 Mock Test</button>
      </div>

      <!-- Tab: Kỹ năng -->
      <div v-if="tab === 'skills'" class="card">
        <div class="card-header"><h3>📚 Kỹ năng theo cấp độ</h3></div>
        <div class="card-body">
          <div v-if="!groupedSubjects.length" class="empty-state"><p>Chưa có kỹ năng nào</p></div>
          <div v-else style="display:flex;flex-direction:column;gap:20px">
            <div v-for="group in groupedSubjects" :key="group.semester">
              <div class="level-label">
                Level {{ group.semester }}
                <span v-if="group.semester === student.currentSemester" class="badge badge-success" style="margin-left:8px">Đang học</span>
              </div>
              <table>
                <thead><tr><th>Mã</th><th>Kỹ năng</th><th>Loại</th><th>Tín chỉ</th><th>Trạng thái</th><th>Band Score</th></tr></thead>
                <tbody>
                  <tr v-for="es in group.subjects" :key="es._id">
                    <td><span class="badge badge-info">{{ es.subject?.code }}</span></td>
                    <td><strong>{{ es.subject?.name }}</strong></td>
                    <td><span class="badge badge-gray">{{ es.subject?.skill }}</span></td>
                    <td>{{ es.subject?.credits }}</td>
                    <td><span class="badge" :class="subClass(es.status)">{{ subLabel(es.status) }}</span></td>
                    <td>
                      <span v-if="es.grade !== null && es.grade !== undefined"
                            style="font-weight:700;font-size:15px"
                            :style="{ color: es.grade >= 5 ? 'var(--success)' : 'var(--danger)' }">
                        {{ es.grade }}
                      </span>
                      <span v-else class="text-muted">—</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Mock Test -->
      <div v-if="tab === 'mocktest'">
        <div class="card" style="margin-bottom:16px">
          <div class="card-header">
            <h3>📊 Lịch sử Mock Test</h3>
            <button class="btn btn-primary btn-sm" @click="showAddMock = true">+ Thêm kết quả</button>
          </div>
          <div class="card-body" style="padding:0">
            <div v-if="loadingMock" class="loading-wrap"><div class="spinner"></div></div>
            <div v-else-if="!mockTests.length" class="empty-state">
              <div class="icon">📊</div><p>Chưa có kết quả mock test nào</p>
            </div>
            <table v-else>
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Loại</th>
                  <th>Listening</th>
                  <th>Reading</th>
                  <th>Writing</th>
                  <th>Speaking</th>
                  <th>Overall</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(mt, idx) in mockTests" :key="idx">
                  <td>{{ formatDate(mt.date) }}</td>
                  <td><span class="badge" :class="examBadge(mt.testType)">{{ mt.testType }}</span></td>
                  <td>{{ mt.listening ?? '—' }}</td>
                  <td>{{ mt.reading   ?? '—' }}</td>
                  <td>{{ mt.writing   ?? '—' }}</td>
                  <td>{{ mt.speaking  ?? '—' }}</td>
                  <td>
                    <span style="font-weight:700;font-size:15px"
                          :style="{ color: mt.overall >= 5 ? 'var(--success)' : 'var(--danger)' }">
                      {{ mt.overall ?? '—' }}
                    </span>
                  </td>
                  <td class="text-muted">{{ mt.note || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal thêm mock test -->
    <div class="modal-overlay" v-if="showAddMock" @click.self="showAddMock=false">
      <div class="modal modal-md">
        <div class="modal-header">
          <h3>Thêm kết quả Mock Test</h3>
          <button class="btn btn-ghost btn-sm btn-icon" @click="showAddMock=false">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="mockError" class="alert alert-error">{{ mockError }}</div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Ngày thi *</label>
              <input v-model="mockForm.date" type="date" class="form-control" />
            </div>
            <div class="form-group">
              <label class="form-label">Loại bài thi *</label>
              <select v-model="mockForm.testType" class="form-control">
                <option value="IELTS">IELTS</option>
                <option value="TOEIC">TOEIC</option>
                <option value="TOEFL">TOEFL</option>
                <option value="Internal">Internal Test</option>
              </select>
            </div>
          </div>
          <!-- IELTS fields -->
          <div class="grid-4">
            <div class="form-group">
              <label class="form-label">Listening</label>
              <input v-model.number="mockForm.listening" type="number" step="0.5" min="0" max="9" class="form-control" placeholder="0-9" />
            </div>
            <div class="form-group">
              <label class="form-label">Reading</label>
              <input v-model.number="mockForm.reading" type="number" step="0.5" min="0" max="9" class="form-control" placeholder="0-9" />
            </div>
            <div class="form-group">
              <label class="form-label">Writing</label>
              <input v-model.number="mockForm.writing" type="number" step="0.5" min="0" max="9" class="form-control" placeholder="0-9" />
            </div>
            <div class="form-group">
              <label class="form-label">Speaking</label>
              <input v-model.number="mockForm.speaking" type="number" step="0.5" min="0" max="9" class="form-control" placeholder="0-9" />
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Overall Band *</label>
              <input v-model.number="mockForm.overall" type="number" step="0.5" min="0" max="9" class="form-control" placeholder="VD: 6.0" />
            </div>
            <div class="form-group">
              <label class="form-label">Ghi chú</label>
              <input v-model="mockForm.note" class="form-control" placeholder="Nhận xét, cần cải thiện..." />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showAddMock=false">Hủy</button>
          <button class="btn btn-primary" @click="saveMockTest" :disabled="savingMock">
            {{ savingMock ? 'Đang lưu...' : '✅ Lưu kết quả' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable */
import { ref, computed, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { studentAPI } from '@/api'

const route    = useRoute()
const student  = ref(null)
const loading  = ref(true)
const advancing= ref(false)
const tab      = ref('skills')
const mockTests    = ref([])
const loadingMock  = ref(false)
const showAddMock  = ref(false)
const savingMock   = ref(false)
const mockError    = ref('')
const mockForm     = reactive({ date: '', testType: 'IELTS', listening: null, reading: null, writing: null, speaking: null, overall: null, note: '' })

const formatDate  = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—'
const examBadge   = (t) => ({ IELTS:'badge-info', TOEIC:'badge-success', TOEFL:'badge-warning', Internal:'badge-gray' }[t] || 'badge-gray')
const subClass    = (s) => ({ in_progress:'badge-info', passed:'badge-success', failed:'badge-danger' }[s])
const subLabel    = (s) => ({ in_progress:'Đang học', passed:'Đã qua', failed:'Không đạt' }[s])

// Điểm mock test gần nhất
const latestScore = computed(() => {
  if (!mockTests.value.length) return null
  const sorted = [...mockTests.value].sort((a, b) => new Date(b.date) - new Date(a.date))
  return sorted[0]?.overall ?? null
})

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

const loadMockTests = async () => {
  loadingMock.value = true
  const { data } = await studentAPI.getMockTests(route.params.id)
  mockTests.value = data; loadingMock.value = false
}

const advance = async () => {
  if (!confirm(`Nâng học viên ${student.value.name} lên Level ${student.value.currentSemester + 1}?`)) return
  advancing.value = true
  try {
    const { data } = await studentAPI.advanceSemester(route.params.id)
    student.value = data
    alert(`✅ Đã nâng lên Level ${data.currentSemester}!`)
  } catch(e) { alert(e.response?.data?.message || 'Có lỗi xảy ra') }
  finally { advancing.value = false }
}

const saveMockTest = async () => {
  if (!mockForm.date || mockForm.overall === null) return (mockError.value = 'Vui lòng nhập ngày thi và điểm Overall')
  savingMock.value = true; mockError.value = ''
  try {
    await studentAPI.addMockTest(route.params.id, mockForm)
    showAddMock.value = false
    Object.assign(mockForm, { date:'', testType:'IELTS', listening:null, reading:null, writing:null, speaking:null, overall:null, note:'' })
    await loadMockTests()
  } catch(e) { mockError.value = e.response?.data?.message || 'Có lỗi xảy ra' }
  finally { savingMock.value = false }
}

onMounted(async () => {
  await load()
  await loadMockTests()
})
</script>

<style scoped>
.avatar      { width:64px; height:64px; border-radius:50%; background:var(--primary); color:white; display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:700; flex-shrink:0; }
.level-label { font-size:14px; font-weight:700; color:var(--primary); padding:8px 0 10px; display:flex; align-items:center; border-bottom:2px solid var(--primary-50); margin-bottom:8px; }
.tabs        { display:flex; gap:4px; border-bottom:2px solid var(--gray-200); margin-bottom:16px; }
.tab         { padding:10px 20px; border:none; background:transparent; font-size:14px; font-weight:500; color:var(--gray-500); cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-2px; transition:var(--transition); font-family:inherit; }
.tab:hover   { color:var(--primary); }
.tab.active  { color:var(--primary); border-bottom-color:var(--primary); }

/* Band score box */
.score-box   { display:flex; align-items:center; gap:12px; background:var(--gray-50); border-radius:var(--radius); padding:16px 20px; border:1px solid var(--gray-200); }
.score-item  { text-align:center; }
.score-lbl   { font-size:11px; color:var(--gray-400); font-weight:600; text-transform:uppercase; margin-bottom:4px; }
.score-val   { font-size:26px; font-weight:700; }
.score-val.entry   { color:var(--gray-500); }
.score-val.target  { color:var(--primary); }
.score-val.current { color:var(--success); }
.score-arrow { font-size:20px; color:var(--gray-300); }

/* Grid 4 */
.grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
</style>