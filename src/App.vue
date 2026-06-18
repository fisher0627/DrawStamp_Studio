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
    radial-gradient(circle at 18% 8%, rgba(255, 255, 255, 0.92), transparent 30%),
    radial-gradient(circle at 88% 14%, rgba(35, 76, 92, 0.08), transparent 24%),
    linear-gradient(135deg, rgba(32, 37, 34, 0.045) 0 1px, transparent 1px 100%),
    linear-gradient(180deg, #f4f5f1 0%, #fbfaf6 46%, #eef1eb 100%);
  background-size: auto, auto, 26px 26px, auto;
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
