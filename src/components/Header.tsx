import { Struttura } from '../types';

interface Props {
  strutture: Struttura[];
  selected: string;
  onSelect: (id: string) => void;
  loading: boolean;
  lastRefresh: Date;
  isDemo: boolean;
  error: string | null;
  onRefresh: () => void;
  onConfig: () => void;
}

export default function Header({ strutture, selected, onSelect, loading, lastRefresh, isDemo, error, onRefresh, onConfig }: Props) {
  return (
    <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold text-white leading-tight">Dashboard Bed&amp;Bed</h1>
              <p className="text-xs text-slate-400">
                {isDemo ? (
                  <span className="text-amber-400">Modalità demo — collega i tuoi Google Sheet</span>
                ) : error ? (
                  <span className="text-red-400">Errore: {error} — dati non aggiornati</span>
                ) : (
                  <>Aggiornato: {lastRefresh.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-slate-900 rounded-lg p-0.5 gap-0.5">
              <button
                onClick={() => onSelect('tutti')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selected === 'tutti' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tutti
              </button>
              {strutture.map(s => (
                <button
                  key={s.id}
                  onClick={() => onSelect(s.id)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    selected === s.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s.nome}
                </button>
              ))}
            </div>

            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
              title="Aggiorna dati"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <button
              onClick={onConfig}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
              title="Impostazioni"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
