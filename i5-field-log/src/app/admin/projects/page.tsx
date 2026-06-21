import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProjectsAdmin } from '@/components/ProjectsAdmin'

export default async function AdminProjectsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: projects } = await supabase.from('projects').select('*').order('name')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Projects</h1>
      <ProjectsAdmin projects={projects ?? []} />
    </div>
  )
}
