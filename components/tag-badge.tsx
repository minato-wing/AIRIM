interface TagBadgeProps {
  tag: {
    id: string
    name: string
    displayName: string
  }
  size?: 'sm' | 'md'
}

export function TagBadge({ tag, size = 'sm' }: TagBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  return (
    <span
      className={`inline-block rounded-full bg-primary/10 text-primary ${sizeClasses[size]}`}
    >
      {tag.displayName}
    </span>
  )
}
