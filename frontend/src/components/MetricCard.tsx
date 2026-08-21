import type { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: string | number
  note?: string
  icon: ReactNode
  tone?: 'saffron' | 'teal' | 'coral' | 'ink'
}

const tones = {
  saffron: 'bg-[#fff7e7] text-[#a66c09]',
  teal: 'bg-[#e8f5f3] text-teal',
  coral: 'bg-[#fff0eb] text-coral',
  ink: 'bg-[#edf1f2] text-ink',
}

export function MetricCard({ label, value, note, icon, tone = 'saffron' }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm text-slate-500">{label}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-md ${tones[tone]}`}>{icon}</span>
      </div>
      <p className="mt-5 text-2xl font-semibold tracking-tight text-ink">{value}</p>
      {note && <p className="mt-1 text-xs text-slate-400">{note}</p>}
    </div>
  )
}
