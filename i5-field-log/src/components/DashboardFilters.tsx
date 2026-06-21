'use client'

import { useRouter } from 'next/navigation'
import type { Project } from '@/lib/types'

interface Props {
  projects: Project[]
  currentProject?: string
  currentStart: string
  currentEnd: string
}

export function DashboardFilters({ projects, currentProject, currentStart, currentEnd }: Props) {
  const router = useRouter()

  function update(key: string, value: string) {
    const params = new URLSearchParams({
      project: currentProject ?? '',
      start: currentStart,
      end: currentEnd,
      [key]: value,
    })
    if (!params.get('project')) params.delete('project')
    router.push(`/dashboard?${params.toString()}`)
  }

  const inputClass = "border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"

  return (
    <div className="flex flex-wrap gap-2.5 bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3 items-center">
      <select
        value={currentProject ?? ''}
        onChange={e => update('project', e.target.value)}
        className={`${inputClass} flex-1 min-w-[160px]`}
      >
        <option value="">All projects</option>
        {projects.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <div className="flex items-center gap-2 shrink-0">
        <input
          type="date"
          value={currentStart}
          onChange={e => update('start', e.target.value)}
          className={inputClass}
        />
        <span className="text-gray-300 font-light select-none">—</span>
        <input
          type="date"
          value={currentEnd}
          onChange={e => update('end', e.target.value)}
          className={inputClass}
        />
      </div>
    </div>
  )
}
