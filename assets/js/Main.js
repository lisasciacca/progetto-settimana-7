import { cercaSquadre, caricaEventi, caricaProssimiEventi } from "./api.js";
import { caricaPreferiti, salvaPreferiti } from "./storage.js";
import {
  mostraSpinner,
  nascondiSpinner,
  mostraErrore,
  nascondiErrore,
  mostraMessaggio,
  renderSquadre,
  renderPreferiti,
  renderDettagli,
  renderAppuntamenti,
  renderModaleEvento,
  renderModaleSquadra,
  segnaPreferito,
} from "./ui.js";

const ATTESA_DEBOUNCE = 400; // ms di pausa prima di cercare
const MESSAGGIO_INIZIALE = "Inizia cercando una squadra qui sopra.";

const form = document.getElementById("form-ricerca");
const titoloRisultati = document.getElementById("titolo-risultati");
const input = document.getElementById("input-ricerca");
const filtri = document.getElementById("filtri-sport");
const listaSquadre = document.getElementById("lista-squadre");
const listaPreferiti = document.getElementById("lista-preferiti");
const listaAppuntamenti = document.getElementById("lista-appuntamenti");
const dettagli = document.getElementById("dettagli");
const modaleEvento = document.getElementById("modale-evento");
const titoloModale = document.getElementById("titolo-modale-evento");
const corpoModale = document.getElementById("corpo-modale-evento");
const modaleSquadra = document.getElementById("modale-squadra");
const titoloModaleSquadra = document.getElementById("titolo-modale-squadra");
const corpoModaleSquadra = document.getElementById("corpo-modale-squadra");

// ===== STATO =====
let squadreTrovate = []; // risultati dell'ultima ricerca
let ricercaEffettuata = false; // true dopo una ricerca andata a buon fine
let filtroSport = "tutti"; // "tutti", "Soccer", "Basketball", "American Football"
let preferiti = caricaPreferiti(); // letti da localStorage
let eventiDettagli = []; // eventi della squadra aperta nei dettagli
let appuntamenti = []; // prossimi eventi delle preferite
let versioneAppuntamenti = 0; // per ignorare i caricamenti superati
let timerRicerca = null; // timer del debounce
let controllerRicerca = null; // AbortController della ricerca in corso
let cardAperta = null; // card che ha aperto la modal della squadra

// ===== SCORRIMENTO =====

// Porta la pagina a un elemento (fluido, o immediato con "riduci animazioni")
// e ci sposta il focus, per chi usa tastiera o screen reader
function portaA(elemento) {
  const riduciMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  elemento.tabIndex = -1; // focusabile da JS, ma non con Tab
  elemento.scrollIntoView({
    behavior: riduciMovimento ? "auto" : "smooth",
    block: "start",
  });
  elemento.focus({ preventScroll: true }); // lo scroll lo gestisce scrollIntoView
}

// ===== AVVIO =====
renderPreferiti(listaPreferiti, preferiti);
caricaAppuntamenti();

// ===== RICERCA =====

// Squadre trovate filtrate per sport
function squadreFiltrate() {
  if (filtroSport === "tutti") return squadreTrovate;
  return squadreTrovate.filter((s) => s.sport === filtroSport);
}

// Mostra i risultati tenendo conto del filtro, con il messaggio giusto se vuoti
function mostraRisultati() {
  if (squadreTrovate.length === 0) {
    mostraMessaggio(listaSquadre, "Nessuna squadra trovata");
    return;
  }

  const filtrate = squadreFiltrate();
  if (filtrate.length === 0) {
    mostraMessaggio(listaSquadre, "Nessuna squadra trovata per questo sport");
    return;
  }

  renderSquadre(listaSquadre, filtrate, preferiti);
}

async function eseguiRicerca(query) {
  // Se c'è una ricerca ancora in corso, la annullo
  if (controllerRicerca) controllerRicerca.abort();

  nascondiErrore();
  dettagli.replaceChildren();
  eventiDettagli = [];
  squadreTrovate = [];
  ricercaEffettuata = false;

  // Input vuoto → torno al messaggio iniziale
  if (!query) {
    controllerRicerca = null;
    nascondiSpinner();
    mostraMessaggio(listaSquadre, MESSAGGIO_INIZIALE);
    return;
  }

  const controller = new AbortController();
  controllerRicerca = controller;

  listaSquadre.replaceChildren();
  mostraSpinner();

  try {
    squadreTrovate = await cercaSquadre(query, controller.signal);
    ricercaEffettuata = true;
    mostraRisultati();
  } catch (error) {
    // Richiesta annullata da noi: non è un vero errore
    if (error.name === "AbortError") return;

    console.error(error);
    mostraErrore("Impossibile cercare le squadre. Riprova più tardi.");
  } finally {
    // Tolgo lo spinner solo se questa è ancora la ricerca più recente
    if (controllerRicerca === controller) {
      nascondiSpinner();
      controllerRicerca = null;
    }
  }
}

// Debounce: la ricerca parte dopo 400ms di pausa nella digitazione
input.addEventListener("input", () => {
  clearTimeout(timerRicerca);
  timerRicerca = setTimeout(() => {
    eseguiRicerca(input.value.trim());
  }, ATTESA_DEBOUNCE);
});

// Submit (bottone Cerca o Invio): cerca subito, svuota il campo e scende ai risultati
form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearTimeout(timerRicerca); // evita una seconda ricerca dal debounce

  const query = input.value.trim(); // prima salvo il testo...
  input.value = ""; // ...poi svuoto (non fa scattare l'evento "input")

  eseguiRicerca(query);
  portaA(titoloRisultati);
});

// ===== FILTRO PER SPORT =====
filtri.addEventListener("click", (event) => {
  const bottone = event.target.closest(".btn-filtro");
  if (!bottone) return;

  filtroSport = bottone.dataset.sport;

  // Solo il bottone cliccato risulta "premuto"
  filtri.querySelectorAll(".btn-filtro").forEach((b) => {
    b.setAttribute("aria-pressed", b === bottone ? "true" : "false");
  });

  if (ricercaEffettuata) mostraRisultati();
});

// ===== DETTAGLI =====
async function apriDettagli(squadra) {
  nascondiErrore();
  dettagli.replaceChildren();
  mostraSpinner();

  try {
    const { prossimi, ultimi } = await caricaEventi(squadra.id);
    eventiDettagli = [...prossimi, ...ultimi];
    renderDettagli(dettagli, squadra, prossimi, ultimi);
  } catch (error) {
    console.error(error);
    mostraErrore("Impossibile caricare gli eventi della squadra. Riprova.");
  } finally {
    nascondiSpinner();
  }
}

// ===== MODAL INFO SQUADRA =====

// Click su una card: apre la modal con le info e carica le liste sotto
function apriSquadra(squadra, card) {
  cardAperta = card;
  renderModaleSquadra(titoloModaleSquadra, corpoModaleSquadra, squadra);
  bootstrap.Modal.getOrCreateInstance(modaleSquadra).show(); // API JS di Bootstrap
  apriDettagli(squadra);
}

// Alla chiusura della modal porto l'utente alle liste degli eventi
modaleSquadra.addEventListener("hidden.bs.modal", () => {
  const titoloDettagli = dettagli.querySelector("h3");

  if (titoloDettagli) {
    portaA(titoloDettagli);
  } else if (cardAperta && cardAperta.isConnected) {
    cardAperta.focus(); // dettagli non caricati: torno alla card cliccata
  }
});

// ===== APPUNTAMENTI DEI PREFERITI (Promise.allSettled) =====
async function caricaAppuntamenti() {
  const versione = ++versioneAppuntamenti;

  if (preferiti.length === 0) {
    appuntamenti = [];
    mostraMessaggio(
      listaAppuntamenti,
      "Aggiungi una squadra ai preferiti per vedere qui i suoi prossimi appuntamenti."
    );
    return;
  }

  mostraMessaggio(listaAppuntamenti, "Caricamento degli appuntamenti…");

  const squadre = [...preferiti]; // copia: i preferiti potrebbero cambiare durante l'attesa
  const risultati = await Promise.allSettled(
    squadre.map((squadra) => caricaProssimiEventi(squadra.id))
  );

  // È partito un caricamento più recente: questo è superato
  if (versione !== versioneAppuntamenti) return;

  const eventi = [];
  const squadreFallite = [];

  risultati.forEach((risultato, i) => {
    if (risultato.status === "fulfilled") {
      eventi.push(...risultato.value);
    } else {
      console.error(risultato.reason);
      squadreFallite.push(squadre[i].nome);
    }
  });

  // Tolgo i doppioni (due preferite che giocano tra loro) e ordino per data
  const unici = eventi.filter(
    (evento, i) => eventi.findIndex((e) => e.id === evento.id) === i
  );
  unici.sort((a, b) =>
    (a.timestamp || a.data || "").localeCompare(b.timestamp || b.data || "")
  );

  appuntamenti = unici;
  renderAppuntamenti(listaAppuntamenti, appuntamenti, squadreFallite);
}

// ===== PREFERITI =====
function aggiungiPreferito(squadra, bottone) {
  const giaPresente = preferiti.some((p) => p.id === squadra.id);
  if (giaPresente) return;

  preferiti.push(squadra);
  salvaPreferiti(preferiti);
  renderPreferiti(listaPreferiti, preferiti);
  segnaPreferito(bottone, true, squadra.nome);
  caricaAppuntamenti();
}

function rimuoviPreferito(squadra) {
  preferiti = preferiti.filter((p) => p.id !== squadra.id);
  salvaPreferiti(preferiti);
  renderPreferiti(listaPreferiti, preferiti);
  caricaAppuntamenti();

  // Se la squadra è anche tra i risultati, aggiorno il suo bottone stella
  const bottone = listaSquadre.querySelector(
    `.card-squadra[data-id="${squadra.id}"] .btn-preferito`
  );
  if (bottone) segnaPreferito(bottone, false, squadra.nome);
}

// ===== EVENTI SULLE CARD (event delegation) =====

// Risultati: stella → aggiungi ai preferiti, resto della card → dettagli
listaSquadre.addEventListener("click", (event) => {
  const card = event.target.closest(".card-squadra");
  if (!card) return;

  const squadra = squadreTrovate.find((s) => s.id === card.dataset.id);
  if (!squadra) return;

  const bottoneStella = event.target.closest(".btn-preferito");
  if (bottoneStella) {
    aggiungiPreferito(squadra, bottoneStella);
    return;
  }

  apriSquadra(squadra, card);
});

// Preferiti: rimuovi → toglie, resto della card → dettagli senza ricerca
listaPreferiti.addEventListener("click", (event) => {
  const card = event.target.closest(".card-squadra");
  if (!card) return;

  const squadra = preferiti.find((p) => p.id === card.dataset.id);
  if (!squadra) return;

  if (event.target.closest(".btn-rimuovi")) {
    rimuoviPreferito(squadra);
    return;
  }

  apriSquadra(squadra, card);
});

// Tastiera: Invio o Spazio sulla card la "clicca"
function attivaCardConTastiera(event) {
  if (event.key !== "Enter" && event.key !== " ") return;

  // I bottoni gestiscono già Invio e Spazio da soli
  if (event.target.closest("button")) return;

  const card = event.target.closest(".card-squadra");
  if (!card) return;

  event.preventDefault(); // evita lo scroll della pagina con lo Spazio
  card.click(); // riusa i listener del click qui sopra
}

listaSquadre.addEventListener("keydown", attivaCardConTastiera);
listaPreferiti.addEventListener("keydown", attivaCardConTastiera);

// ===== MODAL DETTAGLI EVENTO =====
// Bootstrap apre la modal da solo (data-bs-toggle); qui la riempio prima che compaia
modaleEvento.addEventListener("show.bs.modal", (event) => {
  const bottone = event.relatedTarget; // il bottone dell'evento cliccato
  if (!bottone) return;

  const evento = [...eventiDettagli, ...appuntamenti].find(
    (e) => e.id === bottone.dataset.id
  );

  if (!evento) {
    titoloModale.textContent = "Dettagli evento";
    mostraMessaggio(corpoModale, "Dettagli dell'evento non disponibili.");
    return;
  }

  renderModaleEvento(titoloModale, corpoModale, evento);
});