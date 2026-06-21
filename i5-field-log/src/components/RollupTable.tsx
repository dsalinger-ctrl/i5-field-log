'use client'

import { useState } from 'react'
import type { ProjectRollup } from '@/lib/types'
import { formatPPMPH, ppmphColor } from '@/lib/utils'

interface Props {
  rollups: ProjectRollup[]
}

export function RollupTable({ rollups }: Props) {
  const [open, setOpen] = useState<string[]>([])

  function toggle(id: string) {
    setOpen(o => o.includes(id) ? o.filter(x => x !== id) : [...o, id])
  }

  if (rollups.length === 0) {
    return <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-400">No data.</div>
  }

  return (
    <div className="space-y-3">
      {rollups.map(proj => (
        <div key={proj.project_id} className="bg-white rounded-xl shadow-sm overflow-hidden">
          <button
            onClick={() => toggle(proj.project_id)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
          >
            <div className="text-left">
              <div className="font-semibold text-gray-900">{proj.project_name}</div>
              <div className="text-xs text-gray-500">{proj.days} days · {proj.total_man_hours.toFixed(1)} man-hrs · {proj.total_points.toFixed(1)} pts</div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-lg font-bold ${ppmphColor(proj.weighted_ppmph, proj.target_ppmph)}`}>
                {formatPPMPH(proj.weighted_ppmph)}
              </span>
              <span className="text-gray-400 text-sm">{open.includes(proj.project_id) ? '▲' : '▼'}</span>
            </div>
          </button>

          {open.includes(proj.project_id) && (
            <div className="border-t border-gray-100 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Week','Days','Points','Man-Hrs','PPMPH'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {proj.weeks.map(w => (
                    <tr key={w.iso_week} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono text-gray-700">{w.iso_week}</td>
                      <td className="px-3 py-2">{w.days}</td>
                      <td className="px-3 py-2">{w.total_points.toFixed(1)}</td>
                      <td className="px-3 py-2">{w.total_man_hours.toFixed(1)}</td>
                      <td className={`px-3 py-2 font-semibold ${ppmphColor(w.weighted_ppmph, proj.target_ppmph)}`}>
                        {formatPPMPH(w.weighted_ppmph)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
