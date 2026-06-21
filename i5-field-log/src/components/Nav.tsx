'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import type { Profile } from '@/lib/types'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/log', label: 'Log Day' },
  { href: '/entries', label: 'Entries' },
  { href: '/export', label: 'Export' },
]

const adminLinks = [
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/users', label: 'Users' },
]

export function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
    })
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (pathname === '/login') return null

  const allLinks = profile?.role === 'admin' ? [...navLinks, ...adminLinks] : navLinks

  return (
    <nav className="bg-brand shadow-md">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/dashboard" className="text-white font-bold text-lg tracking-tight">
          I-5 Field Log
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          {allLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                pathname.startsWith(l.href)
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <button onClick={signOut} className="ml-3 text-white/60 hover:text-white text-sm">
            Sign out
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="sm:hidden text-white p-1"
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden bg-brand-dark border-t border-white/10 px-4 py-3 space-y-1">
          {allLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                pathname.startsWith(l.href) ? 'bg-white/20 text-white' : 'text-white/70'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <button onClick={signOut} className="block w-full text-left px-3 py-2 text-white/60 text-sm">
            Sign out
          </button>
          {profile && (
            <p className="px-3 py-1 text-white/40 text-xs">{profile.email}</p>
          )}
        </div>
      )}
    </nav>
  )
}
