import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Loader2, Sparkles, ArrowLeft, Mail } from 'lucide-react'
import { useState } from 'react'
import { useForgotPassword } from '../../hooks/useApi'
import { cn } from '../../lib/utils'

const schema = z.object({ email: z.string().email('Enter a valid email') })
type FormData = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const { mutate: forgotPassword, isPending } = useForgotPassword()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    forgotPassword(data, { onSuccess: () => setSent(true) })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Reset password</h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            We'll send you a link to reset your password
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
          {sent ? (
            <div className="text-center py-4">
              <Mail className="w-10 h-10 text-primary mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">Check your email</p>
              <p className="text-xs text-muted-foreground mt-1">
                We've sent a reset link if that email is registered.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
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
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Send Reset Link
              </button>
            </form>
          )}
        </div>

        <Link
          to="/login"
          className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mt-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
