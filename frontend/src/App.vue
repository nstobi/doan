<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span>🎓</span>
        <span class="logo-text">Tobi</span>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item" exact-active-class="active">
          <span>📊</span><span>Tổng quan</span>
        </router-link>
        <div class="nav-section">Cấu hình</div>
        <router-link to="/majors" class="nav-item" active-class="active">
          <span>🏫</span><span>Ngành học</span>
        </router-link>
        <router-link to="/subjects" class="nav-item" active-class="active">
          <span>📚</span><span>Môn học</span>
        </router-link>
        <router-link to="/programs" class="nav-item" active-class="active">
          <span>📋</span><span>Chương trình đào tạo</span>
        </router-link>
        <div class="nav-section">Quản lý</div>
        <router-link to="/students" class="nav-item" active-class="active">
          <span>👩‍🎓</span><span>Sinh viên</span>
        </router-link>
        <router-link to="/classes" class="nav-item" active-class="active">
          <span>🏛️</span><span>Lớp học</span>
        </router-link>
      </nav>
    </aside>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
.app-layout { display: flex; min-height: 100vh; }
.sidebar {
  width: var(--sidebar-w);
  background: var(--primary);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 100;
}
.sidebar-logo {
  padding: 20px 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255,255,255,.1);
  font-size: 24px;
}
.logo-text { font-size: 16px; font-weight: 700; color: white; }
.sidebar-nav { flex: 1; padding: 12px 8px; overflow-y: auto; }
.nav-section {
  font-size: 10px; font-weight: 600;
  text-transform: uppercase; letter-spacing: .1em;
  color: rgba(255,255,255,.4);
  padding: 14px 10px 6px;
}

.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 10px; border-radius: 7px;
  color: rgba(255,255,255,.75);
  text-decoration: none; font-size: 13.5px; font-weight: 500;
  transition: var(--transition); margin-bottom: 2px;
}

.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 10px; border-radius: 7px;
  color: rgba(255,255,255,.75);
}
.nav-item:hover  { background: rgba(255,255,255,.1); color: #fff; }

.main-content {
  flex: 1;
  margin-left: var(--sidebar-w);
  padding: 28px 32px;
  min-height: 100vh;
}
</style>