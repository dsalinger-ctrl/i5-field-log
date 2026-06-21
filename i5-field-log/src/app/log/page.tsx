import { createClient } from '@/lib/supabase/server'
import { LogForm } from '@/components/LogForm'
import { redirect } from 'next/navigation'

export default async function LogPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('active', true)
    .order('name')

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="pt-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Production</p>
        <h1 className="text-2xl font-semibold text-gray-900">Log a Day</h1>
      </div>
      <LogForm projects={projects ?? []} userId={user.id} />
    </div>
  )
}
