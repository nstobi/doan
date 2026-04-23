<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">👩‍🎓 Học viên</h1>
      <button class="btn btn-primary" @click="openCreate">+ Thêm học viên</button>
    </div>

    <!-- Tìm kiếm + lọc -->
    <div class="card" style="margin-bottom:20px">
      <div class="card-body" style="padding:14px 20px">
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <input v-model="search" class="form-control" placeholder="🔍 Tìm tên, mã HV, SĐT..."
            style="flex:1" @input="onSearch" />
          <select v-model="filterMajor" class="form-control" style="width:180px" @change="load">
            <option value="">Tất cả chương trình</option>
            <option v-for="m in majors" :key="m._id" :value="m._id">{{ m.name }}</option>
          </select>
          <select v-model="filterExam" class="form-control" style="width:140px" @change="load">
            <option value="">Tất cả</option>
            <option value="IELTS">IELTS</option>
            <option value="TOEIC">TOEIC</option>
            <option value="TOEFL">TOEFL</option>
          </select>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body" style="padding:0">
        <div v-if="loading" class="loading-wrap"><div class="spinner"></div></div>
        <div v-else-if="!students.length" class="empty-state">
          <div class="icon">👩‍🎓</div><p>Không tìm thấy học viên</p>
        </div>
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Học viên</th>
                <th>Chương trình</th>
                <th>Loại thi</th>
                <th>Cấp độ</th>
                <th>Band đầu vào</th>
                <th>Mục tiêu</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in students" :key="s._id">
                <td>
                  <div style="font-weight:600">{{ s.name }}</div>
                  <div class="text-muted">{{ s.studentId }} · {{ s.phone }}</div>
                </td>
                <td>{{ s.major?.name || '—' }}</td>
                <td><span class="badge" :class="examBadge(s.examType)">{{ s.examType }}</span></td>
                <td><span class="badge badge-info">Level {{ s.currentSemester }}</span></td>
                <td>
                  <span v-if="s.entryScore" style="font-weight:600">{{ s.entryScore }}</span>
                  <span v-else class="text-muted">—</span>
                </td>
                <td>
                  <span v-if="s.targetScore" style="font-weight:600;color:var(--primary)">
                    {{ s.targetScore }}
                  </span>
                  <span v-else class="text-muted">—</span>
                </td>
                <td><span class="badge" :class="statusClass(s.status)">{{ statusLabel(s.status) }}</span></td>
                <td>
                  <div class="flex gap-2">
                    <router-link :to="`/students/${s._id}`" class="btn btn-ghost btn-sm">👁</router-link>
                    <button class="btn btn-ghost btn-sm" @click="openEdit(s)">✏️</button>
                    <button class="btn btn-danger btn-sm" @click="remove(s)">🗑</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal tạo/sửa học viên -->
    <div class="modal-overlay" v-if="showModal" @click.self="showModal=false">
      <div class="modal modal-md">
        <div class="modal-header">
          <h3>{{ editing ? 'Sửa học viên' : 'Thêm học viên mới' }}</h3>
          <button class="btn btn-ghost btn-sm btn-icon" @click="showModal=false">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="error" class="alert alert-error">{{ error }}</div>
          <div v-if="!editing" class="alert alert-info">
            💡 Học viên sẽ được <strong>tự động xếp vào Level 1</strong> của chương trình được chọn.
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Mã học viên *</label>
              <input v-model="form.studentId" class="form-control" placeholder="HV001" />
            </div>
            <div class="form-group">
              <label class="form-label">Họ và tên *</label>
              <input v-model="form.name" class="form-control" placeholder="Nguyễn Văn A" />
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Email *</label>
              <input v-model="form.email" type="email" class="form-control" />
            </div>
            <div class="form-group">
              <label class="form-label">Số điện thoại</label>
              <input v-model="form.phone" class="form-control" placeholder="0901234567" />
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Chương trình *</label>
              <select v-model="form.major" class="form-control">
                <option value="">-- Chọn chương trình --</option>
                <option v-for="m in majors" :key="m._id" :value="m._id">{{ m.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Loại thi *</label>
              <select v-model="form.examType" class="form-control">
                <option value="IELTS">IELTS</option>
                <option value="TOEIC">TOEIC</option>
                <option value="TOEFL">TOEFL</option>
                <option value="Communication">Communication</option>
              </select>
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Band điểm đầu vào</label>
              <input v-model.number="form.entryScore" type="number" step="0.5" min="0" max="9" class="form-control" placeholder="VD: 4.5" />
            </div>
            <div class="form-group">
              <label class="form-label">Band điểm mục tiêu</label>
              <input v-model.number="form.targetScore" type="number" step="0.5" min="0" max="9" class="form-control" placeholder="VD: 6.5" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Ngày sinh</label>
            <input v-model="form.dateOfBirth" type="date" class="form-control" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showModal=false">Hủy</button>
          <button class="btn btn-primary" @click="save" :disabled="saving">
            {{ saving ? 'Đang lưu...' : (editing ? 'Cập nhật' : 'Thêm học viên') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable */
import { ref, reactive, onMounted } from 'vue'
import { studentAPI, majorAPI } from '@/api'

const students    = ref([])
const majors      = ref([])
const loading     = ref(true)
const showModal   = ref(false)
const editing     = ref(null)
const saving      = ref(false)
const error       = ref('')
const search      = ref('')
const filterMajor = ref('')
const filterExam  = ref('')

const form = reactive({
  studentId: '', name: '', email: '', phone: '',
  major: '', examType: 'IELTS',
  entryScore: null, targetScore: null, dateOfBirth: ''
})

const examBadge  = (t) => ({ IELTS:'badge-info', TOEIC:'badge-success', TOEFL:'badge-warning' }[t] || 'badge-gray')
const statusClass= (s) => ({ active:'badge-success', graduated:'badge-info', suspended:'badge-danger', on_hold:'badge-warning' }[s])
const statusLabel= (s) => ({ active:'Đang học', graduated:'Hoàn thành', suspended:'Đình chỉ', on_hold:'Tạm dừng' }[s])

let timer = null
const onSearch = () => { clearTimeout(timer); timer = setTimeout(load, 400) }

const load = async () => {
  loading.value = true
  const params = {}
  if (search.value)      params.search   = search.value
  if (filterMajor.value) params.major    = filterMajor.value
  if (filterExam.value)  params.examType = filterExam.value
  const { data } = await studentAPI.getAll(params)
  students.value = data; loading.value = false
}

const openCreate = () => {
  editing.value = null
  Object.assign(form, { studentId:'', name:'', email:'', phone:'', major:'', examType:'IELTS', entryScore:null, targetScore:null, dateOfBirth:'' })
  error.value = ''; showModal.value = true
}

const openEdit = (s) => {
  editing.value = s._id
  Object.assign(form, {
    studentId: s.studentId, name: s.name, email: s.email, phone: s.phone,
    major: s.major?._id || '', examType: s.examType || 'IELTS',
    entryScore: s.entryScore, targetScore: s.targetScore,
    dateOfBirth: s.dateOfBirth?.split('T')[0] || ''
  })
  error.value = ''; showModal.value = true
}

const save = async () => {
  if (!form.studentId || !form.name || !form.email || !form.major) {
    return (error.value = 'Vui lòng điền đầy đủ thông tin bắt buộc (*)')
  }
  saving.value = true; error.value = ''
  try {
    if (editing.value) await studentAPI.update(editing.value, form)
    else await studentAPI.create(form)
    showModal.value = false; await load()
  } catch(e) { error.value = e.response?.data?.message || 'Có lỗi xảy ra' }
  finally { saving.value = false }
}

const remove = async (s) => {
  if (!confirm(`Xóa học viên "${s.name}"?`)) return
  await studentAPI.remove(s._id); await load()
}

onMounted(async () => {
  const { data } = await majorAPI.getAll()
  majors.value = data; await load()
})
</script>