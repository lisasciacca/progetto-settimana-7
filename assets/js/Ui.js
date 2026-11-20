const spinner = document.getElementById("spinner");
const alertErrore = document.getElementById("errore");

// Crea un elemento con classi e testo, senza innerHTML
export function creaElemento(tag, classi = "", testo = "") {
  const el = document.createElement(tag);
  if (classi) el.className = classi;
  if (testo) el.textContent = testo;
  return el;
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

// ===== CARD SQUADRA =====
function creaCardSquadra(squadra) {
  const card = creaElemento("article", "card-squadra");
  card.dataset.id = squadra.id;
  card.tabIndex = 0; // raggiungibile con Tab
  card.setAttribute("role", "button"); // annunciata come cliccabile

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

export function renderSquadre(contenitore, squadre) {
  contenitore.replaceChildren(); // svuota senza innerHTML

  if (squadre.length === 0) {
    contenitore.append(
      creaElemento("p", "nessun-risultato", "Nessuna squadra trovata")
    );
    return;
  }

  squadre.forEach((squadra) => {
    contenitore.append(creaCardSquadra(squadra));
  });
}

// ===== DETTAGLI SQUADRA =====
function creaListaEventi(titolo, eventi, messaggioVuoto) {
  const colonna = creaElemento("div", "col-12 col-md-6");
  const intestazione = creaElemento("h4", "titolo-eventi", titolo);
  const lista = creaElemento("ul", "lista-eventi list-unstyled mb-0");

  if (eventi.length === 0) {
    lista.append(creaElemento("li", "nessun-evento", messaggioVuoto));
  } else {
    eventi.forEach((evento) => {
      const voce = document.createElement("li");

      const data = creaElemento("span", "data-evento", evento.dataFormattata());
      const partita = creaElemento(
        "span",
        "nome-evento",
        `${evento.casa} vs ${evento.trasferta}`
      );
      voce.append(data, partita);

      const punteggio = evento.punteggio();
      if (punteggio) {
        voce.append(creaElemento("span", "badge bg-success ms-2", punteggio));
      }

      lista.append(voce);
    });
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