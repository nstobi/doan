<template>
  <div>
    <div class="page-header">
      <div style="display:flex;align-items:center;gap:12px">
        <button class="btn btn-ghost btn-sm" @click="$router.back()">← Quay lại</button>
        <h1 class="page-title" v-if="cls">{{ cls.name }}</h1>
      </div>
    </div>
 
    <div v-if="loading" class="loading-wrap"><div class="spinner"></div></div>
 
    <div v-else-if="cls">
      <!-- Thông tin lớp + sinh viên -->
      <div class="grid-2" style="margin-bottom:20px">
        <div class="card">
          <div class="card-header"><h3>📋 Thông tin lớp</h3></div>
          <div class="card-body">
            <div class="info-row"><span class="info-label">Môn học</span><span>{{ cls.subject?.name }}</span></div>
            <div class="info-row"><span class="info-label">Ngành</span><span>{{ cls.major?.name }}</span></div>
            <div class="info-row"><span class="info-label">Kỳ</span><span>Kỳ {{ cls.semester }} – {{ cls.year }}</span></div>
            <div class="info-row"><span class="info-label">Sĩ số</span><span>{{ cls.students?.length || 0 }} sinh viên</span></div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h3>👩‍🎓 Sinh viên ({{ cls.students?.length }})</h3></div>
          <div class="card-body" style="padding:0;max-height:220px;overflow-y:auto">
            <table>
              <tbody>
                <tr v-for="s in cls.students" :key="s._id">
                  <td>
                    <div style="font-weight:500">{{ s.name }}</div>
                    <div class="text-muted">{{ s.studentId }}</div>
                  </td>
                </tr>
                <tr v-if="!cls.students?.length">
                  <td class="empty-state">Chưa có sinh viên</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
 
      <!-- Tabs -->
      <div class="tabs">
        <button
          class="tab"
          :class="{ active: activeTab === 'sessions' }"
          @click="activeTab = 'sessions'"
        >📅 Buổi học</button>
        <button
          class="tab"
          :class="{ active: activeTab === 'materials' }"
          @click="activeTab = 'materials'; loadMaterials()"
        >📁 Học liệu</button>
        <button
          class="tab"
          :class="{ active: activeTab === 'assignments' }"
          @click="activeTab = 'assignments'; loadAssignments()"
        >📝 Bài thi</button>
      </div>
 
      <!-- Tab: Buổi học -->
      <div class="card" v-if="activeTab === 'sessions'">
        <div class="card-header">
          <h3>📅 Các buổi học ({{ cls.sessions?.length || 0 }})</h3>
          <button class="btn btn-primary btn-sm" @click="openAddSession">+ Thêm buổi học</button>
        </div>
        <div class="card-body" style="padding:0">
          <div v-if="!cls.sessions?.length" class="empty-state">
            <div class="icon">📅</div>
            <p>Chưa có buổi học. Thêm buổi học để bắt đầu điểm danh!</p>
          </div>
          <table v-else>
            <thead>
              <tr><th>Buổi</th><th>Ngày</th><th>Nội dung</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              <tr v-for="(session, idx) in cls.sessions" :key="idx">
                <td><strong>Buổi {{ idx + 1 }}</strong></td>
                <td>{{ formatDate(session.date) }}</td>
                <td class="text-muted">{{ session.description || '—' }}</td>
                <td>
                  <router-link
                    :to="`/attendance/${cls._id}/session/${idx}`"
                    class="btn btn-primary btn-sm"
                  >📝 Điểm danh</router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
 
      <!-- Tab: Học liệu -->
      <div class="card" v-if="activeTab === 'materials'">
        <div class="card-header">
          <h3>📁 Học liệu ({{ materials.length }})</h3>
          <button class="btn btn-primary btn-sm" @click="showUpload = true">
            + Upload tài liệu
          </button>
        </div>
        <div class="card-body" style="padding:0">
          <div v-if="loadingMaterials" class="loading-wrap"><div class="spinner"></div></div>
          <div v-else-if="!materials.length" class="empty-state">
            <div class="icon">📁</div>
            <p>Chưa có học liệu nào. Upload tài liệu để sinh viên xem!</p>
          </div>
          <table v-else>
            <thead>
              <tr>
                <th>Tài liệu</th>
                <th>Loại</th>
                <th>Kích thước</th>
                <th>Người upload</th>
                <th>Ngày upload</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in materials" :key="m._id">
                <td>
                  <div style="font-weight:600">{{ m.title }}</div>
                  <div class="text-muted">{{ m.originalName }}</div>
                </td>
                <td>
                  <span class="badge" :class="typeBadge(m.type)">
                    {{ typeIcon(m.type) }} {{ m.type }}
                  </span>
                </td>
                <td class="text-muted">{{ formatSize(m.fileSize) }}</td>
                <td class="text-muted">{{ m.uploadedBy?.name || '—' }}</td>
                <td class="text-muted">{{ formatDate(m.createdAt) }}</td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-primary btn-sm" @click="downloadFile(m)">⬇️ Tải</button>
                    <button class="btn btn-danger btn-sm" @click="removeMaterial(m)">🗑</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
 
      <!-- Tab: Bài thi -->
      <div class="card" v-if="activeTab === 'assignments'">
        <div class="card-header">
          <h3>📝 Bài thi & Bài tập ({{ assignments.length }})</h3>
          <button class="btn btn-primary btn-sm" @click="showCreateAssignment = true">
            + Tạo bài thi
          </button>
        </div>
        <div class="card-body" style="padding:0">
          <div v-if="loadingAssignments" class="loading-wrap"><div class="spinner"></div></div>
          <div v-else-if="!assignments.length" class="empty-state">
            <div class="icon">📝</div>
            <p>Chưa có bài thi nào</p>
          </div>
          <table v-else>
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Loại</th>
                <th>Hạn nộp</th>
                <th>Điểm tối đa</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in assignments" :key="a._id">
                <td>
                  <div style="font-weight:600">{{ a.title }}</div>
                  <div class="text-muted">{{ a.description }}</div>
                </td>
                <td>
                  <span class="badge" :class="assignmentTypeBadge(a.type)">
                    {{ assignmentTypeLabel(a.type) }}
                  </span>
                </td>
                <td>
                  <div :style="{ color: isOverdue(a.dueDate) ? 'var(--danger)' : '' }">
                    {{ formatDate(a.dueDate) }}
                  </div>
                  <div class="text-muted" v-if="isOverdue(a.dueDate)">Đã quá hạn</div>
                </td>
                <td>{{ a.maxScore }} điểm</td>
                <td>
                  <span class="badge" :class="a.status === 'open' ? 'badge-success' : 'badge-gray'">
                    {{ a.status === 'open' ? 'Đang mở' : 'Đã đóng' }}
                  </span>
                </td>
                <td>
                  <div class="flex gap-2">
                    <router-link :to="`/assignments/${a._id}`" class="btn btn-primary btn-sm">
                      👁 Chi tiết
                    </router-link>
                    <button class="btn btn-danger btn-sm" @click="removeAssignment(a)">🗑</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
 
          <!-- Link nộp bài cho sinh viên -->
          <div style="padding:16px;border-top:1px solid var(--gray-200)" v-if="assignments.length">
            <p class="text-muted" style="margin-bottom:8px">🔗 Link nộp bài cho sinh viên:</p>
            <div v-for="a in assignments" :key="'link-'+a._id" style="margin-bottom:6px">
              <router-link :to="`/assignments/${a._id}/submit`" class="btn btn-ghost btn-sm">
                📤 Nộp bài: {{ a.title }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
 
    <!-- ── Modals ─────────────────────────────── -->
 
    <!-- Modal thêm buổi học -->
    <div class="modal-overlay" v-if="showSessionModal" @click.self="showSessionModal=false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h3>Thêm buổi học</h3>
          <button class="btn btn-ghost btn-sm btn-icon" @click="showSessionModal=false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Ngày học *</label>
            <input v-model="sessionForm.date" type="date" class="form-control" />
          </div>
          <div class="form-group">
            <label class="form-label">Nội dung</label>
            <input v-model="sessionForm.description" class="form-control" placeholder="Buổi 1: Giới thiệu môn học" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showSessionModal=false">Hủy</button>
          <button class="btn btn-primary" @click="addSession" :disabled="savingSession">
            {{ savingSession ? 'Đang lưu...' : 'Thêm buổi học' }}
          </button>
        </div>
      </div>
    </div>
 
    <!-- Modal upload học liệu -->
    <div class="modal-overlay" v-if="showUpload" @click.self="showUpload=false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h3>Upload Học liệu</h3>
          <button class="btn btn-ghost btn-sm btn-icon" @click="showUpload=false">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="uploadError" class="alert alert-error">{{ uploadError }}</div>
          <div class="form-group">
            <label class="form-label">Tiêu đề</label>
            <input v-model="uploadForm.title" class="form-control" placeholder="Bài giảng tuần 1" />
          </div>
          <div class="form-group">
            <label class="form-label">Mô tả</label>
            <input v-model="uploadForm.description" class="form-control" placeholder="Nội dung tài liệu..." />
          </div>
          <div class="form-group">
            <label class="form-label">Chọn file *</label>
            <input type="file" @change="onFileChange" class="form-control" />
            <div class="text-muted" style="margin-top:4px">
              Hỗ trợ: PDF, Word, PowerPoint, Excel, ảnh, video (tối đa 100MB)
            </div>
          </div>
          <div v-if="uploading" style="margin-top:12px">
            <div class="text-muted" style="margin-bottom:6px">Đang upload... {{ uploadProgress }}%</div>
            <div class="progress-wrap">
              <div class="progress-bar-upload" :style="{ width: uploadProgress + '%' }"></div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showUpload=false">Hủy</button>
          <button class="btn btn-primary" @click="uploadFile" :disabled="uploading || !selectedFile">
            {{ uploading ? 'Đang upload...' : '⬆️ Upload' }}
          </button>
        </div>
      </div>
    </div>
 
    <!-- Modal tạo bài thi -->
    <div class="modal-overlay" v-if="showCreateAssignment" @click.self="showCreateAssignment=false">
      <div class="modal modal-md">
        <div class="modal-header">
          <h3>Tạo bài thi / bài tập</h3>
          <button class="btn btn-ghost btn-sm btn-icon" @click="showCreateAssignment=false">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="assignmentError" class="alert alert-error">{{ assignmentError }}</div>
          <div class="form-group">
            <label class="form-label">Tiêu đề *</label>
            <input v-model="assignmentForm.title" class="form-control" placeholder="Bài kiểm tra giữa kỳ" />
          </div>
          <div class="form-group">
            <label class="form-label">Mô tả / Đề bài</label>
            <textarea v-model="assignmentForm.description" class="form-control" rows="4" placeholder="Nội dung bài thi..."></textarea>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Loại *</label>
              <select v-model="assignmentForm.type" class="form-control">
                <option value="assignment">📋 Bài tập</option>
                <option value="exam">📝 Bài thi</option>
                <option value="quiz">⚡ Kiểm tra nhanh</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Điểm tối đa</label>
              <input v-model.number="assignmentForm.maxScore" type="number" min="1" max="100" class="form-control" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Hạn nộp *</label>
            <input v-model="assignmentForm.dueDate" type="datetime-local" class="form-control" />
          </div>
          <div class="form-group">
            <label class="form-label">File đề bài (không bắt buộc)</label>
            <input type="file" multiple @change="onAssignmentFiles" class="form-control" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showCreateAssignment=false">Hủy</button>
          <button class="btn btn-primary" @click="createAssignment" :disabled="savingAssignment">
            {{ savingAssignment ? 'Đang tạo...' : 'Tạo bài thi' }}
          </button>
        </div>
      </div>
    </div>
 
  </div>
</template>
 
<script setup>
/* eslint-disable */
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { classAPI, materialAPI, assignmentAPI } from '@/api'
import api from '@/api'
 
const route = useRoute()
 
// ── State chung ───────────────────────────
const cls       = ref(null)
const loading   = ref(true)
const activeTab = ref('sessions')
 
// ── State học liệu ────────────────────────
const materials        = ref([])
const loadingMaterials = ref(false)
const showUpload       = ref(false)
const uploading        = ref(false)
const uploadProgress   = ref(0)
const uploadError      = ref('')
const selectedFile     = ref(null)
const uploadForm       = reactive({ title: '', description: '' })
 
// ── State buổi học ────────────────────────
const showSessionModal = ref(false)
const savingSession    = ref(false)
const sessionForm      = reactive({ date: '', description: '' })
 
// ── State bài thi ─────────────────────────
const assignments          = ref([])
const loadingAssignments   = ref(false)
const showCreateAssignment = ref(false)
const savingAssignment     = ref(false)
const assignmentError      = ref('')
const assignmentFiles      = ref([])
const assignmentForm       = reactive({
  title: '', description: '', type: 'assignment', maxScore: 10, dueDate: ''
})
 
// ── Helpers ───────────────────────────────
const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN')
const formatSize = (bytes) => {
  if (!bytes) return '—'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
const typeIcon  = (t) => ({ video:'🎥', document:'📄', image:'🖼️', other:'📦' }[t] || '📦')
const typeBadge = (t) => ({ video:'badge-danger', document:'badge-info', image:'badge-success', other:'badge-gray' }[t])
 
const assignmentTypeBadge = (t) => ({ assignment:'badge-info', exam:'badge-danger', quiz:'badge-warning' }[t])
const assignmentTypeLabel = (t) => ({ assignment:'📋 Bài tập', exam:'📝 Bài thi', quiz:'⚡ Kiểm tra nhanh' }[t])
const isOverdue = (date) => new Date() > new Date(date)
 
// ── Load dữ liệu ──────────────────────────
const load = async () => {
  loading.value = true
  const { data } = await classAPI.getOne(route.params.id)
  cls.value = data
  loading.value = false
}
 
const loadMaterials = async () => {
  loadingMaterials.value = true
  const { data } = await materialAPI.getByClass(route.params.id)
  materials.value = data
  loadingMaterials.value = false
}
 
const loadAssignments = async () => {
  loadingAssignments.value = true
  const { data } = await assignmentAPI.getByClass(route.params.id)
  assignments.value = data
  loadingAssignments.value = false
}
 
// ── Buổi học ─────────────────────────────
const openAddSession = () => {
  sessionForm.date = new Date().toISOString().split('T')[0]
  sessionForm.description = ''
  showSessionModal.value = true
}
 
const addSession = async () => {
  if (!sessionForm.date) return alert('Vui lòng chọn ngày học')
  savingSession.value = true
  await classAPI.addSession(route.params.id, sessionForm)
  showSessionModal.value = false
  savingSession.value = false
  await load()
}
 
// ── Học liệu ─────────────────────────────
const onFileChange = (e) => {
  selectedFile.value = e.target.files[0]
  if (selectedFile.value && !uploadForm.title) {
    uploadForm.title = selectedFile.value.name
  }
}
 
const uploadFile = async () => {
  if (!selectedFile.value) return
  uploading.value = true
  uploadError.value = ''
  uploadProgress.value = 0
  try {
    const formData = new FormData()
    formData.append('file',        selectedFile.value)
    formData.append('title',       uploadForm.title || selectedFile.value.name)
    formData.append('description', uploadForm.description)
    await api.post(`/materials/class/${route.params.id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        uploadProgress.value = Math.round((e.loaded / e.total) * 100)
      }
    })
    showUpload.value = false
    uploadForm.title = ''
    uploadForm.description = ''
    selectedFile.value = null
    await loadMaterials()
  } catch (e) {
    uploadError.value = e.response?.data?.message || 'Upload thất bại'
  } finally { uploading.value = false }
}
 
const downloadFile = async (material) => {
  try {
    const response = await api.get(`/materials/${material._id}/download`, { responseType: 'blob' })
    const url  = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href  = url
    link.setAttribute('download', material.originalName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (e) { alert('Không thể tải file') }
}
 
const removeMaterial = async (m) => {
  if (!confirm(`Xóa tài liệu "${m.title}"?`)) return
  await materialAPI.remove(m._id)
  await loadMaterials()
}
 
// ── Bài thi ───────────────────────────────
const onAssignmentFiles = (e) => {
  assignmentFiles.value = Array.from(e.target.files)
}
 
const createAssignment = async () => {
  if (!assignmentForm.title || !assignmentForm.dueDate) {
    return (assignmentError.value = 'Vui lòng điền tiêu đề và hạn nộp')
  }
  savingAssignment.value = true
  assignmentError.value  = ''
  try {
    const formData = new FormData()
    formData.append('title',       assignmentForm.title)
    formData.append('description', assignmentForm.description)
    formData.append('type',        assignmentForm.type)
    formData.append('maxScore',    assignmentForm.maxScore)
    formData.append('dueDate',     assignmentForm.dueDate)
    assignmentFiles.value.forEach(f => formData.append('files', f))
    await assignmentAPI.create(route.params.id, formData)
    showCreateAssignment.value = false
    assignmentForm.title = ''
    assignmentForm.description = ''
    assignmentForm.dueDate = ''
    await loadAssignments()
  } catch (e) {
    assignmentError.value = e.response?.data?.message || 'Có lỗi xảy ra'
  } finally { savingAssignment.value = false }
}
 
const removeAssignment = async (a) => {
  if (!confirm(`Xóa bài thi "${a.title}"?`)) return
  await assignmentAPI.remove(a._id)
  await loadAssignments()
}
 
onMounted(load)
</script>
 
<style scoped>
.info-row   { display:flex; align-items:center; gap:8px; margin-bottom:10px; }
.info-label { font-size:12px; color:var(--gray-400); font-weight:600; text-transform:uppercase; min-width:80px; }
 
.tabs {
  display: flex; gap: 4px;
  border-bottom: 2px solid var(--gray-200);
  margin-bottom: 16px;
}
.tab {
  padding: 10px 20px; border: none; background: transparent;
  font-size: 14px; font-weight: 500; color: var(--gray-500);
  cursor: pointer; border-bottom: 2px solid transparent;
  margin-bottom: -2px; transition: var(--transition);
  font-family: inherit;
}
.tab:hover  { color: var(--primary); }
.tab.active { color: var(--primary); border-bottom-color: var(--primary); }
 
.progress-wrap       { background: var(--gray-100); border-radius: 99px; height: 8px; overflow: hidden; }
.progress-bar-upload { height: 100%; background: var(--primary); border-radius: 99px; transition: width .3s ease; }
</style>
 