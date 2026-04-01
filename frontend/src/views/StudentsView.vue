<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">👩‍🎓 Sinh viên</h1>
      <button class="btn btn-primary" @click="openCreate">+ Thêm sinh viên</button>
    </div>

    <!-- Search -->
    <div class="card" style="margin-bottom:20px">
      <div class="card-body" style="padding:14px 20px">
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <input v-model="search" class="form-control" placeholder="🔍 Tìm tên, mã SV..." style="flex:1" @input="onSearch" />
          <select v-model="filterMajor" class="form-control" style="width:180px" @change="load">
            <option value="">Tất cả ngành</option>
            <option v-for="m in majors" :key="m._id" :value="m._id">{{ m.name }}</option>
          </select>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body" style="padding:0">
        <div v-if="loading" class="loading-wrap"><div class="spinner"></div></div>
        <div v-else-if="!students.length" class="empty-state">
          <div class="icon">👩‍🎓</div><p>Không tìm thấy sinh viên</p>
        </div>
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Sinh viên</th><th>Ngành</th><th>Kỳ hiện tại</th><th>Số môn</th><th>Trạng thái</th><th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in students" :key="s._id">
                <td>
                  <div style="font-weight:600">{{ s.name }}</div>
                  <div class="text-muted">{{ s.studentId }} · {{ s.email }}</div>
                </td>
                <td>{{ s.major?.name || '—' }}</td>
                <td><span class="badge badge-info">Kỳ {{ s.currentSemester }}</span></td>
                <td><span class="badge badge-gray">{{ s.enrolledSubjects?.length || 0 }} môn</span></td>
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

    <!-- Modal -->
    <div class="modal-overlay" v-if="showModal" @click.self="showModal=false">
      <div class="modal modal-md">
        <div class="modal-header">
          <h3>{{ editing ? 'Sửa sinh viên' : 'Thêm sinh viên mới' }}</h3>
          <button class="btn btn-ghost btn-sm btn-icon" @click="showModal=false">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="error" class="alert alert-error">{{ error }}</div>
          <div v-if="!editing" class="alert alert-info">
            💡 Sinh viên sẽ được <strong>tự động đăng ký môn học kỳ 1</strong> của ngành được chọn.
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Mã sinh viên *</label>
              <input v-model="form.studentId" class="form-control" placeholder="SV001" />
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
              <input v-model="form.phone" class="form-control" />
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Ngành học *</label>
              <select v-model="form.major" class="form-control">
                <option value="">-- Chọn ngành --</option>
                <option v-for="m in majors" :key="m._id" :value="m._id">{{ m.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Ngày sinh</label>
              <input v-model="form.dateOfBirth" type="date" class="form-control" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showModal=false">Hủy</button>
          <button class="btn btn-primary" @click="save" :disabled="saving">
            {{ saving ? 'Đang lưu...' : (editing ? 'Cập nhật' : 'Tạo & Tự động đăng ký') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
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
const form = reactive({ studentId:'', name:'', email:'', phone:'', major:'', dateOfBirth:'' })

const statusClass = (s) => ({ active:'badge-success', graduated:'badge-info', suspended:'badge-danger' }[s])
const statusLabel = (s) => ({ active:'Đang học', graduated:'Tốt nghiệp', suspended:'Đình chỉ' }[s])

let timer = null
const onSearch = () => { clearTimeout(timer); timer = setTimeout(load, 400) }

const load = async () => {
  loading.value = true
  const params = {}
  if (search.value) params.search = search.value
  if (filterMajor.value) params.major = filterMajor.value
  const { data } = await studentAPI.getAll(params)
  students.value = data
  loading.value = false
}

const openCreate = () => {
  editing.value = null
  Object.assign(form, { studentId:'', name:'', email:'', phone:'', major:'', dateOfBirth:'' })
  error.value = ''; showModal.value = true
}

const openEdit = (s) => {
  editing.value = s._id
  Object.assign(form, { studentId:s.studentId, name:s.name, email:s.email, phone:s.phone, major:s.major?._id||'', dateOfBirth:s.dateOfBirth?.split('T')[0]||'' })
  error.value = ''; showModal.value = true
}

const save = async () => {
  if (!form.studentId || !form.name || !form.email || !form.major) return (error.value = 'Vui lòng điền đầy đủ thông tin bắt buộc (*)')
  saving.value = true; error.value = ''
  try {
    if (editing.value) await studentAPI.update(editing.value, form)
    else await studentAPI.create(form)
    showModal.value = false; await load()
  } catch (e) {
    error.value = e.response?.data?.message || 'Có lỗi xảy ra'
  } finally { saving.value = false }
}

const remove = async (s) => {
  if (!confirm(`Xóa sinh viên "${s.name}"?`)) return
  await studentAPI.remove(s._id); await load()
}

onMounted(async () => {
  const { data } = await majorAPI.getAll()
  majors.value = data
  await load()
})
</script>