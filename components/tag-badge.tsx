import type { Tag } from '@prisma/client'

interface TagBadgeProps {
  tag: Tag
  size?: 'sm' | 'md'
}

export function TagBadge({ tag, size = 'sm' }: TagBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  const colorClasses = {
    LIVER: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    LISTENER: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  }

  const colorClass = colorClasses[tag.name as keyof typeof colorClasses] || 'bg-primary/10 text-primary'

  return (
    <span
      className={`inline-block rounded-full ${colorClass} ${sizeClasses[size]}`}
    >
      {tag.displayName}
    </span>
  )
}
