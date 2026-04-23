<template>
  <div class="portal-layout">

    <!-- Sidebar trái -->
    <aside class="portal-sidebar">
      <!-- Logo + tên -->
      <div class="portal-logo">
        <span>🎓</span>
        <span>EduManager</span>
      </div>

      <!-- Thông tin sinh viên -->
      <div class="sv-info" v-if="student">
        <div class="sv-avatar">{{ authStore.user?.name?.charAt(0) }}</div>
        <div class="sv-name">{{ authStore.user?.name }}</div>
        <div class="sv-id text-muted">{{ student.studentId }}</div>
        <span class="badge badge-info" style="margin-top:6px">Kỳ {{ student.currentSemester }}</span>
      </div>
        
      <!-- Menu -->
      <nav class="portal-nav">
        <button class="pnav-item" :class="{ active: tab === 'dashboard' }" @click="tab = 'dashboard'">
          <span>📊</span><span>Dashboard</span>
        </button>
        <button class="pnav-item" :class="{ active: tab === 'timetable' }" @click="tab = 'timetable'">
          <span>📅</span><span>Thời khóa biểu</span>
        </button>
        <button class="pnav-item" :class="{ active: tab === 'courses' }" @click="tab = 'courses'">
          <span>📚</span><span>Danh sách môn</span>
        </button>
        <button class="pnav-item" :class="{ active: tab === 'marks' }" @click="tab = 'marks'">
          <span>📝</span><span>Kết quả học tập</span>
        </button>
      </nav>

      <!-- Đăng xuất -->
      <button class="portal-logout" @click="logout">
        <span>⏻</span><span>Đăng xuất</span>
      </button>
    </aside>

    <!-- Nội dung chính -->
    <main class="portal-main">
      <div v-if="loading" class="loading-wrap"><div class="spinner"></div></div>

      <div v-else-if="student">

        <!-- ── DASHBOARD ─────────────────────────── -->
        <div v-if="tab === 'dashboard'">
          <div class="page-header">
            <h1 class="page-title">📊 Dashboard</h1>
            <span class="text-muted">Xin chào, {{ authStore.user?.name }}!</span>
          </div>

          <div class="grid-4" style="margin-bottom:24px">
            <div class="stat-card">
              <div class="stat-icon">📚</div>
              <div class="stat-val">{{ currentSubjects.length }}</div>
              <div class="stat-lbl">Kỹ năng đang học</div>
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

          <div class="grid-2">
            <!-- Thông tin cá nhân -->
            <div class="card">
              <div class="card-header"><h3>👤 Thông tin cá nhân</h3></div>
              <div class="card-body">
                <div class="info-row"><span class="info-lbl">Mã SV</span><span>{{ student.studentId }}</span></div>
                <div class="info-row"><span class="info-lbl">Họ tên</span><span>{{ student.name }}</span></div>
                <div class="info-row"><span class="info-lbl">Email</span><span>{{ student.email }}</span></div>
                <div class="info-row"><span class="info-lbl">Ngành</span><span>{{ student.major?.name }}</span></div>
                <div class="info-row"><span class="info-lbl">Cấp độ</span><span class="badge badge-info">Kỳ {{ student.currentSemester }}</span></div>
                <div class="info-row"><span class="info-lbl">Trạng thái</span><span class="badge badge-success">Đang học</span></div>
              </div>
            </div>

            <!-- Điểm danh tổng hợp -->
            <div class="card">
              <div class="card-header"><h3>📊 Điểm danh tổng hợp</h3></div>
              <div class="card-body" style="padding:0">
                <div v-if="!attendanceSummary.length" class="empty-state"><p>Chưa có dữ liệu</p></div>
                <table v-else>
                  <thead><tr><th>Lớp học</th><th>Có mặt</th><th>Vắng</th><th>Tỉ lệ</th></tr></thead>
                  <tbody>
                    <tr v-for="row in attendanceSummary" :key="row.classId">
                      <td style="font-weight:500">{{ row.className }}</td>
                      <td><span class="badge badge-success">{{ row.present }}</span></td>
                      <td><span class="badge badge-danger">{{ row.absent }}</span></td>
                      <td>
                        <div class="mini-progress">
                          <div class="mini-track">
                            <div class="mini-bar" :style="{ width: row.rate + '%', background: row.rate >= 80 ? '#10b981' : '#ef4444' }"></div>
                          </div>
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

        <!-- ── THỜI KHÓA BIỂU ────────────────────── -->
        <div v-if="tab === 'timetable'">
          <div class="page-header">
            <h1 class="page-title">📅 Thời khóa biểu</h1>
            <span class="text-muted">Kỳ {{ student.currentSemester }}</span>
          </div>
          <div class="card">
            <div class="card-body" style="padding:0">
              <div v-if="!allSessions.length" class="empty-state">
                <div class="icon">📅</div><p>Chưa có lịch học nào</p>
              </div>
              <table v-else>
                <thead>
                  <tr><th>Lớp học</th><th>Môn học</th><th>Buổi</th><th>Ngày học</th><th>Nội dung</th></tr>
                </thead>
                <tbody>
                  <tr v-for="s in allSessions" :key="s.key" :class="{ 'row-today': isToday(s.date) }">
                    <td style="font-weight:500">{{ s.className }}</td>
                    <td>{{ s.subjectName }}</td>
                    <td><span class="badge badge-info">Buổi {{ s.idx + 1 }}</span></td>
                    <td>
                      <div :style="{ fontWeight: isToday(s.date) ? '700' : '400', color: isToday(s.date) ? 'var(--primary)' : '' }">
                        {{ formatDate(s.date) }}
                      </div>
                      <div class="text-muted" v-if="isToday(s.date)">📍 Hôm nay</div>
                    </td>
                    <td class="text-muted">{{ s.description || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ── DANH SÁCH MÔN ─────────────────────── -->
        <div v-if="tab === 'courses'">
          <div class="page-header">
            <h1 class="page-title">📚 Danh sách môn học</h1>
          </div>

          <!-- Môn kỳ hiện tại -->
          <div class="card" style="margin-bottom:20px">
            <div class="card-header"><h3>Kỳ {{ student.currentSemester }} — Đang học</h3></div>
            <div class="card-body" style="padding:0">
              <div v-if="!currentSubjects.length" class="empty-state"><p>Chưa có môn học nào</p></div>
              <table v-else>
                <thead><tr><th>Mã môn</th><th>Tên môn học</th><th>Tín chỉ</th><th>Lớp học</th><th>Trạng thái</th></tr></thead>
                <tbody>
                  <tr v-for="es in currentSubjects" :key="es._id">
                    <td><span class="badge badge-info">{{ es.subject?.code }}</span></td>
                    <td><strong>{{ es.subject?.name }}</strong></td>
                    <td>{{ es.subject?.credits }} TC</td>
                    <td class="text-muted">
                      <span v-for="cls in getClassBySubject(es.subject?._id)" :key="cls._id">{{ cls.name }}</span>
                    </td>
                    <td><span class="badge badge-info">Đang học</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Lịch sử các kỳ trước -->
          <div class="card" v-if="pastSubjects.length">
            <div class="card-header"><h3>📖 Lịch sử các kỳ trước</h3></div>
            <div class="card-body" style="padding:0">
              <table>
                <thead><tr><th>Kỳ</th><th>Mã môn</th><th>Tên môn</th><th>Tín chỉ</th><th>Trạng thái</th><th>Điểm</th></tr></thead>
                <tbody>
                  <tr v-for="es in pastSubjects" :key="es._id">
                    <td><span class="badge badge-gray">Kỳ {{ es.semester }}</span></td>
                    <td><span class="badge badge-info">{{ es.subject?.code }}</span></td>
                    <td>{{ es.subject?.name }}</td>
                    <td>{{ es.subject?.credits }} TC</td>
                    <td><span class="badge" :class="subClass(es.status)">{{ subLabel(es.status) }}</span></td>
                    <td>
                      <span v-if="es.grade !== null && es.grade !== undefined" style="font-weight:700"
                            :style="{ color: es.grade >= 5 ? 'var(--success)' : 'var(--danger)' }">
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

        <!-- ── BẢNG ĐIỂM ─────────────────────────── -->
        <div v-if="tab === 'marks'">
          <div class="page-header">
            <h1 class="page-title">📝 Kết quả học tập</h1>
          </div>

          <!-- Thống kê -->
          <div class="grid-3" style="margin-bottom:20px">
            <div class="mark-card">
              <div class="mark-icon">🏆</div>
              <div class="mark-val" :style="{ color: gpa !== '—' && parseFloat(gpa) >= 5 ? 'var(--success)' : 'var(--danger)' }">{{ gpa }}</div>
              <div class="mark-lbl">Band Score TB</div>
            </div>
            <div class="mark-card">
              <div class="mark-icon">✅</div>
              <div class="mark-val" style="color:var(--success)">{{ passedCount }}</div>
              <div class="mark-lbl">Môn đã qua</div>
            </div>
            <div class="mark-card">
              <div class="mark-icon">📊</div>
              <div class="mark-val">{{ totalCredits }} TC</div>
              <div class="mark-lbl">Tín chỉ tích lũy</div>``
            </div>
          </div>

          <!-- Bảng điểm chi tiết -->
          <div class="card">
            <div class="card-header"><h3>Chi tiết điểm từng môn</h3></div>
            <div class="card-body" style="padding:0">
              <div v-if="!allSubjectsSorted.length" class="empty-state">
                <div class="icon">📝</div><p>Chưa có dữ liệu điểm</p>
              </div>
              <table v-else>
                <thead>
                  <tr><th>Kỳ</th><th>Mã môn</th><th>Tên môn</th><th>TC</th><th>Điểm</th><th>Xếp loại</th><th>Kết quả</th></tr>
                </thead>
                <tbody>
                  <tr v-for="es in allSubjectsSorted" :key="es._id">
                    <td><span class="badge badge-gray">Kỳ {{ es.semester }}</span></td>
                    <td><span class="badge badge-info">{{ es.subject?.code }}</span></td>
                    <td><strong>{{ es.subject?.name }}</strong></td>
                    <td>{{ es.subject?.credits }}</td>
                    <td>
                      <span v-if="es.grade !== null && es.grade !== undefined"
                            style="font-size:15px;font-weight:700"
                            :style="{ color: es.grade >= 5 ? 'var(--success)' : 'var(--danger)' }">
                        {{ es.grade }}/10
                      </span>
                      <span v-else class="text-muted">Chưa có</span>
                    </td>
                    <td>
                      <span v-if="es.grade !== null && es.grade !== undefined" class="badge" :class="gradeBadge(es.grade)">
                        {{ gradeLabel(es.grade) }}
                      </span>
                      <span v-else class="text-muted">—</span>
                    </td>
                    <td><span class="badge" :class="subClass(es.status)">{{ subLabel(es.status) }}</span></td>
                  </tr>
                </tbody>
              </table>
              <!-- Chú thích -->
              <div style="padding:12px 16px;border-top:1px solid var(--gray-100);display:flex;gap:10px;flex-wrap:wrap">
                <span class="badge" style="background:#d1fae5;color:#065f46">A: 9–10</span>
                <span class="badge" style="background:#dbeafe;color:#1e40af">B: 7–8.9</span>
                <span class="badge" style="background:#fef3c7;color:#92400e">C: 5–6.9</span>
                <span class="badge" style="background:#fee2e2;color:#991b1b">D: &lt; 5</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Không tìm thấy SV -->
      <div v-else class="card">
        <div class="card-body empty-state">
          <div class="icon">⚠️</div>
          <p>Không tìm thấy thông tin sinh viên. Vui lòng liên hệ admin.</p>
        </div>
      </div>
    </main>
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

const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—'
const isToday = (d) => {
  if (!d) return false
  const date = new Date(d), today = new Date()
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear()
}
const subClass   = (s) => ({ in_progress:'badge-info', passed:'badge-success', failed:'badge-danger' }[s] || 'badge-gray')
const subLabel   = (s) => ({ in_progress:'Đang học', passed:'Đã qua', failed:'Không đạt' }[s] || s)
const gradeBadge = (g) => g >= 9 ? 'badge-success' : g >= 7 ? 'badge-info' : g >= 5 ? 'badge-warning' : 'badge-danger'
const gradeLabel = (g) => g >= 9 ? 'A' : g >= 7 ? 'B' : g >= 5 ? 'C' : 'D'

const currentSubjects = computed(() =>
  student.value?.enrolledSubjects?.filter(es => es.semester === student.value.currentSemester) || []
)
const pastSubjects = computed(() =>
  student.value?.enrolledSubjects?.filter(es => es.semester < student.value.currentSemester)
    .sort((a, b) => b.semester - a.semester) || []
)
const allSubjectsSorted = computed(() =>
  [...(student.value?.enrolledSubjects || [])].sort((a, b) => a.semester - b.semester)
)
const totalSessions = computed(() =>
  myClasses.value.reduce((sum, cls) => sum + (cls.sessions?.length || 0), 0)
)
const allSessions = computed(() => {
  const list = []
  myClasses.value.forEach(cls => {
    (cls.sessions || []).forEach((s, idx) => {
      list.push({ key: `${cls._id}-${idx}`, ...s, idx, className: cls.name, subjectName: cls.subject?.name })
    })
  })
  return list.sort((a, b) => new Date(a.date) - new Date(b.date))
})
const gpa = computed(() => {
  const graded = allSubjectsSorted.value.filter(es => es.grade !== null && es.grade !== undefined)
  if (!graded.length) return '—'
  return (graded.reduce((sum, es) => sum + es.grade, 0) / graded.length).toFixed(1)
})
const passedCount = computed(() =>
  allSubjectsSorted.value.filter(es => es.status === 'passed').length
)
const totalCredits = computed(() =>
  allSubjectsSorted.value.filter(es => es.status === 'passed')
    .reduce((sum, es) => sum + (es.subject?.credits || 0), 0)
)
const avgAttendance = computed(() => {
  if (!attendanceSummary.value.length) return '—'
  const avg = attendanceSummary.value.reduce((sum, r) => sum + r.rate, 0) / attendanceSummary.value.length
  return Math.round(avg)
})
const getClassBySubject = (subjectId) =>
  myClasses.value.filter(cls => cls.subject?._id === subjectId || cls.subject === subjectId)

const logout = () => { authStore.logout(); router.push('/login') }

onMounted(async () => {
  loading.value = true
  try {
    const studentId = authStore.user?.studentRef || authStore.user?.studentInfo?._id
    if (studentId) {
      const { data } = await studentAPI.getOne(studentId)
      student.value = data
      const classRes = await classAPI.getAll()
      myClasses.value = classRes.data.filter(cls =>
        cls.students?.some(s => (s._id || s)?.toString() === student.value._id?.toString())
      )
      for (const cls of myClasses.value) {
        try {
          const { data: sum } = await attendanceAPI.getStudentSummary(cls._id, student.value._id)
          attendanceSummary.value.push({
            classId: cls._id, className: cls.name,
            present: sum.present, absent: sum.absent, late: sum.late, rate: sum.attendanceRate
          })
        } catch {}
      }
    }
  } catch(e) { console.error(e) }
  finally { loading.value = false }
})
</script>

<style scoped>
/* ── Layout ────────────────────────────────── */
.portal-layout {
  display: flex;
  min-height: 100vh;
}

/* ── Sidebar trái ──────────────────────────── */
.portal-sidebar {
  width: 220px;
  background: var(--primary);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 100;
}

.portal-logo {
  padding: 20px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 700;
  color: white;
  border-bottom: 1px solid rgba(255,255,255,.1);
}
.portal-logo span:first-child { font-size: 24px; }

/* Avatar + tên SV */
.sv-info {
  padding: 16px;
  border-bottom: 1px solid rgba(255,255,255,.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
}
.sv-avatar {
  width: 48px; height: 48px;
  border-radius: 50%;
  background: var(--accent);
  color: white;
  font-size: 20px;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 6px;
}
.sv-name { font-size: 13px; font-weight: 600; color: white; }
.sv-id   { font-size: 11px; color: rgba(255,255,255,.5); }

/* Nav menu */
.portal-nav { flex: 1; padding: 12px 8px; }

.pnav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  color: rgba(255,255,255,.75);
  font-size: 13.5px;
  font-weight: 500;
  font-family: inherit;
  border-radius: 7px;
  cursor: pointer;
  transition: var(--transition);
  margin-bottom: 2px;
  text-align: left;
}
.pnav-item:hover  { background: rgba(255,255,255,.1); color: white; }
.pnav-item.active { background: var(--accent); color: white; }
.pnav-item span:first-child { font-size: 16px; width: 20px; text-align: center; }

/* Nút đăng xuất */
.portal-logout {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 14px 16px;
  border: none;
  border-top: 1px solid rgba(255,255,255,.1);
  background: transparent;
  color: rgba(255,255,255,.6);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: var(--transition);
}
.portal-logout:hover { background: var(--danger); color: white; }

/* ── Nội dung chính ────────────────────────── */
.portal-main {
  flex: 1;
  margin-left: 220px;
  padding: 28px 32px;
  min-height: 100vh;
}

/* Stat cards */
.stat-card { background:var(--white); border:1px solid var(--gray-200); border-radius:var(--radius); padding:20px; text-align:center; box-shadow:var(--shadow-sm); }
.stat-icon { font-size:28px; margin-bottom:8px; }
.stat-val  { font-size:26px; font-weight:700; color:var(--primary); }
.stat-lbl  { font-size:12px; color:var(--gray-500); margin-top:4px; }

/* Mark cards */
.grid-3    { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
.mark-card { background:var(--white); border:1px solid var(--gray-200); border-radius:var(--radius); padding:24px; text-align:center; box-shadow:var(--shadow-sm); }
.mark-icon { font-size:32px; margin-bottom:8px; }
.mark-val  { font-size:30px; font-weight:700; color:var(--primary); margin-bottom:4px; }
.mark-lbl  { font-size:13px; color:var(--gray-500); }

/* Info rows */
.info-row { display:flex; align-items:center; gap:8px; margin-bottom:10px; }
.info-lbl { font-size:12px; color:var(--gray-400); font-weight:600; text-transform:uppercase; min-width:80px; }

/* Mini progress */
.mini-progress { display:flex; align-items:center; gap:8px; }
.mini-track    { flex:1; height:8px; background:var(--gray-100); border-radius:99px; overflow:hidden; }
.mini-bar      { height:100%; border-radius:99px; transition:width .3s; }
.mini-progress > span { font-size:12px; font-weight:600; color:var(--gray-600); width:35px; }

/* Timetable today */
.row-today { background: var(--primary-50) !important; }
</style>
