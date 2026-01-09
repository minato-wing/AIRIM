-- Add composite indexes for better query performance

-- Optimize notification queries
CREATE INDEX IF NOT EXISTS "Notification_recipientId_read_createdAt_idx" ON "Notification"("recipientId", "read", "createdAt" DESC);

-- Optimize like/repost lookups
CREATE INDEX IF NOT EXISTS "Like_postId_userId_idx" ON "Like"("postId", "userId");
CREATE INDEX IF NOT EXISTS "Repost_postId_userId_idx" ON "Repost"("postId", "userId");
