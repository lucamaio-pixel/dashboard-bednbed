export interface KPIData {
  mese: string;
  indice: number; // 1-12
  occupazione: number; // valore grezzo dal foglio (dividi per 10 per %)
  tariffaAvg: number;
  utileNetto: number;
  spese: number;
  ricavo: number;
}

export interface Transazione {
  giorno: number;
  mese: string;
  indice: number;
  categoria: string;
  descrizione: string;
  pagato: string;
  uscita: number;
  entrata: number;
}

export interface SpesaCategoria {
  categoria: string;
  totale: number;
  mensili: Record<string, number>;
}

export interface Saldo {
  banca: number;
  cash: number;
  cassaforte: number;
  postepay: number;
}

export interface Struttura {
  id: string;
  nome: string;
  kpi: KPIData[];
  transazioni: Transazione[];
  speseCategorie: SpesaCategoria[];
  saldo: Saldo;
}

export interface DashboardData {
  strutture: Struttura[];
  timestamp: string;
}
