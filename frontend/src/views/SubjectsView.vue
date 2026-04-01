<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">📚 Môn học</h1>
      <button class="btn btn-primary" @click="openCreate">+ Thêm môn học</button>
    </div>
    <div class="card">
      <div class="card-body" style="padding:0">
        <div v-if="loading" class="loading-wrap"><div class="spinner"></div></div>
        <div v-else-if="!subjects.length" class="empty-state">
          <div class="icon">📚</div><p>Chưa có môn học nào</p>
        </div>
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tên môn</th><th>Mã môn</th><th>Tín chỉ</th><th>Mô tả</th><th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in subjects" :key="s._id">
                <td><strong>{{ s.name }}</strong></td>
                <td><span class="badge badge-info">{{ s.code }}</span></td>
                <td><span class="badge badge-success">{{ s.credits }} TC</span></td>
                <td class="text-muted">{{ s.description || '—' }}</td>
                <td>
                  <div class="flex gap-2">
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

    <div class="modal-overlay" v-if="showModal" @click.self="showModal=false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h3>{{ editing ? 'Sửa môn học' : 'Thêm môn học' }}</h3>
          <button class="btn btn-ghost btn-sm btn-icon" @click="showModal=false">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="error" class="alert alert-error">{{ error }}</div>
          <div class="form-group">
            <label class="form-label">Tên môn *</label>
            <input v-model="form.name" class="form-control" placeholder="Toán rời rạc" />
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Mã môn *</label>
              <input v-model="form.code" class="form-control" placeholder="IT102" />
            </div>
            <div class="form-group">
              <label class="form-label">Số tín chỉ *</label>
              <input v-model.number="form.credits" type="number" min="1" max="10" class="form-control" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Mô tả</label>
            <textarea v-model="form.description" class="form-control" rows="3"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showModal=false">Hủy</button>
          <button class="btn btn-primary" @click="save" :disabled="saving">
            {{ saving ? 'Đang lưu...' : 'Lưu' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { subjectAPI } from '@/api'

const subjects  = ref([])
const loading   = ref(true)
const showModal = ref(false)
const editing   = ref(null)
const saving    = ref(false)
const error     = ref('')
const form      = reactive({ name: '', code: '', credits: 3, description: '' })

const load = async () => {
  loading.value = true
  const { data } = await subjectAPI.getAll()
  subjects.value = data
  loading.value = false
}

const openCreate = () => {
  editing.value = null
  Object.assign(form, { name: '', code: '', credits: 3, description: '' })
  error.value = ''; showModal.value = true
}

const openEdit = (s) => {
  editing.value = s._id
  Object.assign(form, { name: s.name, code: s.code, credits: s.credits, description: s.description })
  error.value = ''; showModal.value = true
}

const save = async () => {
  if (!form.name || !form.code || !form.credits) return (error.value = 'Vui lòng điền đầy đủ')
  saving.value = true; error.value = ''
  try {
    if (editing.value) await subjectAPI.update(editing.value, form)
    else await subjectAPI.create(form)
    showModal.value = false; await load()
  } catch (e) {
    error.value = e.response?.data?.message || 'Có lỗi xảy ra'
  } finally { saving.value = false }
}

const remove = async (s) => {
  if (!confirm(`Xóa môn "${s.name}"?`)) return
  await subjectAPI.remove(s._id); await load()
}

onMounted(load)
</script>