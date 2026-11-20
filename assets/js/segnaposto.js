// =====================================================================
// segnaposto.js – Partite di esempio
// Completa le sezioni "Ultimi risultati" quando l'API (chiave gratuita)
// restituisce poche partite. Le partite di esempio sono sempre segnate
// con esempio = true (badge "Esempio" nelle card e avviso nella modal).
// =====================================================================

import { Evento } from "./Evento.js";

// Quante partite mostrare almeno in ogni sezione di risultati (3 visibili alla volta su PC)
export const MINIMO_PARTITE = 9;

// Loghi reali delle squadre (indirizzi presi dall'API di TheSportsDB)
const LOGHI = {
  "Arsenal": "https://r2.thesportsdb.com/images/media/team/badge/uyhbfe1612467038.png",
  "Liverpool": "https://r2.thesportsdb.com/images/media/team/badge/kfaher1737969724.png",
  "Manchester United": "https://r2.thesportsdb.com/images/media/team/badge/xzqdr11517660252.png",
  "Aston Villa": "https://r2.thesportsdb.com/images/media/team/badge/uwzw561787679026.png",
};

// Partite DI ESEMPIO tra squadre reali, con la stessa forma dei dati dell'API.
// Non sono partite disputate: i risultati sono inventati (le card mostrano il badge "Esempio").
// Servono solo a riempire la griglia finché l'API (chiave gratuita) dà pochi risultati.
const PARTITE_ESEMPIO = [
  {
    dateEvent: "2026-11-15",
    strTimestamp: "2026-11-15T15:00:00",
    strHomeTeam: "Arsenal",
    strAwayTeam: "Liverpool",
    strHomeTeamBadge: LOGHI["Arsenal"],
    strAwayTeamBadge: LOGHI["Liverpool"],
    intHomeScore: "2",
    intAwayScore: "1",
    strVenue: "Emirates Stadium",
  },
  {
    dateEvent: "2026-11-14",
    strTimestamp: "2026-11-14T19:45:00",
    strHomeTeam: "Aston Villa",
    strAwayTeam: "Arsenal",
    strHomeTeamBadge: LOGHI["Aston Villa"],
    strAwayTeamBadge: LOGHI["Arsenal"],
    intHomeScore: "1",
    intAwayScore: "1",
    strVenue: "Villa Park",
  },
  {
    dateEvent: "2026-11-12",
    strTimestamp: "2026-11-12T20:00:00",
    strHomeTeam: "Liverpool",
    strAwayTeam: "Aston Villa",
    strHomeTeamBadge: LOGHI["Liverpool"],
    strAwayTeamBadge: LOGHI["Aston Villa"],
    intHomeScore: "3",
    intAwayScore: "0",
    strVenue: "Anfield",
  },
  {
    dateEvent: "2026-11-10",
    strTimestamp: "2026-11-10T17:30:00",
    strHomeTeam: "Manchester United",
    strAwayTeam: "Liverpool",
    strHomeTeamBadge: LOGHI["Manchester United"],
    strAwayTeamBadge: LOGHI["Liverpool"],
    intHomeScore: "0",
    intAwayScore: "2",
    strVenue: "Old Trafford",
  },
  {
    dateEvent: "2026-11-07",
    strTimestamp: "2026-11-07T16:00:00",
    strHomeTeam: "Arsenal",
    strAwayTeam: "Manchester United",
    strHomeTeamBadge: LOGHI["Arsenal"],
    strAwayTeamBadge: LOGHI["Manchester United"],
    intHomeScore: "2",
    intAwayScore: "2",
    strVenue: "Emirates Stadium",
  },
  {
    dateEvent: "2026-11-04",
    strTimestamp: "2026-11-04T20:00:00",
    strHomeTeam: "Aston Villa",
    strAwayTeam: "Liverpool",
    strHomeTeamBadge: LOGHI["Aston Villa"],
    strAwayTeamBadge: LOGHI["Liverpool"],
    intHomeScore: "1",
    intAwayScore: "3",
    strVenue: "Villa Park",
  },
  {
    dateEvent: "2026-11-01",
    strTimestamp: "2026-11-01T15:00:00",
    strHomeTeam: "Liverpool",
    strAwayTeam: "Manchester United",
    strHomeTeamBadge: LOGHI["Liverpool"],
    strAwayTeamBadge: LOGHI["Manchester United"],
    intHomeScore: "2",
    intAwayScore: "0",
    strVenue: "Anfield",
  },
  {
    dateEvent: "2026-10-31",
    strTimestamp: "2026-10-31T17:30:00",
    strHomeTeam: "Manchester United",
    strAwayTeam: "Arsenal",
    strHomeTeamBadge: LOGHI["Manchester United"],
    strAwayTeamBadge: LOGHI["Arsenal"],
    intHomeScore: "1",
    intAwayScore: "2",
    strVenue: "Old Trafford",
  },
  {
    dateEvent: "2026-10-28",
    strTimestamp: "2026-10-28T20:00:00",
    strHomeTeam: "Arsenal",
    strAwayTeam: "Aston Villa",
    strHomeTeamBadge: LOGHI["Arsenal"],
    strAwayTeamBadge: LOGHI["Aston Villa"],
    intHomeScore: "4",
    intAwayScore: "1",
    strVenue: "Emirates Stadium",
  },
];

// Crea "quante" partite di esempio come oggetti Evento.
// prefisso: rende unici gli id per sezione (la modal cerca le partite per id)
function partiteEsempio(prefisso, quante, lega) {
  return PARTITE_ESEMPIO.slice(0, quante).map(
    (dati, i) =>
      new Evento({
        ...dati,
        idEvent: `${prefisso}-esempio-${i + 1}`,
        strEvent: `${dati.strHomeTeam} vs ${dati.strAwayTeam}`,
        strLeague: lega,
        strCountry: "England",
        strStatus: "FT",
        esempio: true, // segnaposto: viene etichettato come "Esempio"
      })
  );
}

// Se le partite vere sono meno del minimo, aggiunge esempi fino a raggiungerlo
export function completaConEsempi(reali, prefisso, lega) {
  if (reali.length >= MINIMO_PARTITE) return reali;
  const mancanti = MINIMO_PARTITE - reali.length;
  return [...reali, ...partiteEsempio(prefisso, mancanti, lega)];
}