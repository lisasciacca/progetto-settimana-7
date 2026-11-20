// Rappresenta una squadra: traduce i dati grezzi dell'API in proprietà nostre
export class Squadra {
  constructor(dati) {
    this.id = dati.idTeam;
    this.nome = dati.strTeam;
    this.logo = dati.strBadge;
    this.lega = dati.strLeague ?? "—"; // se null/undefined → trattino
    this.paese = dati.strCountry ?? "—";
    this.sport = dati.strSport; // utile per il filtro della versione avanzata
  }
}