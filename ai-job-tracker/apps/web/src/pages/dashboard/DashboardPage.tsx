import {
  BriefcaseBusiness,
  TrendingUp,
  Award,
  XCircle,
  Calendar,
  Sparkles,
  Plus,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import { useAnalyticsDashboard } from '../../hooks/useApi'
import { useAuthStore } from '../../stores/auth.store'
import { StatCard } from '../../components/ui/StatCard'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { APPLICATION_STATUS_COLORS, ApplicationStatus } from '@ai-job-tracker/shared'
import { formatDate, STATUS_CONFIG } from '../../lib/utils'

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const { data: analytics, isLoading } = useAnalyticsDashboard()

  const byStatus = analytics?.byStatus ?? {}
  const weeklyTrend = analytics?.weeklyTrend ?? []
  const upcomingInterviews = analytics?.upcomingInterviews ?? []

  const pieData = Object.entries(byStatus)
    .filter(([, v]) => (v as number) > 0)
    .map(([status, count]) => ({
      name: STATUS_CONFIG[status as ApplicationStatus]?.label ?? status,
      value: count as number,
      color: APPLICATION_STATUS_COLORS[status as ApplicationStatus],
    }))

  const hourOfDay = new Date().getHours()
  const greeting =
    hourOfDay < 12 ? 'Good morning' : hourOfDay < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-6 space-y-6">
      {/* Welcome banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {greeting}, {user?.firstName} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here's your job search overview
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/applications')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Application
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Applications"
          value={analytics?.total ?? '—'}
          icon={BriefcaseBusiness}
          delay={0}
        />
        <StatCard
          title="Interview Rate"
          value={`${analytics?.interviewConversionRate ?? 0}%`}
          subtitle="of applied positions"
          icon={TrendingUp}
          iconColor="text-violet-400"
          iconBg="bg-violet-400/10"
          delay={50}
        />
        <StatCard
          title="Offer Rate"
          value={`${analytics?.offerRate ?? 0}%`}
          subtitle="overall success rate"
          icon={Award}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-400/10"
          delay={100}
        />
        <StatCard
          title="Rejections"
          value={byStatus[ApplicationStatus.REJECTED] ?? 0}
          icon={XCircle}
          iconColor="text-red-400"
          iconBg="bg-red-400/10"
          delay={150}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly trend chart */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 animate-fade-in animate-fade-in-delay-2">
          <h2 className="text-sm font-medium text-foreground mb-4">Weekly Applications</h2>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyTrend} margin={{ top: 2, right: 2, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(221 83% 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(221 83% 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="week"
                tick={{ fill: 'hsl(215 16% 55%)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'hsl(215 16% 55%)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'hsl(224 20% 10%)',
                  border: '1px solid hsl(224 20% 16%)',
                  borderRadius: '8px',
                  color: 'hsl(213 31% 91%)',
                  fontSize: 12,
                }}
                cursor={{ stroke: 'hsl(224 20% 20%)', strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="hsl(221 83% 60%)"
                strokeWidth={2}
                fill="url(#areaGrad)"
                dot={false}
                activeDot={{ r: 4, fill: 'hsl(221 83% 60%)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status donut */}
        <div className="rounded-xl border border-border bg-card p-5 animate-fade-in animate-fade-in-delay-3">
          <h2 className="text-sm font-medium text-foreground mb-4">By Status</h2>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(224 20% 10%)',
                      border: '1px solid hsl(224 20% 16%)',
                      borderRadius: '8px',
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {pieData.slice(0, 4).map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="font-medium text-foreground">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
              No data yet
            </div>
          )}
        </div>
      </div>

      {/* Upcoming interviews + AI prompt */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming interviews */}
        <div className="rounded-xl border border-border bg-card p-5 animate-fade-in animate-fade-in-delay-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-medium text-foreground">Upcoming Interviews</h2>
          </div>
          {upcomingInterviews.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No upcoming interviews scheduled
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingInterviews.map((app: Record<string, unknown>) => (
                <div
                  key={app.id as string}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                >
                  <div className="w-8 h-8 rounded-lg bg-violet-400/10 flex items-center justify-center text-xs font-semibold text-violet-400 flex-shrink-0">
                    {(app.company as string)?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{app.company as string}</p>
                    <p className="text-xs text-muted-foreground truncate">{app.jobTitle as string}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-medium text-violet-400">
                      {formatDate(app.interviewAt as string)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI tools prompt */}
        <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 to-primary/10 p-5 animate-fade-in animate-fade-in-delay-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-medium text-foreground">AI Tools</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Supercharge your applications with AI-powered tools
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Cover Letter', desc: 'Tailored to each role' },
              { label: 'Match Score', desc: 'Resume vs. JD analysis' },
              { label: 'Interview Prep', desc: 'Predicted questions' },
              { label: 'Job Summary', desc: 'Instant JD insights' },
            ].map((tool) => (
              <button
                key={tool.label}
                onClick={() => navigate('/dashboard/applications')}
                className="text-left p-3 rounded-lg bg-background/60 hover:bg-background/90 border border-border/60 transition-colors"
              >
                <p className="text-xs font-medium text-foreground">{tool.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{tool.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
