import { Transazione } from '../types';

interface Props {
  transazioni: Transazione[];
}

export default function RecentTransactions({ transazioni }: Props) {
  const recent = [...transazioni]
    .sort((a, b) => b.indice - a.indice || b.giorno - a.giorno)
    .slice(0, 10);

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <h2 className="text-white font-semibold mb-4">Ultimi Movimenti</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 text-xs border-b border-slate-700">
              <th className="text-left pb-2 font-medium">Data</th>
              <th className="text-left pb-2 font-medium">Descrizione</th>
              <th className="text-left pb-2 font-medium">Categoria</th>
              <th className="text-right pb-2 font-medium text-emerald-400">Entrata</th>
              <th className="text-right pb-2 font-medium text-red-400">Uscita</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((t, i) => (
              <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                <td className="py-2 text-slate-400 whitespace-nowrap">
                  {t.giorno} {t.mese.slice(0, 3).charAt(0) + t.mese.slice(1, 3).toLowerCase()}
                </td>
                <td className="py-2 text-slate-300 max-w-[180px] truncate">{t.descrizione || '—'}</td>
                <td className="py-2">
                  {t.categoria ? (
                    <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 text-xs">
                      {t.categoria.toLowerCase()}
                    </span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className="py-2 text-right text-emerald-400 font-medium">
                  {t.entrata > 0 ? `€ ${t.entrata.toFixed(2)}` : ''}
                </td>
                <td className="py-2 text-right text-red-400 font-medium">
                  {t.uscita > 0 ? `€ ${t.uscita.toFixed(2)}` : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
