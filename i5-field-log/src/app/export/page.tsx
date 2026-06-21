import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CSVTools } from '@/components/CSVTools'

export default async function ExportPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Export / Import</h1>
      <CSVTools isAdmin={profile?.role === 'admin'} />
    </div>
  )
}
