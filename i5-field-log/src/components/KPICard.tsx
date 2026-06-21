interface Props {
  label: string
  value: string | number
  sub?: string
  valueClass?: string
}

export function KPICard({ label, value, sub, valueClass = '' }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-2xl font-bold ${valueClass || 'text-gray-900'}`}>{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}
