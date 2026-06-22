import type { LogEntry, ProjectRollup, WeekRollup } from './types'

export function formatPPMPH(v: number | null | undefined): string {
  if (v == null || isNaN(v)) return '—'
  return v.toFixed(3)
}

export function formatDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export function getISOWeek(date: string): string {
  const d = new Date(date + 'T00:00:00')
  const jan4 = new Date(d.getFullYear(), 0, 4)
  const startOfWeek1 = new Date(jan4)
  startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7))
  const diff = d.getTime() - startOfWeek1.getTime()
  const week = Math.floor(diff / (7 * 86400000)) + 1
  const year = week < 1 ? d.getFullYear() - 1 : d.getFullYear()
  return `${year}-W${String(week < 1 ? 52 : week).padStart(2, '0')}`
}

export function groupByProjectAndWeek(entries: LogEntry[]): ProjectRollup[] {
  const map = new Map<string, ProjectRollup>()

  for (const e of entries) {
    const key = e.project_id
    if (!map.has(key)) {
      map.set(key, {
        project_id: e.project_id,
        project_name: e.project?.name ?? e.project_id,
        target_ppmph: e.project?.target_ppmph ?? 0.65,
        total_points: 0,
        total_man_hours: 0,
        weighted_ppmph: 0,
        days: 0,
        weeks: [],
      })
    }
    const proj = map.get(key)!
    proj.total_points += (e.points ?? 0)
    proj.total_man_hours += e.man_hours
    proj.days += 1

    const isoWeek = getISOWeek(e.entry_date)
    let weekRow = proj.weeks.find(w => w.iso_week === isoWeek)
    if (!weekRow) {
      weekRow = { iso_week: isoWeek, total_points: 0, total_man_hours: 0, weighted_ppmph: 0, days: 0 }
      proj.weeks.push(weekRow)
    }
    weekRow.total_points += (e.points ?? 0)
    weekRow.total_man_hours += e.man_hours
    weekRow.days += 1
  }

  for (const proj of map.values()) {
    proj.weighted_ppmph = proj.total_man_hours > 0 ? proj.total_points / proj.total_man_hours : 0
    for (const w of proj.weeks) {
      w.weighted_ppmph = w.total_man_hours > 0 ? w.total_points / w.total_man_hours : 0
    }
    proj.weeks.sort((a, b) => b.iso_week.localeCompare(a.iso_week))
  }

  return Array.from(map.values()).sort((a, b) => a.project_name.localeCompare(b.project_name))
}

export function entriesToCSV(entries: LogEntry[]): string {
  const header = ['id','entry_date','project','men','hours','points','man_hours','ppmph','points_per_man','notes','logged_by_email','created_at']
  const rows = entries.map(e => [
    e.id,
    e.entry_date,
    e.project?.name ?? e.project_id,
    e.men,
    e.hours,
    e.points,
    e.man_hours,
    e.ppmph,
    e.points_per_man,
    (e.notes ?? '').replace(/,/g, ';'),
    e.profile?.email ?? e.logged_by,
    e.created_at,
  ])
  return [header, ...rows].map(r => r.join(',')).join('\n')
}

export function ppmphColor(ppmph: number, target: number): string {
  if (ppmph >= target) return 'text-green-600'
  if (ppmph >= target * 0.85) return 'text-yellow-600'
  return 'text-red-600'
}

export function getCurrentWeekRange(): { start: string; end: string } {
  const now = new Date()
  const day = now.getDay() // 0=Sun
  const mon = new Date(now)
  mon.setDate(now.getDate() - ((day + 6) % 7))
  const fri = new Date(mon)
  fri.setDate(mon.getDate() + 6)
  return {
    start: mon.toISOString().slice(0, 10),
    end: fri.toISOString().slice(0, 10),
  }
}
