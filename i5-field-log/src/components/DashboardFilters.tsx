'use client'

import { useRouter, useSearchParams } from 'next/navigation'
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

  return (
    <div className="flex flex-wrap gap-3 bg-white rounded-xl shadow-sm p-3">
      <select
        value={currentProject ?? ''}
        onChange={e => update('project', e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[140px]"
      >
        <option value="">All projects</option>
        {projects.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <input
        type="date"
        value={currentStart}
        onChange={e => update('start', e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
      />
      <span className="self-center text-gray-400 text-sm">to</span>
      <input
        type="date"
        value={currentEnd}
        onChange={e => update('end', e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
      />
    </div>
  )
}
