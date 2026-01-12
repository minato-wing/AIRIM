'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { TagBadge } from '@/components/tag-badge'
import { searchProfiles } from '@/lib/actions/profile'
import { getAllTags } from '@/lib/actions/tag'
import { Search as SearchIcon } from 'lucide-react'
import type { Profile, Tag } from '@prisma/client'

type ProfileWithTag = {
  id: string
  username: string
  name: string
  bio: string
  avatar: string | null
  tags: Array<{
    tag: {
      id: string
      name: string
      displayName: string
    }
  }>
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ProfileWithTag[]>([])
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  useEffect(() => {
    const loadTags = async () => {
      try {
        const allTags = await getAllTags()
        setTags(allTags)
      } catch (err) {
        console.error('Failed to load tags:', err)
      }
    }
    loadTags()
  }, [])

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    setLoading(true)
    try {
      const profiles = await searchProfiles({
        query: query.trim() || undefined,
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      })
      setResults(profiles)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((prev) => {
      const newSelection = prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
      return newSelection
    })
  }

  useEffect(() => {
    if (selectedTagIds.length > 0 || query.trim()) {
      handleSearch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTagIds])

  return (
    <div className="w-full max-w-2xl mx-auto pb-20 md:pb-0">
      <div className="border-b p-3 md:p-4">
        <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">検索</h2>
        <form onSubmit={handleSearch} className="flex gap-2 mb-3 md:mb-4">
          <Input
            placeholder="ユーザーを検索..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm md:text-base"
          />
          <Button type="submit" disabled={loading} size="sm" className="md:size-default">
            <SearchIcon className="h-4 w-4" />
          </Button>
        </form>

        {tags.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs md:text-sm font-medium">タグで絞り込み</Label>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center space-x-1.5 md:space-x-2">
                  <Checkbox
                    id={`tag-${tag.id}`}
                    checked={selectedTagIds.includes(tag.id)}
                    onCheckedChange={() => handleTagToggle(tag.id)}
                  />
                  <Label
                    htmlFor={`tag-${tag.id}`}
                    className="text-xs md:text-sm font-normal cursor-pointer"
                  >
                    {tag.displayName}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        {results.length > 0 ? (
          results.map((profile) => (
            <Link
              key={profile.id}
              href={`/profile/${profile.username}`}
              className="block border-b p-3 md:p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2 md:gap-3">
                <Avatar className="h-10 w-10 md:h-12 md:w-12">
                  <AvatarFallback>{profile.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate text-sm md:text-base">{profile.name}</p>
                  <p className="text-xs md:text-sm text-muted-foreground truncate">
                    @{profile.username}
                  </p>
                  {profile.tags && profile.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {profile.tags.map((pt) => (
                        <TagBadge key={pt.tag.id} tag={pt.tag} />
                      ))}
                    </div>
                  )}
                  {profile.bio && (
                    <p className="text-xs md:text-sm mt-1 line-clamp-2">{profile.bio}</p>
                  )}
                </div>
              </div>
            </Link>
          ))
        ) : query && !loading ? (
          <div className="p-6 md:p-8 text-center text-muted-foreground text-sm md:text-base">
            ユーザーが見つかりませんでした
          </div>
        ) : (
          <div className="p-6 md:p-8 text-center text-muted-foreground text-sm md:text-base">
            ユーザーを検索してください
          </div>
        )}
      </div>
    </div>
  )
}
