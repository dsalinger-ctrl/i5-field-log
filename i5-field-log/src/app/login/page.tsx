'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-brand">I-5 Field Log</h1>
          <p className="text-sm text-gray-500 mt-1">Production tracking for install teams</p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="text-4xl mb-3">📬</div>
            <p className="font-medium text-gray-800">Check your email</p>
            <p className="text-sm text-gray-500 mt-1">
              We sent a sign-in link to <strong>{email}</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@i5design.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-white rounded-lg py-2 font-medium text-sm hover:bg-brand-dark disabled:opacity-50 transition"
            >
              {loading ? 'Sending…' : 'Send sign-in link'}
            </button>
          </form>
        )}

        <p className="text-xs text-gray-400 text-center mt-6">
          Access is invite-only. Contact your admin if you need access.
        </p>
      </div>
    </div>
  )
}
