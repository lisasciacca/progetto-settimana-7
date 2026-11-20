// Rappresenta una squadra: traduce i dati grezzi dell'API in proprietà nostre
export class Squadra {
  constructor(dati) {
    this.id = dati.idTeam;
    this.nome = dati.strTeam;
    this.logo = dati.strBadge;
    this.lega = dati.strLeague ?? "—"; // se null/undefined → trattino
    this.paese = dati.strCountry ?? "—";
    this.sport = dati.strSport; // usato dal filtro per sport

    // Informazioni per la modal della squadra
    this.nomeAlternativo = dati.strTeamAlternate;
    this.sigla = dati.strTeamShort;
    this.annoFondazione = dati.intFormedYear;
    this.stadio = dati.strStadium;
    this.localita = dati.strLocation;
    this.banner = dati.strBanner;

    // Descrizione in italiano; se manca (null o "") quella in inglese
    this.descrizione = dati.strDescriptionIT || dati.strDescriptionEN;

    // Tutte le competizioni, senza quelle vuote
    this.competizioni = [
      dati.strLeague,
      dati.strLeague2,
      dati.strLeague3,
      dati.strLeague4,
      dati.strLeague5,
      dati.strLeague6,
      dati.strLeague7,
    ].filter(Boolean);

    // Colori sociali (es. "#EF0107"), senza quelli vuoti
    this.colori = [dati.strColour1, dati.strColour2, dati.strColour3].filter(Boolean);

    // Sito e social
    this.sito = dati.strWebsite;
    this.facebook = dati.strFacebook;
    this.twitter = dati.strTwitter;
    this.instagram = dati.strInstagram;
    this.youtube = dati.strYoutube;
  }
}