import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

// SM삼환기업 통합관제 대시보드 — 클라이언트(SM삼환) 전용 버전
// base: './' → 상대경로 에셋. (배포 방식 확정 시 조정)
// port 5274 → 원본(5273)과 동시 실행 가능
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5274,
    // /api/* → Node 백엔드(:3001) 프록시 (CORS 우회 + 키 서버측 보관)
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
});
