// =====================================================================
// main.js – Punto di ingresso dell'app
// Collega gli eventi (ricerca, click, tastiera, Bootstrap), tiene lo stato
// e coordina gli altri moduli: api.js (dati), ui.js (DOM), storage.js,
// tema.js e semplificata.js (preferenze salvate), segnaposto.js (esempi).
// =====================================================================

import {
  cercaSquadre,
  caricaEventi,
  caricaProssimiEventi,
  caricaUltimiEventi,
  caricaUltimiEventiLega,
} from "./api.js";
import { completaConEsempi } from "./segnaposto.js";
import { caricaPreferiti, salvaPreferiti } from "./storage.js";
import { temaIniziale, applicaTema, salvaTema } from "./tema.js";
import { semplificataIniziale, applicaSemplificata, salvaSemplificata } from "./semplificata.js";
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
  renderPartite,
  renderModaleEvento,
  renderModaleSquadra,
  segnaPreferito,
  mostraNotifica,
  aggiornaBottoneTema,
  aggiornaBottoneSemplificata,
  aggiornaContatorePreferiti,
} from "./ui.js";

// ===== COSTANTI =====
const ATTESA_DEBOUNCE = 400; // ms di pausa prima di cercare
const ID_PREMIER_LEAGUE = "4328"; // id della Premier League su TheSportsDB
const MESSAGGIO_INIZIALE = "Inizia cercando una squadra qui sopra."; // testo di #lista-squadre a campo vuoto

// ===== ELEMENTI DEL DOM =====

const linkMarchio = document.getElementById("link-marchio");
const pallaApp = document.getElementById("palla-app");
const pallaAppBottone = document.getElementById("palla-app-bottone");
const notifica = document.getElementById("notifica");
const bottoneTema = document.getElementById("btn-tema");
const bottoneSemplificata = document.getElementById("btn-semplificata");
const bottonePreferiti = document.getElementById("btn-vai-preferiti");
const contatorePreferiti = document.getElementById("contatore-preferiti");
const titoloPreferiti = document.getElementById("titolo-preferiti");
const contenitorePreferiti = document.getElementById("contenitore-preferiti");
const annoCorrente = document.getElementById("anno-corrente");
const form = document.getElementById("form-ricerca");
const titoloRisultati = document.getElementById("titolo-risultati");
const input = document.getElementById("input-ricerca");
const filtri = document.getElementById("filtri-sport");
const listaSquadre = document.getElementById("lista-squadre");
const listaPreferiti = document.getElementById("lista-preferiti");
const listaAppuntamenti = document.getElementById("lista-appuntamenti");
const contenitoreRisultatiLega = document.getElementById("risultati-lega");
const contenitoreRisultatiPreferite = document.getElementById("risultati-preferite");
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
let risultatiLega = []; // ultime partite della Premier League (+ esempi)
let risultatiPreferite = []; // ultimi risultati delle preferite (+ esempi)
let versioneRisultati = 0; // come versioneAppuntamenti, per i risultati delle preferite
let timerRicerca = null; // timer del debounce
let controllerRicerca = null; // AbortController della ricerca in corso
let cardAperta = null; // card che ha aperto la modal della squadra
let tema = temaIniziale(); // "light" o "dark"
let semplificata = semplificataIniziale(); // true o false

// ===== SCORRIMENTO =====

// Scorrimento immediato con "riduci animazioni" o in modalità semplificata, altrimenti fluido
function comportamentoScorrimento() {
  const fermo =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.hasAttribute("data-semplificata");
  return fermo ? "auto" : "smooth";
}

// Porta la pagina a un elemento e ci sposta il focus, per chi usa tastiera o screen reader
function portaA(elemento) {
  elemento.tabIndex = -1; // focusabile da JS, ma non con Tab
  elemento.scrollIntoView({
    behavior: comportamentoScorrimento(),
    block: "start",
  });
  elemento.focus({ preventScroll: true }); // lo scroll lo gestisce scrollIntoView
}

// ===== PREFERITI: SEZIONE + CONTATORE NELLA BARRA =====
function mostraPreferiti() {
  renderPreferiti(listaPreferiti, preferiti);
  aggiornaContatorePreferiti(bottonePreferiti, contatorePreferiti, preferiti.length);
}

// ===== AVVIO =====
applicaTema(tema);
aggiornaBottoneTema(bottoneTema, tema);
applicaSemplificata(semplificata);
aggiornaBottoneSemplificata(bottoneSemplificata, semplificata);
annoCorrente.textContent = new Date().getFullYear();
mostraPreferiti();
caricaAppuntamenti();
caricaRisultatiLega();
caricaRisultatiPreferite();

// ===== BARRA DI NAVIGAZIONE =====

// Tema chiaro / scuro
bottoneTema.addEventListener("click", () => {
  tema = tema === "dark" ? "light" : "dark";
  applicaTema(tema);
  salvaTema(tema);
  aggiornaBottoneTema(bottoneTema, tema);
});

// Logo: torna in cima (href="#") e chiude la lista dei preferiti
linkMarchio.addEventListener("click", () => {
  bootstrap.Collapse.getOrCreateInstance(contenitorePreferiti, { toggle: false }).hide();
});

// Modalità semplificata: on/off
bottoneSemplificata.addEventListener("click", () => {
  semplificata = !semplificata;
  applicaSemplificata(semplificata);
  salvaSemplificata(semplificata);
  aggiornaBottoneSemplificata(bottoneSemplificata, semplificata);
});

// ===== PALLINA APP: si alza sopra la notifica =====

// Il toast sta per comparire: misuro la sua altezza e alzo la pallina
notifica.addEventListener("show.bs.toast", () => {
  // Bootstrap rende visibile il toast subito DOPO questo evento:
  // con setTimeout 0 misuro quando è già visibile (un toast invisibile misura 0)
  setTimeout(() => {
    const altezza = notifica.offsetHeight + 12; // + 12px di spazio
    pallaApp.style.setProperty("--sh-alzata", `${altezza}px`);
    pallaApp.classList.add("alzata");
  }, 0);
});

// Il toast è sparito: la pallina torna giù
notifica.addEventListener("hidden.bs.toast", () => {
  pallaApp.classList.remove("alzata");
});

// ===== PALLINA APP: finestrella =====
// Con il mouse la apre l'hover (CSS); qui gestisco il tocco su telefono e tablet
function chiudiFinestraApp() {
  pallaApp.classList.remove("aperta");
  pallaAppBottone.setAttribute("aria-expanded", "false");
}

// Click o tocco sul pallone: apre/chiude la finestrella e aggiorna aria-expanded
pallaAppBottone.addEventListener("click", () => {
  const aperta = pallaApp.classList.toggle("aperta"); // toggle restituisce il nuovo stato
  pallaAppBottone.setAttribute("aria-expanded", aperta ? "true" : "false");
});

// Click sulla scritta: si apre la modal, la finestrella si chiude
pallaApp.addEventListener("click", (event) => {
  if (event.target.closest(".palla-app-link")) chiudiFinestraApp();
});

// Esc chiude la finestrella
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") chiudiFinestraApp();
});

// ===== FOOTER: pannello appena aperto → la pagina scende a mostrarlo =====
// shown.bs.collapse arriva a fine apertura (il pannello ha già la sua altezza vera)
document.getElementById("footer-pannelli").addEventListener("shown.bs.collapse", (event) => {
  event.target.scrollIntoView({
    behavior: comportamentoScorrimento(),
    block: "end", // il fondo del pannello allineato al fondo dello schermo
  });
});

// ===== FOOTER: chiusura dei pannelli cliccando fuori =====
document.addEventListener("click", (event) => {
  // Click fuori dalla pallina: chiudo la sua finestrella (se aperta col tocco)
  if (!event.target.closest("#palla-app")) chiudiFinestraApp();

  // Click sui bottoni About us / Accessibilità: ci pensa già Bootstrap
  if (event.target.closest(".link-footer")) return;

  // Click dentro un pannello (testo, link): resta aperto
  if (event.target.closest("#footer-pannelli")) return;

  // Click in qualunque altro punto: chiudo il pannello aperto (se c'è)
  const pannelloAperto = document.querySelector("#footer-pannelli .collapse.show");
  if (pannelloAperto) {
    bootstrap.Collapse.getOrCreateInstance(pannelloAperto, { toggle: false }).hide();
  }
});

// Vai ai preferiti: se la lista è chiusa la riapro, poi scendo alla sezione
bottonePreferiti.addEventListener("click", () => {
  bootstrap.Collapse.getOrCreateInstance(contenitorePreferiti, { toggle: false }).show();
  portaA(titoloPreferiti);
});


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

// Esegue una ricerca: annulla quella precedente, mostra lo spinner, disegna i risultati
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

// ===== ULTIMI RISULTATI =====

// Premier League: con la chiave gratuita arriva 1 partita, il resto sono esempi
async function caricaRisultatiLega() {
  mostraMessaggio(contenitoreRisultatiLega, "Caricamento dei risultati…");

  let reali = [];
  try {
    reali = await caricaUltimiEventiLega(ID_PREMIER_LEAGUE);
  } catch (error) {
    console.error(error); // in caso di errore restano solo gli esempi
  }

  reali.sort((a, b) => (b.timestamp || b.data || "").localeCompare(a.timestamp || a.data || ""));
  risultatiLega = completaConEsempi(reali, "lega", "English Premier League");
  renderPartite(contenitoreRisultatiLega, risultatiLega);
}

// Preferite: Promise.allSettled come per gli appuntamenti, dal più recente
async function caricaRisultatiPreferite() {
  const versione = ++versioneRisultati;
  mostraMessaggio(contenitoreRisultatiPreferite, "Caricamento dei risultati…");

  const squadre = [...preferiti];
  const risultati = await Promise.allSettled(
    squadre.map((squadra) => caricaUltimiEventi(squadra.id))
  );

  if (versione !== versioneRisultati) return; // superato da un caricamento più recente

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

  const unici = eventi.filter(
    (evento, i) => eventi.findIndex((e) => e.id === evento.id) === i
  );
  unici.sort((a, b) => (b.timestamp || b.data || "").localeCompare(a.timestamp || a.data || ""));

  risultatiPreferite = completaConEsempi(unici, "preferite", "English Premier League");
  renderPartite(contenitoreRisultatiPreferite, risultatiPreferite, squadreFallite);
}

// ===== PREFERITI =====
// Aggiunge una squadra ai preferiti: salva, ridisegna, notifica e ricarica appuntamenti e risultati
function aggiungiPreferito(squadra, bottone) {
  const giaPresente = preferiti.some((p) => p.id === squadra.id);
  if (giaPresente) return;

  preferiti.push(squadra);
  salvaPreferiti(preferiti);
  mostraPreferiti();
  segnaPreferito(bottone, true, squadra.nome);
  mostraNotifica(`${squadra.nome} aggiunta ai preferiti`, "aggiunta");
  caricaAppuntamenti();
  caricaRisultatiPreferite();
}

// Toglie una squadra dai preferiti: salva, ridisegna, notifica e aggiorna il bottone stella
function rimuoviPreferito(squadra) {
  preferiti = preferiti.filter((p) => p.id !== squadra.id);
  salvaPreferiti(preferiti);
  mostraPreferiti();
  mostraNotifica(`${squadra.nome} rimossa dai preferiti`, "rimossa");
  caricaAppuntamenti();
  caricaRisultatiPreferite();

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

// La stessa gestione da tastiera vale per entrambe le liste di card
listaSquadre.addEventListener("keydown", attivaCardConTastiera);
listaPreferiti.addEventListener("keydown", attivaCardConTastiera);

// ===== MODAL DETTAGLI EVENTO =====
// Bootstrap apre la modal da solo (data-bs-toggle); qui la riempio prima che compaia
modaleEvento.addEventListener("show.bs.modal", (event) => {
  const bottone = event.relatedTarget; // il bottone dell'evento cliccato
  if (!bottone) return;

  const evento = [...eventiDettagli, ...appuntamenti, ...risultatiLega, ...risultatiPreferite].find(
    (e) => e.id === bottone.dataset.id
  );

  if (!evento) {
    titoloModale.textContent = "Dettagli evento";
    mostraMessaggio(corpoModale, "Dettagli dell'evento non disponibili.");
    return;
  }

  renderModaleEvento(titoloModale, corpoModale, evento);
});