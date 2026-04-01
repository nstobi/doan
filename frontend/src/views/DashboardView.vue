<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">📊 Tổng quan</h1>
    </div>
    <div class="grid-4">
      <div class="stat-card" v-for="stat in stats" :key="stat.label">
        <div class="stat-icon">{{ stat.icon }}</div>
        <div>
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { majorAPI, subjectAPI, studentAPI, classAPI } from '@/api'

const stats = ref([
  { icon: '🏫', label: 'Ngành học',  value: 0 },
  { icon: '📚', label: 'Môn học',    value: 0 },
  { icon: '👩‍🎓', label: 'Sinh viên', value: 0 },
  { icon: '🏛️', label: 'Lớp học',   value: 0 }
])

onMounted(async () => {
  const [majors, subjects, students, classes] = await Promise.all([
    majorAPI.getAll(),
    subjectAPI.getAll(),
    studentAPI.getAll(),
    classAPI.getAll()
  ])
  stats.value[0].value = majors.data.length
  stats.value[1].value = subjects.data.length
  stats.value[2].value = students.data.length
  stats.value[3].value = classes.data.length
})
</script>

<style scoped>
.stat-card {
  background: var(--white);
  border-radius: var(--radius);
  border: 1px solid var(--gray-200);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-sm);
}
.stat-icon  { font-size: 32px; }
.stat-value { font-size: 28px; font-weight: 700; color: var(--primary); }
.stat-label { font-size: 13px; color: var(--gray-500); margin-top: 2px; }
</style>