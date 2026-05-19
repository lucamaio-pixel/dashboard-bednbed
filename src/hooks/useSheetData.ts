import { useState, useEffect, useCallback, useRef } from 'react';
import { DashboardData } from '../types';
import { mockData } from '../data/mockData';

const AUTO_REFRESH_MS = 5 * 60 * 1000; // 5 minuti

export function useSheetData(appsScriptUrl: string) {
  const [data, setData] = useState<DashboardData>(mockData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDemo = !appsScriptUrl;

  const fetchData = useCallback(async (url: string) => {
    if (!url) {
      setData(mockData);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Parametro cache-busting per evitare risposte cachate da Google CDN e dal browser
      const separator = url.includes('?') ? '&' : '?';
      const res = await fetch(`${url}${separator}t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: DashboardData = await res.json();
      json.strutture = json.strutture.map(s => ({
        ...s,
        saldo: s.saldo ?? { banca: 0, cash: 0, cassaforte: 0, postepay: 0 },
      }));
      setData(json);
      setLastRefresh(new Date());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore di connessione');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(appsScriptUrl);

    if (appsScriptUrl) {
      timerRef.current = setInterval(() => fetchData(appsScriptUrl), AUTO_REFRESH_MS);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [appsScriptUrl, fetchData]);

  const refresh = useCallback(() => fetchData(appsScriptUrl), [appsScriptUrl, fetchData]);

  return { data, loading, error, lastRefresh, isDemo, refresh };
}
