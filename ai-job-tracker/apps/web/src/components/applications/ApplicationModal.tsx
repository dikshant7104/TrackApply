import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2 } from 'lucide-react'
import { ApplicationStatus } from '@ai-job-tracker/shared'
import { useCreateApplication, useUpdateApplication } from '../../hooks/useApi'
import { cn, STATUS_CONFIG } from '../../lib/utils'

const schema = z.object({
  company: z.string().min(1, 'Company is required').max(100),
  jobTitle: z.string().min(1, 'Job title is required').max(150),
  status: z.nativeEnum(ApplicationStatus).optional(),
  salary: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  jobUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  notes: z.string().max(5000).optional(),
  deadline: z.string().optional(),
  contactPerson: z.string().max(100).optional(),
  contactEmail: z.string().email('Invalid email').or(z.literal('')).optional(),
  appliedAt: z.string().optional(),
  interviewAt: z.string().optional(),
  jobDescription: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface ApplicationModalProps {
  open: boolean
  onClose: () => void
  application?: Partial<FormData & { id: string }> | null
}

export function ApplicationModal({ open, onClose, application }: ApplicationModalProps) {
  const isEdit = !!application?.id
  const { mutate: create, isPending: creating } = useCreateApplication()
  const { mutate: update, isPending: updating } = useUpdateApplication()
  const isPending = creating || updating

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: ApplicationStatus.SAVED,
      ...application,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        status: ApplicationStatus.SAVED,
        company: '',
        jobTitle: '',
        ...application,
      })
    }
  }, [open, application, reset])

  const onSubmit = (data: FormData) => {
    const payload = {
      ...data,
      jobUrl: data.jobUrl || undefined,
      contactEmail: data.contactEmail || undefined,
    }

    if (isEdit) {
      update(
        { id: application!.id!, data: payload },
        { onSuccess: onClose },
      )
    } else {
      create(payload, { onSuccess: onClose })
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-xl shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-border bg-card/95 backdrop-blur-sm z-10">
          <h2 className="text-base font-semibold text-foreground">
            {isEdit ? 'Edit Application' : 'Add Application'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
          {/* Company + Job Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Company *" error={errors.company?.message}>
              <input
                {...register('company')}
                className={inputCls(!!errors.company)}
                placeholder="e.g. Google"
                data-testid="company-input"
              />
            </Field>
            <Field label="Job Title *" error={errors.jobTitle?.message}>
              <input
                {...register('jobTitle')}
                className={inputCls(!!errors.jobTitle)}
                placeholder="e.g. Senior Engineer"
                data-testid="job-title-input"
              />
            </Field>
          </div>

          {/* Status */}
          <Field label="Status">
            <select {...register('status')} className={inputCls(false)} data-testid="status-select">
              {Object.values(ApplicationStatus).map((s) => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
          </Field>

          {/* Salary + Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Salary Range" error={errors.salary?.message}>
              <input
                {...register('salary')}
                className={inputCls(!!errors.salary)}
                placeholder="e.g. $120,000 – $150,000"
              />
            </Field>
            <Field label="Location" error={errors.location?.message}>
              <input
                {...register('location')}
                className={inputCls(!!errors.location)}
                placeholder="e.g. New York / Remote"
              />
            </Field>
          </div>

          {/* Job URL */}
          <Field label="Job URL" error={errors.jobUrl?.message}>
            <input
              {...register('jobUrl')}
              className={inputCls(!!errors.jobUrl)}
              placeholder="https://..."
              type="url"
            />
          </Field>

          {/* Applied / Interview dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Applied Date">
              <input {...register('appliedAt')} type="date" className={inputCls(false)} />
            </Field>
            <Field label="Interview Date">
              <input {...register('interviewAt')} type="date" className={inputCls(false)} />
            </Field>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Contact Person" error={errors.contactPerson?.message}>
              <input
                {...register('contactPerson')}
                className={inputCls(!!errors.contactPerson)}
                placeholder="Jane Smith"
              />
            </Field>
            <Field label="Contact Email" error={errors.contactEmail?.message}>
              <input
                {...register('contactEmail')}
                className={inputCls(!!errors.contactEmail)}
                placeholder="jane@company.com"
                type="email"
              />
            </Field>
          </div>

          {/* Job Description */}
          <Field label="Job Description">
            <textarea
              {...register('jobDescription')}
              className={cn(inputCls(false), 'resize-none h-24')}
              placeholder="Paste the job description here for AI features..."
            />
          </Field>

          {/* Notes */}
          <Field label="Notes" error={errors.notes?.message}>
            <textarea
              {...register('notes')}
              className={cn(inputCls(!!errors.notes), 'resize-none h-20')}
              placeholder="Any personal notes..."
            />
          </Field>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              data-testid="submit-application"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Add Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}

function inputCls(hasError: boolean) {
  return cn(
    'w-full px-3 py-2 text-sm bg-background border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring transition-colors',
    hasError ? 'border-destructive' : 'border-border',
  )
}
