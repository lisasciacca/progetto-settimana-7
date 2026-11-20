import { Squadra } from "./Squadra.js";
import { Evento } from "./Evento.js";

// Deve finire con "/" perché new URL() aggiunga il file correttamente
const BASE_URL = "https://www.thesportsdb.com/api/v1/json/123/";

// Fa la fetch, controlla response.ok e restituisce il JSON
async function getJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Errore HTTP: ${response.status}`);
  }
  return response.json();
}

// Cerca le squadre per nome → array di Squadra (vuoto se nessuna)
export async function cercaSquadre(query) {
  const url = new URL("searchteams.php", BASE_URL);
  url.searchParams.set("t", query);

  const dati = await getJSON(url);

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