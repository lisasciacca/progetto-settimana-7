// Rappresenta una partita (futura o già giocata)
export class Evento {
  constructor(dati) {
    this.id = dati.idEvent;
    this.data = dati.dateEvent; // es. "2026-05-17"
    this.casa = dati.strHomeTeam;
    this.trasferta = dati.strAwayTeam;
    this.punteggioCasa = dati.intHomeScore; // stringa o null
    this.punteggioTrasferta = dati.intAwayScore; // stringa o null
  }

  // "2026-05-17" → "17/05/2026"
  dataFormattata() {
    if (!this.data) return "Data non disponibile";

    const formattatore = new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    // "T00:00:00" → la data viene letta nell'ora locale, non in UTC
    return formattatore.format(new Date(this.data + "T00:00:00"));
  }

  // "3 – 1", oppure "" se la partita non è ancora stata giocata
  punteggio() {
    if (this.punteggioCasa === null || this.punteggioTrasferta === null) {
      return "";
    }
    return `${this.punteggioCasa} – ${this.punteggioTrasferta}`;
  }
}