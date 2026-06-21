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

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('active', true)
    .order('name')

  let q = supabase
    .from('log_entries')
    .select('*, project:projects(*), profile:profiles(email,full_name)')
    .gte('entry_date', start)
    .lte('entry_date', end)
    .order('entry_date', { ascending: true })

  if (projectFilter) q = q.eq('project_id', projectFilter)

  const { data: entries } = await q
  const typedEntries = (entries ?? []) as unknown as LogEntry[]

  const totalPoints = typedEntries.reduce((s, e) => s + e.points, 0)
  const totalManHours = typedEntries.reduce((s, e) => s + e.man_hours, 0)
  const avgPPMPH = totalManHours > 0 ? totalPoints / totalManHours : 0
  const totalMen = typedEntries.reduce((s, e) => s + e.men, 0)
  const days = typedEntries.length
  const pointsPerManDay = days > 0 && totalMen > 0 ? totalPoints / totalMen : 0

  const selectedProject = projects?.find(p => p.id === projectFilter)
  const target = selectedProject?.target_ppmph ?? 0.65

  const chartData = typedEntries.map(e => ({
    date: e.entry_date,
    ppmph: Number(e.ppmph?.toFixed(3) ?? 0),
    points: e.points,
    target,
  }))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pt-1">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Overview</p>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>
      </div>

      <DashboardFilters
        projects={projects ?? []}
        currentProject={projectFilter}
        currentStart={start}
        currentEnd={end}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KPICard
          label="Avg PPMPH"
          value={formatPPMPH(avgPPMPH)}
          sub={`Target ${target}`}
          valueClass={days > 0 ? ppmphColor(avgPPMPH, target) : ''}
        />
        <KPICard label="Total Points" value={totalPoints.toLocaleString()} />
        <KPICard label="Man-Hours" value={totalManHours.toLocaleString()} />
        <KPICard label="Pts / Man-Day" value={formatPPMPH(pointsPerManDay)} />
      </div>

      {typedEntries.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">PPMPH Over Time</p>
            <PPMPHChart data={chartData} target={target} />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Points Per Day</p>
            <PointsBarChart data={chartData} />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-sm">No entries in this date range.</p>
        </div>
      )}
    </div>
  )
}
