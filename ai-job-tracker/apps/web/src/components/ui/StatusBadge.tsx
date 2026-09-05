import { ApplicationStatus } from '@ai-job-tracker/shared'
import { cn, STATUS_CONFIG } from '../../lib/utils'

interface StatusBadgeProps {
  status: ApplicationStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.bg,
        config.color,
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}
