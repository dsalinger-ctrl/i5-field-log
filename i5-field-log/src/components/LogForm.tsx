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
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
      {/* Live preview */}
      {men > 0 && hours > 0 && points > 0 && (
        <div className="bg-brand/5 border border-brand/10 rounded-xl p-4 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className={`text-xl font-bold ${ppmphColor(ppmph, target)}`}>{formatPPMPH(ppmph)}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">PPMPH</div>
          </div>
          <div>
            <div className="text-xl font-bold text-gray-700">{manHours.toFixed(1)}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Man-Hours</div>
          </div>
          <div>
            <div className="text-xl font-bold text-gray-700">{formatPPMPH(ptsPerMan)}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Pts/Man</div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Date</label>
          <input
            type="date"
            required
            value={form.entry_date}
            onChange={e => set('entry_date', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Project</label>
          <select
            required
            value={form.project_id}
            onChange={e => set('project_id', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
          >
            <option value="">Select project…</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { key: 'men', label: 'Men', min: '1', step: '1', placeholder: '6' },
            { key: 'hours', label: 'Hours', min: '0.5', step: '0.5', placeholder: '9' },
            { key: 'points', label: 'Points', min: '0', step: '0.1', placeholder: '42' },
          ].map(({ key, label, min, step, placeholder }) => (
            <div key={key}>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{label}</label>
              <input
                type="number"
                required
                min={min}
                step={step}
                value={form[key as keyof typeof form]}
                onChange={e => set(key, e.target.value)}
                placeholder={placeholder}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            Notes <span className="font-normal normal-case tracking-normal">(optional)</span>
          </label>
          <textarea
            rows={2}
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Any notes for the day…"
            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
          />
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}
      {success && (
        <p className="text-green-700 text-sm font-semibold bg-green-50 border border-green-100 rounded-lg px-3 py-2">
          ✓ Entry logged successfully
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-accent hover:bg-accent-dark text-gray-900 rounded-lg py-2.5 font-semibold text-sm disabled:opacity-50 transition-colors shadow-sm"
      >
        {loading ? 'Saving…' : 'Log Day'}
      </button>
    </form>
  )
}
