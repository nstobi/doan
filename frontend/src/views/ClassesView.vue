<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">🏛️ Lớp học</h1>
      <button class="btn btn-primary" @click="openCreate">+ Tạo lớp học</button>
    </div>
    <div class="card">
      <div class="card-body" style="padding:0">
        <div v-if="loading" class="loading-wrap"><div class="spinner"></div></div>
        <div v-else-if="!classes.length" class="empty-state">
          <div class="icon">🏛️</div><p>Chưa có lớp học nào</p>
        </div>
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr><th>Tên lớp</th><th>Môn học</th><th>Ngành</th><th>Kỳ</th><th>Sĩ số</th><th>Số buổi</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              <tr v-for="c in classes" :key="c._id">
                <td><strong>{{ c.name }}</strong></td>
                <td>{{ c.subject?.name }}</td>
                <td>{{ c.major?.name }}</td>
                <td><span class="badge badge-info">Kỳ {{ c.semester }}</span></td>
                <td>{{ c.students?.length || 0 }}</td>
                <td>{{ c.sessions?.length || 0 }}</td>
                <td>
                  <div class="flex gap-2">
                    <router-link :to="`/classes/${c._id}`" class="btn btn-ghost btn-sm">👁</router-link>
                    <button class="btn btn-danger btn-sm" @click="remove(c)">🗑</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal-overlay" v-if="showModal" @click.self="showModal=false">
      <div class="modal modal-md">
        <div class="modal-header">
          <h3>Tạo lớp học mới</h3>
          <button class="btn btn-ghost btn-sm btn-icon" @click="showModal=false">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="error" class="alert alert-error">{{ error }}</div>
          <div class="alert alert-info">💡 Sinh viên cùng ngành + cùng kỳ sẽ được <strong>tự động thêm vào lớp</strong>.</div>
          <div class="form-group">
            <label class="form-label">Tên lớp *</label>
            <input v-model="form.name" class="form-control" placeholder="CNTT K1 - Nhập môn Lập trình" />
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Môn học *</label>
              <select v-model="form.subject" class="form-control">
                <option value="">-- Chọn môn --</option>
                <option v-for="s in subjects" :key="s._id" :value="s._id">{{ s.code }} - {{ s.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Ngành học *</label>
              <select v-model="form.major" class="form-control">
                <option value="">-- Chọn ngành --</option>
                <option v-for="m in majors" :key="m._id" :value="m._id">{{ m.name }}</option>
              </select>
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Kỳ học *</label>
              <input v-model.number="form.semester" type="number" min="1" class="form-control" />
            </div>
            <div class="form-group">
              <label class="form-label">Năm học *</label>
              <input v-model="form.year" class="form-control" placeholder="2024-2025" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">ID Giáo viên</label>
            <input v-model="form.teacher" class="form-control" placeholder="000000000000000000000001" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showModal=false">Hủy</button>
          <button class="btn btn-primary" @click="save" :disabled="saving">
            {{ saving ? 'Đang tạo...' : 'Tạo lớp học' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { classAPI, majorAPI, subjectAPI } from '@/api'

const classes  = ref([])
const majors   = ref([])
const subjects = ref([])
const loading   = ref(true)
const showModal = ref(false)
const saving    = ref(false)
const error     = ref('')
const form = reactive({ name:'', subject:'', major:'', semester:1, year:'2024-2025', teacher:'000000000000000000000001' })

const load = async () => {
  loading.value = true
  const { data } = await classAPI.getAll()
  classes.value = data; loading.value = false
}

const openCreate = () => {
  Object.assign(form, { name:'', subject:'', major:'', semester:1, year:'2024-2025', teacher:'000000000000000000000001' })
  error.value = ''; showModal.value = true
}

const save = async () => {
  if (!form.name || !form.subject || !form.major) return (error.value = 'Vui lòng điền đầy đủ thông tin')
  saving.value = true; error.value = ''
  try {
    await classAPI.create(form)
    showModal.value = false; await load()
  } catch(e) {
    error.value = e.response?.data?.message || 'Có lỗi xảy ra'
  } finally { saving.value = false }
}

const remove = async (c) => {
  if (!confirm(`Xóa lớp "${c.name}"?`)) return
  await classAPI.remove(c._id); await load()
}

onMounted(async () => {
  const [m, s] = await Promise.all([majorAPI.getAll(), subjectAPI.getAll()])
  majors.value = m.data; subjects.value = s.data
  await load()
})
</script>