import fs from 'fs'
import path from 'path'

const distDir = path.resolve('dist')
const indexPath = path.join(distDir, 'index.html')
const fallbackPath = path.join(distDir, '404.html')

if (fs.existsSync(indexPath)) {
  fs.copyFileSync(indexPath, fallbackPath)
  console.log('✓ Copied index.html to 404.html for GitHub Pages SPA routing')
}
