// 构建后把顶层 assets/（textures / models / fonts / legacy）合入 dist/assets/
// 用法：vite build 完成后自动调用（见 package.json 的 build 脚本）
import { cpSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const src = resolve(root, 'assets')
const dest = resolve(root, 'dist', 'assets')

if (!existsSync(src)) {
  console.warn('[copy-assets] 未找到 assets/ 目录，跳过')
  process.exit(0)
}

// 覆盖已存在的同名文件（Vite 哈希产物 index-*.js/css 不会被 assets/ 中的文件覆盖，
// 因为 assets/ 只含 textures/models/fonts/legacy 子目录，不会与哈希产物重名）
cpSync(src, dest, { recursive: true, force: true })

console.log('[copy-assets] assets/ 已合入 dist/assets/')
