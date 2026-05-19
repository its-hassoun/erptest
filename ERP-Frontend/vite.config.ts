import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      clientPort: 3000,
    },
  proxy: {
  '/api/helpdesk': {
    target: 'http://host.docker.internal:5006',
    changeOrigin: true,
    
    rewrite: (path) => path.replace(/^\/api\/helpdesk/, '/api')

  },
  '/uploads': {
    target: 'http://host.docker.internal:5006',
    changeOrigin: true,
  },
  '/api/timesheet': {
    target: 'http://host.docker.internal:5004',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/helpdesk/, '/api')

  },
  '/api/crm': {
        target: 'http://localhost:5101',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/crm/, '/api')
      },
      '/api/rh': {
        target: 'http://localhost:5102',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/rh/, '/api')
      },
      '/api/bi': {
        target: 'http://localhost:5103',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bi/, '/api')
      },
      '/api/projet': {
        target: 'http://localhost:5104',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/projet/, '/api')
      },



}
  }
})