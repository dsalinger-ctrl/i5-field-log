export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: 'admin' | 'lead'
  created_at: string
}

export interface Project {
  id: string
  name: string
  target_ppmph: number
  active: boolean
  created_at: string
}

export interface LogEntry {
  id: string
  entry_date: string
  project_id: string
  men: number
  hours: number
  points: number | null
  man_hours: number
  ppmph: number
  points_per_man: number
  notes: string | null
  logged_by: string
  created_at: string
  updated_at: string
  // Joined
  project?: Project
  profile?: Profile
}

export interface WeekRollup {
  iso_week: string   // e.g. "2025-W22"
  total_points: number
  total_man_hours: number
  weighted_ppmph: number
  days: number
}

export interface ProjectRollup {
  project_id: string
  project_name: string
  target_ppmph: number
  total_points: number
  total_man_hours: number
  weighted_ppmph: number
  days: number
  weeks: WeekRollup[]
}
