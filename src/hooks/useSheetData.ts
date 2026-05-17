import { useState, useEffect, useCallback } from 'react';
import { DashboardData } from '../types';
import { mockData } from '../data/mockData';

export function useSheetData(appsScriptUrl: string) {
  const [data, setData] = useState<DashboardData>(mockData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isDemo, setIsDemo] = useState(!appsScriptUrl);

  const fetchData = useCallback(async (url: string) => {
    if (!url) {
      setData(mockData);
      setIsDemo(true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: DashboardData = await res.json();
      // Compatibilità: aggiungi saldo default se mancante
      json.strutture = json.strutture.map(s => ({
        ...s,
        saldo: s.saldo ?? { banca: 0, cash: 0, cassaforte: 0, postepay: 0 },
      }));
      setData(json);
      setIsDemo(false);
      setLastRefresh(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore di connessione');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(appsScriptUrl);
  }, [appsScriptUrl, fetchData]);

  const refresh = () => fetchData(appsScriptUrl);

  return { data, loading, error, lastRefresh, isDemo, refresh };
}
