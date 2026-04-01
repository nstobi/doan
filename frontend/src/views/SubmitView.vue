<template>
  <div>
    <div class="page-header">
      <div style="display:flex;align-items:center;gap:12px">
        <button class="btn btn-ghost btn-sm" @click="$router.back()">← Quay lại</button>
        <h1 class="page-title">📤 Nộp bài</h1>
      </div>
    </div>

    <div v-if="loading" class="loading-wrap"><div class="spinner"></div></div>

    <div v-else-if="assignment">
      <!-- Thông tin bài thi -->
      <div class="card" style="margin-bottom:20px">
        <div class="card-header">
          <div>
            <h3>{{ assignment.title }}</h3>
            <span class="badge" :class="typeBadge(assignment.type)">{{ typeLabel(assignment.type) }}</span>
          </div>
          <div>
            <span :class="isOverdue ? 'text-danger' : 'text-muted'">
              ⏰ Hạn nộp: {{ formatDateTime(assignment.dueDate) }}
            </span>
          </div>
        </div>
        <div class="card-body">
          <p style="white-space:pre-wrap;line-height:1.8">{{ assignment.description || 'Không có mô tả' }}</p>
        </div>
      </div>

      <!-- Đã nộp rồi -->
      <div v-if="existingSubmission" class="card" style="margin-bottom:20px">
        <div class="card-header">
          <h3>✅ Bài đã nộp</h3>
          <span class="badge" :class="subStatusBadge(existingSubmission.status)">
            {{ subStatusLabel(existingSubmission.status) }}
          </span>
        </div>
        <div class="card-body">
          <div v-if="existingSubmission.score !== null" class="alert alert-success">
            🎯 Điểm của bạn: <strong>{{ existingSubmission.score }}/{{ assignment.maxScore }}</strong>
            <div v-if="existingSubmission.feedback" style="margin-top:8px">
              💬 Nhận xét: {{ existingSubmission.feedback }}
            </div>
          </div>
          <div v-else class="alert alert-info">
            Bài đã nộp lúc {{ formatDateTime(existingSubmission.createdAt) }}. Chờ giáo viên chấm điểm.
          </div>
          <button class="btn btn-ghost btn-sm" style="margin-top:8px" @click="existingSubmission = null">
            🔄 Nộp lại bài
          </button>
        </div>
      </div>

      <!-- Form nộp bài -->
      <div class="card" v-else>
        <div class="card-header"><h3>📤 Nộp bài của bạn</h3></div>
        <div class="card-body">
          <div v-if="isOverdue" class="alert alert-error">
            ⚠️ Đã quá hạn nộp! Bài nộp sẽ được đánh dấu là trễ.
          </div>
          <div v-if="error" class="alert alert-error">{{ error }}</div>
          <div v-if="success" class="alert alert-success">{{ success }}</div>

          <!-- Chọn sinh viên (tạm thời vì chưa có auth sinh viên) -->
          <div class="form-group">
            <label class="form-label">Mã sinh viên của bạn *</label>
            <select v-model="form.studentId" class="form-control">
              <option value="">-- Chọn sinh viên --</option>
              <option v-for="s in students" :key="s._id" :value="s._id">
                {{ s.studentId }} — {{ s.name }}
              </option>
            </select>
          </div>

          <!-- Nội dung bài làm -->
          <div class="form-group">
            <label class="form-label">Nội dung bài làm</label>
            <textarea
              v-model="form.content"
              class="form-control"
              rows="8"
              placeholder="Nhập câu trả lời hoặc nội dung bài làm của bạn..."
            ></textarea>
          </div>

          <!-- Upload file -->
          <div class="form-group">
            <label class="form-label">File đính kèm</label>
            <input type="file" multiple @change="onFiles" class="form-control" />
            <div class="text-muted" style="margin-top:4px">
              Có thể đính kèm nhiều file (PDF, Word, ảnh...)
            </div>
          </div>

          <!-- Danh sách file đã chọn -->
          <div v-if="selectedFiles.length" style="margin-bottom:16px">
            <div class="text-muted" style="margin-bottom:6px">File đã chọn:</div>
            <div v-for="(f, idx) in selectedFiles" :key="idx" class="file-chip">
              📎 {{ f.name }} ({{ formatSize(f.size) }})
              <button @click="removeFile(idx)" style="background:none;border:none;cursor:pointer;color:var(--danger)">✕</button>
            </div>
          </div>
        </div>
        <div class="modal-footer" style="border-top:1px solid var(--gray-200)">
          <button class="btn btn-primary" @click="submitWork" :disabled="submitting">
            {{ submitting ? 'Đang nộp...' : '📤 Nộp bài' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { assignmentAPI } from '@/api'
import api from '@/api'

const route      = useRoute()
const assignment = ref(null)
const students   = ref([])
const loading    = ref(true)
const submitting = ref(false)
const error      = ref('')
const success    = ref('')
const selectedFiles        = ref([])
const existingSubmission   = ref(null)

const form = reactive({ studentId: '', content: '' })

const formatDateTime = (d) => new Date(d).toLocaleString('vi-VN')
const formatSize     = (b) => b < 1024*1024 ? (b/1024).toFixed(1)+' KB' : (b/(1024*1024)).toFixed(1)+' MB'

const typeBadge  = (t) => ({ assignment:'badge-info', exam:'badge-danger', quiz:'badge-warning' }[t])
const typeLabel  = (t) => ({ assignment:'📋 Bài tập', exam:'📝 Bài thi', quiz:'⚡ Kiểm tra' }[t])
const subStatusBadge = (s) => ({ submitted:'badge-info', graded:'badge-success', late:'badge-warning' }[s])
const subStatusLabel = (s) => ({ submitted:'Đã nộp', graded:'Đã chấm', late:'Nộp trễ' }[s])

const isOverdue = computed(() =>
  assignment.value ? new Date() > new Date(assignment.value.dueDate) : false
)

const onFiles     = (e) => { selectedFiles.value = Array.from(e.target.files) }
const removeFile  = (idx) => { selectedFiles.value.splice(idx, 1) }

const submitWork = async () => {
  if (!form.studentId) return (error.value = 'Vui lòng chọn sinh viên')
  if (!form.content && !selectedFiles.value.length) {
    return (error.value = 'Vui lòng nhập nội dung hoặc đính kèm file')
  }

  submitting.value = true
  error.value = ''; success.value = ''

  try {
    const formData = new FormData()
    formData.append('studentId', form.studentId)
    formData.append('content',   form.content)
    selectedFiles.value.forEach(f => formData.append('files', f))

    const { data } = await assignmentAPI.submit(route.params.id, formData)
    success.value = data.message || '✅ Nộp bài thành công!'

    // Reload để hiển thị bài đã nộp
    const subs = await assignmentAPI.getSubmissions(route.params.id)
    const mySub = subs.data.find(s => s.student._id === form.studentId)
    if (mySub) existingSubmission.value = mySub
  } catch (e) {
    error.value = e.response?.data?.message || 'Có lỗi xảy ra'
  } finally { submitting.value = false }
}

onMounted(async () => {
  loading.value = true
  const { data } = await assignmentAPI.getOne(route.params.id)
  assignment.value = data

  // Lấy danh sách sinh viên trong lớp
  const classRes = await api.get(`/classes/${data.class._id || data.class}`)
  students.value = classRes.data.students || []

  loading.value = false
})
</script>

<style scoped>
.text-danger { color: var(--danger); font-weight: 600; }
.file-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; background: var(--gray-100);
  border-radius: 99px; font-size: 12px; margin: 4px;
}
</style>