#!/usr/bin/env node

const { execSync } = require('child_process')

async function runMigrations() {
  try {
    console.log('🔄 Checking database migrations...')
    
    // Run prisma migrate deploy (production-safe, only applies pending migrations)
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: process.env,
    })
    
    console.log('✅ Database migrations completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

runMigrations()
