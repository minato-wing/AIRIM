'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PostCard } from '@/components/post-card'
import { PostWithAuthor } from '@/lib/types'

interface TimelineProps {
  globalPosts: PostWithAuthor[]
  followingPosts: PostWithAuthor[]
  currentUserId?: string
}

export function Timeline({ globalPosts, followingPosts, currentUserId }: TimelineProps) {
  return (
    <Tabs defaultValue="global" className="w-full">
      <TabsList className="w-full rounded-none border-b">
        <TabsTrigger value="following" className="flex-1">
          フォロー中
        </TabsTrigger>
        <TabsTrigger value="global" className="flex-1">
          全体
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="global" className="mt-0">
        {globalPosts.map((post) => (
          <PostCard key={post.id} post={post} currentUserId={currentUserId} />
        ))}
      </TabsContent>
      
      <TabsContent value="following" className="mt-0">
        {followingPosts.length > 0 ? (
          followingPosts.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={currentUserId} />
          ))
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            フォローしているユーザーの投稿がありません
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
