import { createClient } from '@/lib/supabase/server'
import { KPICard } from '@/components/KPICard'
import { PPMPHChart } from '@/components/PPMPHChart'
import { PointsBarChart } from '@/components/PointsBarChart'
import { DashboardFilters } from '@/components/DashboardFilters'
import { getCurrentWeekRange, formatPPMPH, ppmphColor } from '@/lib/utils'
import type { LogEntry, Project } from '@/lib/types'

interface Props {
  searchParams: { project?: string; start?: string; end?: string }
}

export default async function DashboardPage({ searchParams }: Props) {
  const supabase = createClient()
  const weekRange = getCurrentWeekRange()

  const start = searchParams.start ?? weekRange.start
  const end = searchParams.end ?? weekRange.end
  const projectFilter = searchParams.project

  // Fetch projects for filter dropdown
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('active', true)
    .order('name')

  // Build entries query
  let q = supabase
    .from('log_entries')
    .select('*, project:projects(*), profile:profiles(email,full_name)')
    .gte('entry_date', start)
    .lte('entry_date', end)
    .order('entry_date', { ascending: true })

  if (projectFilter) q = q.eq('project_id', projectFilter)

  const { data: entries } = await q
  const typedEntries = (entries ?? []) as unknown as LogEntry[]

  // KPIs
  const totalPoints = typedEntries.reduce((s, e) => s + e.points, 0)
  const totalManHours = typedEntries.reduce((s, e) => s + e.man_hours, 0)
  const avgPPMPH = totalManHours > 0 ? totalPoints / totalManHours : 0
  const totalMen = typedEntries.reduce((s, e) => s + e.men, 0)
  const days = typedEntries.length
  const pointsPerManDay = days > 0 && totalMen > 0 ? totalPoints / totalMen : 0

  const selectedProject = projects?.find(p => p.id === projectFilter)
  const target = selectedProject?.target_ppmph ?? 0.65

  // Chart data
  const chartData = typedEntries.map(e => ({
    date: e.entry_date,
    ppmph: Number(e.ppmph?.toFixed(3) ?? 0),
    points: e.points,
    target,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <DashboardFilters
        projects={projects ?? []}
        currentProject={projectFilter}
        currentStart={start}
        currentEnd={end}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KPICard
          label="Avg PPMPH"
          value={formatPPMPH(avgPPMPH)}
          sub={`Target ${target}`}
          valueClass={days > 0 ? ppmphColor(avgPPMPH, target) : ''}
        />
        <KPICard label="Total Points" value={totalPoints.toLocaleString()} />
        <KPICard label="Man-Hours" value={totalManHours.toLocaleString()} />
        <KPICard label="Pts/Man-Day" value={formatPPMPH(pointsPerManDay)} />
      </div>

      {/* Charts */}
      {typedEntries.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">PPMPH Over Time</h2>
            <PPMPHChart data={chartData} target={target} />
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Points Per Day</h2>
            <PointsBarChart data={chartData} />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400">
          No entries in this date range.
        </div>
      )}
    </div>
  )
}
