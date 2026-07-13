#!/usr/bin/env node
// Run: node scripts/build-android.js
const { execSync } = require('child_process')

console.log('📦 Building React app...')
execSync('npm run build', { stdio: 'inherit' })

console.log('🔄 Syncing to Android...')
execSync('node_modules\\.bin\\cap sync android', { stdio: 'inherit' })

console.log('✅ Done! Open Android Studio:')
console.log('   node_modules\\.bin\\cap open android')
