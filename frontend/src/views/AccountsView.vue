<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">👥 Quản lý Tài khoản</h1>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button class="tab" :class="{ active: activeTab === 'teacher' }" @click="activeTab = 'teacher'">
        👨‍🏫 Tài khoản Giáo viên
      </button>
      <button class="tab" :class="{ active: activeTab === 'student' }" @click="activeTab = 'student'">
        👩‍🎓 Tài khoản Sinh viên
      </button>
    </div>

    <!-- Tab: Giáo viên -->
    <div v-if="activeTab === 'teacher'">
      <div class="card" style="margin-bottom:20px">
        <div class="card-header">
          <h3>👨‍🏫 Danh sách Giáo viên</h3>
          <button class="btn btn-primary btn-sm" @click="showCreateTeacher = true">+ Tạo tài khoản GV</button>
        </div>
        <div class="card-body" style="padding:0">
          <div v-if="loadingTeachers" class="loading-wrap"><div class="spinner"></div></div>
          <div v-else-if="!teachers.length" class="empty-state">
            <div class="icon">👨‍🏫</div>
            <p>Chưa có tài khoản giáo viên nào</p>
          </div>
          <table v-else>
            <thead><tr><th>Tên</th><th>Email</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead>
            <tbody>
              <tr v-for="t in teachers" :key="t._id">
                <td><strong>{{ t.name }}</strong></td>
                <td>{{ t.email }}</td>
                <td class="text-muted">{{ formatDate(t.createdAt) }}</td>
                <td>
                  <button class="btn btn-danger btn-sm" @click="deleteAccount(t)">🗑 Xóa</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Tab: Sinh viên -->
    <div v-if="activeTab === 'student'">
      <div class="card">
        <div class="card-header">
          <h3>👩‍🎓 Tạo tài khoản cho Sinh viên</h3>
        </div>
        <div class="card-body">
          <div class="alert alert-info">
            💡 Chọn sinh viên từ danh sách để tạo tài khoản đăng nhập cho họ.
          </div>
          <div v-if="errorSV" class="alert alert-error">{{ errorSV }}</div>
          <div v-if="successSV" class="alert alert-success">{{ successSV }}</div>

          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Chọn sinh viên *</label>
              <select v-model="svForm.studentRef" class="form-control" @change="fillSVInfo">
                <option value="">-- Chọn sinh viên --</option>
                <option v-for="s in students" :key="s._id" :value="s._id">
                  {{ s.studentId }} — {{ s.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Email đăng nhập *</label>
              <input v-model="svForm.email" type="email" class="form-control" placeholder="sv001@school.edu.vn" />
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Họ tên</label>
              <input v-model="svForm.name" class="form-control" readonly style="background:var(--gray-50)" />
            </div>
            <div class="form-group">
              <label class="form-label">Mật khẩu *</label>
              <input v-model="svForm.password" type="password" class="form-control" placeholder="Tối thiểu 6 ký tự" />
            </div>
          </div>
          <button class="btn btn-primary" @click="createStudentAccount" :disabled="savingSV">
            {{ savingSV ? 'Đang tạo...' : '✅ Tạo tài khoản sinh viên' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal tạo tài khoản giáo viên -->
    <div class="modal-overlay" v-if="showCreateTeacher" @click.self="showCreateTeacher = false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h3>Tạo tài khoản Giáo viên</h3>
          <button class="btn btn-ghost btn-sm btn-icon" @click="showCreateTeacher = false">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="errorTeacher" class="alert alert-error">{{ errorTeacher }}</div>
          <div class="form-group">
            <label class="form-label">Họ tên *</label>
            <input v-model="teacherForm.name" class="form-control" placeholder="Nguyễn Văn A" />
          </div>
          <div class="form-group">
            <label class="form-label">Email *</label>
            <input v-model="teacherForm.email" type="email" class="form-control" placeholder="giaovien@school.edu.vn" />
          </div>
          <div class="form-group">
            <label class="form-label">Mật khẩu *</label>
            <input v-model="teacherForm.password" type="password" class="form-control" placeholder="Tối thiểu 6 ký tự" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showCreateTeacher = false">Hủy</button>
          <button class="btn btn-primary" @click="createTeacher" :disabled="savingTeacher">
            {{ savingTeacher ? 'Đang tạo...' : 'Tạo tài khoản' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable */
import { ref, reactive, onMounted } from 'vue'
import { authAPI, studentAPI } from '@/api'

const activeTab = ref('teacher')

// Teacher
const teachers         = ref([])
const loadingTeachers  = ref(true)
const showCreateTeacher= ref(false)
const savingTeacher    = ref(false)
const errorTeacher     = ref('')
const teacherForm      = reactive({ name: '', email: '', password: '' })

// Student account
const students  = ref([])
const savingSV  = ref(false)
const errorSV   = ref('')
const successSV = ref('')
const svForm    = reactive({ studentRef: '', name: '', email: '', password: '' })

const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—'

const loadTeachers = async () => {
  loadingTeachers.value = true
  const { data } = await authAPI.getTeachers()
  teachers.value = data
  loadingTeachers.value = false
}

// Tự điền tên khi chọn sinh viên
const fillSVInfo = () => {
  const sv = students.value.find(s => s._id === svForm.studentRef)
  if (sv) {
    svForm.name  = sv.name
    svForm.email = `${sv.studentId.toLowerCase()}@school.edu.vn`
  }
}

const createTeacher = async () => {
  if (!teacherForm.name || !teacherForm.email || !teacherForm.password) {
    return (errorTeacher.value = 'Vui lòng điền đầy đủ thông tin')
  }
  savingTeacher.value = true; errorTeacher.value = ''
  try {
    await authAPI.createTeacher(teacherForm)
    showCreateTeacher.value = false
    Object.assign(teacherForm, { name: '', email: '', password: '' })
    await loadTeachers()
  } catch(e) {
    errorTeacher.value = e.response?.data?.message || 'Có lỗi xảy ra'
  } finally { savingTeacher.value = false }
}

const createStudentAccount = async () => {
  if (!svForm.studentRef || !svForm.email || !svForm.password) {
    return (errorSV.value = 'Vui lòng điền đầy đủ thông tin')
  }
  savingSV.value = true; errorSV.value = ''; successSV.value = ''
  try {
    await authAPI.createStudentAccount({
      name:       svForm.name,
      email:      svForm.email,
      password:   svForm.password,
      studentRef: svForm.studentRef
    })
    successSV.value = `✅ Đã tạo tài khoản cho ${svForm.name}! Email: ${svForm.email}`
    Object.assign(svForm, { studentRef: '', name: '', email: '', password: '' })
  } catch(e) {
    errorSV.value = e.response?.data?.message || 'Có lỗi xảy ra'
  } finally { savingSV.value = false }
}

const deleteAccount = async (user) => {
  if (!confirm(`Xóa tài khoản của "${user.name}"?`)) return
  await authAPI.deleteUser(user._id)
  await loadTeachers()
}

onMounted(async () => {
  const [t, s] = await Promise.all([authAPI.getTeachers(), studentAPI.getAll()])
  teachers.value = t.data
  students.value = s.data
  loadingTeachers.value = false
})
</script>

<style scoped>
.tabs { display:flex; gap:4px; border-bottom:2px solid var(--gray-200); margin-bottom:20px; }
.tab  { padding:10px 20px; border:none; background:transparent; font-size:14px; font-weight:500; color:var(--gray-500); cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-2px; transition:var(--transition); font-family:inherit; }
.tab:hover  { color:var(--primary); }
.tab.active { color:var(--primary); border-bottom-color:var(--primary); }
</style>
