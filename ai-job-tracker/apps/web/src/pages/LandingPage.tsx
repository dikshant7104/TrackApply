import { Link } from 'react-router-dom'
import {
  Sparkles,
  BriefcaseBusiness,
  BarChart3,
  FileText,
  Zap,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'

const features = [
  {
    icon: BriefcaseBusiness,
    title: 'Track Every Application',
    desc: 'Organize all your applications in one place with statuses, deadlines, and contacts.',
  },
  {
    icon: Sparkles,
    title: 'AI Cover Letters',
    desc: 'Generate tailored cover letters in seconds, matched to each specific job description.',
  },
  {
    icon: Zap,
    title: 'Resume Match Score',
    desc: "See how well your resume matches each job and exactly which skills you're missing.",
  },
  {
    icon: FileText,
    title: 'Interview Prep',
    desc: 'Get AI-predicted interview questions for every role you apply to.',
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    desc: 'Track your conversion rates, weekly trends, and overall job search performance.',
  },
]

const stats = [
  { value: '10x', label: 'Faster cover letters' },
  { value: '3×', label: 'Better match rates' },
  { value: '100%', label: 'Free to start' },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="font-semibold text-foreground tracking-tight">TrackApply</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
          <Sparkles className="w-3 h-3" />
          AI-powered job application tracking
        </div>

        <h1 className="relative text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 text-foreground">
          Land your dream job{' '}
          <span className="gradient-text">faster</span>
        </h1>

        <p className="relative text-lg text-muted-foreground max-w-xl mx-auto mb-8">
          Track every application, generate AI cover letters, calculate resume match scores,
          and prep for interviews — all in one place.
        </p>

        <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/register"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            Start for free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 text-sm font-medium text-muted-foreground border border-border rounded-xl hover:text-foreground hover:border-border/80 transition-colors"
          >
            View demo →
          </Link>
        </div>

        {/* Stats */}
        <div className="relative flex items-center justify-center gap-8 mt-14 pt-8 border-t border-border">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-semibold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-semibold text-center text-foreground mb-10">
          Everything you need to succeed
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="p-5 rounded-xl border border-border bg-card hover:border-border/80 transition-colors"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <f.icon className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="rounded-2xl bg-card border border-border p-10 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-3">
            Ready to organize your job search?
          </h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Join thousands of job seekers who use TrackApply to land offers faster.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Get started free
            </Link>
          </div>
          <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground">
            {['No credit card required', 'Free forever plan', 'Cancel anytime'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} TrackApply. Built with React, NestJS & OpenAI.
      </footer>
    </div>
  )
}
