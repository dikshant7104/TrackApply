import { cn } from '../../lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  trend?: { value: number; label: string }
  className?: string
  delay?: number
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
  trend,
  className,
  delay = 0,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-5 animate-fade-in',
        className,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-semibold text-foreground mt-1 tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend !== undefined && (
            <p className={cn('text-xs mt-1', trend.value >= 0 ? 'text-emerald-400' : 'text-red-400')}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn('flex-shrink-0 p-2.5 rounded-lg', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
      </div>
    </div>
  )
}
