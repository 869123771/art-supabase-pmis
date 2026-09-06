import { existsSync, readFileSync, realpathSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig, loadEnv } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import ElementPlus from 'unplugin-element-plus/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

const applicationRoot = fileURLToPath(new URL('.', import.meta.url))

function isPlatformRoot(candidate: string | undefined): candidate is string {
  if (!candidate) return false
  const packageFile = path.join(candidate, 'package.json')
  if (!existsSync(packageFile)) return false
  try {
    return (
      (JSON.parse(readFileSync(packageFile, 'utf8')) as { name?: string }).name ===
      'art-supabase-pro'
    )
  } catch {
    return false
  }
}

function resolvePlatformRoot(): string {
  const candidates = [
    process.env.ART_SUPABASE_PLATFORM_ROOT,
    path.resolve(applicationRoot, '../..'),
    path.resolve(applicationRoot, '../art-supabase-pro'),
    path.resolve(applicationRoot, 'node_modules/art-supabase-pro')
  ]
  const resolved = candidates.find(isPlatformRoot)
  if (!resolved) throw new Error('未找到 art-supabase-pro 平台运行时，请先执行 pnpm install')
  return realpathSync(resolved)
}

const platformRoot = resolvePlatformRoot()
const platformSourceRoot = path.join(platformRoot, 'src')
const sourcePattern = /[\\/](?:art-supabase-pmis|art-supabase-pro)[\\/].*\.(?:ts|tsx|vue)(?:\?.*)?$/

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, platformRoot, ''), ...loadEnv(mode, applicationRoot, '') }
  const outDir = process.env.VITE_OUT_DIR || env.VITE_OUT_DIR || 'docs'

  return {
    base: env.VITE_BASE_URL || '/',
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_VERSION || '1.0.0'),
      'import.meta.env.VITE_APP_CODE': JSON.stringify('pmis')
    },
    server: {
      host: true,
      port: Number(env.VITE_PORT || 3020),
      fs: { allow: [applicationRoot, platformRoot] }
    },
    preview: { host: true, port: Number(env.VITE_PORT || 3020) },
    resolve: {
      alias: {
        '@pmis': path.join(applicationRoot, 'src'),
        '@': platformSourceRoot,
        '@views': path.join(platformSourceRoot, 'views'),
        '@imgs': path.join(platformSourceRoot, 'assets/images'),
        '@icons': path.join(platformSourceRoot, 'assets/icons'),
        '@utils': path.join(platformSourceRoot, 'utils'),
        '@stores': path.join(platformSourceRoot, 'store'),
        '@styles': path.join(platformSourceRoot, 'assets/styles')
      },
      dedupe: ['vue', 'vue-router', 'pinia', 'element-plus']
    },
    plugins: [
      vue(),
      vueJsx(),
      tailwindcss(),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
        include: [sourcePattern],
        dts: false,
        resolvers: [ElementPlusResolver({ importStyle: 'sass' })]
      }),
      Components({
        include: [sourcePattern],
        dirs: [path.join(platformSourceRoot, 'components')],
        deep: true,
        dts: false,
        resolvers: [ElementPlusResolver({ importStyle: 'sass' })]
      }),
      ElementPlus({ useSource: true })
    ],
    build: {
      target: 'es2020',
      outDir,
      emptyOutDir: true,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 2000
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData:
            '@use "@styles/core/el-light.scss" as elementTheme; @use "@styles/core/mixin.scss" as *;'
        }
      }
    },
    optimizeDeps: {
      entries: ['index.html', 'src/views/**/*.vue'],
      include: ['vue', 'vue-router', 'pinia', 'element-plus/es']
    }
  }
})
