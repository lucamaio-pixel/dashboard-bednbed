export const euro = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

export const euroDecimal = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(n);

export const percent = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'percent', maximumFractionDigits: 1 }).format(n / 100);

export const MONTHS_SHORT = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];

export const MONTHS_FULL = [
  'GENNAIO','FEBBRAIO','MARZO','APRILE','MAGGIO','GIUGNO',
  'LUGLIO','AGOSTO','SETTEMBRE','OTTOBRE','NOVEMBRE','DICEMBRE',
];

// Il "periodo attuale" dipende da quale anno si sta guardando: per l'anno in
// corso è il mese di oggi, per un anno chiuso sono tutti i dodici mesi, per un
// anno futuro non c'è ancora nessun consuntivo e si guardano le prenotazioni.
export type AnnoMode = 'passato' | 'corrente' | 'futuro';

export const annoMode = (anno: number): AnnoMode => {
  const y = new Date().getFullYear();
  return anno < y ? 'passato' : anno > y ? 'futuro' : 'corrente';
};

// Ultimo mese da considerare consuntivo: 12 per un anno chiuso, il mese
// corrente per l'anno in corso, 0 per un anno futuro.
export const meseCutoff = (anno: number): number => {
  const m = annoMode(anno);
  return m === 'passato' ? 12 : m === 'futuro' ? 0 : new Date().getMonth() + 1;
};

// "YTD" ha senso solo sull'anno in corso.
export const labelPeriodo = (m: AnnoMode) =>
  m === 'corrente' ? 'YTD' : m === 'passato' ? 'anno' : 'a libro';

// Fin dove disegnare un grafico: il consuntivo, oppure l'ultimo mese che ha
// dati. Senza questo, su un anno futuro (cutoff 0) i grafici resterebbero
// vuoti pur avendo prenotazioni e movimenti di cassa registrati.
export const ultimoMeseVisibile = (cutoff: number, mesiConDati: number[]) =>
  Math.max(cutoff, ...mesiConDati, 0);
