'use client'

import Link from 'next/link'
import Image from 'next/image'
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
    <nav className="bg-brand shadow-lg border-b border-brand-dark">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://s3.amazonaws.com/hoth.bizango/images/1324251/logo_small-white_home.png"
            alt="I-5 Design Build"
            className="h-7 w-auto object-contain"
          />
          <span className="hidden sm:block text-white/40 text-sm font-light border-l border-white/20 pl-3 tracking-wider">
            Field Log
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-0.5">
          {allLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium tracking-wide transition-all ${
                pathname.startsWith(l.href)
                  ? 'bg-accent text-gray-900 shadow-sm'
                  : 'text-white/65 hover:text-white hover:bg-white/10'
              }`}
            >
              {l.label}
            </Link>
          ))}

          {/* Divider */}
          <div className="w-px h-5 bg-white/20 mx-2" />

          {/* User info + sign out */}
          <div className="flex items-center gap-2">
            {profile && (
              <span className="text-xs text-white/40 hidden lg:block">
                {profile.full_name || profile.email}
              </span>
            )}
            <button
              onClick={signOut}
              className="text-white/50 hover:text-white text-sm transition px-2 py-1 rounded hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="sm:hidden text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
          aria-label="Menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                pathname.startsWith(l.href)
                  ? 'bg-accent text-gray-900'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <div className="border-t border-white/10 pt-2 mt-2">
            {profile && (
              <p className="px-3 py-1 text-white/40 text-xs mb-1">{profile.email}</p>
            )}
            <button onClick={signOut} className="block w-full text-left px-3 py-2 text-white/60 hover:text-white text-sm transition">
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
