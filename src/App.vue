<script setup lang="ts">
import StampWorkspace from './components/editor/StampWorkspace.vue'
</script>

<template>
  <div class="app-root">
    <div class="demo-wrapper">
      <StampWorkspace />
    </div>
  </div>
</template>

<style scoped>
.app-root {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 18px;
  background:
    linear-gradient(180deg, #eef2f6 0%, #f7f8fa 48%, #eceff3 100%);
  box-sizing: border-box;
  overflow-x: hidden;
}

.demo-wrapper {
  width: 100%;
  max-width: 1440px;
  min-width: 0;
}

@media (max-width: 720px) {
  .app-root {
    padding: 10px;
  }
}
</style>
