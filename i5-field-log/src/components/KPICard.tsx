interface Props {
  label: string
  value: string | number
  sub?: string
  valueClass?: string
}

export function KPICard({ label, value, sub, valueClass = '' }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 pl-5 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand rounded-l-xl" />
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</div>
      <div className={`text-2xl font-bold tracking-tight ${valueClass || 'text-gray-900'}`}>{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1 font-medium">{sub}</div>}
    </div>
  )
}
