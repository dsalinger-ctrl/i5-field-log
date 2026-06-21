'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { LogEntry } from '@/lib/types'
import { formatDate, formatPPMPH, ppmphColor } from '@/lib/utils'

interface Props {
  entries: LogEntry[]
  currentUserId: string
  role: string
}

export function EntriesTable({ entries, currentUserId, role }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editing, setEditing] = useState<LogEntry | null>(null)
  const [editForm, setEditForm] = useState({ men: '', hours: '', points: '', notes: '' })

  function canModify(entry: LogEntry) {
    return role === 'admin' || entry.logged_by === currentUserId
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this entry?')) return
    setDeleting(id)
    await supabase.from('log_entries').delete().eq('id', id)
    setDeleting(null)
    router.refresh()
  }

  function startEdit(entry: LogEntry) {
    setEditing(entry)
    setEditForm({
      men: String(entry.men),
      hours: String(entry.hours),
      points: String(entry.points),
      notes: entry.notes ?? '',
    })
  }

  async function handleSave() {
    if (!editing) return
    await supabase.from('log_entries').update({
      men: parseInt(editForm.men),
      hours: parseFloat(editForm.hours),
      points: parseFloat(editForm.points),
      notes: editForm.notes || null,
    }).eq('id', editing.id)
    setEditing(null)
    router.refresh()
  }

  if (entries.length === 0) {
    return <p className="p-6 text-center text-gray-400">No entries yet.</p>
  }

  return (
    <>
      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-bold text-gray-900">Edit Entry — {formatDate(editing.entry_date)}</h3>
            <div className="grid grid-cols-3 gap-3">
              {['men','hours','points'].map(f => (
                <div key={f}>
                  <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{f}</label>
                  <input
                    type="number"
                    value={(editForm as any)[f]}
                    onChange={e => setEditForm(ef => ({ ...ef, [f]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <textarea
                rows={2}
                value={editForm.notes}
                onChange={e => setEditForm(ef => ({ ...ef, notes: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} className="flex-1 bg-brand text-white rounded-lg py-2 text-sm font-medium">Save</button>
              <button onClick={() => setEditing(null)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Date','Project','Men','Hours','Points','Man-Hrs','PPMPH','Pts/Man','By','Actions'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {entries.map(e => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-3 py-2.5 whitespace-nowrap text-gray-700">{formatDate(e.entry_date)}</td>
                <td className="px-3 py-2.5 whitespace-nowrap font-medium">{e.project?.name ?? '—'}</td>
                <td className="px-3 py-2.5">{e.men}</td>
                <td className="px-3 py-2.5">{e.hours}</td>
                <td className="px-3 py-2.5">{e.points}</td>
                <td className="px-3 py-2.5">{e.man_hours}</td>
                <td className={`px-3 py-2.5 font-semibold ${ppmphColor(e.ppmph, e.project?.target_ppmph ?? 0.65)}`}>
                  {formatPPMPH(e.ppmph)}
                </td>
                <td className="px-3 py-2.5">{formatPPMPH(e.points_per_man)}</td>
                <td className="px-3 py-2.5 text-gray-500 text-xs">{e.profile?.email?.split('@')[0] ?? '—'}</td>
                <td className="px-3 py-2.5">
                  {canModify(e) && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(e)}
                        className="text-brand hover:underline text-xs"
                      >Edit</button>
                      <button
                        onClick={() => handleDelete(e.id)}
                        disabled={deleting === e.id}
                        className="text-red-500 hover:underline text-xs disabled:opacity-50"
                      >Del</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
