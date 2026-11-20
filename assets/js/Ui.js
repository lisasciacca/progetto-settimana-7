const spinner = document.getElementById("spinner");
const alertErrore = document.getElementById("errore");

// Crea un elemento con classi e testo, senza innerHTML
export function creaElemento(tag, classi = "", testo = "") {
  const el = document.createElement(tag);
  if (classi) el.className = classi;
  if (testo) el.textContent = testo;
  return el;
}

// Crea uno <span> con un'emoji decorativa, nascosta agli screen reader
function creaIcona(emoji) {
  const icona = creaElemento("span", "", emoji);
  icona.setAttribute("aria-hidden", "true");
  return icona;
}

// ===== SPINNER =====
export function mostraSpinner() {
  spinner.classList.remove("d-none");
}

export function nascondiSpinner() {
  spinner.classList.add("d-none");
}

// ===== ERRORE =====
export function mostraErrore(messaggio) {
  alertErrore.textContent = messaggio;
  alertErrore.classList.remove("d-none");
}

export function nascondiErrore() {
  alertErrore.textContent = "";
  alertErrore.classList.add("d-none");
}

// ===== MESSAGGI (stato vuoto) =====
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
    bottone.replaceChildren(creaIcona("★"), " Già nei preferiti");
    bottone.setAttribute("aria-label", `${nome} è già nei preferiti`);
  } else {
    bottone.replaceChildren(creaIcona("☆"), " Aggiungi ai preferiti");
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
  bottone.append(creaIcona("🗑"), " Rimuovi");

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

// Una voce di lista: bottone che apre la modal di Bootstrap con i dettagli
function creaVoceEvento(evento) {
  const voce = document.createElement("li");

  const bottone = creaElemento("button", "btn-evento");
  bottone.type = "button";
  bottone.dataset.id = evento.id;
  bottone.dataset.bsToggle = "modal"; // → data-bs-toggle="modal"
  bottone.dataset.bsTarget = "#modale-evento"; // → data-bs-target="#modale-evento"
  bottone.setAttribute("aria-haspopup", "dialog");

  const data = creaElemento("span", "data-evento", evento.dataFormattata());
  const partita = creaElemento(
    "span",
    "nome-evento",
    `${evento.casa} vs ${evento.trasferta}`
  );
  bottone.append(data, partita);

  const punteggio = evento.punteggio();
  if (punteggio) {
    bottone.append(creaElemento("span", "badge bg-success ms-2", punteggio));
  }

  voce.append(bottone);
  return voce;
}

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
  eventi.forEach((evento) => lista.append(creaVoceEvento(evento)));
  contenitore.append(lista);
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

export function renderModaleEvento(titolo, corpo, evento) {
  titolo.textContent = evento.nomeEvento || `${evento.casa} vs ${evento.trasferta}`;
  corpo.replaceChildren();

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