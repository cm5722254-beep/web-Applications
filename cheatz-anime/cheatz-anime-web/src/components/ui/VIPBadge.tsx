import { Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VIPBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  variant?: 'default' | 'premium' | 'exclusive'
}

export function VIPBadge({ size = 'md', className, variant = 'default' }: VIPBadgeProps) {
  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5 gap-0.5',
    md: 'text-[10px] px-2 py-1 gap-1',
    lg: 'text-xs px-2.5 py-1 gap-1',
  }

  const iconSizes = {
    sm: 8,
    md: 10,
    lg: 12,
  }

  const variantClasses = {
    default: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black',
    premium: 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-black animate-pulse',
    exclusive: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center font-extrabold uppercase tracking-wider rounded-lg shadow-lg',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      <Crown size={iconSizes[size]} className="fill-current" />
      <span>VIP</span>
    </div>
  )
}
