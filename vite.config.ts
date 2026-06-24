import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/ff14-craft-planner/',
  plugins: [react()],
})
