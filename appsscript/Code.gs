// ============================================================
// CONFIGURAZIONE — modifica questi valori
// ============================================================
const CONFIG = {
  strutture: [
    { id: 'policlinico', nome: 'Policlinico', spreadsheetId: '1_EQcpCIxVSVClTWGd3WV63I3otQ3QGMRNN9AwsKcgyo' },
    { id: 'atelier',     nome: 'Atelier',     spreadsheetId: '1efYS5g0m_MCZ7mqCoOxQDVFv6y2EQj_Jyqt6Rlh8yyY' },
    { id: 'ganzirri',    nome: 'Ganzirri',    spreadsheetId: '1Xhq6c_RfKqGYVdTId6e19wxLcmOXVD7RkD08DsBySu8' },
  ],
  sheetNames: {
    kpi:          'KPI',             // nome della scheda KPI
    primaNotaCassa: 'Prima nota cassa',
    spese:        'Spese',
  }
};
// ============================================================

function doGet() {
  const result = {
    strutture: CONFIG.strutture.map(s => {
      try {
        return getStrutturaData(s);
      } catch (e) {
        return { id: s.id, nome: s.nome, kpi: [], transazioni: [], speseCategorie: [], error: e.toString() };
      }
    }),
    timestamp: new Date().toISOString()
  };

  const output = ContentService.createTextOutput(JSON.stringify(result));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function getStrutturaData(struttura) {
  const ss = SpreadsheetApp.openById(struttura.spreadsheetId);
  return {
    id: struttura.id,
    nome: struttura.nome,
    kpi: readKPI(ss),
    transazioni: readPrimaNota(ss),
    speseCategorie: readSpese(ss),
    saldo: readSaldo(ss),
  };
}

// --------------- KPI ---------------
function readKPI(ss) {
  const sheet = ss.getSheetByName(CONFIG.sheetNames.kpi);
  if (!sheet) return [];

  const MONTHS = ['GENNAIO','FEBBRAIO','MARZO','APRILE','MAGGIO','GIUGNO',
                  'LUGLIO','AGOSTO','SETTEMBRE','OTTOBRE','NOVEMBRE','DICEMBRE'];
  const data = sheet.getDataRange().getValues();
  const result = [];

  // Trova la riga di intestazione con OCCUPAZIONE
  let headerRow = -1;
  let occCol = -1, tariffaCol = -1, utileCol = -1, speseCol = -1, ricavoCol = -1;

  for (let r = 0; r < Math.min(data.length, 20); r++) {
    const row = data[r].map(c => String(c).toUpperCase().trim());
    if (row.some(c => c.includes('OCCUPAZIONE'))) {
      headerRow = r;
      occCol    = row.findIndex(c => c.includes('OCCUPAZIONE'));
      tariffaCol = row.findIndex(c => c.includes('TARIFFA'));
      utileCol  = row.findIndex(c => c.includes('UTILE'));
      speseCol  = row.findIndex(c => c.includes('SPESE') && !c.includes('VENDITE') && !c.includes('OPEX'));
      ricavoCol = row.findIndex(c => c.includes('RICAVO'));
      break;
    }
  }

  if (headerRow === -1) return [];

  for (let r = headerRow + 1; r < data.length; r++) {
    const row = data[r];
    const mese = String(row[0]).trim().toUpperCase();
    if (!MONTHS.includes(mese)) continue;

    const utile = parseNum(row[utileCol]);
    const spese = parseNum(row[speseCol]);
    const ricavo = ricavoCol !== -1 ? parseNum(row[ricavoCol]) : (utile + spese);
    result.push({
      mese: mese,
      indice: MONTHS.indexOf(mese) + 1,
      occupazione: parseNum(row[occCol]),
      tariffaAvg:  parseNum(row[tariffaCol]),
      utileNetto:  utile,
      spese:       spese,
      ricavo:      ricavo,
    });
  }

  return result;
}

// --------------- PRIMA NOTA CASSA ---------------
function readPrimaNota(ss) {
  const sheet = ss.getSheetByName(CONFIG.sheetNames.primaNotaCassa);
  if (!sheet) return [];

  const MONTHS = ['GENNAIO','FEBBRAIO','MARZO','APRILE','MAGGIO','GIUGNO',
                  'LUGLIO','AGOSTO','SETTEMBRE','OTTOBRE','NOVEMBRE','DICEMBRE'];
  const data = sheet.getDataRange().getValues();
  const result = [];

  // Trova intestazione con MESE
  let headerRow = -1;
  let meseCol = -1, catCol = -1, descCol = -1, pagatoCol = -1, uscitaCol = -1, entrataCol = -1;

  for (let r = 0; r < Math.min(data.length, 10); r++) {
    const row = data[r].map(c => String(c).toUpperCase().trim());
    if (row.some(c => c === 'MESE')) {
      headerRow  = r;
      meseCol    = row.findIndex(c => c === 'MESE');
      catCol     = row.findIndex(c => c.includes('CATEGORIA'));
      descCol    = row.findIndex(c => c.includes('DESCRIZIONE'));
      pagatoCol  = row.findIndex(c => c.includes('PAGATO'));
      uscitaCol  = row.findIndex(c => c.includes('USCITA'));
      entrataCol = row.findIndex(c => c.includes('ENTRATA'));
      break;
    }
  }

  if (headerRow === -1) return [];

  for (let r = headerRow + 1; r < data.length; r++) {
    const row = data[r];
    const mese = String(row[meseCol] || '').trim().toUpperCase();
    if (!MONTHS.includes(mese)) continue;

    const uscita  = parseNum(row[uscitaCol]);
    const entrata = parseNum(row[entrataCol]);
    if (uscita === 0 && entrata === 0) continue;

    result.push({
      giorno:      parseInt(String(row[0])) || 0,
      mese:        mese,
      indice:      MONTHS.indexOf(mese) + 1,
      categoria:   String(row[catCol] || '').trim(),
      descrizione: String(row[descCol] || '').trim(),
      pagato:      String(row[pagatoCol] || '').trim(),
      uscita:      uscita,
      entrata:     entrata,
    });
  }

  return result;
}

// --------------- SPESE PER CATEGORIA ---------------
function readSpese(ss) {
  const sheet = ss.getSheetByName(CONFIG.sheetNames.spese);
  if (!sheet) return [];

  const CATS = ['PULIZIE','RATE','UTENZE','PRODOTTI PULIZIA','RIPARAZIONI',
                'PUBBLICITA','IMU','TARI','ARREDAMENTO','BIANCHERIA',
                'COMMERCIALISTA','DIVIDENDO','RIPROTEZIONE'];
  const MONTH_KEYS = ['GEN','FEB','MAR','APR','MAG','GIU','LUG','AGO','SET','OTT','NOV','DIC'];

  const data = sheet.getDataRange().getValues();
  const result = [];

  // Trova la riga di intestazione con le colonne dei mesi
  let headerRow = -1;
  let monthCols = {};

  for (let r = 0; r < Math.min(data.length, 10); r++) {
    const row = data[r].map(c => String(c).toUpperCase().trim());
    if (row.some(c => MONTH_KEYS.some(mk => c.startsWith(mk)))) {
      headerRow = r;
      row.forEach((h, ci) => {
        const mk = MONTH_KEYS.find(m => h.startsWith(m));
        if (mk && !monthCols[mk]) monthCols[mk] = ci;
      });
      break;
    }
  }

  if (headerRow === -1) return [];

  for (let r = headerRow + 1; r < data.length; r++) {
    const row = data[r];
    const cat = String(row[0] || '').trim().toUpperCase();
    if (!CATS.some(c => cat.includes(c))) continue;

    const mensili = {};
    let totale = 0;
    MONTH_KEYS.forEach(mk => {
      if (monthCols[mk] !== undefined) {
        const v = parseNum(row[monthCols[mk]]);
        mensili[mk] = v;
        totale += v;
      }
    });

    result.push({ categoria: cat, totale: totale, mensili: mensili });
  }

  return result;
}

// --------------- SALDO ATTUALE ---------------
function readSaldo(ss) {
  const sheet = ss.getSheetByName(CONFIG.sheetNames.primaNotaCassa);
  const result = { banca: 0, cash: 0, cassaforte: 0, postepay: 0 };
  if (!sheet) return result;

  const data = sheet.getDataRange().getValues();

  // Cerca la riga/colonna con "SALDO ATTUALE" (o fallback "SALDO PROGRESSIVO")
  let headerRow = -1, headerCol = -1;
  const keywords = ['SALDO ATTUALE', 'SALDO PROGRESSIVO', 'SALDO'];
  outer:
  for (let r = 0; r < data.length; r++) {
    for (let c = 0; c < data[r].length; c++) {
      const cell = String(data[r][c]).toUpperCase().trim();
      if (keywords.some(k => cell === k)) {
        headerRow = r;
        headerCol = c;
        break outer;
      }
    }
  }

  if (headerRow === -1) return result;

  // Legge le righe successive cercando BANCA/CONTO, CASH, CASSAFORTE, POSTEPAY
  for (let r = headerRow + 1; r < Math.min(headerRow + 10, data.length); r++) {
    for (let c = 0; c < data[r].length - 1; c++) {
      const label = String(data[r][c]).toUpperCase().trim();
      const val = parseNum(data[r][c + 1]);
      if (label === 'BANCA' || label === 'CONTO') result.banca = val;
      else if (label === 'CASH' || label === 'CONTANTI') result.cash = val;
      else if (label.includes('CASSAFORTE')) result.cassaforte = val;
      else if (label === 'POSTEPAY') result.postepay = val;
    }
  }

  return result;
}

// --------------- UTILITY ---------------
function parseNum(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const s = String(val).replace(/[€\s]/g, '').replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}
