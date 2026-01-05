'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { searchProfiles } from '@/lib/actions/profile'
import { Search as SearchIcon } from 'lucide-react'
import type { Profile } from '@prisma/client'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const profiles = await searchProfiles(query)
      setResults(profiles)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="border-b p-4">
        <h2 className="text-xl font-bold mb-4">検索</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="ユーザーを検索..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            <SearchIcon className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <div>
        {results.length > 0 ? (
          results.map((profile) => (
            <Link
              key={profile.id}
              href={`/profile/${profile.username}`}
              className="block border-b p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{profile.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{profile.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    @{profile.username}
                  </p>
                  {profile.bio && (
                    <p className="text-sm mt-1 line-clamp-2">{profile.bio}</p>
                  )}
                </div>
              </div>
            </Link>
          ))
        ) : query && !loading ? (
          <div className="p-8 text-center text-muted-foreground">
            ユーザーが見つかりませんでした
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            ユーザーを検索してください
          </div>
        )}
      </div>
    </div>
  )
}
