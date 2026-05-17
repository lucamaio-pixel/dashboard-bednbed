import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { KPIData } from '../types';
import { MONTHS_SHORT, CURRENT_MONTH_IDX, euro } from '../utils/formatters';

interface Props {
  kpi: KPIData[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl text-sm">
      <p className="font-semibold text-white mb-2">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {euro(p.value)}</p>
      ))}
    </div>
  );
};

export default function CashflowChart({ kpi }: Props) {
  const data = kpi.map(k => ({
    name: MONTHS_SHORT[k.indice - 1],
    indice: k.indice,
    Ricavi: k.ricavo,
    Spese: k.spese,
    'Utile Netto': k.utileNetto,
    isForecast: k.indice > CURRENT_MONTH_IDX,
    hasData: k.ricavo > 0 || k.spese > 0,
  })).filter(d => d.hasData || d.indice <= CURRENT_MONTH_IDX);

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold">Cashflow Mensile</h2>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-blue-500 inline-block" />
            Ricavi
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-500 inline-block" />
            Spese
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
            Utile
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <span className="w-3 h-3 rounded border border-dashed border-slate-500 inline-block" />
            Previsione
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="Ricavi" radius={[3, 3, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.isForecast ? '#3b82f680' : '#3b82f6'} />
            ))}
          </Bar>
          <Bar dataKey="Spese" radius={[3, 3, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.isForecast ? '#ef444480' : '#ef4444'} />
            ))}
          </Bar>
          <Bar dataKey="Utile Netto" radius={[3, 3, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.isForecast ? '#10b98180' : '#10b981'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-slate-500 mt-2 text-center">
        Le barre più chiare indicano mesi futuri con prenotazioni già confermate
      </p>
    </div>
  );
}
