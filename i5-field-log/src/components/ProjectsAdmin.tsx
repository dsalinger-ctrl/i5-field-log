'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Project } from '@/lib/types'

interface Props { projects: Project[] }

const blank = { name: '', target_ppmph: '0.65' }

export function ProjectsAdmin({ projects }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState(blank)
  const [editing, setEditing] = useState<Project | null>(null)
  const [editForm, setEditForm] = useState({ name: '', target_ppmph: '' })
  const [error, setError] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const { error } = await supabase.from('projects').insert({
      name: form.name.trim(),
      target_ppmph: parseFloat(form.target_ppmph),
    })
    if (error) return setError(error.message)
    setForm(blank)
    router.refresh()
  }

  async function handleSave() {
    if (!editing) return
    await supabase.from('projects').update({
      name: editForm.name.trim(),
      target_ppmph: parseFloat(editForm.target_ppmph),
    }).eq('id', editing.id)
    setEditing(null)
    router.refresh()
  }

  async function toggleActive(p: Project) {
    await supabase.from('projects').update({ active: !p.active }).eq('id', p.id)
    router.refresh()
  }

  function startEdit(p: Project) {
    setEditing(p)
    setEditForm({ name: p.name, target_ppmph: String(p.target_ppmph) })
  }

  return (
    <div className="space-y-4">
      {/* Add form */}
      <form onSubmit={handleAdd} className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-medium text-gray-600 mb-1">Project name</label>
          <input
            required
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Job name"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="w-28">
          <label className="block text-xs font-medium text-gray-600 mb-1">Target PPMPH</label>
          <input
            type="number"
            step="0.01"
            required
            value={form.target_ppmph}
            onChange={e => setForm(f => ({ ...f, target_ppmph: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button type="submit" className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium">
          Add Project
        </button>
        {error && <p className="w-full text-red-500 text-sm">{error}</p>}
      </form>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-bold text-gray-900">Edit Project</h3>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
              <input
                value={editForm.name}
                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Target PPMPH</label>
              <input
                type="number"
                step="0.01"
                value={editForm.target_ppmph}
                onChange={e => setEditForm(f => ({ ...f, target_ppmph: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} className="flex-1 bg-brand text-white rounded-lg py-2 text-sm font-medium">Save</button>
              <button onClick={() => setEditing(null)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Name','Target PPMPH','Status','Actions'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {projects.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium">{p.name}</td>
                <td className="px-4 py-2.5">{p.target_ppmph}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-2.5 flex gap-3">
                  <button onClick={() => startEdit(p)} className="text-brand hover:underline text-xs">Edit</button>
                  <button onClick={() => toggleActive(p)} className="text-gray-500 hover:underline text-xs">
                    {p.active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
