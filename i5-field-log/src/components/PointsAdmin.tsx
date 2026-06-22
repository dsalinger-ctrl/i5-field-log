'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { LogEntry } from '@/lib/types'

interface Props {
  entries: (LogEntry & { project: { name: string } })[]
}

function formatDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })
}

export function PointsAdmin({ entries }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function savePoints(id: string) {
    const val = parseFloat(values[id] ?? '')
    if (isNaN(val) || val < 0) {
      setErrors(e => ({ ...e, [id]: 'Enter a valid number' }))
      return
    }
    setSaving(s => ({ ...s, [id]: true }))
    setErrors(e => ({ ...e, [id]: '' }))

    const { error } = await supabase
      .from('log_entries')
      .update({ points: val })
      .eq('id', id)

    if (error) {
      setErrors(e => ({ ...e, [id]: error.message }))
    } else {
      setSaved(s => ({ ...s, [id]: true }))
      router.refresh()
    }
    setSaving(s => ({ ...s, [id]: false }))
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
        <div className="text-3xl mb-3">✓</div>
        <p className="font-semibold text-gray-700">All entries have points entered.</p>
        <p className="text-sm text-gray-400 mt-1">Nothing pending.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {entries.map(entry => {
        const manHours = entry.men * entry.hours
        const pts = parseFloat(values[entry.id] ?? '')
        const ppmph = (!isNaN(pts) && manHours > 0) ? (pts / manHours).toFixed(2) : '—'
        const isSaved = saved[entry.id]

        return (
          <div
            key={entry.id}
            className={`bg-white rounded-2xl shadow-sm border p-4 transition ${
              isSaved ? 'border-green-200 bg-green-50/30' : 'border-gray-100'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{formatDate(entry.entry_date)}</p>
                <p className="text-xs text-gray-500 mt-0.5">{entry.project.name}</p>
                <div className="flex gap-4 mt-1.5 text-xs text-gray-500">
                  <span><span className="font-medium text-gray-700">{entry.men}</span> men</span>
                  <span><span className="font-medium text-gray-700">{entry.hours}</span> hrs</span>
                  <span><span className="font-medium text-gray-700">{manHours.toFixed(1)}</span> man-hrs</span>
                  {!isNaN(pts) && (
                    <span>→ <span className="font-medium text-gray-700">{ppmph}</span> PPMPH</span>
                  )}
                </div>
                {entry.notes && (
                  <p className="text-xs text-gray-400 mt-1 italic">"{entry.notes}"</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isSaved ? (
                  <span className="text-green-700 text-sm font-semibold bg-green-100 rounded-lg px-3 py-2">
                    ✓ {values[entry.id]} pts saved
                  </span>
                ) : (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Points</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="0.0"
                        value={values[entry.id] ?? ''}
                        onChange={e => setValues(v => ({ ...v, [entry.id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && savePoints(entry.id)}
                        className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
                      />
                      {errors[entry.id] && (
                        <p className="text-red-500 text-xs mt-0.5">{errors[entry.id]}</p>
                      )}
                    </div>
                    <button
                      onClick={() => savePoints(entry.id)}
                      disabled={saving[entry.id] || !values[entry.id]}
                      className="mt-5 bg-accent hover:bg-accent-dark text-gray-900 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-40 transition-colors shadow-sm"
                    >
                      {saving[entry.id] ? '…' : 'Save'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}