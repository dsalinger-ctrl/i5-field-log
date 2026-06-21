import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const text = await req.text()
  const lines = text.trim().split('\n')
  const header = lines[0].split(',')

  // Expected header: entry_date,project_name,men,hours,points,notes
  const dateIdx = header.indexOf('entry_date')
  const projIdx = header.indexOf('project')
  const menIdx = header.indexOf('men')
  const hoursIdx = header.indexOf('hours')
  const pointsIdx = header.indexOf('points')
  const notesIdx = header.indexOf('notes')

  const { data: projects } = await supabase.from('projects').select('id,name')
  const projectMap = new Map((projects ?? []).map(p => [p.name.toLowerCase(), p.id]))

  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',')
    if (cols.length < 3) continue
    const projName = (cols[projIdx] ?? '').trim().toLowerCase()
    const project_id = projectMap.get(projName)
    if (!project_id) continue
    rows.push({
      entry_date: cols[dateIdx]?.trim(),
      project_id,
      men: parseInt(cols[menIdx] ?? '0'),
      hours: parseFloat(cols[hoursIdx] ?? '0'),
      points: parseFloat(cols[pointsIdx] ?? '0'),
      notes: notesIdx >= 0 ? (cols[notesIdx]?.trim() || null) : null,
      logged_by: user.id,
    })
  }

  if (rows.length === 0) return NextResponse.json({ error: 'No valid rows found' }, { status: 400 })

  const { error } = await supabase.from('log_entries').insert(rows)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ inserted: rows.length })
}
