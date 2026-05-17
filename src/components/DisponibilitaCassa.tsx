import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import { Struttura } from '../types';
import { euro, MONTHS_SHORT, CURRENT_MONTH_IDX } from '../utils/formatters';

interface Props {
  strutture: Struttura[];
  selected: string;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl text-sm">
      <p className="font-semibold text-white mb-1">{label}</p>
      <p className={val >= 0 ? 'text-emerald-400' : 'text-red-400'}>
        Flusso netto: {euro(val)}
      </p>
    </div>
  );
};

export default function DisponibilitaCassa({ strutture, selected }: Props) {
  const activeStrutture = selected === 'tutti'
    ? strutture
    : strutture.filter(s => s.id === selected);

  const totalBanca = activeStrutture.reduce((s, st) => s + st.saldo.banca, 0);
  const totalCash = activeStrutture.reduce((s, st) => s + st.saldo.cash, 0);
  const totalCassaforte = activeStrutture.reduce((s, st) => s + st.saldo.cassaforte, 0);
  const totalPostepay = activeStrutture.reduce((s, st) => s + st.saldo.postepay, 0);
  const totale = totalBanca + totalCash + totalCassaforte + totalPostepay;

  // Calcola flusso netto per mese dalle transazioni
  const flussoPer: Record<number, number> = {};
  activeStrutture.flatMap(s => s.transazioni).forEach(t => {
    flussoPer[t.indice] = (flussoPer[t.indice] || 0) + t.entrata - t.uscita;
  });

  const chartData = MONTHS_SHORT.map((name, i) => ({
    name,
    indice: i + 1,
    flusso: Math.round((flussoPer[i + 1] || 0) * 100) / 100,
    isFuture: i + 1 > CURRENT_MONTH_IDX,
  })).filter(d => d.flusso !== 0 || d.indice <= CURRENT_MONTH_IDX);

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <h2 className="text-white font-semibold mb-4">Disponibilità in Cassa</h2>

      {/* Cards saldi */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="bg-slate-700 rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-1">Banca / Conto</p>
          <p className="text-lg font-bold text-blue-400">{euro(totalBanca)}</p>
        </div>
        <div className="bg-slate-700 rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-1">Contanti</p>
          <p className="text-lg font-bold text-amber-400">{euro(totalCash)}</p>
        </div>
        {totalCassaforte > 0 && (
          <div className="bg-slate-700 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">Cassaforte</p>
            <p className="text-lg font-bold text-purple-400">{euro(totalCassaforte)}</p>
          </div>
        )}
        {totalPostepay > 0 && (
          <div className="bg-slate-700 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">Postepay</p>
            <p className="text-lg font-bold text-slate-300">{euro(totalPostepay)}</p>
          </div>
        )}
        <div className="bg-emerald-900 border border-emerald-700 rounded-lg p-3">
          <p className="text-xs text-emerald-300 mb-1">Totale disponibile</p>
          <p className="text-lg font-bold text-emerald-400">{euro(totale)}</p>
        </div>
      </div>

      {/* Breakdown per struttura (solo se "tutti") */}
      {selected === 'tutti' && strutture.length > 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-5">
          {strutture.map(s => (
            <div key={s.id} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
              <p className="text-xs text-slate-400 font-semibold mb-2">{s.nome}</p>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Banca</span>
                <span className="text-blue-400">{euro(s.saldo.banca)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300 mt-1">
                <span>Contanti</span>
                <span className="text-amber-400">{euro(s.saldo.cash)}</span>
              </div>
              {s.saldo.cassaforte > 0 && (
                <div className="flex justify-between text-xs text-slate-300 mt-1">
                  <span>Cassaforte</span>
                  <span className="text-purple-400">{euro(s.saldo.cassaforte)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs mt-1 pt-1 border-t border-slate-600">
                <span className="text-slate-400">Totale</span>
                <span className="text-emerald-400 font-semibold">
                  {euro(s.saldo.banca + s.saldo.cash + s.saldo.cassaforte + s.saldo.postepay)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grafico flusso netto mensile */}
      <p className="text-xs text-slate-400 mb-2">Flusso netto mensile (entrate − uscite)</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#475569" />
          <Bar dataKey="flusso" radius={[3, 3, 0, 0]}>
            {chartData.map((d, i) => (
              <Cell
                key={i}
                fill={d.flusso >= 0
                  ? (d.isFuture ? '#10b98150' : '#10b981')
                  : (d.isFuture ? '#ef444450' : '#ef4444')}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-slate-500 mt-2 text-center">
        Verde = incassi superiori alle uscite · Rosso = uscite superiori agli incassi
      </p>
    </div>
  );
}
