// Rappresenta una partita (futura o già giocata)
export class Evento {
  // Traduzione dei codici di stato dell'API
  static STATI = {
    NS: "Non ancora iniziata",
    FT: "Terminata",
    AET: "Terminata ai tempi supplementari",
    PEN: "Terminata ai rigori",
    PST: "Rinviata",
    CANC: "Annullata",
  };

  constructor(dati) {
    this.id = dati.idEvent;
    this.nomeEvento = dati.strEvent;
    this.data = dati.dateEvent; // es. "2026-05-17"
    this.timestamp = dati.strTimestamp; // es. "2026-11-22T16:30:00" (UTC)
    this.casa = dati.strHomeTeam;
    this.trasferta = dati.strAwayTeam;
    this.punteggioCasa = dati.intHomeScore; // stringa o null
    this.punteggioTrasferta = dati.intAwayScore; // stringa o null
    this.logoCasa = dati.strHomeTeamBadge;
    this.logoTrasferta = dati.strAwayTeamBadge;
    this.lega = dati.strLeague;
    this.stagione = dati.strSeason;
    this.giornata = dati.intRound;
    this.stadio = dati.strVenue;
    this.citta = dati.strCity;
    this.paese = dati.strCountry;
    this.stato = dati.strStatus; // es. "NS", "FT"
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

  // "2026-11-22T16:30:00" (UTC) → "17:30" (ora italiana)
  oraFormattata() {
    if (!this.timestamp) return "";

    const data = new Date(this.timestamp + "Z"); // "Z" = orario UTC
    if (Number.isNaN(data.getTime())) return ""; // data non valida

    const formattatore = new Intl.DateTimeFormat("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return formattatore.format(data);
  }

  // "NS" → "Non ancora iniziata"; codici sconosciuti restano come sono
  statoLeggibile() {
    if (!this.stato) return "";
    return Evento.STATI[this.stato] || this.stato;
  }

  // "3 – 1", oppure "" se la partita non è ancora stata giocata
  punteggio() {
    if (this.punteggioCasa === null || this.punteggioTrasferta === null) {
      return "";
    }
    return `${this.punteggioCasa} - ${this.punteggioTrasferta}`;
  }
}