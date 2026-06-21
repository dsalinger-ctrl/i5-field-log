'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Project } from '@/lib/types'
import { formatPPMPH, ppmphColor } from '@/lib/utils'

interface Props {
  projects: Project[]
  userId: string
}

export function LogForm({ projects, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const today = new Date().toISOString().slice(0, 10)

  const [form, setForm] = useState({
    entry_date: today,
    project_id: projects[0]?.id ?? '',
    men: '',
    hours: '9',
    points: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const men = parseFloat(form.men) || 0
  const hours = parseFloat(form.hours) || 0
  const points = parseFloat(form.points) || 0
  const manHours = men * hours
  const ppmph = manHours > 0 ? points / manHours : 0
  const ptsPerMan = men > 0 ? points / men : 0

  const selectedProject = projects.find(p => p.id === form.project_id)
  const target = selectedProject?.target_ppmph ?? 0.65

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
    setError(null)
    setSuccess(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.project_id) return setError('Select a project')
    setLoading(true)
    setError(null)

    const { error } = await supabase.from('log_entries').insert({
      entry_date: form.entry_date,
      project_id: form.project_id,
      men: parseInt(form.men),
      hours: parseFloat(form.hours),
      points: parseFloat(form.points),
      notes: form.notes || null,
      logged_by: userId,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setForm(f => ({ ...f, men: '', points: '', notes: '' }))
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
      {/* Live preview */}
      {men > 0 && hours > 0 && points > 0 && (
        <div className="bg-gray-50 rounded-xl p-3 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className={`text-lg font-bold ${ppmphColor(ppmph, target)}`}>{formatPPMPH(ppmph)}</div>
            <div className="text-xs text-gray-500">PPMPH</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-800">{manHours.toFixed(1)}</div>
            <div className="text-xs text-gray-500">Man-Hours</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-800">{formatPPMPH(ptsPerMan)}</div>
            <div className="text-xs text-gray-500">Pts/Man</div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            required
            value={form.entry_date}
            onChange={e => set('entry_date', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
          <select
            required
            value={form.project_id}
            onChange={e => set('project_id', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Select project…</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Men</label>
            <input
              type="number"
              required
              min="1"
              step="1"
              value={form.men}
              onChange={e => set('men', e.target.value)}
              placeholder="6"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
            <input
              type="number"
              required
              min="0.5"
              step="0.5"
              value={form.hours}
              onChange={e => set('hours', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
            <input
              type="number"
              required
              min="0"
              step="0.1"
              value={form.points}
              onChange={e => set('points', e.target.value)}
              placeholder="42"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes <span className="text-gray-400">(optional)</span></label>
          <textarea
            rows={2}
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Any notes for the day…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm font-medium">Entry logged!</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand text-white rounded-lg py-2.5 font-medium text-sm hover:bg-brand-dark disabled:opacity-50 transition"
      >
        {loading ? 'Saving…' : 'Log Day'}
      </button>
    </form>
  )
}
