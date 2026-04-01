<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">📋 Chương trình đào tạo</h1>
    </div>
    <div v-if="loading" class="loading-wrap"><div class="spinner"></div></div>
    <div v-else-if="!programs.length" class="card">
      <div class="empty-state"><div class="icon">📋</div><p>Chưa có chương trình nào</p></div>
    </div>
    <div v-else style="display:flex;flex-direction:column;gap:20px">
      <div class="card" v-for="prog in programs" :key="prog._id">
        <div class="card-header">
          <div>
            <h3>{{ prog.major?.name }}</h3>
            <span class="text-muted">{{ prog.major?.code }} · {{ prog.totalSemesters }} kỳ</span>
          </div>
        </div>
        <div class="card-body">
          <div class="semesters-grid">
            <div class="semester-card" v-for="sem in prog.semesters" :key="sem.semesterNumber">
              <div class="semester-header">Kỳ {{ sem.semesterNumber }}</div>
              <div class="semester-body">
                <div class="subject-tag" v-for="sub in sem.subjects" :key="sub._id">
                  <strong>{{ sub.code }}</strong> — {{ sub.name }} ({{ sub.credits }}TC)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { programAPI } from '@/api'

const programs = ref([])
const loading  = ref(true)

onMounted(async () => {
  const { data } = await programAPI.getAll()
  programs.value = data
  loading.value = false
})
</script>

<style scoped>
.semesters-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(200px,1fr)); gap: 12px; }
.semester-card  { border: 1px solid var(--gray-200); border-radius: var(--radius); overflow: hidden; }
.semester-header { background: var(--primary); color: white; padding: 8px 12px; font-weight: 600; font-size: 13px; }
.semester-body  { padding: 10px; display: flex; flex-direction: column; gap: 6px; }
.subject-tag    { font-size: 12px; padding: 5px 8px; background: var(--primary-50); border-radius: 5px; color: var(--gray-700); }
</style>