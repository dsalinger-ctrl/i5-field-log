import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
          if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

            const { userId, role } = await req.json()
              if (!userId || !role) return NextResponse.json({ error: 'userId and role required' }, { status: 400 })
                if (!['admin', 'lead'].includes(role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 })

                  if (userId === user.id) return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 })

                    const admin = createAdminClient()
                      const { error } = await admin.from('profiles').update({ role }).eq('id', userId)

                        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
                          return NextResponse.json({ ok: true })
                          }