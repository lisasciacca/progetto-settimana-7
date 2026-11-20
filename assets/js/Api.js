// =====================================================================
// api.js – Chiamate all'API di TheSportsDB
// Fa solo le fetch e trasforma i dati grezzi in oggetti Squadra / Evento.
// Non tocca mai il DOM.
// =====================================================================

import { Squadra } from "./Squadra.js";
import { Evento } from "./Evento.js";

// Deve finire con "/" perché new URL() aggiunga il file correttamente
const BASE_URL = "https://www.thesportsdb.com/api/v1/json/123/";

// Fa la fetch, controlla response.ok e restituisce il JSON.
// signal (facoltativo) permette di annullare la richiesta con AbortController
async function getJSON(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Errore HTTP: ${response.status}`);
  }
  return response.json();
}

// Cerca le squadre per nome → array di Squadra (vuoto se nessuna)
export async function cercaSquadre(query, signal) {
  const url = new URL("searchteams.php", BASE_URL);
  url.searchParams.set("t", query);

  const dati = await getJSON(url, signal);

  if (!dati.teams) return []; // teams è null → nessuna squadra
  return dati.teams.map((squadra) => new Squadra(squadra));
}

// Carica in parallelo prossimi eventi e ultimi risultati di una squadra
export async function caricaEventi(idTeam) {
  const urlProssimi = new URL("eventsnext.php", BASE_URL);
  urlProssimi.searchParams.set("id", idTeam);

  const urlUltimi = new URL("eventslast.php", BASE_URL);
  urlUltimi.searchParams.set("id", idTeam);

  const [datiProssimi, datiUltimi] = await Promise.all([
    getJSON(urlProssimi),
    getJSON(urlUltimi),
  ]);

  // eventsnext → "events", eventslast → "results"
  const prossimi = (datiProssimi.events || []).map((e) => new Evento(e));
  const ultimi = (datiUltimi.results || []).map((e) => new Evento(e));

  return { prossimi, ultimi };
}

// Solo i prossimi eventi di una squadra (usata per gli appuntamenti dei preferiti)
export async function caricaProssimiEventi(idTeam) {
  const url = new URL("eventsnext.php", BASE_URL);
  url.searchParams.set("id", idTeam);

  const dati = await getJSON(url);
  return (dati.events || []).map((e) => new Evento(e));
}

// Ultimi risultati di una squadra (usata per le preferite)
export async function caricaUltimiEventi(idTeam) {
  const url = new URL("eventslast.php", BASE_URL);
  url.searchParams.set("id", idTeam);

  const dati = await getJSON(url);
  return (dati.results || []).map((e) => new Evento(e)); // eventslast → "results"
}

// Ultime partite di un campionato (es. 4328 = Premier League)
export async function caricaUltimiEventiLega(idLega) {
  const url = new URL("eventspastleague.php", BASE_URL);
  url.searchParams.set("id", idLega);

  const dati = await getJSON(url);
  return (dati.events || []).map((e) => new Evento(e)); // eventspastleague → "events"
}