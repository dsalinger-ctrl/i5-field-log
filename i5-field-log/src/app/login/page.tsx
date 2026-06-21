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
    <div className="min-h-screen flex">
      {/* Left: brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-brand px-12 py-16">
        <img
          src="https://s3.amazonaws.com/hoth.bizango/images/1322152/logo_full-dark_home.png"
          alt="I-5 Design Build"
          className="h-10 w-auto object-contain object-left"
        />
        <div>
          <p className="text-white/30 text-xs tracking-widest uppercase mb-4">Field Production Log</p>
          <h2 className="text-white text-3xl font-light leading-snug">
            Transforming Spaces.<br />
            <span className="font-semibold">Elevating Performance.</span>
          </h2>
        </div>
        <p className="text-white/25 text-xs">© {new Date().getFullYear()} I-5 Design Build</p>
      </div>

      {/* Right: login form */}
      <div className="flex-1 flex items-center justify-center bg-slate-100 px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <img
              src="https://s3.amazonaws.com/hoth.bizango/images/1322152/logo_full-dark_home.png"
              alt="I-5 Design Build"
              className="h-8 w-auto object-contain mx-auto mb-3"
              style={{ filter: 'brightness(0) saturate(100%) invert(23%) sepia(52%) saturate(600%) hue-rotate(185deg) brightness(85%)' }}
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="mb-7">
              <h1 className="text-xl font-semibold text-gray-900">Sign in</h1>
              <p className="text-sm text-gray-500 mt-1">We&apos;ll send a magic link to your inbox</p>
            </div>

            {sent ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="font-semibold text-gray-900">Check your email</p>
                <p className="text-sm text-gray-500 mt-2">
                  Sign-in link sent to<br /><strong className="text-gray-700">{email}</strong>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@i5design.com"
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
                  />
                </div>
                {error && (
                  <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent hover:bg-accent-dark text-gray-900 rounded-lg py-2.5 font-semibold text-sm disabled:opacity-50 transition-colors shadow-sm"
                >
                  {loading ? 'Sending…' : 'Send Sign-in Link'}
                </button>
              </form>
            )}
          </div>

          <p className="text-xs text-gray-400 text-center mt-5">
            Access is invite-only · Contact your admin for access
          </p>
        </div>
      </div>
    </div>
  )
}
