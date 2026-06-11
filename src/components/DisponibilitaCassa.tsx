import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import { Struttura } from '../types';
import { euro, MONTHS_SHORT, CURRENT_MONTH_IDX } from '../utils/formatters';

interface Props {
  strutture: Struttura[];
  selected: string;
}

const TooltipCumulativo = ({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number; payload: { delta: number } }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  const cum = payload[0].value;
  const delta = payload[0].payload.delta;
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl text-sm">
      <p className="font-semibold text-white mb-1">{label}</p>
      <p className="text-emerald-400">Disponibile cumulativo: {euro(cum)}</p>
      <p className={delta >= 0 ? 'text-blue-400' : 'text-red-400'}>
        Questo mese: {delta >= 0 ? '+' : ''}{euro(delta)}
      </p>
    </div>
  );
};

const TooltipDelta = ({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl text-sm">
      <p className="font-semibold text-white mb-1">{label}</p>
      <p className={val >= 0 ? 'text-emerald-400' : 'text-red-400'}>
        Netto mese: {val >= 0 ? '+' : ''}{euro(val)}
      </p>
    </div>
  );
};

export default function DisponibilitaCassa({ strutture, selected }: Props) {
  const activeStrutture = selected === 'tutti'
    ? strutture
    : strutture.filter(s => s.id === selected);

  const totalBanca      = activeStrutture.reduce((s, st) => s + st.saldo.banca, 0);
  const totalCash       = activeStrutture.reduce((s, st) => s + st.saldo.cash, 0);
  const totalCassaforte = activeStrutture.reduce((s, st) => s + st.saldo.cassaforte, 0);
  const totalPostepay   = activeStrutture.reduce((s, st) => s + st.saldo.postepay, 0);
  const totale = totalBanca + totalCash + totalCassaforte + totalPostepay;

  // Calcola delta mensile e cumulativo dalle transazioni
  const deltaPerMese: Record<number, number> = {};
  activeStrutture.flatMap(s => s.transazioni).forEach(t => {
    deltaPerMese[t.indice] = (deltaPerMese[t.indice] || 0) + t.entrata - t.uscita;
  });

  let cumulativo = 0;
  const cumulativoData = MONTHS_SHORT
    .map((name, i) => {
      const idx = i + 1;
      const delta = Math.round((deltaPerMese[idx] || 0) * 100) / 100;
      cumulativo += delta;
      return { name, idx, delta, cumulativo: Math.round(cumulativo * 100) / 100 };
    })
    .filter(d => d.idx <= CURRENT_MONTH_IDX);

  const deltaData = MONTHS_SHORT
    .map((name, i) => ({
      name,
      idx: i + 1,
      delta: Math.round((deltaPerMese[i + 1] || 0) * 100) / 100,
    }))
    .filter(d => d.idx <= CURRENT_MONTH_IDX);

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <h2 className="text-white font-semibold mb-4">Disponibilità in Cassa</h2>

      {/* Cards saldo attuale */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="bg-slate-700 rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-1">Banca / Conto</p>
          <p className="text-lg font-bold text-blue-400">{euro(totalBanca)}</p>
        </div>
        <div className="bg-slate-700 rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-1">Contanti</p>
          <p className="text-lg font-bold text-amber-400">{euro(totalCash)}</p>
        </div>
        <div className="bg-slate-700 rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-1">Cassaforte</p>
          <p className="text-lg font-bold text-purple-400">{euro(totalCassaforte)}</p>
        </div>
        {totalPostepay !== 0 ? (
          <div className="bg-slate-700 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">Postepay</p>
            <p className="text-lg font-bold text-slate-300">{euro(totalPostepay)}</p>
          </div>
        ) : (
          <div className="bg-emerald-900 border border-emerald-700 rounded-lg p-3 lg:col-span-1">
            <p className="text-xs text-emerald-300 mb-1">Totale disponibile</p>
            <p className="text-lg font-bold text-emerald-400">{euro(totale)}</p>
          </div>
        )}
        {totalPostepay !== 0 && (
          <div className="bg-emerald-900 border border-emerald-700 rounded-lg p-3 col-span-2 lg:col-span-4">
            <p className="text-xs text-emerald-300 mb-1">Totale disponibile</p>
            <p className="text-2xl font-bold text-emerald-400">{euro(totale)}</p>
          </div>
        )}
      </div>

      {/* Breakdown per struttura (solo se "tutti") */}
      {selected === 'tutti' && strutture.length > 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-5">
          {strutture.map(s => {
            const tot = s.saldo.banca + s.saldo.cash + s.saldo.cassaforte + s.saldo.postepay;
            return (
              <div key={s.id} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                <p className="text-xs text-slate-400 font-semibold mb-2">{s.nome}</p>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Banca / Conto</span>
                  <span className="text-blue-400">{euro(s.saldo.banca)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-300 mt-1">
                  <span>Contanti</span>
                  <span className="text-amber-400">{euro(s.saldo.cash)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-300 mt-1">
                  <span>Cassaforte</span>
                  <span className="text-purple-400">{euro(s.saldo.cassaforte)}</span>
                </div>
                {s.saldo.postepay !== 0 && (
                  <div className="flex justify-between text-xs text-slate-300 mt-1">
                    <span>Postepay</span>
                    <span className="text-slate-300">{euro(s.saldo.postepay)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs mt-2 pt-1 border-t border-slate-600">
                  <span className="text-slate-400">Totale</span>
                  <span className={`font-semibold ${tot >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {euro(tot)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Grafico crescita cumulativa */}
      {cumulativoData.length > 0 && (
        <>
          <p className="text-xs text-slate-400 mb-2">
            Crescita cumulativa YTD — disponibile netto accumulato mese per mese (entrate − uscite)
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={cumulativoData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="gradCum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TooltipCumulativo />} />
              <ReferenceLine y={0} stroke="#475569" />
              <Area
                type="monotone"
                dataKey="cumulativo"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#gradCum)"
                dot={{ fill: '#10b981', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </>
      )}

      {/* Grafico delta mensile */}
      {deltaData.length > 0 && (
        <>
          <p className="text-xs text-slate-400 mt-4 mb-2">
            Flusso netto per mese (entrate − uscite)
          </p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={deltaData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TooltipDelta />} />
              <ReferenceLine y={0} stroke="#475569" />
              <Bar dataKey="delta" radius={[3, 3, 0, 0]}>
                {deltaData.map((d, i) => (
                  <Cell key={i} fill={d.delta >= 0 ? '#3b82f6' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
