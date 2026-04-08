<template>
  <div>
    <div class="page-header">
      <div style="display:flex;align-items:center;gap:12px">
        <button class="btn btn-ghost btn-sm" @click="$router.back()">← Quay lại</button>
        <div v-if="assignment">
          <h1 class="page-title">{{ assignment.title }}</h1>
          <p class="text-muted">
            <span class="badge" :class="typeBadge(assignment.type)">{{ typeLabel(assignment.type) }}</span>
            · Hạn nộp: {{ formatDate(assignment.dueDate) }}
            · Tối đa: {{ assignment.maxScore }} điểm
          </p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-wrap"><div class="spinner"></div></div>

    <div v-else-if="assignment">
      <!-- Đề bài -->
      <div class="card" style="margin-bottom:20px">
        <div class="card-header"><h3>📄 Đề bài</h3></div>
        <div class="card-body">
          <p style="white-space:pre-wrap;line-height:1.8">{{ assignment.description || 'Không có mô tả' }}</p>
          <div v-if="assignment.attachments && assignment.attachments.length > 0" style="margin-top:12px">
            <div class="text-muted" style="margin-bottom:8px">File đính kèm:</div>
            <span v-for="(f, idx) in assignment.attachments" :key="idx" class="btn btn-ghost btn-sm" style="margin-right:6px">📎 {{ f.originalName }}</span>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid-4" style="margin-bottom:20px">
        <div class="stat-mini"><div class="stat-mini-value">{{ submissions.length }}</div><div class="stat-mini-label">Đã nộp</div></div>
        <div class="stat-mini"><div class="stat-mini-value">{{ gradedCount }}</div><div class="stat-mini-label">Đã chấm</div></div>
        <div class="stat-mini"><div class="stat-mini-value">{{ lateCount }}</div><div class="stat-mini-label">Nộp trễ</div></div>
        <div class="stat-mini"><div class="stat-mini-value">{{ avgScore }}</div><div class="stat-mini-label">Điểm TB</div></div>
      </div>

      <!-- Submissions -->
      <div class="card">
        <div class="card-header"><h3>📬 Bài nộp ({{ submissions.length }})</h3></div>
        <div class="card-body" style="padding:0">
          <div v-if="!submissions.length" class="empty-state"><div class="icon">📬</div><p>Chưa có sinh viên nào nộp bài</p></div>
          <table v-else>
            <thead><tr><th>Sinh viên</th><th>Thời gian nộp</th><th>Trạng thái</th><th>Nội dung / File</th><th>Điểm</th><th>Thao tác</th></tr></thead>
            <tbody>
              <tr v-for="sub in submissions" :key="sub._id">
                <td><div style="font-weight:600">{{ sub.student?.name }}</div><div class="text-muted">{{ sub.student?.studentId }}</div></td>
                <td class="text-muted">{{ formatDateTime(sub.createdAt) }}</td>
                <td><span class="badge" :class="subStatusBadge(sub.status)">{{ subStatusLabel(sub.status) }}</span></td>
                <td>
                  <div v-if="sub.attachments && sub.attachments.length > 0">
                    <button v-for="(f, idx) in sub.attachments" :key="idx" class="btn btn-ghost btn-sm" style="margin-bottom:4px;display:block" @click="downloadSubmission(sub._id, idx, f.originalName)">📎 {{ f.originalName }}</button>
                  </div>
                  <div v-if="sub.content" class="text-muted">💬 Có nội dung text</div>
                  <div v-if="!sub.attachments?.length && !sub.content" class="text-muted">—</div>
                </td>
                <td>
                  <span v-if="sub.score !== null && sub.score !== undefined" class="badge badge-success">{{ sub.score }}/{{ assignment.maxScore }}</span>
                  <span v-else class="text-muted">Chưa chấm</span>
                </td>
                <td><button class="btn btn-primary btn-sm" @click="openGrade(sub)">✏️ Chấm điểm</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal: Grade -->
    <div class="modal-overlay" v-if="showGrade" @click.self="showGrade=false">
      <div class="modal modal-sm">
        <div class="modal-header"><h3>Chấm điểm — {{ gradingSubmission?.student?.name }}</h3><button class="btn btn-ghost btn-sm btn-icon" @click="showGrade=false">✕</button></div>
        <div class="modal-body">
          <div v-if="gradingSubmission?.content" style="margin-bottom:16px">
            <label class="form-label">Nội dung bài làm:</label>
            <div class="submission-content">{{ gradingSubmission.content }}</div>
          </div>
          <div class="form-group"><label class="form-label">Điểm * (tối đa {{ assignment?.maxScore }})</label><input v-model.number="gradeForm.score" type="number" min="0" :max="assignment?.maxScore" class="form-control" placeholder="8.5" /></div>
          <div class="form-group"><label class="form-label">Nhận xét</label><textarea v-model="gradeForm.feedback" class="form-control" rows="4" placeholder="Bài làm tốt..."></textarea></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showGrade=false">Hủy</button>
          <button class="btn btn-primary" @click="submitGrade" :disabled="grading">{{ grading ? 'Đang lưu...' : '✅ Lưu điểm' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable */
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { assignmentAPI } from '@/api'
import api from '@/api'

const route      = useRoute()
const assignment = ref(null)
const submissions= ref([])
const loading    = ref(true)
const showGrade  = ref(false)
const grading    = ref(false)
const gradingSubmission = ref(null)
const gradeForm  = reactive({ score: null, feedback: '' })

const formatDate     = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—'
const formatDateTime = (d) => d ? new Date(d).toLocaleString('vi-VN') : '—'
const typeBadge      = (t) => ({ assignment:'badge-info', exam:'badge-danger', quiz:'badge-warning' }[t] || 'badge-gray')
const typeLabel      = (t) => ({ assignment:'📋 Bài tập', exam:'📝 Bài thi', quiz:'⚡ Kiểm tra' }[t] || t)
const subStatusBadge = (s) => ({ submitted:'badge-info', graded:'badge-success', late:'badge-warning' }[s] || 'badge-gray')
const subStatusLabel = (s) => ({ submitted:'Đã nộp', graded:'Đã chấm', late:'Nộp trễ' }[s] || s)

const gradedCount = computed(() => submissions.value.filter(s => s.status === 'graded').length)
const lateCount   = computed(() => submissions.value.filter(s => s.status === 'late').length)
const avgScore    = computed(() => {
  const graded = submissions.value.filter(s => s.score !== null && s.score !== undefined)
  if (!graded.length) return '—'
  return (graded.reduce((sum, s) => sum + s.score, 0) / graded.length).toFixed(1)
})

const load = async () => {
  loading.value = true
  try {
    const [aRes, sRes] = await Promise.all([
      assignmentAPI.getOne(route.params.id),
      assignmentAPI.getSubmissions(route.params.id)
    ])
    assignment.value  = aRes.data
    submissions.value = sRes.data || []
  } catch(e) { console.error(e) }
  finally { loading.value = false }
}

const openGrade = (sub) => {
  gradingSubmission.value = sub
  gradeForm.score    = sub.score ?? null
  gradeForm.feedback = sub.feedback || ''
  showGrade.value    = true
}

const submitGrade = async () => {
  if (gradeForm.score === null || gradeForm.score === '') return alert('Vui lòng nhập điểm')
  grading.value = true
  try { await assignmentAPI.grade(gradingSubmission.value._id, gradeForm); showGrade.value = false; await load() }
  catch(e) { alert(e.response?.data?.message || 'Có lỗi xảy ra') }
  finally { grading.value = false }
}

const downloadSubmission = async (subId, fileIndex, fileName) => {
  try {
    const res  = await api.get(`/assignments/submissions/${subId}/download/${fileIndex}`, { responseType: 'blob' })
    const url  = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href  = url; link.setAttribute('download', fileName)
    document.body.appendChild(link); link.click(); link.remove()
    window.URL.revokeObjectURL(url)
  } catch { alert('Không thể tải file') }
}

onMounted(load)
</script>

<style scoped>
.stat-mini         { background:var(--white); border:1px solid var(--gray-200); border-radius:var(--radius); padding:16px; text-align:center; }
.stat-mini-value   { font-size:24px; font-weight:700; color:var(--primary); }
.stat-mini-label   { font-size:12px; color:var(--gray-500); margin-top:4px; }
.submission-content { background:var(--gray-50); border:1px solid var(--gray-200); border-radius:var(--radius); padding:12px; font-size:13px; white-space:pre-wrap; max-height:200px; overflow-y:auto; }
</style>
