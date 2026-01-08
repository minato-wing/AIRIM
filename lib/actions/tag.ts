'use server'

import { prisma } from '@/lib/prisma'

export async function getAllTags() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: 'asc' },
  })
  return tags
}

export async function getTagById(id: string) {
  const tag = await prisma.tag.findUnique({
    where: { id },
  })
  return tag
}
