import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined')
  }
  console.log("start pooling")

  const pool = new Pool({
    connectionString,
    max: parseInt(process.env.DATABASE_POOL_MAX || '5', 10),
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 5000,
  })
  console.log("end of pooling")
  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development'
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'stdout', level: 'error' },
          { emit: 'stdout', level: 'warn' },
        ]
      : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma

  // Log slow queries in development
  prisma.$on('query' as never, (e: any) => {
    if (e.duration > 900) {
      console.log(`[Prisma] Slow query (${e.duration}ms):`, e.query.substring(0, 1500))
    }
  })
}
