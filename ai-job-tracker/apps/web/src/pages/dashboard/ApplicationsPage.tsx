import { useState } from 'react'
import {
  Plus,
  Search,
  Filter,
  ExternalLink,
  Pencil,
  Trash2,
  Loader2,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useApplications, useDeleteApplication } from '../../hooks/useApi'
import { ApplicationModal } from '../../components/applications/ApplicationModal'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { EmptyState } from '../../components/ui/EmptyState'
import { ApplicationStatus } from '@ai-job-tracker/shared'
import { formatRelativeDate, STATUS_CONFIG, cn } from '../../lib/utils'

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  ...Object.values(ApplicationStatus).map((s) => ({
    value: s,
    label: STATUS_CONFIG[s].label,
  })),
]

export function ApplicationsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editApp, setEditApp] = useState<Record<string, unknown> | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ApplicationStatus | ''>('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useApplications({
    page,
    limit: 15,
    search: search || undefined,
    status: status || undefined,
  })

  const { mutate: deleteApp } = useDeleteApplication()

  const applications = data?.data ?? []
  const meta = data?.meta

  const handleEdit = (app: Record<string, unknown>) => {
    setEditApp(app)
    setModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this application?')) {
      deleteApp(id)
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditApp(null)
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Applications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {meta?.total ?? 0} total applications
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          data-testid="add-application-btn"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Application
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search companies or roles..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            data-testid="search-input"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setStatus(f.value as ApplicationStatus | ''); setPage(1) }}
              data-testid={`filter-${f.value || 'all'}`}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors',
                status === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={BriefcaseBusiness}
          title="No applications yet"
          description="Start tracking your job search by adding your first application."
          action={
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add your first application
            </button>
          }
        />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Company</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden xl:table-cell">Added</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {applications.map((app: Record<string, unknown>, i: number) => (
                  <tr
                    key={app.id as string}
                    className="hover:bg-muted/30 transition-colors group animate-fade-in"
                    style={{ animationDelay: `${i * 30}ms` }}
                    data-testid="application-row"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-semibold text-foreground flex-shrink-0">
                          {(app.company as string)?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{app.company as string}</p>
                          <p className="text-xs text-muted-foreground md:hidden">{app.jobTitle as string}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground hidden md:table-cell">
                      {app.jobTitle as string}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status as ApplicationStatus} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      {(app.location as string) || '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden xl:table-cell">
                      {formatRelativeDate(app.createdAt as string)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        {app.jobUrl && (
                          <a
                            href={app.jobUrl as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => handleEdit(app)}
                          data-testid="edit-application-btn"
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(app.id as string)}
                          data-testid="delete-application-btn"
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Page {meta.page} of {meta.totalPages} · {meta.total} total
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= meta.totalPages}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <ApplicationModal
        open={modalOpen}
        onClose={handleCloseModal}
        application={editApp}
      />
    </div>
  )
}
