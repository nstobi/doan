<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">🏫 Ngành học</h1>
      <button class="btn btn-primary" @click="openCreate">+ Thêm ngành</button>
    </div>

    <div class="card">
      <div class="card-body" style="padding:0">
        <div v-if="loading" class="loading-wrap"><div class="spinner"></div></div>
        <div v-else-if="!majors.length" class="empty-state">
          <div class="icon">🏫</div>
          <p>Chưa có ngành học nào</p>
        </div>
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tên ngành</th>
                <th>Mã ngành</th>
                <th>Mô tả</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in majors" :key="m._id">
                <td><strong>{{ m.name }}</strong></td>
                <td><span class="badge badge-info">{{ m.code }}</span></td>
                <td class="text-muted">{{ m.description || '—' }}</td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-ghost btn-sm" @click="openEdit(m)">✏️</button>
                    <button class="btn btn-danger btn-sm" @click="remove(m)">🗑</button>
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
      <div class="modal modal-sm">
        <div class="modal-header">
          <h3>{{ editing ? 'Sửa ngành học' : 'Thêm ngành học' }}</h3>
          <button class="btn btn-ghost btn-sm btn-icon" @click="showModal=false">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="error" class="alert alert-error">{{ error }}</div>
          <div class="form-group">
            <label class="form-label">Tên ngành *</label>
            <input v-model="form.name" class="form-control" placeholder="Công nghệ Thông tin" />
          </div>
          <div class="form-group">
            <label class="form-label">Mã ngành *</label>
            <input v-model="form.code" class="form-control" placeholder="CNTT" />
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
import { majorAPI } from '@/api'

const majors    = ref([])
const loading   = ref(true)
const showModal = ref(false)
const editing   = ref(null)
const saving    = ref(false)
const error     = ref('')
const form      = reactive({ name: '', code: '', description: '' })

const load = async () => {
  loading.value = true
  const { data } = await majorAPI.getAll()
  majors.value = data
  loading.value = false
}

const openCreate = () => {
  editing.value = null
  Object.assign(form, { name: '', code: '', description: '' })
  error.value = ''
  showModal.value = true
}

const openEdit = (m) => {
  editing.value = m._id
  Object.assign(form, { name: m.name, code: m.code, description: m.description })
  error.value = ''
  showModal.value = true
}

const save = async () => {
  if (!form.name || !form.code) return (error.value = 'Vui lòng điền đầy đủ thông tin')
  saving.value = true; error.value = ''
  try {
    if (editing.value) await majorAPI.update(editing.value, form)
    else await majorAPI.create(form)
    showModal.value = false
    await load()
  } catch (e) {
    error.value = e.response?.data?.message || 'Có lỗi xảy ra'
  } finally { saving.value = false }
}

const remove = async (m) => {
  if (!confirm(`Xóa ngành "${m.name}"?`)) return
  await majorAPI.remove(m._id)
  await load()
}

onMounted(load)
</script>