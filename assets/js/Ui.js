// =====================================================================
// ui.js – Creazione degli elementi nel DOM
// Disegna card, liste, modal, notifiche e messaggi. Non fa mai fetch.
// Tutto con createElement e textContent: in tutto il progetto niente innerHTML.
// =====================================================================

// Elementi fissi della pagina usati da più funzioni
const spinner = document.getElementById("spinner");
const alertErrore = document.getElementById("errore");
const notifica = document.getElementById("notifica");
const testoNotifica = document.getElementById("testo-notifica");

// Crea un elemento con classi e testo, senza innerHTML
export function creaElemento(tag, classi = "", testo = "") {
  const el = document.createElement(tag);
  if (classi) el.className = classi;
  if (testo) el.textContent = testo;
  return el;
}

// Crea un'icona di Bootstrap Icons (es. "star" → <i class="bi bi-star">),
// decorativa e quindi nascosta agli screen reader
function creaIcona(nome) {
  const icona = creaElemento("i", `bi bi-${nome}`);
  icona.setAttribute("aria-hidden", "true");
  return icona;
}

// ===== SPINNER =====
// Mostra lo spinner di caricamento (toglie la classe d-none di Bootstrap)
export function mostraSpinner() {
  spinner.classList.remove("d-none");
}

// Nasconde lo spinner (rimette d-none)
export function nascondiSpinner() {
  spinner.classList.add("d-none");
}

// ===== ERRORE =====
// Mostra l'alert rosso con il messaggio d'errore
export function mostraErrore(messaggio) {
  alertErrore.textContent = messaggio;
  alertErrore.classList.remove("d-none");
}

// Svuota e nasconde l'alert d'errore
export function nascondiErrore() {
  alertErrore.textContent = "";
  alertErrore.classList.add("d-none");
}

// ===== BARRA DI NAVIGAZIONE =====

// Icona e etichetta del bottone tema: indica il tema che si attiverà al click
export function aggiornaBottoneTema(bottone, tema) {
  const scuro = tema === "dark";
  const etichetta = scuro ? "Attiva il tema chiaro" : "Attiva il tema scuro";

  bottone.replaceChildren(creaIcona(scuro ? "sun" : "moon-stars"));
  bottone.setAttribute("aria-label", etichetta);
  bottone.title = etichetta; // suggerimento al passaggio del mouse
}

// Stato del bottone on/off della modalità semplificata
export function aggiornaBottoneSemplificata(bottone, attiva) {
  bottone.setAttribute("aria-pressed", attiva ? "true" : "false");
}

// Numero di squadre salvate nel badge del bottone "Preferiti"
export function aggiornaContatorePreferiti(bottone, contatore, numero) {
  contatore.textContent = numero;

  const salvate = numero === 1 ? "1 salvata" : `${numero} salvate`;
  bottone.setAttribute("aria-label", `Vai alle squadre preferite (${salvate})`);
}

// ===== NOTIFICA (toast Bootstrap) =====
// tipo: "aggiunta" oppure "rimossa"
export function mostraNotifica(testo, tipo) {
  const aggiunta = tipo === "aggiunta";

  testoNotifica.replaceChildren(creaIcona(aggiunta ? "star-fill" : "trash3"), ` ${testo}`);
  notifica.classList.toggle("notifica-aggiunta", aggiunta);
  notifica.classList.toggle("notifica-rimossa", !aggiunta);

  bootstrap.Toast.getOrCreateInstance(notifica).show(); // API JS di Bootstrap
}

// ===== MESSAGGI (stato vuoto) =====
// Sostituisce il contenuto di un contenitore con un messaggio (es. "Nessuna squadra trovata")
export function mostraMessaggio(contenitore, testo) {
  contenitore.replaceChildren(creaElemento("p", "nessun-risultato mb-0", testo));
}

// ===== CARD SQUADRA =====

// Parte comune: logo, nome, lega, paese
function creaCardBase(squadra) {
  const card = creaElemento("article", "card-squadra");
  card.dataset.id = squadra.id;
  card.tabIndex = 0; // raggiungibile con Tab, si apre con Invio

  if (squadra.logo) {
    const logo = document.createElement("img");
    logo.src = squadra.logo;
    logo.alt = `Logo ${squadra.nome}`;
    card.append(logo);
  }

  const nome = creaElemento("h3", "", squadra.nome);
  const lega = creaElemento("p", "", squadra.lega);
  const paese = creaElemento("p", "", squadra.paese);

  card.append(nome, lega, paese);
  return card;
}

// Aggiorna testo e stato del bottone stella
export function segnaPreferito(bottone, inPreferiti, nome) {
  if (inPreferiti) {
    bottone.replaceChildren(creaIcona("star-fill"), " Già nei preferiti");
    bottone.setAttribute("aria-label", `${nome} è già nei preferiti`);
  } else {
    bottone.replaceChildren(creaIcona("star"), " Aggiungi ai preferiti");
    bottone.setAttribute("aria-label", `Aggiungi ${nome} ai preferiti`);
  }
  bottone.disabled = inPreferiti; // già nei preferiti → non cliccabile
}

// Card dei risultati: base + bottone stella
function creaCardRisultato(squadra, inPreferiti) {
  const card = creaCardBase(squadra);

  const bottone = creaElemento("button", "btn btn-preferito");
  bottone.type = "button";
  segnaPreferito(bottone, inPreferiti, squadra.nome);

  card.append(bottone);
  return card;
}

// Card dei preferiti: base + bottone rimuovi
function creaCardPreferita(squadra) {
  const card = creaCardBase(squadra);

  const bottone = creaElemento("button", "btn btn-rimuovi");
  bottone.type = "button";
  bottone.setAttribute("aria-label", `Rimuovi ${squadra.nome} dai preferiti`);
  bottone.append(creaIcona("trash3"), " Rimuovi");

  card.append(bottone);
  return card;
}

// Disegna le card delle squadre trovate (i messaggi di lista vuota li gestisce main.js)
export function renderSquadre(contenitore, squadre, preferiti) {
  contenitore.replaceChildren(); // svuota senza innerHTML

  squadre.forEach((squadra) => {
    const inPreferiti = preferiti.some((p) => p.id === squadra.id);
    contenitore.append(creaCardRisultato(squadra, inPreferiti));
  });
}

// Disegna le card delle squadre preferite, oppure il messaggio di lista vuota
export function renderPreferiti(contenitore, preferiti) {
  if (preferiti.length === 0) {
    mostraMessaggio(
      contenitore,
      "Non hai ancora salvato nessuna squadra. Cercane una qui sopra e aggiungila ai preferiti."
    );
    return;
  }

  contenitore.replaceChildren();

  preferiti.forEach((squadra) => {
    contenitore.append(creaCardPreferita(squadra));
  });
}

// ===== EVENTI =====

// Una voce di lista: bottone che apre la modal di Bootstrap con i dettagli.
// conLuogo = true (appuntamenti): ora accanto alla data, stadio e paese a destra
function creaVoceEvento(evento, conLuogo = false) {
  const voce = document.createElement("li");

  const bottone = creaElemento("button", "btn-evento");
  bottone.type = "button";
  bottone.dataset.id = evento.id;
  bottone.dataset.bsToggle = "modal"; // → data-bs-toggle="modal"
  bottone.dataset.bsTarget = "#modale-evento"; // → data-bs-target="#modale-evento"
  bottone.setAttribute("aria-haspopup", "dialog");

  // Data, con l'ora accanto se richiesta e disponibile
  let testoData = evento.dataFormattata();
  const ora = evento.oraFormattata();
  if (conLuogo && ora) {
    testoData += `, ore ${ora}`;
  }

  const data = creaElemento("span", "data-evento", testoData);
  const partita = creaElemento(
    "span",
    "nome-evento",
    `${evento.casa} vs ${evento.trasferta}`
  );

  const punteggio = evento.punteggio();
  const badge = punteggio ? creaElemento("span", "badge bg-success ms-2", punteggio) : null;

  if (!conLuogo) {
    // Versione semplice (dettagli squadra): come prima
    bottone.append(data, partita);
    if (badge) bottone.append(badge);
    voce.append(bottone);
    return voce;
  }

  // Versione appuntamenti: sinistra (data e partita) + destra (luogo)
  bottone.classList.add("evento-con-luogo");

  const sinistra = document.createElement("span");
  sinistra.append(data, partita);
  if (badge) sinistra.append(badge);
  bottone.append(sinistra);

  // Stadio e paese, solo quelli presenti
  const luogo = [evento.stadio, evento.paese].filter(Boolean).join(", ");
  if (luogo) {
    const destra = creaElemento("span", "luogo-evento");
    destra.append(creaIcona("geo-alt"), ` ${luogo}`);
    bottone.append(destra);
  }

  voce.append(bottone);
  return voce;
}

// Una colonna della card dettagli: titolo + lista di eventi (o messaggio se vuota)
function creaListaEventi(titolo, eventi, messaggioVuoto) {
  const colonna = creaElemento("div", "col-12 col-md-6");
  const intestazione = creaElemento("h4", "titolo-eventi", titolo);
  const lista = creaElemento("ul", "lista-eventi list-unstyled mb-0");

  if (eventi.length === 0) {
    lista.append(creaElemento("li", "nessun-evento", messaggioVuoto));
  } else {
    eventi.forEach((evento) => lista.append(creaVoceEvento(evento)));
  }

  colonna.append(intestazione, lista);
  return colonna;
}

// Card dei dettagli squadra: nome + due colonne (prossimi eventi, ultimi risultati)
export function renderDettagli(contenitore, squadra, prossimi, ultimi) {
  contenitore.replaceChildren();

  const card = creaElemento("article", "card-risultato");
  const titolo = creaElemento("h3", "", squadra.nome);
  const riga = creaElemento("div", "row g-4");

  riga.append(
    creaListaEventi("Prossimi eventi", prossimi, "Nessun evento in programma"),
    creaListaEventi("Ultimi risultati", ultimi, "Nessun risultato disponibile")
  );

  card.append(titolo, riga);
  contenitore.append(card);
}

// ===== APPUNTAMENTI DEI PREFERITI =====
export function renderAppuntamenti(contenitore, eventi, squadreFallite) {
  contenitore.replaceChildren();

  // Avviso per le squadre che non è stato possibile caricare
  if (squadreFallite.length > 0) {
    contenitore.append(
      creaElemento(
        "p",
        "alert alert-warning py-2 small",
        `Non è stato possibile caricare gli appuntamenti di: ${squadreFallite.join(", ")}.`
      )
    );
  }

  if (eventi.length === 0) {
    contenitore.append(
      creaElemento(
        "p",
        "nessun-risultato mb-0",
        "Nessun appuntamento in programma per le tue squadre."
      )
    );
    return;
  }

  const lista = creaElemento("ul", "lista-eventi list-unstyled mb-0");
  eventi.forEach((evento) => lista.append(creaVoceEvento(evento, true))); // con ora e luogo
  contenitore.append(lista);
}

// ===== GRIGLIA DI PARTITE (ultimi risultati) =====

// Iniziali per lo stemma segnaposto: "Northbridge Rovers" → "NR"
function iniziali(nome) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parola) => parola[0].toUpperCase())
    .join("");
}

// Una squadra nella card: logo (o stemma con le iniziali) e, sotto, il nome
function creaSquadraPartita(nome, logo) {
  const blocco = creaElemento("span", "card-partita-squadra");

  if (logo) {
    const img = document.createElement("img");
    img.src = logo;
    img.alt = ""; // decorativo: il nome è scritto subito sotto
    img.className = "card-partita-logo";
    blocco.append(img);
  } else {
    // Squadre di esempio o senza logo: cerchio con le iniziali
    const stemma = creaElemento("span", "card-partita-stemma", iniziali(nome));
    stemma.setAttribute("aria-hidden", "true");
    blocco.append(stemma);
  }

  blocco.append(creaElemento("span", "card-partita-nome", nome));
  return blocco;
}

// Una card partita: bottone che apre la modal dell'evento
function creaCardPartita(evento) {
  const voce = creaElemento("li", "voce-partita"); // larghezza: 1/3 su PC, 1/2 tablet, intera su mobile

  const card = creaElemento("button", "card-partita");
  card.type = "button";
  card.dataset.id = evento.id;
  card.dataset.bsToggle = "modal";
  card.dataset.bsTarget = "#modale-evento";
  card.setAttribute("aria-haspopup", "dialog");

  // Testa: campionato + eventuale badge "Esempio"
  const testa = creaElemento("span", "card-partita-testa");
  testa.append(creaElemento("span", "card-partita-lega", evento.lega || ""));
  if (evento.esempio) {
    testa.append(creaElemento("span", "badge text-bg-warning", "Esempio"));
  }

  // Tabellone: casa – punteggio (o "vs") – trasferta
  const tabellone = creaElemento("span", "card-partita-tabellone");
  tabellone.append(
    creaSquadraPartita(evento.casa, evento.logoCasa),
    creaElemento("span", "card-partita-punteggio", evento.punteggio() || "vs"),
    creaSquadraPartita(evento.trasferta, evento.logoTrasferta)
  );

  // Piede: data, ora e luogo
  const ora = evento.oraFormattata();
  const quando = ora ? `${evento.dataFormattata()}, ore ${ora}` : evento.dataFormattata();
  const piede = creaElemento("span", "card-partita-piede");
  piede.append(creaElemento("span", "d-block", quando));

  const luogo = [evento.stadio, evento.paese].filter(Boolean).join(", ");
  if (luogo) {
    const riga = creaElemento("span", "d-block");
    riga.append(creaIcona("geo-alt"), ` ${luogo}`);
    piede.append(riga);
  }

  card.append(testa, tabellone, piede);
  voce.append(card);
  return voce;
}

// Bottone freccia della striscia (‹ o ›)
function creaFreccia(direzione, idLista) {
  const precedente = direzione === "precedente";

  const bottone = creaElemento("button", "btn btn-sm btn-barra carosello-freccia");
  bottone.type = "button";
  bottone.setAttribute("aria-controls", idLista);
  bottone.setAttribute(
    "aria-label",
    precedente ? "Mostra le partite precedenti" : "Mostra le partite successive"
  );
  bottone.append(creaIcona(precedente ? "chevron-left" : "chevron-right"));
  return bottone;
}

// Striscia di partite scorrevole con frecce, nota sui segnaposto e avviso per le squadre fallite
export function renderPartite(contenitore, eventi, squadreFallite = []) {
  contenitore.replaceChildren();

  if (squadreFallite.length > 0) {
    contenitore.append(
      creaElemento(
        "p",
        "alert alert-warning py-2 small",
        `Non è stato possibile caricare i risultati di: ${squadreFallite.join(", ")}.`
      )
    );
  }

  // Riga in alto: nota sugli esempi a sinistra, frecce a destra
  const barra = creaElemento("div", "carosello-barra");

  const nota = eventi.some((evento) => evento.esempio)
    ? "Le partite segnate come Esempio sono segnaposto: squadre reali, ma risultati inventati."
    : "";
  barra.append(creaElemento("p", "nota-esempio", nota));

  const idLista = `${contenitore.id}-lista`; // es. "risultati-lega-lista"
  const precedente = creaFreccia("precedente", idLista);
  const successiva = creaFreccia("successiva", idLista);

  const frecce = creaElemento("div", "d-flex gap-2");
  frecce.append(precedente, successiva);
  barra.append(frecce);

  // La striscia
  const lista = creaElemento("ul", "lista-partite");
  lista.id = idLista;
  eventi.forEach((evento) => lista.append(creaCardPartita(evento)));

  contenitore.append(barra, lista);

  // Frecce disattivate all'inizio e alla fine della striscia
  function aggiornaFrecce() {
    const fine = lista.scrollWidth - lista.clientWidth;
    precedente.disabled = lista.scrollLeft <= 0;
    successiva.disabled = lista.scrollLeft >= fine - 1; // -1: margine per gli arrotondamenti
  }

  // Scorre di una "pagina" (la larghezza visibile): 3 card su PC, 2 su tablet
  function scorri(verso) {
    const fermo =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.hasAttribute("data-semplificata");

    lista.scrollBy({
      left: verso * lista.clientWidth,
      behavior: fermo ? "auto" : "smooth",
    });
  }

  precedente.addEventListener("click", () => scorri(-1));
  successiva.addEventListener("click", () => scorri(1));
  lista.addEventListener("scroll", aggiornaFrecce);
  aggiornaFrecce();
}

// ===== MODAL DETTAGLI EVENTO =====

// Una squadra nel "tabellone": logo + nome
function creaSquadraTabellone(nome, logo) {
  const blocco = creaElemento("div", "tabellone-squadra");

  if (logo) {
    const img = document.createElement("img");
    img.src = logo;
    img.alt = `Logo ${nome}`;
    img.className = "tabellone-logo";
    blocco.append(img);
  }

  blocco.append(creaElemento("p", "tabellone-nome", nome));
  return blocco;
}

// Aggiunge una riga "etichetta: valore" al <dl>, solo se il valore esiste
function aggiungiDato(elenco, etichetta, valore) {
  if (!valore) return;

  const dt = creaElemento("dt", "col-5", etichetta);
  const dd = creaElemento("dd", "col-7", valore);
  elenco.append(dt, dd);
}

// Riempie la modal dell'evento: eventuale avviso "esempio", tabellone e dati in un <dl>
export function renderModaleEvento(titolo, corpo, evento) {
  titolo.textContent = evento.nomeEvento || `${evento.casa} vs ${evento.trasferta}`;
  corpo.replaceChildren();

  // Partita segnaposto: lo dico chiaramente
  if (evento.esempio) {
    corpo.append(
      creaElemento("p", "alert alert-warning py-2 small", "Partita di esempio: non è una partita reale.")
    );
  }

  // Tabellone: casa – punteggio (o "vs") – trasferta
  const tabellone = creaElemento("div", "tabellone");
  tabellone.append(
    creaSquadraTabellone(evento.casa, evento.logoCasa),
    creaElemento("p", "tabellone-punteggio", evento.punteggio() || "vs"),
    creaSquadraTabellone(evento.trasferta, evento.logoTrasferta)
  );
  corpo.append(tabellone);

  // Elenco dei dati
  const elenco = creaElemento("dl", "row mb-0");
  aggiungiDato(elenco, "Competizione", evento.lega);
  aggiungiDato(elenco, "Stagione", evento.stagione);
  aggiungiDato(elenco, "Giornata", evento.giornata);
  aggiungiDato(elenco, "Data", evento.dataFormattata());
  aggiungiDato(elenco, "Ora", evento.oraFormattata());
  aggiungiDato(elenco, "Stadio", evento.stadio);
  aggiungiDato(elenco, "Città", evento.citta);
  aggiungiDato(elenco, "Paese", evento.paese);
  aggiungiDato(elenco, "Stato", evento.statoLeggibile());
  corpo.append(elenco);
}

// ===== MODAL INFO SQUADRA =====

// Nomi degli sport in italiano
const NOMI_SPORT = {
  Soccer: "Calcio",
  Basketball: "Basket",
  "American Football": "Football americano",
};

// Titolo di una parte della modal (es. "Storia")
function creaTitoloSezioneModale(testo) {
  return creaElemento("h3", "titolo-sezione-modale", testo);
}

// Link esterno sicuro: aggiunge https:// se manca e si apre in una nuova scheda
function creaLinkEsterno(url, testo) {
  const indirizzo = url.startsWith("http") ? url : `https://${url}`;

  const link = creaElemento("a", "link-squadra", testo);
  link.href = indirizzo;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.append(creaElemento("span", "visually-hidden", " (si apre in una nuova scheda)"));
  return link;
}

// Riempie la modal della squadra: banner, intestazione, dati, colori, storia e link
export function renderModaleSquadra(titolo, corpo, squadra) {
  titolo.textContent = squadra.nome;
  corpo.replaceChildren();

  // 1. Banner, se c'è
  if (squadra.banner) {
    const banner = document.createElement("img");
    banner.src = squadra.banner;
    banner.alt = `Banner ${squadra.nome}`;
    banner.className = "img-fluid rounded mb-3";
    corpo.append(banner);
  }

  // 2. Intestazione: logo, nome completo, sigla
  const intestazione = creaElemento("div", "intestazione-squadra");

  if (squadra.logo) {
    const logo = document.createElement("img");
    logo.src = squadra.logo;
    logo.alt = `Logo ${squadra.nome}`;
    logo.className = "logo-modale";
    intestazione.append(logo);
  }

  const testi = document.createElement("div");
  testi.append(creaElemento("p", "nome-squadra-modale", squadra.nomeAlternativo || squadra.nome));
  if (squadra.sigla) {
    testi.append(creaElemento("span", "badge badge-sigla", squadra.sigla));
  }
  intestazione.append(testi);
  corpo.append(intestazione);

  // 3. Dati principali
  const elenco = creaElemento("dl", "row mb-0");
  aggiungiDato(elenco, "Sport", NOMI_SPORT[squadra.sport] || squadra.sport);
  aggiungiDato(elenco, "Campionato", squadra.lega);
  aggiungiDato(elenco, "Paese", squadra.paese);
  aggiungiDato(elenco, "Fondazione", squadra.annoFondazione);
  aggiungiDato(elenco, "Stadio", squadra.stadio);
  aggiungiDato(elenco, "Località", squadra.localita);

  const competizioni = squadra.competizioni || []; // i preferiti vecchi non ce l'hanno
  if (competizioni.length > 0) {
    aggiungiDato(elenco, "Competizioni", competizioni.join(", "));
  }
  corpo.append(elenco);

  // 4. Colori sociali
  const colori = squadra.colori || [];
  if (colori.length > 0) {
    corpo.append(creaTitoloSezioneModale("Colori sociali"));

    const riga = creaElemento("div", "colori-squadra");
    colori.forEach((colore) => {
      const pallino = creaElemento("span", "colore-sociale");
      pallino.style.backgroundColor = colore;
      pallino.title = colore;
      pallino.setAttribute("role", "img");
      pallino.setAttribute("aria-label", `Colore ${colore}`);
      riga.append(pallino);
    });
    corpo.append(riga);
  }

  // 5. Storia
  if (squadra.descrizione) {
    corpo.append(
      creaTitoloSezioneModale("Storia"),
      creaElemento("p", "descrizione-squadra", squadra.descrizione)
    );
  }

  // 6. Sito e social
  const link = [
    { url: squadra.sito, testo: "Sito ufficiale" },
    { url: squadra.facebook, testo: "Facebook" },
    { url: squadra.twitter, testo: "X (Twitter)" },
    { url: squadra.instagram, testo: "Instagram" },
    { url: squadra.youtube, testo: "YouTube" },
  ].filter((voce) => voce.url); // solo quelli presenti

  if (link.length > 0) {
    corpo.append(creaTitoloSezioneModale("Link ufficiali"));

    const lista = creaElemento("ul", "lista-link list-unstyled mb-0");
    link.forEach((voce) => {
      const elemento = document.createElement("li");
      elemento.append(creaLinkEsterno(voce.url, voce.testo));
      lista.append(elemento);
    });
    corpo.append(lista);
  }
}