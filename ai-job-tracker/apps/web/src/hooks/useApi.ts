import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '../lib/api'
import { useAuthStore } from '../stores/auth.store'
import { getErrorMessage } from '../lib/utils'
import type { ApplicationStatus } from '@ai-job-tracker/shared'

// ─── AUTH ────────────────────────────────────────────────────────────────────

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post('/auth/login', data).then((r) => r.data.data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken)
      toast.success('Welcome back!')
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: (data: {
      email: string
      password: string
      firstName: string
      lastName: string
    }) => api.post('/auth/register', data).then((r) => r.data.data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken)
      toast.success('Account created!')
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export function useLogout() {
  const { logout, refreshToken } = useAuthStore()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      api.post('/auth/logout', { refreshToken }).then((r) => r.data),
    onSettled: () => {
      logout()
      qc.clear()
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: { email: string }) =>
      api.post('/auth/forgot-password', data).then((r) => r.data.data),
    onSuccess: () => toast.success('Reset link sent — check your email'),
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: { token: string; password: string }) =>
      api.post('/auth/reset-password', data).then((r) => r.data.data),
    onSuccess: () => toast.success('Password reset successfully'),
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

// ─── USER PROFILE ────────────────────────────────────────────────────────────

export function useProfile() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/users/profile').then((r) => r.data.data),
    enabled: isAuthenticated,
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  const updateUser = useAuthStore((s) => s.updateUser)
  return useMutation({
    mutationFn: (data: { firstName?: string; lastName?: string; email?: string }) =>
      api.put('/users/profile', data).then((r) => r.data.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['profile'] })
      updateUser(data)
      toast.success('Profile updated')
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      api.put('/users/change-password', data).then((r) => r.data.data),
    onSuccess: () => toast.success('Password changed'),
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

// ─── APPLICATIONS ─────────────────────────────────────────────────────────────

export interface ApplicationQuery {
  page?: number
  limit?: number
  status?: ApplicationStatus
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export function useApplications(query: ApplicationQuery = {}) {
  return useQuery({
    queryKey: ['applications', query],
    queryFn: () =>
      api.get('/applications', { params: query }).then((r) => r.data.data),
    placeholderData: keepPreviousData,
  })
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: ['applications', id],
    queryFn: () => api.get(`/applications/${id}`).then((r) => r.data.data),
    enabled: !!id,
  })
}

export function useCreateApplication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post('/applications', data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] })
      qc.invalidateQueries({ queryKey: ['analytics'] })
      toast.success('Application added')
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export function useUpdateApplication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.put(`/applications/${id}`, data).then((r) => r.data.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['applications'] })
      qc.invalidateQueries({ queryKey: ['applications', id] })
      qc.invalidateQueries({ queryKey: ['analytics'] })
      toast.success('Application updated')
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export function useDeleteApplication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/applications/${id}`).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] })
      qc.invalidateQueries({ queryKey: ['analytics'] })
      toast.success('Application deleted')
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

// ─── ANALYTICS ───────────────────────────────────────────────────────────────

export function useAnalyticsDashboard() {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => api.get('/analytics/dashboard').then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
  })
}

// ─── RESUMES ─────────────────────────────────────────────────────────────────

export function useResumes() {
  return useQuery({
    queryKey: ['resumes'],
    queryFn: () => api.get('/resumes').then((r) => r.data.data),
  })
}

export function useUploadResume() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return api.post('/resumes/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((r) => r.data.data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resumes'] })
      toast.success('Resume uploaded')
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export function useDeleteResume() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/resumes/${id}`).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resumes'] })
      toast.success('Resume deleted')
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export function useSetDefaultResume() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.put(`/resumes/${id}/default`).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resumes'] })
      toast.success('Default resume updated')
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

// ─── AI ───────────────────────────────────────────────────────────────────────

export function useGenerateCoverLetter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      applicationId,
      additionalContext,
    }: {
      applicationId: string
      additionalContext?: string
    }) =>
      api
        .post(`/ai/applications/${applicationId}/cover-letter`, { additionalContext })
        .then((r) => r.data.data),
    onSuccess: (_, { applicationId }) => {
      qc.invalidateQueries({ queryKey: ['applications', applicationId] })
      toast.success('Cover letter generated!')
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export function useMatchScore() {
  return useMutation({
    mutationFn: ({
      applicationId,
      resumeId,
    }: {
      applicationId: string
      resumeId: string
    }) =>
      api
        .post(`/ai/applications/${applicationId}/match-score`, { resumeId })
        .then((r) => r.data.data),
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export function useGenerateInterviewQuestions() {
  return useMutation({
    mutationFn: ({
      applicationId,
      questionCount = 10,
    }: {
      applicationId: string
      questionCount?: number
    }) =>
      api
        .post(`/ai/applications/${applicationId}/interview-questions`, { questionCount })
        .then((r) => r.data.data),
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

export function useSummarizeJob() {
  return useMutation({
    mutationFn: (jobDescription: string) =>
      api.post('/ai/summarize-job', { jobDescription }).then((r) => r.data.data),
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}
