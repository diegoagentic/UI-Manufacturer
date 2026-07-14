import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/

/**
 * Bug workaround (2026-07-14) · vite v7.3.x con Node 22 deja handles
 * abiertos tras  completar · el proceso npm nunca termina
 * y Vercel lo mata con SIGKILL tras ~2min. Este plugin fuerza exit
 * limpio tras el closeBundle hook.
 */
const forceExitAfterBuild = () => ({
  name: 'force-exit-after-build',
  apply: 'build' as const,
  closeBundle() {
    setTimeout(() => process.exit(0), 100)
  },
})

export default defineConfig({
  plugins: [react(), forceExitAfterBuild()],
  base: process.env.GITHUB_PAGES === 'true' ? '/demo-strata/' : '/',
  server: {
    port: 8085,
    strictPort: false,
  },
})
