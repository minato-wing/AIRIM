#!/usr/bin/env node

const { execSync } = require('child_process')

async function runMigrations() {
  try {
    console.log('🔄 Checking database migrations...')
    
    // Run prisma migrate deploy (production-safe, only applies pending migrations)
    // prisma.config.ts handles using DIRECT_URL for migrations
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
    })
    
    console.log('✅ Database migrations completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

runMigrations()
