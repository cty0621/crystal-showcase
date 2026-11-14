import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // 相对 base：构建产物可部署在站点根或任意子目录（如 Gitee Pages）
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174, // 与原项目（5173）错开，避免端口冲突
    host: true,
  },
})
