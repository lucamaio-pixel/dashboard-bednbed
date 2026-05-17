import { useState } from 'react';

interface Props {
  url: string;
  strutture: { id: string; nome: string }[];
  onSave: (url: string, names: string[]) => void;
  onClose: () => void;
}

export default function ConfigModal({ url, strutture, onSave, onClose }: Props) {
  const [appsScriptUrl, setAppsScriptUrl] = useState(url);
  const [names, setNames] = useState(strutture.map(s => s.nome));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h2 className="text-white font-semibold text-lg">Impostazioni</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">
              URL Apps Script
            </label>
            <input
              type="url"
              value={appsScriptUrl}
              onChange={e => setAppsScriptUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/..."
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <p className="text-slate-500 text-xs mt-1">
              Incolla qui l'URL del tuo Google Apps Script dopo averlo pubblicato come web app.
            </p>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Nomi delle strutture
            </label>
            <div className="space-y-2">
              {strutture.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs w-16">Struttura {i + 1}</span>
                  <input
                    type="text"
                    value={names[i] || ''}
                    onChange={e => {
                      const updated = [...names];
                      updated[i] = e.target.value;
                      setNames(updated);
                    }}
                    className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-3 text-xs text-slate-400 space-y-1">
            <p className="font-medium text-slate-300">Come configurare Apps Script:</p>
            <ol className="list-decimal list-inside space-y-0.5 ml-1">
              <li>Apri uno dei tuoi Google Sheet</li>
              <li>Menu Extensions → Apps Script</li>
              <li>Incolla il codice del file <code className="text-blue-400">appsscript/Code.gs</code></li>
              <li>Clicca Deploy → New deployment → Web app</li>
              <li>Imposta "Execute as: Me" e "Who has access: Anyone"</li>
              <li>Copia l'URL e incollalo sopra</li>
            </ol>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-5 border-t border-slate-700">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 text-sm transition-colors">
            Annulla
          </button>
          <button
            onClick={() => onSave(appsScriptUrl, names)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 text-sm font-medium transition-colors"
          >
            Salva e connetti
          </button>
        </div>
      </div>
    </div>
  );
}
