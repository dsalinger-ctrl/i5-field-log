import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { entriesToCSV } from '@/lib/utils'
import type { LogEntry } from '@/lib/types'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: entries } = await supabase
    .from('log_entries')
    .select('*, project:projects(*), profile:profiles(email,full_name)')
    .order('entry_date', { ascending: true })

  const csv = entriesToCSV((entries ?? []) as unknown as LogEntry[])

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="field-log-${new Date().toISOString().slice(0,10)}.csv"`,
    },
  })
}
