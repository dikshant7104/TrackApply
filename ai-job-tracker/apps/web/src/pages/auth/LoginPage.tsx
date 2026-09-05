import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, Sparkles, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useLogin } from '../../hooks/useApi'
import { cn } from '../../lib/utils'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormData = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const { mutate: login, isPending } = useLogin()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = (data: FormData) => {
    login(data, { onSuccess: () => navigate('/dashboard') })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background subtle grid */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-muted-foreground">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  data-testid="password-input"
                  className={cn(
                    'w-full px-3 py-2 pr-10 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring',
                    errors.password ? 'border-destructive' : 'border-border',
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              data-testid="login-submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors mt-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign In
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-4 p-3 rounded-lg bg-muted/40 border border-border/60">
            <p className="text-xs text-muted-foreground text-center mb-1">Demo account</p>
            <p className="text-xs text-center text-foreground font-mono">
              demo@example.com / Demo123!
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  )
}
