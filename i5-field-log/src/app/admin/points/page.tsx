import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PointsAdmin } from '@/components/PointsAdmin'

export default async function AdminPointsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: entries } = await supabase
    .from('log_entries')
    .select('*, project:projects(id, name, target_ppmph, active, created_at)')
    .is('points', null)
    .order('entry_date', { ascending: false })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Enter Points</h1>
        <p className="text-sm text-gray-500 mt-1">
          {entries?.length
            ? `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'} waiting for points`
            : 'All caught up'}
        </p>
      </div>
      <PointsAdmin entries={(entries ?? []) as any} />
    </div>
  )
}