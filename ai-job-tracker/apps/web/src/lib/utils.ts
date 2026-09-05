import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ApplicationStatus } from '@ai-job-tracker/shared'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  [ApplicationStatus.SAVED]: {
    label: 'Saved',
    color: 'text-slate-400',
    bg: 'bg-slate-400/10',
    dot: 'bg-slate-400',
  },
  [ApplicationStatus.APPLIED]: {
    label: 'Applied',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    dot: 'bg-blue-400',
  },
  [ApplicationStatus.INTERVIEW]: {
    label: 'Interview',
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
    dot: 'bg-violet-400',
  },
  [ApplicationStatus.TECHNICAL_TEST]: {
    label: 'Tech Test',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    dot: 'bg-amber-400',
  },
  [ApplicationStatus.OFFER]: {
    label: 'Offer',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    dot: 'bg-emerald-400',
  },
  [ApplicationStatus.REJECTED]: {
    label: 'Rejected',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    dot: 'bg-red-400',
  },
}

export function formatDate(date: string | Date | undefined): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeDate(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
  return `${Math.floor(diffDays / 365)}y ago`
}

export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response: { data: { message: string | string[] } } }).response
    const message = response?.data?.message
    if (Array.isArray(message)) return message[0]
    if (typeof message === 'string') return message
  }
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred'
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}
