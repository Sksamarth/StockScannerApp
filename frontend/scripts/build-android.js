import { execSync } from 'child_process'

console.log('📦 Building React app...')
execSync('npm run build', { stdio: 'inherit' })

console.log('🔄 Syncing to Android...')
execSync('node_modules\\.bin\\cap sync android', { stdio: 'inherit' })

console.log('✅ Done! Run: npm run cap:open')
