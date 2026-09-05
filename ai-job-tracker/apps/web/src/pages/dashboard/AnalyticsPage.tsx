import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { useAnalyticsDashboard } from '../../hooks/useApi'
import { StatCard } from '../../components/ui/StatCard'
import { APPLICATION_STATUS_COLORS, ApplicationStatus } from '@ai-job-tracker/shared'
import { TrendingUp, Award, BriefcaseBusiness, XCircle, BarChart3 } from 'lucide-react'
import { STATUS_CONFIG } from '../../lib/utils'

export function AnalyticsPage() {
  const { data: analytics, isLoading } = useAnalyticsDashboard()
  const byStatus = analytics?.byStatus ?? {}

  const statusData = Object.entries(byStatus).map(([status, count]) => ({
    name: STATUS_CONFIG[status as ApplicationStatus]?.label ?? status,
    count: count as number,
    color: APPLICATION_STATUS_COLORS[status as ApplicationStatus],
  }))

  const pieData = statusData.filter((d) => d.count > 0)

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground text-sm">Loading analytics…</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your job search performance</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Applications" value={analytics?.total ?? 0} icon={BriefcaseBusiness} />
        <StatCard
          title="Interview Rate"
          value={`${analytics?.interviewConversionRate ?? 0}%`}
          icon={TrendingUp}
          iconColor="text-violet-400"
          iconBg="bg-violet-400/10"
        />
        <StatCard
          title="Offer Rate"
          value={`${analytics?.offerRate ?? 0}%`}
          icon={Award}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-400/10"
        />
        <StatCard
          title="Rejection Rate"
          value={`${analytics?.rejectionRate ?? 0}%`}
          icon={XCircle}
          iconColor="text-red-400"
          iconBg="bg-red-400/10"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar chart by status */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium text-foreground mb-4">Applications by Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusData} margin={{ top: 2, right: 2, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="name"
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
                  fontSize: 12,
                }}
                cursor={{ fill: 'hsl(224 20% 14%)' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium text-foreground mb-4">Status Distribution</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  outerRadius={80}
                  innerRadius={48}
                  paddingAngle={3}
                  dataKey="count"
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
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, color: 'hsl(215 16% 55%)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-52 text-sm text-muted-foreground">
              No application data yet
            </div>
          )}
        </div>
      </div>

      {/* Weekly trend */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-medium text-foreground">Weekly Application Trend</h2>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart
            data={analytics?.weeklyTrend ?? []}
            margin={{ top: 2, right: 2, left: -20, bottom: 0 }}
          >
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
                fontSize: 12,
              }}
              cursor={{ fill: 'hsl(224 20% 14%)' }}
            />
            <Bar dataKey="count" fill="hsl(221 83% 60%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
