import { useRef } from 'react'
import { Upload, FileText, Star, Trash2, Loader2 } from 'lucide-react'
import { useResumes, useUploadResume, useDeleteResume, useSetDefaultResume } from '../../hooks/useApi'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatDate } from '../../lib/utils'

export function ResumesPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const { data: resumes = [], isLoading } = useResumes()
  const { mutate: upload, isPending: uploading } = useUploadResume()
  const { mutate: deleteResume } = useDeleteResume()
  const { mutate: setDefault } = useSetDefaultResume()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) upload(file)
    e.target.value = ''
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Resumes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your resume files for AI features
          </p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          data-testid="upload-resume-btn"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          Upload Resume
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Upload zone */}
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
      >
        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-medium text-foreground">Drop your resume here</p>
        <p className="text-xs text-muted-foreground mt-1">PDF or Word — max 5MB</p>
      </div>

      {/* Resume list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : resumes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No resumes uploaded"
          description="Upload your resume to enable AI match scoring and cover letter generation."
        />
      ) : (
        <div className="space-y-3">
          {resumes.map((resume: Record<string, unknown>) => (
            <div
              key={resume.id as string}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-border/80 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">
                    {resume.originalName as string}
                  </p>
                  {resume.isDefault && (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-400/10 text-amber-400 rounded-full">
                      <Star className="w-3 h-3 fill-current" />
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {((resume.size as number) / 1024).toFixed(0)} KB · Uploaded {formatDate(resume.createdAt as string)}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!resume.isDefault && (
                  <button
                    onClick={() => setDefault(resume.id as string)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                    title="Set as default"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm('Delete this resume?')) deleteResume(resume.id as string)
                  }}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Delete resume"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
