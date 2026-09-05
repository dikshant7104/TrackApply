import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, UserCircle, Lock, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useProfile, useUpdateProfile, useChangePassword } from '../../hooks/useApi'
import { useAuthStore } from '../../stores/auth.store'
import api from '../../lib/api'
import { toast } from 'sonner'
import { cn } from '../../lib/utils'

const profileSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z
      .string()
      .min(8)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

const inputCls = (err: boolean) =>
  cn(
    'w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring',
    err ? 'border-destructive' : 'border-border',
  )

export function ProfilePage() {
  const { data: profile } = useProfile()
  const { mutate: updateProfile, isPending: updatingProfile } = useUpdateProfile()
  const { mutate: changePassword, isPending: changingPw } = useChangePassword()
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: profile
      ? { firstName: profile.firstName, lastName: profile.lastName, email: profile.email }
      : undefined,
  })

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        'This will permanently delete your account and all data. This cannot be undone. Continue?',
      )
    )
      return

    try {
      await api.delete('/users/account')
      logout()
      navigate('/')
      toast.success('Account deleted')
    } catch {
      toast.error('Failed to delete account')
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account settings</p>
      </div>

      {/* Profile section */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3 mb-5">
          <UserCircle className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-foreground">Personal Information</h2>
        </div>
        <form
          onSubmit={profileForm.handleSubmit((d) => updateProfile(d))}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                First Name
              </label>
              <input
                {...profileForm.register('firstName')}
                className={inputCls(!!profileForm.formState.errors.firstName)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Last Name
              </label>
              <input
                {...profileForm.register('lastName')}
                className={inputCls(!!profileForm.formState.errors.lastName)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Email
            </label>
            <input
              {...profileForm.register('email')}
              type="email"
              className={inputCls(!!profileForm.formState.errors.email)}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updatingProfile}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {updatingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Password section */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3 mb-5">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-foreground">Change Password</h2>
        </div>
        <form
          onSubmit={passwordForm.handleSubmit((d) =>
            changePassword(d, { onSuccess: () => passwordForm.reset() }),
          )}
          className="space-y-4"
        >
          {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((field) => (
            <div key={field}>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                {field === 'currentPassword'
                  ? 'Current Password'
                  : field === 'newPassword'
                  ? 'New Password'
                  : 'Confirm Password'}
              </label>
              <input
                {...passwordForm.register(field)}
                type="password"
                className={inputCls(!!passwordForm.formState.errors[field])}
              />
              {passwordForm.formState.errors[field] && (
                <p className="text-xs text-destructive mt-1">
                  {passwordForm.formState.errors[field]?.message}
                </p>
              )}
            </div>
          ))}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={changingPw}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {changingPw && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <div className="flex items-center gap-3 mb-3">
          <Trash2 className="w-4 h-4 text-destructive" />
          <h2 className="text-sm font-medium text-foreground">Danger Zone</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive text-sm font-medium rounded-lg hover:bg-destructive/20 transition-colors border border-destructive/30"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Account
        </button>
      </div>
    </div>
  )
}
