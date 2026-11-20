import { KPIData } from '../types';
import { euro, labelPeriodo, AnnoMode } from '../utils/formatters';

interface Props {
  kpi: KPIData[];
  cutoff: number;
  mode: AnnoMode;
}

function Card({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

export default function KPICards({ kpi, cutoff, mode }: Props) {
  const per = labelPeriodo(mode);

  // Su un anno futuro non c'è consuntivo: il totale utile è quello che è già
  // a libro, cioè tutti i mesi che hanno ricavo.
  const actual = mode === 'futuro'
    ? kpi.filter(k => k.ricavo > 0)
    : kpi.filter(k => k.indice <= cutoff);

  // "Confermati" significa "oltre il mese corrente": ha senso solo sull'anno
  // in corso, dove c'è un confine fra consuntivo e prenotato.
  const confirmed = mode === 'corrente'
    ? kpi.filter(k => k.indice > cutoff && k.ricavo > 0)
    : [];

  const ricavoYTD = actual.reduce((s, k) => s + k.ricavo, 0);
  const speseYTD  = actual.reduce((s, k) => s + k.spese, 0);
  const utileYTD  = actual.reduce((s, k) => s + k.utileNetto, 0);
  const ricavoFuture = confirmed.reduce((s, k) => s + k.ricavo, 0);

  const tariffaAvgYTD = (() => {
    const valid = actual.filter(k => k.tariffaAvg > 0);
    return valid.length ? valid.reduce((s, k) => s + k.tariffaAvg, 0) / valid.length : 0;
  })();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        label={`Ricavo ${per}`}
        value={euro(ricavoYTD)}
        sub={confirmed.length ? `+${euro(ricavoFuture)} confermati` : undefined}
        color="text-blue-400"
      />
      <Card
        label={`Spese ${per}`}
        value={euro(speseYTD)}
        sub="costi operativi"
        color="text-red-400"
      />
      <Card
        label={`Utile Netto ${per}`}
        value={euro(utileYTD)}
        sub={ricavoYTD > 0 ? `margine ${((utileYTD / ricavoYTD) * 100).toFixed(0)}%` : ''}
        color="text-emerald-400"
      />
      <Card
        label="Tariffa Media"
        value={`€ ${tariffaAvgYTD.toFixed(2)}`}
        sub="a notte"
        color="text-amber-400"
      />
    </div>
  );
}
