import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { SpesaCategoria } from '../types';
import { euro } from '../utils/formatters';

interface Props {
  spese: SpesaCategoria[];
}

const COLORS = ['#3b82f6','#8b5cf6','#f59e0b','#ef4444','#10b981','#06b6d4','#ec4899','#84cc16'];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl text-sm">
      <p className="font-semibold text-white">{payload[0].name}</p>
      <p className="text-slate-300">{euro(payload[0].value)}</p>
    </div>
  );
};

const RADIAN = Math.PI / 180;
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
  cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number;
}) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function SpesePieChart({ spese }: Props) {
  const data = spese.filter(s => s.totale > 0).sort((a, b) => b.totale - a.totale);
  const totale = data.reduce((s, d) => s + d.totale, 0);

  if (data.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center justify-center h-full">
        <p className="text-slate-500 text-sm">Nessun dato spese</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <h2 className="text-white font-semibold mb-2">Spese per Categoria</h2>
      <p className="text-slate-400 text-xs mb-3">Totale YTD: {euro(totale)}</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="totale"
            nameKey="categoria"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
            labelLine={false}
            label={renderLabel}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-3 space-y-1.5">
        {data.slice(0, 6).map((d, i) => (
          <div key={d.categoria} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="text-slate-300 capitalize">{d.categoria.toLowerCase()}</span>
            </div>
            <span className="text-slate-400 font-medium">{euro(d.totale)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
