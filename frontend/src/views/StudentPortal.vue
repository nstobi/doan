<template>
  <div class="portal-wrap">

    <!-- Header -->
    <div class="portal-header">
      <div style="display:flex;align-items:center;gap:14px">
        <span style="font-size:40px">🎓</span>
        <div>
          <h2>Xin chào, {{ authStore.user?.name }}!</h2>
          <p class="text-muted">{{ student?.major?.name }} · Kỳ {{ student?.currentSemester }}</p>
        </div>
      </div>
      <button class="btn btn-ghost" @click="logout">⏻ Đăng xuất</button>
    </div>

    <div v-if="loading" class="loading-wrap"><div class="spinner"></div></div>

    <div v-else-if="student">

      <!-- Tabs -->
      <div class="portal-tabs">
        <button class="ptab" :class="{ active: tab === 'dashboard'  }" @click="tab = 'dashboard'">📊 Dashboard</button>
        <button class="ptab" :class="{ active: tab === 'timetable'  }" @click="tab = 'timetable'">📅 Thời khóa biểu</button>
        <button class="ptab" :class="{ active: tab === 'courses'    }" @click="tab = 'courses'">📚 Danh sách môn</button>
        <button class="ptab" :class="{ active: tab === 'marks'      }" @click="tab = 'marks'">📝 Bảng điểm</button>
      </div>

      <!-- ── TAB 1: DASHBOARD ─────────────────────── -->
      <div v-if="tab === 'dashboard'">
        <!-- Stat cards -->
        <div class="grid-4" style="margin-bottom:24px">
          <div class="stat-card">
            <div class="stat-icon">📚</div>
            <div class="stat-val">{{ currentSubjects.length }}</div>
            <div class="stat-lbl">Môn đang học</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🏛️</div>
            <div class="stat-val">{{ myClasses.length }}</div>
            <div class="stat-lbl">Lớp học</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-val">{{ totalSessions }}</div>
            <div class="stat-lbl">Tổng buổi học</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-val">{{ avgAttendance }}%</div>
            <div class="stat-lbl">Tỉ lệ tham gia</div>
          </div>
        </div>

        <!-- Thông tin cá nhân -->
        <div class="grid-2">
          <div class="card">
            <div class="card-header"><h3>👤 Thông tin cá nhân</h3></div>
            <div class="card-body">
              <div class="info-row"><span class="info-lbl">Mã SV</span><span>{{ student.studentId }}</span></div>
              <div class="info-row"><span class="info-lbl">Họ tên</span><span>{{ student.name }}</span></div>
              <div class="info-row"><span class="info-lbl">Email</span><span>{{ student.email }}</span></div>
              <div class="info-row"><span class="info-lbl">Ngành</span><span>{{ student.major?.name }}</span></div>
              <div class="info-row"><span class="info-lbl">Kỳ học</span><span class="badge badge-info">Kỳ {{ student.currentSemester }}</span></div>
              <div class="info-row"><span class="info-lbl">Trạng thái</span><span class="badge badge-success">Đang học</span></div>
            </div>
          </div>

          <!-- Điểm danh tổng hợp -->
          <div class="card">
            <div class="card-header"><h3>📊 Điểm danh tổng hợp</h3></div>
            <div class="card-body" style="padding:0">
              <div v-if="!attendanceSummary.length" class="empty-state"><p>Chưa có dữ liệu điểm danh</p></div>
              <table v-else>
                <thead><tr><th>Lớp học</th><th>Có mặt</th><th>Vắng</th><th>Tỉ lệ</th></tr></thead>
                <tbody>
                  <tr v-for="row in attendanceSummary" :key="row.classId">
                    <td style="font-weight:500">{{ row.className }}</td>
                    <td><span class="badge badge-success">{{ row.present }}</span></td>
                    <td><span class="badge badge-danger">{{ row.absent }}</span></td>
                    <td>
                      <div class="mini-progress">
                        <div class="mini-bar" :style="{ width: row.rate + '%', background: row.rate >= 80 ? '#10b981' : '#ef4444' }"></div>
                        <span>{{ row.rate }}%</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- ── TAB 2: THỜI KHÓA BIỂU ───────────────── -->
      <div v-if="tab === 'timetable'">
        <div class="card">
          <div class="card-header"><h3>📅 Thời khóa biểu — Kỳ {{ student.currentSemester }}</h3></div>
          <div class="card-body" style="padding:0">
            <div v-if="!myClasses.length" class="empty-state">
              <div class="icon">📅</div>
              <p>Chưa có lịch học nào</p>
            </div>
            <div v-else>
              <!-- Danh sách tất cả buổi học -->
              <table>
                <thead>
                  <tr>
                    <th>Lớp học</th>
                    <th>Môn học</th>
                    <th>Buổi</th>
                    <th>Ngày học</th>
                    <th>Nội dung</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="cls in myClasses" :key="cls._id">
                    <tr v-for="(session, idx) in cls.sessions" :key="idx"
                        :class="{ 'row-today': isToday(session.date) }">
                      <td style="font-weight:500">{{ cls.name }}</td>
                      <td>{{ cls.subject?.name }}</td>
                      <td><span class="badge badge-info">Buổi {{ idx + 1 }}</span></td>
                      <td>
                        <div :style="{ fontWeight: isToday(session.date) ? '700' : '400', color: isToday(session.date) ? 'var(--primary)' : '' }">
                          {{ formatDate(session.date) }}
                        </div>
                        <div class="text-muted" v-if="isToday(session.date)">📍 Hôm nay</div>
                      </td>
                      <td class="text-muted">{{ session.description || '—' }}</td>
                    </tr>
                  </template>
                  <tr v-if="allSessions.length === 0">
                    <td colspan="5" class="empty-state">Chưa có buổi học nào được lên lịch</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- ── TAB 3: DANH SÁCH MÔN HỌC ───────────── -->
      <div v-if="tab === 'courses'">
        <!-- Môn kỳ hiện tại -->
        <div class="card" style="margin-bottom:20px">
          <div class="card-header">
            <h3>📚 Môn học kỳ {{ student.currentSemester }} (đang học)</h3>
          </div>
          <div class="card-body" style="padding:0">
            <div v-if="!currentSubjects.length" class="empty-state"><p>Chưa có môn học nào</p></div>
            <table v-else>
              <thead><tr><th>Mã môn</th><th>Tên môn học</th><th>Tín chỉ</th><th>Lớp học</th><th>Trạng thái</th></tr></thead>
              <tbody>
                <tr v-for="es in currentSubjects" :key="es._id">
                  <td><span class="badge badge-info">{{ es.subject?.code }}</span></td>
                  <td><strong>{{ es.subject?.name }}</strong></td>
                  <td>{{ es.subject?.credits }} TC</td>
                  <td>
                    <span v-for="cls in getClassBySubject(es.subject?._id)" :key="cls._id" class="text-muted">
                      {{ cls.name }}
                    </span>
                  </td>
                  <td><span class="badge badge-info">Đang học</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Lịch sử các kỳ trước -->
        <div class="card" v-if="pastSubjects.length > 0">
          <div class="card-header"><h3>📖 Lịch sử học tập các kỳ trước</h3></div>
          <div class="card-body" style="padding:0">
            <table>
              <thead><tr><th>Kỳ</th><th>Mã môn</th><th>Tên môn học</th><th>Tín chỉ</th><th>Trạng thái</th><th>Điểm</th></tr></thead>
              <tbody>
                <tr v-for="es in pastSubjects" :key="es._id">
                  <td><span class="badge badge-gray">Kỳ {{ es.semester }}</span></td>
                  <td><span class="badge badge-info">{{ es.subject?.code }}</span></td>
                  <td>{{ es.subject?.name }}</td>
                  <td>{{ es.subject?.credits }} TC</td>
                  <td><span class="badge" :class="subClass(es.status)">{{ subLabel(es.status) }}</span></td>
                  <td>
                    <span v-if="es.grade !== null && es.grade !== undefined" style="font-weight:700" :style="{ color: es.grade >= 5 ? 'var(--success)' : 'var(--danger)' }">
                      {{ es.grade }}/10
                    </span>
                    <span v-else class="text-muted">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ── TAB 4: BẢNG ĐIỂM ────────────────────── -->
      <div v-if="tab === 'marks'">
        <!-- Thống kê nhanh -->
        <div class="grid-3" style="margin-bottom:20px">
          <div class="mark-stat-card">
            <div class="mark-icon">🏆</div>
            <div class="mark-val" :style="{ color: gpa >= 5 ? 'var(--success)' : 'var(--danger)' }">{{ gpa }}</div>
            <div class="mark-lbl">GPA trung bình</div>
          </div>
          <div class="mark-stat-card">
            <div class="mark-icon">✅</div>
            <div class="mark-val" style="color:var(--success)">{{ passedCount }}</div>
            <div class="mark-lbl">Môn đã qua</div>
          </div>
          <div class="mark-stat-card">
            <div class="mark-icon">📊</div>
            <div class="mark-val">{{ totalCredits }} TC</div>
            <div class="mark-lbl">Tổng tín chỉ tích lũy</div>
          </div>
        </div>

        <!-- Bảng điểm chi tiết -->
        <div class="card">
          <div class="card-header"><h3>📝 Bảng điểm chi tiết</h3></div>
          <div class="card-body" style="padding:0">
            <div v-if="!gradedSubjects.length" class="empty-state">
              <div class="icon">📝</div>
              <p>Chưa có điểm nào được ghi nhận</p>
            </div>
            <table v-else>
              <thead>
                <tr>
                  <th>Kỳ</th>
                  <th>Mã môn</th>
                  <th>Tên môn học</th>
                  <th>Tín chỉ</th>
                  <th>Điểm số</th>
                  <th>Xếp loại</th>
                  <th>Kết quả</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="es in allSubjectsSorted" :key="es._id">
                  <td><span class="badge badge-gray">Kỳ {{ es.semester }}</span></td>
                  <td><span class="badge badge-info">{{ es.subject?.code }}</span></td>
                  <td><strong>{{ es.subject?.name }}</strong></td>
                  <td>{{ es.subject?.credits }} TC</td>
                  <td>
                    <span v-if="es.grade !== null && es.grade !== undefined"
                          style="font-size:16px;font-weight:700"
                          :style="{ color: es.grade >= 5 ? 'var(--success)' : 'var(--danger)' }">
                      {{ es.grade }}/10
                    </span>
                    <span v-else class="text-muted">Chưa có điểm</span>
                  </td>
                  <td>
                    <span v-if="es.grade !== null && es.grade !== undefined" class="badge" :class="gradeBadge(es.grade)">
                      {{ gradeLabel(es.grade) }}
                    </span>
                    <span v-else class="text-muted">—</span>
                  </td>
                  <td>
                    <span class="badge" :class="subClass(es.status)">{{ subLabel(es.status) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Ghi chú xếp loại -->
            <div style="padding:16px;border-top:1px solid var(--gray-100);display:flex;gap:12px;flex-wrap:wrap">
              <span class="badge" style="background:#d1fae5;color:#065f46">A: 9-10</span>
              <span class="badge" style="background:#dbeafe;color:#1e40af">B: 7-8.9</span>
              <span class="badge" style="background:#fef3c7;color:#92400e">C: 5-6.9</span>
              <span class="badge" style="background:#fee2e2;color:#991b1b">D: &lt; 5</span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Không tìm thấy thông tin SV -->
    <div v-else class="card">
      <div class="card-body empty-state">
        <div class="icon">⚠️</div>
        <p>Không tìm thấy thông tin sinh viên. Vui lòng liên hệ admin.</p>
      </div>
    </div>

  </div>
</template>

<script setup>
/* eslint-disable */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { studentAPI, classAPI, attendanceAPI } from '@/api'

const router    = useRouter()
const authStore = useAuthStore()

const tab      = ref('dashboard')
const student  = ref(null)
const myClasses= ref([])
const loading  = ref(true)
const attendanceSummary = ref([])

// ── Helpers ───────────────────────────────────────
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—'
const isToday    = (d) => {
  if (!d) return false
  const date  = new Date(d)
  const today = new Date()
  return date.getDate()     === today.getDate()   &&
         date.getMonth()    === today.getMonth()  &&
         date.getFullYear() === today.getFullYear()
}

const subClass = (s) => ({ in_progress:'badge-info', passed:'badge-success', failed:'badge-danger' }[s] || 'badge-gray')
const subLabel = (s) => ({ in_progress:'Đang học', passed:'Đã qua', failed:'Không đạt' }[s] || s)

const gradeBadge = (g) => {
  if (g >= 9)  return 'badge-success'
  if (g >= 7)  return 'badge-info'
  if (g >= 5)  return 'badge-warning'
  return 'badge-danger'
}
const gradeLabel = (g) => {
  if (g >= 9)  return 'A'
  if (g >= 7)  return 'B'
  if (g >= 5)  return 'C'
  return 'D'
}

// ── Computed ──────────────────────────────────────

// Môn đang học kỳ hiện tại
const currentSubjects = computed(() => {
  if (!student.value) return []
  return student.value.enrolledSubjects?.filter(
    es => es.semester === student.value.currentSemester
  ) || []
})

// Môn các kỳ trước
const pastSubjects = computed(() => {
  if (!student.value) return []
  return student.value.enrolledSubjects?.filter(
    es => es.semester < student.value.currentSemester
  ).sort((a, b) => b.semester - a.semester) || []
})

// Tất cả môn sắp xếp theo kỳ
const allSubjectsSorted = computed(() => {
  if (!student.value) return []
  return [...(student.value.enrolledSubjects || [])].sort((a, b) => a.semester - b.semester)
})

// Các môn đã có điểm
const gradedSubjects = computed(() =>
  allSubjectsSorted.value.filter(es => es.grade !== null && es.grade !== undefined)
)

// Tổng buổi học
const totalSessions = computed(() =>
  myClasses.value.reduce((sum, cls) => sum + (cls.sessions?.length || 0), 0)
)

// GPA trung bình
const gpa = computed(() => {
  const graded = gradedSubjects.value
  if (!graded.length) return '—'
  const avg = graded.reduce((sum, es) => sum + es.grade, 0) / graded.length
  return avg.toFixed(1)
})

// Số môn đã qua
const passedCount = computed(() =>
  allSubjectsSorted.value.filter(es => es.status === 'passed').length
)

// Tổng tín chỉ tích lũy (môn đã qua)
const totalCredits = computed(() =>
  allSubjectsSorted.value
    .filter(es => es.status === 'passed')
    .reduce((sum, es) => sum + (es.subject?.credits || 0), 0)
)

// Tỉ lệ tham gia trung bình
const avgAttendance = computed(() => {
  if (!attendanceSummary.value.length) return '—'
  const avg = attendanceSummary.value.reduce((sum, r) => sum + r.rate, 0) / attendanceSummary.value.length
  return Math.round(avg)
})

// Tất cả buổi học
const allSessions = computed(() => {
  const sessions = []
  myClasses.value.forEach(cls => {
    (cls.sessions || []).forEach((s, idx) => {
      sessions.push({ ...s, className: cls.name, idx })
    })
  })
  return sessions.sort((a, b) => new Date(a.date) - new Date(b.date))
})

// Lấy lớp học theo môn
const getClassBySubject = (subjectId) => {
  if (!subjectId) return []
  return myClasses.value.filter(cls =>
    cls.subject?._id === subjectId || cls.subject === subjectId
  )
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}

// ── Load dữ liệu ──────────────────────────────────
onMounted(async () => {
  loading.value = true
  try {
    // Lấy id sinh viên từ thông tin đăng nhập
    const studentId = authStore.user?.studentRef ||
                      authStore.user?.studentInfo?._id

    if (studentId) {
      // Lấy hồ sơ sinh viên
      const { data } = await studentAPI.getOne(studentId)
      student.value = data

      // Lấy tất cả lớp, lọc ra lớp của sinh viên này
      const classRes = await classAPI.getAll()
      myClasses.value = classRes.data.filter(cls =>
        cls.students?.some(s =>
          (s._id || s)?.toString() === student.value._id?.toString()
        )
      )

      // Lấy thống kê điểm danh từng lớp
      const summaryList = []
      for (const cls of myClasses.value) {
        try {
          const { data: sum } = await attendanceAPI.getStudentSummary(cls._id, student.value._id)
          summaryList.push({
            classId:   cls._id,
            className: cls.name,
            present:   sum.present,
            absent:    sum.absent,
            late:      sum.late,
            rate:      sum.attendanceRate
          })
        } catch { /* bỏ qua nếu chưa có dữ liệu */ }
      }
      attendanceSummary.value = summaryList
    }
  } catch(e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* Layout */
.portal-wrap   { max-width: 1100px; margin: 0 auto; }
.portal-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; flex-wrap:wrap; gap:12px; }

/* Tabs */
.portal-tabs { display:flex; gap:4px; border-bottom:2px solid var(--gray-200); margin-bottom:24px; flex-wrap:wrap; }
.ptab {
  padding: 10px 20px; border: none; background: transparent;
  font-size: 14px; font-weight: 500; color: var(--gray-500);
  cursor: pointer; border-bottom: 2px solid transparent;
  margin-bottom: -2px; transition: var(--transition); font-family: inherit;
}
.ptab:hover  { color: var(--primary); }
.ptab.active { color: var(--primary); border-bottom-color: var(--primary); background: var(--primary-50); border-radius: 6px 6px 0 0; }

/* Stat cards */
.stat-card  { background:var(--white); border:1px solid var(--gray-200); border-radius:var(--radius); padding:20px; text-align:center; box-shadow:var(--shadow-sm); }
.stat-icon  { font-size:28px; margin-bottom:8px; }
.stat-val   { font-size:28px; font-weight:700; color:var(--primary); }
.stat-lbl   { font-size:12px; color:var(--gray-500); margin-top:4px; }

/* Mark stat cards */
.grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
.mark-stat-card { background:var(--white); border:1px solid var(--gray-200); border-radius:var(--radius); padding:24px; text-align:center; box-shadow:var(--shadow-sm); }
.mark-icon { font-size:32px; margin-bottom:8px; }
.mark-val  { font-size:32px; font-weight:700; color:var(--primary); margin-bottom:4px; }
.mark-lbl  { font-size:13px; color:var(--gray-500); }

/* Info rows */
.info-row { display:flex; align-items:center; gap:8px; margin-bottom:10px; }
.info-lbl { font-size:12px; color:var(--gray-400); font-weight:600; text-transform:uppercase; min-width:80px; }

/* Mini progress bar */
.mini-progress { display:flex; align-items:center; gap:8px; min-width:100px; }
.mini-progress > div { flex:1; height:8px; background:var(--gray-100); border-radius:99px; overflow:hidden; }
.mini-bar { height:100%; border-radius:99px; transition:width .3s; }
.mini-progress > span { font-size:12px; font-weight:600; color:var(--gray-600); width:35px; }

/* Timetable today highlight */
.row-today { background: var(--primary-50) !important; }
.row-today td { font-weight: 500; }

/* Responsive */
@media (max-width: 640px) {
  .grid-4, .grid-3, .grid-2 { grid-template-columns: 1fr 1fr; }
}
</style>