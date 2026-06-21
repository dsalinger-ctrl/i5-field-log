'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

interface DataPoint {
  date: string
  points: number
}

interface Props { data: DataPoint[] }

export function PointsBarChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip labelFormatter={l => `Date: ${l}`} />
        <Bar dataKey="points" fill="#2e86c1" radius={[4, 4, 0, 0]} name="Points" />
      </BarChart>
    </ResponsiveContainer>
  )
}
