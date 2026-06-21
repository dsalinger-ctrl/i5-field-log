'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend,
} from 'recharts'

interface DataPoint {
  date: string
  ppmph: number
  target: number
}

interface Props {
  data: DataPoint[]
  target: number
}

export function PPMPHChart({ data, target }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          tickFormatter={d => d.slice(5)}
        />
        <YAxis
          domain={[0, 'auto']}
          tick={{ fontSize: 11 }}
          tickFormatter={v => v.toFixed(2)}
        />
        <Tooltip
          formatter={(v: number) => [v.toFixed(3), 'PPMPH']}
          labelFormatter={l => `Date: ${l}`}
        />
        <ReferenceLine
          y={target}
          stroke="#ef4444"
          strokeDasharray="6 3"
          label={{ value: `Target ${target}`, position: 'insideTopRight', fontSize: 11, fill: '#ef4444' }}
        />
        <Line
          type="monotone"
          dataKey="ppmph"
          stroke="#1a5276"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          name="PPMPH"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
