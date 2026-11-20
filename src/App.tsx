import { useState, useEffect } from 'react';
import { Struttura, KPIData, SpesaCategoria } from './types';
import { useSheetData } from './hooks/useSheetData';
import Header from './components/Header';
import KPICards from './components/KPICards';
import CashflowChart from './components/CashflowChart';
import CumulativeChart from './components/CumulativeChart';
import SpesePieChart from './components/SpesePieChart';
import RecentTransactions from './components/RecentTransactions';
import ConfigModal from './components/ConfigModal';
import DisponibilitaCassa from './components/DisponibilitaCassa';
import { MONTHS_FULL, annoMode, meseCutoff } from './utils/formatters';

function consolidateKPI(strutture: Struttura[]): KPIData[] {
  return MONTHS_FULL.map((mese, i) => {
    const idx = i + 1;
    const list = strutture.map(s => s.kpi.find(k => k.indice === idx)).filter((k): k is KPIData => !!k);
    if (list.length === 0) return { mese, indice: idx, occupazione: 0, tariffaAvg: 0, utileNetto: 0, spese: 0, ricavo: 0 };
    const validTariffe = list.filter(k => k.tariffaAvg > 0);
    return {
      mese,
      indice: idx,
      occupazione: list.reduce((s, k) => s + k.occupazione, 0) / list.length,
      tariffaAvg: validTariffe.length ? validTariffe.reduce((s, k) => s + k.tariffaAvg, 0) / validTariffe.length : 0,
      utileNetto: list.reduce((s, k) => s + k.utileNetto, 0),
      spese: list.reduce((s, k) => s + k.spese, 0),
      ricavo: list.reduce((s, k) => s + k.ricavo, 0),
    };
  });
}

// Voci che non sono costi operativi: rate e estinzioni del mutuo abbattono il debito,
// i dividendi sono distribuzione dell'utile. Restano fuori dalla torta delle spese,
// così il totale coincide con la card "Spese YTD — costi operativi".
const NON_OPERATIVE = ['RATE', 'RIPROTEZIONE', 'DIVIDENDO'];
const isCostoOperativo = (categoria: string) =>
  !NON_OPERATIVE.some(k => categoria.toUpperCase().includes(k));

function consolidateSpese(strutture: Struttura[]): SpesaCategoria[] {
  const map: Record<string, SpesaCategoria> = {};
  strutture.flatMap(s => s.speseCategorie).forEach(item => {
    if (!map[item.categoria]) {
      map[item.categoria] = { categoria: item.categoria, totale: 0, mensili: {} };
    }
    map[item.categoria].totale += item.totale;
    Object.entries(item.mensili).forEach(([m, v]) => {
      map[item.categoria].mensili[m] = (map[item.categoria].mensili[m] || 0) + v;
    });
  });
  return Object.values(map);
}

export default function App() {
  const [appsScriptUrl, setAppsScriptUrl] = useState(
    () => localStorage.getItem('appsScriptUrl') || ''
  );
  const [selected, setSelected] = useState('tutti');
  const [configOpen, setConfigOpen] = useState(false);

  // Ultimo anno guardato; alla prima apertura, l'anno di calendario.
  const [anno, setAnno] = useState<number>(
    () => Number(localStorage.getItem('anno')) || new Date().getFullYear()
  );

  const { data, loading, error, lastRefresh, isDemo, refresh } = useSheetData(appsScriptUrl, anno);

  // La lista degli anni la decide l'Apps Script, così aggiungerne uno non
  // richiede di ridistribuire la dashboard. Uno script vecchio non la manda.
  const anni = data.anniDisponibili ?? [];
  const mode = annoMode(anno);
  const cutoff = meseCutoff(anno);

  const selectAnno = (a: number) => {
    setAnno(a);
    localStorage.setItem('anno', String(a));
  };

  // Se l'anno ricordato non è (più) servito dallo script, allineati a quello
  // che lo script ha effettivamente restituito, invece di insistere a chiederne
  // uno che non esiste.
  useEffect(() => {
    if (data.anno && data.anno !== anno) selectAnno(data.anno);
  }, [data.anno]);

  const strutture = data.strutture;
  const activeStrutture = strutture.filter(s => s.kpi.length > 0);

  const kpi = selected === 'tutti'
    ? consolidateKPI(activeStrutture)
    : (strutture.find(s => s.id === selected)?.kpi ?? []);

  const transazioni = selected === 'tutti'
    ? strutture.flatMap(s => s.transazioni)
    : (strutture.find(s => s.id === selected)?.transazioni ?? []);

  const spese = selected === 'tutti'
    ? consolidateSpese(activeStrutture)
    : (strutture.find(s => s.id === selected)?.speseCategorie ?? []);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-['Inter']">
      <Header
        strutture={strutture}
        selected={selected}
        onSelect={setSelected}
        loading={loading}
        lastRefresh={lastRefresh}
        isDemo={isDemo}
        error={error}
        onRefresh={refresh}
        onConfig={() => setConfigOpen(true)}
        anni={anni}
        anno={anno}
        onSelectAnno={selectAnno}
      />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        <KPICards kpi={kpi} cutoff={cutoff} mode={mode} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2">
            <CashflowChart kpi={kpi} cutoff={cutoff} />
          </div>
          <SpesePieChart
            spese={spese.filter(s => s.totale > 0 && isCostoOperativo(s.categoria))}
            mode={mode}
          />
        </div>

        <DisponibilitaCassa strutture={activeStrutture} selected={selected} cutoff={cutoff} mode={mode} />

        <CumulativeChart strutture={strutture} selected={selected} anno={anno} cutoff={cutoff} mode={mode} />

        <RecentTransactions transazioni={transazioni} />
      </main>

      {configOpen && (
        <ConfigModal
          url={appsScriptUrl}
          strutture={strutture}
          onSave={(url, names) => {
            setAppsScriptUrl(url);
            localStorage.setItem('appsScriptUrl', url);
            names.forEach((name, i) => {
              if (strutture[i]) strutture[i].nome = name;
            });
            setConfigOpen(false);
          }}
          onClose={() => setConfigOpen(false)}
        />
      )}
    </div>
  );
}
