'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/lib/types'

interface Props { profiles: Profile[] }

export function UsersAdmin({ profiles }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    setStatus(res.ok ? `Invite sent to ${email}` : data.error ?? 'Failed')
    if (res.ok) setEmail('')
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      {/* Invite form */}
      <form onSubmit={handleInvite} className="bg-white rounded-xl shadow-sm p-4 flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Invite by email</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="teammate@i5design.com"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Sending…' : 'Invite'}
        </button>
      </form>
      {status && (
        <p className={`text-sm ${status.startsWith('Invite') ? 'text-green-600' : 'text-red-500'}`}>{status}</p>
      )}

      {/* User list */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Email','Name','Role','Joined'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {profiles.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5">{p.email}</td>
                <td className="px-4 py-2.5 text-gray-500">{p.full_name ?? '—'}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <select
                      value={p.role}
                      disabled={roleLoading[p.id]}
                      onChange={e => handleRoleChange(p.id, e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition disabled:opacity-50"
                    >
                      <option value="lead">lead</option>
                      <option value="admin">admin</option>
                    </select>
                    {roleLoading[p.id] && <span className="text-xs text-gray-400">saving…</span>}
                    {roleStatus[p.id] === 'saved' && <span className="text-xs text-green-600 font-medium">✓ saved</span>}
                    {roleStatus[p.id] && roleStatus[p.id] !== 'saved' && <span className="text-xs text-red-500">{roleStatus[p.id]}</span>}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-gray-500 text-xs">
                  {new Date(p.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
