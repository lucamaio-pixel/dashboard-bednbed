import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Struttura } from '../types';
import { MONTHS_SHORT, CURRENT_MONTH_IDX, euro } from '../utils/formatters';

interface Props {
  strutture: Struttura[];
  selected: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'];

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

export default function CumulativeChart({ strutture, selected }: Props) {
  const activeSrutture = selected === 'tutti'
    ? strutture.filter(s => s.kpi.length > 0)
    : strutture.filter(s => s.id === selected && s.kpi.length > 0);

  const data = MONTHS_SHORT.map((name, i) => {
    const idx = i + 1;
    const row: Record<string, string | number> = { name };
    let totale = 0;
    activeSrutture.forEach(s => {
      const cumulative = s.kpi
        .filter(k => k.indice <= idx)
        .reduce((sum, k) => sum + k.utileNetto, 0);
      row[s.nome] = cumulative;
      totale += cumulative;
    });
    if (selected === 'tutti' && activeSrutture.length > 1) row['Totale'] = totale;
    return row;
  });

  const keys = selected === 'tutti' && activeSrutture.length > 1
    ? [...activeSrutture.map(s => s.nome), 'Totale']
    : activeSrutture.map(s => s.nome);

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <h2 className="text-white font-semibold mb-4">Cashflow Cumulativo — Utile Netto Progressivo</h2>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <defs>
            {keys.map((k, i) => (
              <linearGradient key={k} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
          {keys.map((k, i) => (
            <Area
              key={k}
              type="monotone"
              dataKey={k}
              stroke={COLORS[i % COLORS.length]}
              fill={`url(#grad${i})`}
              strokeWidth={k === 'Totale' ? 2.5 : 1.5}
              strokeDasharray={k === 'Totale' ? undefined : undefined}
              dot={{ r: 3, fill: COLORS[i % COLORS.length] }}
              activeDot={{ r: 5 }}
            />
          ))}
          {/* Vertical line at current month */}
          <Area
            type="monotone"
            dataKey={`__phantom__`}
            stroke="transparent"
            fill="transparent"
            legendType="none"
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-xs text-slate-500 mt-2 text-center">
        Mese corrente: {MONTHS_SHORT[CURRENT_MONTH_IDX - 1]} — i mesi successivi includono prenotazioni già confermate
      </p>
    </div>
  );
}
