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

export const CURRENT_MONTH_IDX = new Date().getMonth() + 1; // 1-12
