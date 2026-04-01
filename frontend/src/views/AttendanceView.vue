<template>
  <div>
    <div class="page-header">
      <div style="display:flex;align-items:center;gap:12px">
        <button class="btn btn-ghost btn-sm" @click="$router.back()">← Quay lại</button>
        <div>
          <h1 class="page-title">📝 Điểm danh</h1>
          <p class="text-muted" v-if="classInfo">
            {{ classInfo.name }} – Buổi {{ parseInt(sessionIndex) + 1 }}
          </p>
        </div>
      </div>
      <div style="display:flex;gap:10px">
        <button class="btn btn-success btn-sm" @click="setAll('present')">✅ Tất cả có mặt</button>
        <button class="btn btn-ghost btn-sm" @click="setAll('absent')">❌ Tất cả vắng</button>
        <button class="btn btn-primary" @click="saveAttendance" :disabled="saving">
          {{ saving ? 'Đang lưu...' : '💾 Lưu điểm danh' }}
        </button>
      </div>
    </div>

    <!-- Thông báo lưu thành công -->
    <div v-if="savedMsg" class="alert alert-success">{{ savedMsg }}</div>

    <!-- Thống kê nhanh -->
    <div class="stats-row">
      <div class="chip chip-success">✅ Có mặt: {{ count('present') }}</div>
      <div class="chip chip-danger">❌ Vắng: {{ count('absent') }}</div>
      <div class="chip chip-warning">⚠️ Trễ: {{ count('late') }}</div>
      <div class="chip chip-gray">📊 Tổng: {{ records.length }}</div>
      <div class="chip chip-gray">
        📈 Tỉ lệ có mặt: {{ attendanceRate }}%
      </div>
    </div>

    <div v-if="loading" class="loading-wrap"><div class="spinner"></div></div>

    <!-- Bảng điểm danh -->
    <div class="card" v-else>
      <div class="card-body" style="padding:0">
        <div v-if="!records.length" class="empty-state">
          <p>Lớp chưa có sinh viên</p>
        </div>
        <table v-else>
          <thead>
            <tr>
              <th>#</th>
              <th>Sinh viên</th>
              <th>Mã SV</th>
              <th style="text-align:center">Có mặt ✅</th>
              <th style="text-align:center">Vắng ❌</th>
              <th style="text-align:center">Trễ ⚠️</th>
              <th style="text-align:center">Có phép</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(rec, idx) in records"
              :key="rec.studentId"
              :class="rowClass(rec.status)"
            >
              <td class="text-muted">{{ idx + 1 }}</td>
              <td><strong>{{ rec.name }}</strong></td>
              <td class="text-muted">{{ rec.code }}</td>
              <td style="text-align:center">
                <input type="radio" :name="`s-${rec.studentId}`" value="present" v-model="rec.status" />
              </td>
              <td style="text-align:center">
                <input type="radio" :name="`s-${rec.studentId}`" value="absent" v-model="rec.status" />
              </td>
              <td style="text-align:center">
                <input type="radio" :name="`s-${rec.studentId}`" value="late" v-model="rec.status" />
              </td>
              <!-- Checkbox vắng có phép -->
              <td style="text-align:center">
                <input
                  type="checkbox"
                  v-model="rec.approvedAbsence"
                  :disabled="rec.status === 'present'"
                  title="Vắng có phép"
                />
              </td>
              <td>
                <input
                  type="text"
                  v-model="rec.note"
                  class="form-control"
                  style="font-size:12px;padding:5px 8px"
                  placeholder="Ghi chú..."
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Thống kê tổng hợp cả lớp -->
    <div class="card" style="margin-top:24px" v-if="summary.length">
      <div class="card-header">
        <h3>📊 Tổng kết điểm danh cả lớp</h3>
      </div>
      <div class="card-body" style="padding:0">
        <table>
          <thead>
            <tr>
              <th>Sinh viên</th>
              <th>Có mặt</th>
              <th>Vắng</th>
              <th>Trễ</th>
              <th>Tỉ lệ tham gia</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in summary" :key="row.student.id">
              <td>
                <div style="font-weight:600">{{ row.student.name }}</div>
                <div class="text-muted">{{ row.student.studentId }}</div>
              </td>
              <td><span class="badge badge-success">{{ row.present }}</span></td>
              <td><span class="badge badge-danger">{{ row.absent }}</span></td>
              <td><span class="badge badge-warning">{{ row.late }}</span></td>
              <td>
                <!-- Thanh tiến trình tỉ lệ -->
                <div class="progress-wrap">
                  <div class="progress-bar" :style="{ width: row.attendanceRate + '%', background: row.attendanceRate >= 80 ? '#10b981' : '#ef4444' }"></div>
                  <span class="progress-label">{{ row.attendanceRate }}%</span>
                </div>
              </td>
              <td>
                <!-- Cảnh báo nếu vắng quá nhiều -->
                <span v-if="row.warning" class="badge badge-danger">
                  ⚠️ Vắng {{ row.absent }}/{{ row.maxAbsences }} buổi
                </span>
                <span v-else class="badge badge-success">Bình thường</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { classAPI, attendanceAPI } from '@/api'

const route        = useRoute()
const classId      = route.params.classId
const sessionIndex = route.params.sessionIndex

const classInfo = ref(null)
const records   = ref([])
const summary   = ref([])
const loading   = ref(true)
const saving    = ref(false)
const savedMsg  = ref('')

// Đếm theo trạng thái
const count = (s) => records.value.filter(r => r.status === s).length

// Tỉ lệ có mặt buổi này
const attendanceRate = computed(() => {
  if (!records.value.length) return 0
  const attended = count('present') + count('late')
  return Math.round((attended / records.value.length) * 100)
})

const setAll   = (s) => records.value.forEach(r => r.status = s)
const rowClass = (s) => ({
  'row-present': s === 'present',
  'row-absent':  s === 'absent',
  'row-late':    s === 'late'
})

const load = async () => {
  loading.value = true

  // Lấy thông tin lớp
  const { data: cls } = await classAPI.getOne(classId)
  classInfo.value = cls

  // Lấy điểm danh cũ nếu có
  const { data: existing } = await attendanceAPI.getBySession(classId, sessionIndex)
  const existingMap = {}
  existing.forEach(e => { existingMap[e.student._id] = e })

  // Build danh sách điểm danh
  records.value = (cls.students || []).map(s => ({
    studentId:       s._id,
    name:            s.name,
    code:            s.studentId,
    status:          existingMap[s._id]?.status          || 'present',
    note:            existingMap[s._id]?.note            || '',
    approvedAbsence: existingMap[s._id]?.approvedAbsence || false
  }))

  // Lấy thống kê tổng hợp
  const { data: sum } = await attendanceAPI.getClassSummary(classId)
  summary.value = sum

  loading.value = false
}

const saveAttendance = async () => {
  saving.value = true
  savedMsg.value = ''

  await attendanceAPI.bulkSave({
    classId,
    sessionIndex: parseInt(sessionIndex),
    records: records.value.map(r => ({
      studentId:       r.studentId,
      status:          r.status,
      note:            r.note,
      approvedAbsence: r.approvedAbsence
    }))
  })

  // Refresh thống kê sau khi lưu
  const { data: sum } = await attendanceAPI.getClassSummary(classId)
  summary.value = sum

  savedMsg.value = `✅ Đã lưu điểm danh ${records.value.length} sinh viên!`
  saving.value = false
  setTimeout(() => savedMsg.value = '', 4000)
}

onMounted(load)
</script>

<style scoped>
.stats-row {
  display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;
}
.chip { padding: 6px 14px; border-radius: 99px; font-size: 13px; font-weight: 600; }
.chip-success { background: #d1fae5; color: #065f46; }
.chip-danger  { background: #fee2e2; color: #991b1b; }
.chip-warning { background: #fef3c7; color: #92400e; }
.chip-gray    { background: var(--gray-100); color: var(--gray-600); }

.row-present { background: #f0fdf4 !important; }
.row-absent  { background: #fef2f2 !important; }
.row-late    { background: #fffbeb !important; }

input[type="radio"]    { width: 18px; height: 18px; cursor: pointer; }
input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; }

/* Thanh tiến trình tỉ lệ tham gia */
.progress-wrap {
  position: relative; background: var(--gray-100);
  border-radius: 99px; height: 22px; min-width: 120px; overflow: hidden;
}
.progress-bar {
  height: 100%; border-radius: 99px;
  transition: width .4s ease;
}
.progress-label {
  position: absolute; right: 8px; top: 50%;
  transform: translateY(-50%);
  font-size: 11px; font-weight: 700; color: var(--gray-700);
}
</style>