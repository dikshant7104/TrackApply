import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, Sparkles } from 'lucide-react'
import { useRegister } from '../../hooks/useApi'
import { cn } from '../../lib/utils'

const schema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
      message: 'Must include uppercase, lowercase, number and special character',
    }),
})

type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const navigate = useNavigate()
  const { mutate: register_, isPending } = useRegister()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = (data: FormData) => {
    register_(data, { onSuccess: () => navigate('/dashboard') })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
      <div className="relative w-full max-w-sm animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Create account</h1>
          <p className="text-sm text-muted-foreground mt-1">Start tracking your job search</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  First Name
                </label>
                <input
                  {...register('firstName')}
                  data-testid="firstname-input"
                  className={cn(
                    'w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring',
                    errors.firstName ? 'border-destructive' : 'border-border',
                  )}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Last Name
                </label>
                <input
                  {...register('lastName')}
                  data-testid="lastname-input"
                  className={cn(
                    'w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring',
                    errors.lastName ? 'border-destructive' : 'border-border',
                  )}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
              <input
                {...register('email')}
                type="email"
                data-testid="email-input"
                className={cn(
                  'w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring',
                  errors.email ? 'border-destructive' : 'border-border',
                )}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                data-testid="password-input"
                className={cn(
                  'w-full px-3 py-2 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring',
                  errors.password ? 'border-destructive' : 'border-border',
                )}
                placeholder="Min 8 chars with uppercase, number & symbol"
              />
              {errors.password && (
                <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              data-testid="register-submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors mt-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Account
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
