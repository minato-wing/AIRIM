import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined')
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const SYSTEM_TAGS = [
  { name: 'LIVER', displayName: 'ライバー' },
  { name: 'LISTENER', displayName: 'リスナー' },
]

async function main() {
  console.log('Seeding tags...')
  
  for (const tag of SYSTEM_TAGS) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: { displayName: tag.displayName },
      create: tag,
    })
    console.log(`✓ Tag created/updated: ${tag.displayName}`)
  }
  
  console.log('Tag seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
