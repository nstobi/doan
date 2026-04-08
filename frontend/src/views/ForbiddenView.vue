<template>
  <div class="page-403">
    <div class="icon">🚫</div>
    <h1>Không có quyền truy cập</h1>
    <p>Bạn không có quyền xem trang này.</p>
    <button class="btn btn-primary" @click="$router.back()">← Quay lại</button>
  </div>
</template>

<style scoped>
.page-403 {
  min-height: 100vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center; text-align: center; gap: 12px;
}
.icon { font-size: 64px; }
h1   { color: var(--gray-800); }
p    { color: var(--gray-500); margin-bottom: 8px; }
</style>
