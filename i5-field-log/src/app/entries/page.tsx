import { createClient } from '@/lib/supabase/server'
import { EntriesTable } from '@/components/EntriesTable'
import { RollupTable } from '@/components/RollupTable'
import { groupByProjectAndWeek } from '@/lib/utils'
import type { LogEntry } from '@/lib/types'

export default async function EntriesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const { data: entries } = await supabase
    .from('log_entries')
    .select('*, project:projects(*), profile:profiles(email,full_name)')
    .order('entry_date', { ascending: false })

  const typedEntries = (entries ?? []) as unknown as LogEntry[]
  const rollups = groupByProjectAndWeek(typedEntries)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Entries</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <EntriesTable
          entries={typedEntries}
          currentUserId={user!.id}
          role={profile?.role ?? 'lead'}
        />
      </div>

      <h2 className="text-lg font-bold text-gray-900 pt-2">Rollups</h2>
      <RollupTable rollups={rollups} />
    </div>
  )
}
