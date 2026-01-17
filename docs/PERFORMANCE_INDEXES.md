# Performance Indexes

These indexes should be added to the database for optimal performance:

```sql
-- Optimize notification queries (recipientId + read status + sort by date)
CREATE INDEX IF NOT EXISTS "Notification_recipientId_read_createdAt_idx" 
ON "Notification"("recipientId", "read", "createdAt" DESC);

-- Optimize post timeline queries (filter null parents + sort by date)
CREATE INDEX IF NOT EXISTS "Post_parentId_createdAt_idx" 
ON "Post"("parentId", "createdAt" DESC) 
WHERE "parentId" IS NULL;

-- Optimize profile page posts query (authorId + sort by date)
CREATE INDEX IF NOT EXISTS "Post_authorId_createdAt_idx" 
ON "Post"("authorId", "createdAt" DESC);

-- Optimize like lookups (check if user liked a post)
CREATE INDEX IF NOT EXISTS "Like_postId_userId_idx" 
ON "Like"("postId", "userId");

-- Optimize repost lookups (check if user reposted a post)
CREATE INDEX IF NOT EXISTS "Repost_postId_userId_idx" 
ON "Repost"("postId", "userId");
```

## How to Apply

Run these SQL commands directly in your Supabase SQL editor or via psql:

```bash
psql $DATABASE_URL -f docs/PERFORMANCE_INDEXES.sql
```

Or apply via Prisma:

```bash
npx tsx scripts/add-indexes.ts
```
