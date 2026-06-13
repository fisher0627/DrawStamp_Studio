import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'node:fs'

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version)
  },
  base: '/', // 生产环境使用根路径
  build: {
    outDir: "dist", // Cloudflare Pages 默认使用 dist 目录
    minify: 'esbuild', // 生产环境启用压缩
    sourcemap: false // 生产环境不生成 sourcemap
  }
})
