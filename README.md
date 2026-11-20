# SPORTSHUB - Web app di ricerca squadre

Questa repository contiene il codice sorgente di **SportsHub**, una web app che permette di cercare una squadra sportiva e di consultarne i prossimi eventi e gli ultimi risultati, salvare le proprie squadre preferite e vederne i prossimi appuntamenti. I dati arrivano in tempo reale dall'API pubblica di **TheSportsDB**. Il progetto è stato sviluppato come progetto d'esame del corso di Web Development.

---

> **Stato del progetto:** in sviluppo, versione base completata e funzionalità avanzate in corso. Questo file viene aggiornato a mano a mano che il progetto viene realizzato.

## Indice

- [Funzionalità](#funzionalità)
- [Tecnologie Utilizzate](#tecnologie-utilizzate)
- [Come Eseguire il Progetto Locale](#come-eseguire-il-progetto-locale)
- [Struttura del progetto](#struttura-del-progetto)
- [Architettura, Responsive Design e Media Query](#architettura-responsive-design-e-media-query)
- [Albero del DOM](#albero-del-dom)
- [Validazione del campo di ricerca](#validazione-del-campo-di-ricerca)
- [Come funziona](#come-funziona)
- [Aspetto grafico](#aspetto-grafico)
- [Extra e dettagli](#extra-e-dettagli)
- [Accessibilità](#accessibilità)
- [Convenzioni di codice](#convenzioni-di-codice)
- [Aggiornamenti](#aggiornamenti)
- [Crediti](#crediti)
- [Realizzato da](#realizzato-da)

### Funzionalità

L'applicazione offre un'interfaccia pulita e responsive, strutturata con Bootstrap 5 e resa dinamica con JavaScript nativo diviso in moduli ES:

- **Ricerca squadre**: Al submit del form viene inviata una richiesta GET all'endpoint `searchteams.php`. L'URL è costruito con `new URL()` e `searchParams.set("t", query)`. Le squadre trovate vengono mostrate come card con logo, nome, campionato e paese.
- **Gestione dello stato di caricamento**: Durante ogni richiesta compare uno spinner Bootstrap. In caso di errore di rete o di risposta non valida (`response.ok` falso) viene mostrato un alert rosso.
- **Nessun risultato**: Se l'API restituisce `teams: null`, al posto delle card compare il messaggio "Nessuna squadra trovata".
- **Dettagli squadra**: Al click su una card vengono caricati **in parallelo** con `Promise.all` i prossimi eventi (`eventsnext.php`) e gli ultimi risultati (`eventslast.php`). I due elenchi vengono mostrati affiancati in una card dedicata.
- **Eventi formattati**: Ogni evento mostra la data in formato italiano, la partita "casa vs trasferta" e, se la partita è già stata giocata, il punteggio in un badge verde.
- **Modellazione dei dati con le classi**: I dati grezzi dell'API vengono trasformati in istanze delle classi `Squadra` ed `Evento`, così il resto dell'app usa nomi di proprietà chiari e indipendenti dall'API.
- **Ricerca automatica (debounce)**: La ricerca parte da sola dopo 400ms di pausa nella digitazione. Con `AbortController` la richiesta precedente ancora in corso viene annullata.
- **Squadre preferite**: Bottone "Aggiungi ai preferiti" (con icona a stella) su ogni card. I preferiti vengono salvati in `localStorage` e restano anche dopo il refresh. Il bottone "Rimuovi" toglie una squadra, e il click su una preferita apre i suoi dettagli senza rifare la ricerca. Ogni aggiunta o rimozione è confermata da una notifica. La lista è nascosta all'avvio e si apre con il bottone Mostra/Nascondi; il bottone Preferiti nella barra la apre, il logo la chiude.
- **I tuoi prossimi appuntamenti**: All'avvio vengono caricati in parallelo con `Promise.allSettled` i prossimi eventi di tutte le preferite. Una squadra che fallisce non blocca le altre, e gli eventi sono mostrati in un'unica lista ordinata per data, con l'ora accanto alla data e stadio e paese a destra.
- **Filtro per sport**: I bottoni Tutti / Calcio / Basket / Football filtrano le squadre trovate in base al campo `strSport`.
- **Modal dettagli evento**: Il click su un evento apre una modal Bootstrap con tabellone, competizione, stagione, giornata, data, ora, stadio, città, paese e stato.
- **Modal info squadra**: Il click su una card apre una modal Bootstrap con banner, logo, nome completo e sigla, sport, campionato, paese, anno di fondazione, stadio, località, competizioni, colori sociali, storia della squadra e link a sito e social. Chiudendola, la pagina scende alle liste degli eventi.
- **Barra di navigazione**: Barra fissa in alto con il bottone Preferiti, che porta alla sezione e mostra quante squadre sono salvate, e il bottone per alternare tema chiaro e scuro. La scelta del tema viene salvata in `localStorage`; alla prima visita il tema è sempre quello chiaro.
- **Footer**: I bottoni "About us" e "Accessibilità" aprono sotto il footer un breve pannello (uno alla volta), che si chiude cliccando fuori; all'apertura la pagina scende a mostrarlo. Copyright con l'anno aggiornato automaticamente.
- **Ultimi risultati – Premier League**: Le ultime partite del campionato inglese (`eventspastleague.php`), mostrate dalla più recente.
- **Ultimi risultati delle tue squadre**: Gli ultimi risultati di tutte le preferite, caricati in parallelo con `Promise.allSettled` e aggiornati quando cambiano i preferiti.
- **Striscia di partite con frecce**: Ogni sezione di risultati mostra 9 partite in una striscia scorrevole: 3 visibili su PC, 2 su tablet, 1 su mobile, con le frecce per scorrere. Ogni card è un piccolo tabellone con i loghi delle squadre. Quando l'API dà poche partite, la striscia è completata con partite di esempio, segnate dal badge "Esempio".
- **Modalità semplificata**: Un bottone nella barra attiva una versione pensata per chi ha difficoltà visive (testo più grande, contrasto alto, font più leggibile, niente animazioni). La scelta resta salvata.
- **Pallone dell'app**: In basso a destra un pallone entra rotolando all'apertura della pagina. Al passaggio del mouse mostra "Scarica la nostra app!", che apre una modal di invito a scaricare l'app; quando compare una notifica, il pallone si alza per non esserne coperto.

## Tecnologie Utilizzate

- **HTML5**: Strutturazione semantica dell'interfaccia (`header`, `nav`, `main`, `section`, `article`, `footer`) con attributi di accessibilità.
- **CSS3**: Styling personalizzato, variabili CSS (custom properties) per i due temi, Flexbox, `clamp()`, `linear-gradient`, `scroll-margin-top`, transizioni e media query `prefers-reduced-motion`.
- **Bootstrap 5.3.8**: Collegato tramite CDN. Usato per griglia, utility, form, navbar, spinner, alert, badge, modal, toast e collapse, e per il tema scuro con `data-bs-theme`.
  > **Perché la 5.3.8:** è l'ultima versione stabile riportata nella documentazione ufficiale di Bootstrap, ed è quella a cui puntano i link CDN ufficiali. La 5.3.9, usata in un progetto precedente, non è riportata nella documentazione ufficiale, quindi si è scelta la versione verificata. Tutte le versioni 5.3.x contengono solo correzioni di bug, quindi classi e componenti funzionano allo stesso modo.
- **Bootstrap Icons 1.13.2**: Collegata tramite CDN, per le icone a linea che sostituiscono le emoji.
- **Google Fonts**: Oswald per i titoli, Barlow per il testo e Atkinson Hyperlegible per la modalità semplificata.
- **JavaScript (ES6+)**: Moduli ES (`import` / `export`), classi, `fetch` con `async/await`, `try/catch/finally`, `Promise.all`, `Promise.allSettled`, `AbortController`, debounce con `setTimeout`, `localStorage` / `JSON`, campi `static`, `Intl.DateTimeFormat`, API JavaScript di Bootstrap (`bootstrap.Modal` e `bootstrap.Toast`), `scrollIntoView()`, `scrollBy()`, `matchMedia()`, `offsetHeight`, `style.setProperty()` e manipolazione del DOM senza `innerHTML`.
- **TheSportsDB API v1**: API REST pubblica con la chiave gratuita di test `123`.
- **Pexels**: Foto gratuite caricate tramite link: quella della hero (Kampus Production) e quella della modal dell'app (Ferid Faiqoglu).

> **Nota sui limiti della chiave gratuita:** con la chiave `123` la ricerca delle squadre è limitata, e gli endpoint degli eventi restituiscono un solo evento, solo per le partite in casa. Il limite è di 30 richieste al minuto, oltre il quale l'API risponde con status 429. Fonte: [documentazione ufficiale di TheSportsDB](https://www.thesportsdb.com/documentation).

## Come Eseguire il Progetto Locale

1. **Clona il repository**:
   ```bash
   git clone https://github.com/lisasciacca/progetto-settimana-7
   ```

2. **Apri l'applicazione con Live Server**:
   Il progetto usa i **moduli ES** (`<script type="module">`), quindi **non** può essere aperto con un doppio clic su `index.html`, perché il browser bloccherebbe i moduli con un errore CORS. Usa un server locale, per esempio l'estensione **Live Server** di VS Code: tasto destro su `index.html` → *Open with Live Server*.

---

## Struttura del progetto

```text
.
├── assets/
│   ├── css/
│   │   └── style.css      stile personalizzato
│   ├── img/               vuota: le immagini sono caricate da Pexels tramite link
│   └── js/
│       ├── main.js        punto di ingresso: eventi e coordinamento
│       ├── api.js         chiamate fetch verso TheSportsDB
│       ├── ui.js          creazione degli elementi nel DOM
│       ├── storage.js     salvataggio dei preferiti in localStorage
│       ├── tema.js        gestione del tema chiaro / scuro
│       ├── semplificata.js  modalità semplificata (accessibilità)
│       ├── segnaposto.js  partite di esempio per completare i risultati
│       ├── Squadra.js     class Squadra
│       └── Evento.js      class Evento
├── .gitignore
├── index.html             struttura principale della web app
└── README.md              documentazione del progetto
```

---

## Architettura, Responsive Design e Media Query

L'architettura del progetto adotta un approccio **One-page** e **Mobile-First**. Il contenuto è centrato in un contenitore largo al massimo `1100px`. Le card delle squadre usano il **Flexbox** con `flex: 1 1 280px`: ogni card parte da 280px, cresce per riempire lo spazio libero e va a capo quando non c'è più posto. In questo modo il numero di card per riga si adatta da solo, senza bisogno di media query.

- **Mobile (<768px)**: Una card per riga. Nella card dei dettagli, "Prossimi eventi" e "Ultimi risultati" sono uno sotto l'altro (`col-12`).
- **Tablet (768px - 991px)**: Due card per riga, mentre l'ultima card dispari si allarga a tutta riga. I due elenchi dei dettagli sono affiancati (`col-md-6`).
- **Desktop (≥992px)**: Tre card per riga e due colonne nei dettagli.

I bottoni del filtro vanno a capo con `flex-wrap` sugli schermi stretti; la modal è centrata (`modal-dialog-centered`) e scorre al suo interno se il contenuto è lungo (`modal-dialog-scrollable`); la modal della squadra è più larga (`modal-lg`) per ospitare la descrizione.

La barra di navigazione resta in alto (`sticky-top`); `scroll-margin-top` evita che copra i titoli quando la pagina ci scorre. Il footer è su una riga da tablet in su (`flex-md-row`) e su due righe centrate su mobile (`flex-column`).

La hero occupa tutta la larghezza con la foto come sfondo: da tablet in su il testo e la ricerca stanno a destra, su mobile sono centrati. Le sezioni di risultati sono strisce scorrevoli con una, due o tre card visibili. Il pallone dell'app è fisso in basso a destra.

Il titolo principale usa `clamp(2rem, 5vw, 2.5rem)` per ridursi in modo fluido sugli schermi piccoli. Il CSS usa le media query `min-width: 768px` (tablet) e `min-width: 992px` (PC) per hero, appuntamenti e strisce di partite, e `prefers-reduced-motion`, che disattiva le animazioni per chi ha attivato "riduci animazioni" nel sistema operativo.

---

## Albero del DOM

* **Intestazione (`<header class="barra sticky-top">`)**:
  * `<nav class="navbar">` con `aria-label="Navigazione principale"`: marchio `#link-marchio`, bottone `#btn-vai-preferiti` con il contatore `#contatore-preferiti`, bottone della modalità semplificata `#btn-semplificata` e bottone del tema `#btn-tema`.
* **Contenuto principale (`<main>`)**:
  * **Hero (`<section class="hero" aria-labelledby="titolo-hero">`)**:
    * Foto di sfondo e velo blu (in CSS), titolo `#titolo-hero`, sottotitolo e form di ricerca `#form-ricerca` con `role="search"`, input `#input-ricerca` (con label nascosta `visually-hidden`) e bottone "Cerca".
  * **Contenitore delle sezioni (`<div class="container contenitore">`)**:
    * **Sezione risultati (`<section aria-labelledby="titolo-risultati">`)**:
      * `#filtri-sport`: gruppo di bottoni del filtro per sport, con `role="group"`.
      * `#errore`: alert Bootstrap rosso con `role="alert"`, nascosto con `d-none`.
      * `#spinner`: spinner Bootstrap con testo nascosto "Caricamento...", nascosto con `d-none`.
      * `#lista-squadre`: contenitore delle card delle squadre trovate, popolato via JS. All'avvio mostra il messaggio "Inizia cercando una squadra qui sopra".
      * `#dettagli`: contenitore della card `.card-risultato` con i prossimi eventi e gli ultimi risultati, popolato via JS.
    * **Sezione ultimi risultati della Premier League (`<section aria-labelledby="titolo-risultati-lega">`)**:
      * `#risultati-lega`: nota sugli esempi, frecce e striscia di partite, popolati via JS.
    * **Sezione preferiti (`<section aria-labelledby="titolo-preferiti">`)**:
      * Titolo `#titolo-preferiti` e bottone Mostra/Nascondi; il collapse `#contenitore-preferiti` (chiuso all'avvio) contiene `#lista-preferiti`, con le card delle squadre salvate oppure il messaggio di lista vuota.
    * **Sezione appuntamenti (`<section aria-labelledby="titolo-appuntamenti">`)**:
      * Titolo `#titolo-appuntamenti` e card `#lista-appuntamenti` con i prossimi eventi delle preferite, ordinati per data e popolati via JS.
    * **Sezione ultimi risultati delle preferite (`<section aria-labelledby="titolo-risultati-preferite">`)**:
      * `#risultati-preferite`: striscia di partite con frecce, popolata via JS.
* **Piè di pagina (`<footer class="footer">`)**:
  * `<nav>` con i bottoni "About us" e "Accessibilità", il copyright con l'anno `#anno-corrente` e i pannelli `#footer-pannelli` (`#footer-about` e `#footer-accessibilita`, collapse a fisarmonica).
* **Pallone dell'app (`#palla-app`)**:
  * Bottone `#palla-app-bottone` con il pallone e la finestrella `#palla-app-finestra` con il bottone "Scarica la nostra app!".
* **Notifiche**:
  * `.toast-container` con il toast `#notifica` e il testo `#testo-notifica`, riempito via JS.
* **Finestre modali**:
  * `#modale-app`: modal Bootstrap con la foto che sfuma, il titolo `#titolo-modale-app` e i bottoni dei negozi (segnaposto, disabilitati).
  * `#modale-squadra`: modal Bootstrap con titolo `#titolo-modale-squadra` e corpo `#corpo-modale-squadra`, riempita via JS e aperta con l'API JavaScript di Bootstrap.
  * `#modale-evento`: modal Bootstrap con titolo `#titolo-modale-evento` e corpo `#corpo-modale-evento`, riempita via JS all'apertura con i dati dell'evento cliccato.

---

## Validazione del campo di ricerca

### 1. Regole HTML5

| Campo | Regola | Cosa controlla il browser |
| ----- | ----- | ----- |
| **Nome della squadra** | `type="search"` + `required` | Che non sia vuoto prima di inviare il form |

### 2. Controllo tramite JavaScript (`main.js`)

`required` non blocca un input che contiene solo spazi, quindi il valore viene ripulito con `trim()` prima di passarlo a `eseguiRicerca()`. Se dopo `trim()` non resta nulla, la ricerca non parte e torna il messaggio iniziale "Inizia cercando una squadra qui sopra".

**Sequenza di ricerca:**
> Digitazione → dopo 400ms di pausa (oppure subito con Cerca, che con `preventDefault()` blocca il ricaricamento della pagina e annulla il timer; il testo viene salvato e il campo svuotato, la pagina scende a "Squadre trovate") → `trim()` toglie gli spazi → se vuoto torna il messaggio iniziale → la ricerca precedente ancora in corso viene annullata con `abort()` → si nascondono l'errore precedente e i vecchi risultati → compare lo spinner → `cercaSquadre()` interroga l'API → vengono mostrate le card (filtrate per sport) oppure "Nessuna squadra trovata" → in caso di errore compare l'alert rosso → il `finally` nasconde lo spinner solo se è ancora la ricerca più recente.

---

## Come funziona

Il codice JavaScript è diviso in **moduli ES**, ognuno con un solo compito:

1. **`Squadra.js` ed `Evento.js` (le classi)**:
   - `Squadra` traduce i dati dell'API (`idTeam`, `strTeam`, `strBadge`, `strLeague`, `strCountry`, `strSport`) nelle proprietà `id`, `nome`, `logo`, `lega`, `paese` e `sport`. Se `lega` o `paese` mancano, l'operatore `??` li sostituisce con un trattino. Per la modal della squadra mappa anche `nomeAlternativo`, `sigla`, `annoFondazione`, `stadio`, `localita`, `banner`, `descrizione`, `competizioni`, `colori`, `sito` e i social. `competizioni` e `colori` raccolgono più campi in un array e tolgono quelli vuoti con `.filter(Boolean)`; `descrizione` usa `||` per passare all'inglese se l'italiano manca o è una stringa vuota.
   - `Evento` mappa `id`, `nomeEvento`, `data`, `timestamp`, `casa`, `trasferta`, i punteggi, i loghi delle due squadre, `lega`, `stagione`, `giornata`, `stadio`, `citta`, `paese` e `stato`. Il metodo `dataFormattata()` usa `Intl.DateTimeFormat("it-IT")` per trasformare `2026-05-17` in `17/05/2026`. Il metodo `oraFormattata()` converte il timestamp UTC nell'ora italiana. Il metodo `statoLeggibile()` traduce i codici di stato dell'API grazie al campo statico `static STATI`. Il metodo `punteggio()` restituisce `3 – 1`, oppure una stringa vuota se la partita non è ancora stata giocata.
2. **`api.js` (le chiamate all'API)**:
   - La funzione interna `getJSON()` esegue la `fetch`, controlla `response.ok` e lancia un errore se la risposta non è valida.
   - `getJSON()` accetta anche un `signal`, che permette di annullare la richiesta con `AbortController`.
   - `cercaSquadre(query, signal)` costruisce l'URL con `new URL()` e `searchParams` e restituisce un array di oggetti `Squadra` (vuoto se `teams` è `null`).
   - `caricaEventi(idTeam)` avvia le due richieste in parallelo con `Promise.all` e restituisce `{ prossimi, ultimi }`. Attenzione: `eventsnext.php` usa la chiave `events`, mentre `eventslast.php` usa `results`.
   - `caricaProssimiEventi(idTeam)` chiama solo `eventsnext.php` ed è usata per gli appuntamenti delle preferite.
   - `caricaUltimiEventi(idTeam)` (`eventslast.php`, chiave `results`) e `caricaUltimiEventiLega(idLega)` (`eventspastleague.php`, chiave `events`) servono alle sezioni degli ultimi risultati.
3. **`storage.js` (i preferiti)**:
   - `caricaPreferiti()` legge la chiave `sportshub-preferiti` da `localStorage` con `JSON.parse` e restituisce un array (vuoto se non c'è niente o se il dato non è valido).
   - `salvaPreferiti()` salva l'array con `JSON.stringify`. Entrambe usano `try/catch`.
4. **`tema.js` (il tema)**:
   - `temaIniziale()` restituisce il tema salvato in `localStorage`, altrimenti sempre quello chiaro.
   - `applicaTema()` imposta l'attributo `data-bs-theme` su `<html>`, che Bootstrap e le variabili CSS usano per cambiare i colori.
   - `salvaTema()` ricorda la scelta. Lettura e salvataggio usano `try/catch`.
5. **`semplificata.js` (la modalità semplificata)**:
   - `semplificataIniziale()` legge la scelta salvata (di base spenta), `applicaSemplificata()` mette o toglie l'attributo `data-semplificata="true"` su `<html>`, da cui dipendono tutte le regole CSS della modalità, e `salvaSemplificata()` ricorda la scelta.
6. **`segnaposto.js` (le partite di esempio)**:
   - Contiene 9 partite di esempio tra squadre reali, con i loro loghi, nella stessa forma dei dati dell'API.
   - `completaConEsempi()` aggiunge partite di esempio fino ad arrivare a `MINIMO_PARTITE` (9). Le partite di esempio hanno `esempio = true`, che fa comparire il badge "Esempio" nelle card e un avviso nella modal.
7. **`ui.js` (il DOM)**:
   - `creaElemento()` crea un tag con classi e testo tramite `textContent`. In tutto il progetto non viene mai usato `innerHTML`.
   - `creaIcona()` crea un'icona di Bootstrap Icons (`<i class="bi bi-…">`) con `aria-hidden="true"`.
   - `aggiornaBottoneTema()` mostra l'icona luna o sole e aggiorna l'`aria-label` del bottone tema; `aggiornaContatorePreferiti()` aggiorna il numero nel badge e l'`aria-label` del bottone Preferiti.
   - `mostraSpinner()` / `nascondiSpinner()` e `mostraErrore()` / `nascondiErrore()` aggiungono o tolgono la classe `d-none`.
   - `creaCardBase()` crea la parte comune delle card (logo, nome, lega, paese) con `data-id` e `tabindex="0"`. Le card dei risultati aggiungono il bottone stella, quelle dei preferiti il bottone "Rimuovi".
   - `segnaPreferito()` aggiorna testo, `aria-label` e attributo `disabled` del bottone stella.
   - `renderSquadre()` e `renderPreferiti()` svuotano il contenitore con `replaceChildren()` e creano una card per ogni squadra.
   - `renderDettagli()` crea la card dei dettagli. Le due colonne sono generate dalla stessa funzione di supporto `creaListaEventi()`.
   - Ogni evento è un `<button>` con `data-bs-toggle="modal"` e `data-bs-target="#modale-evento"`, così è Bootstrap ad aprire la modal.
   - `renderAppuntamenti()` crea la lista degli appuntamenti e l'eventuale avviso per le squadre non caricate.
   - `renderModaleEvento()` riempie la modal con il tabellone e un elenco `<dl>` dei dati dell'evento.
   - `mostraNotifica(testo, tipo)` scrive testo e icona nel toast, cambia colore con `classList.toggle` e lo mostra con `bootstrap.Toast.getOrCreateInstance().show()`.
   - `creaVoceEvento(evento, conLuogo)` crea una riga evento; con `conLuogo = true` (appuntamenti) aggiunge l'ora accanto alla data e stadio e paese a destra.
   - `renderPartite()` crea la striscia di partite con la nota sugli esempi e le frecce: `scrollBy()` scorre di una "pagina" e le frecce si disattivano a inizio e fine striscia. Ogni card partita è un tabellone con i loghi, oppure le iniziali della squadra se il logo manca.
   - `renderModaleSquadra()` riempie la modal della squadra. I link esterni ricevono `https://` se manca e si aprono in una nuova scheda con `rel="noopener noreferrer"`; i colori sociali diventano pallini colorati con `style.backgroundColor`.
8. **`main.js` (il coordinatore)**:
   - All'avvio applica il tema, scrive l'anno corrente nel footer con `new Date().getFullYear()`, mostra i preferiti e carica gli appuntamenti.
   - Il bottone tema alterna chiaro e scuro, salva la scelta e aggiorna l'icona; il bottone Preferiti porta alla sezione con `portaA()`.
   - `mostraPreferiti()` disegna la sezione dei preferiti e aggiorna il contatore nella barra.
   - I pannelli del footer: sull'evento `shown.bs.collapse` la pagina scende a mostrare il pannello appena aperto; un listener sul documento chiude il pannello aperto quando si clicca fuori.
   - La lista dei preferiti è un collapse di Bootstrap: il bottone Preferiti la apre e il logo la chiude con `bootstrap.Collapse.getOrCreateInstance().show()` / `.hide()`.
   - `caricaRisultatiLega()` e `caricaRisultatiPreferite()` caricano gli ultimi risultati (la seconda con `Promise.allSettled`), li ordinano dal più recente e li completano con le partite di esempio.
   - Il pallone dell'app: sull'evento `show.bs.toast` misura l'altezza della notifica con `offsetHeight` e alza il pallone con la variabile CSS `--sh-alzata` (`style.setProperty()`); su `hidden.bs.toast` lo riabbassa. Il click sul pallone apre la finestrella sui dispositivi touch; click fuori ed Esc la chiudono.
   - `comportamentoScorrimento()` decide se gli scorrimenti sono fluidi o immediati (immediati con "riduci animazioni" o in modalità semplificata).
   - `eseguiRicerca()` gestisce la ricerca con `async/await` e `try/catch/finally`. Viene chiamata dal **debounce** sull'evento `input` (400ms con `setTimeout` / `clearTimeout`) e dal submit del form.
   - A ogni nuova ricerca la precedente viene annullata con `AbortController`. Una richiesta annullata (`AbortError`) non mostra l'alert, e lo spinner viene nascosto solo se `controllerRicerca === controller`, cioè se è ancora la ricerca più recente.
   - Salva le squadre dell'ultima ricerca nell'array `squadreTrovate` e le mostra filtrate per sport con `squadreFiltrate()` e `mostraRisultati()`.
   - Il filtro usa l'event delegation su `#filtri-sport` e aggiorna `aria-pressed` sui bottoni.
   - `caricaAppuntamenti()` carica i prossimi eventi di tutte le preferite con `Promise.allSettled`, separa le risposte riuscite da quelle fallite, toglie i doppioni con `filter` + `findIndex` e ordina per data con `sort` e `localeCompare`. Un contatore `versioneAppuntamenti` ignora i caricamenti superati da uno più recente.
   - `aggiungiPreferito()` e `rimuoviPreferito()` aggiornano l'array `preferiti`, lo salvano, ridisegnano la sezione, ricaricano gli appuntamenti, aggiornano il bottone stella e chiamano `mostraNotifica()`.
   - Usa l'**event delegation** su `#lista-squadre` e `#lista-preferiti`: un solo listener `click` per contenitore distingue il click sul bottone (aggiungi o rimuovi) da quello sulla card (apri i dettagli).
   - Un listener `keydown` apre la card anche con **Invio** o **Spazio**, richiamando `card.click()`, per chi naviga da tastiera.
   - `apriSquadra()` riempie la modal della squadra, la apre con `bootstrap.Modal.getOrCreateInstance().show()` e carica le liste degli eventi. Non si usa `data-bs-toggle` sulla card perché Bootstrap aprirebbe la modal anche cliccando i bottoni stella e Rimuovi al suo interno.
   - Sull'evento `hidden.bs.modal` della modal squadra, la pagina scende alle liste degli eventi.
   - `portaA()` fa scorrere la pagina fino a un elemento con `scrollIntoView()` (fluido o immediato secondo `comportamentoScorrimento()`) e ci sposta il focus con `focus({ preventScroll: true })`.
   - Al submit il testo viene salvato, il campo svuotato e la pagina portata a "Squadre trovate" con `portaA()`.
   - Sull'evento `show.bs.modal` di Bootstrap legge `event.relatedTarget` (il bottone cliccato), trova l'evento tramite il `data-id` e riempie la modal prima che compaia.

---

## Aspetto grafico

L'applicazione si presenta con un design sportivo e deciso. In alto c'è una barra chiara con il marchio e i bottoni, seguita dalla hero blu (`#1b3366`) con il titolo e il form di ricerca centrati; anche il footer è blu. Il resto della pagina ha uno sfondo grigio chiarissimo (`#f4f5f8`) e card bianche con angoli arrotondati e un'ombra leggera. I titoli usano il font **Oswald**, in maiuscolo e con le lettere leggermente distanziate, come sui tabelloni degli stadi; il testo usa **Barlow**, squadrato e molto leggibile. Le icone sono quelle a linea di **Bootstrap Icons**, sobrie e monocromatiche; l'unica emoji rimasta è il pallone del marchio. Tutti i colori sono definiti con variabili CSS, così il **tema scuro** li cambia in un punto solo: nel tema scuro il blu diventa l'azzurro `#8fb0ff`, più leggibile su sfondo scuro. Lo stesso azzurro torna in diversi dettagli: l'alone delle card e degli eventi al passaggio del mouse (che si sollevano leggermente), il bordo delle modal e i link del footer, che diventano azzurri con una sottolineatura che cresce da sinistra. I punteggi sono evidenziati da un badge verde di Bootstrap (`bg-success`), mentre date, campionato e paese sono in grigio più piccolo, così risaltano i nomi delle squadre. I messaggi informativi, come "Nessuna squadra trovata", sono in corsivo grigio. I filtri sono bottoni a pillola con bordo blu, pieni quando attivi; il bottone "Già nei preferiti" è grigio con cursore "non consentito"; nella modal un tabellone mette a confronto i loghi delle due squadre con il punteggio al centro. Nella modal della squadra la sigla è in un badge blu, i colori sociali sono pallini e i link a sito e social sono bottoni a pillola come i filtri. Le notifiche compaiono in basso a destra, blu per le aggiunte e rosso scuro per le rimozioni, e spariscono dopo 3 secondi. La hero usa come sfondo una foto specchiata, con un velo blu sfumato che lascia vedere il calciatore a sinistra e rende leggibile il testo a destra; all'apertura la foto entra da sinistra. Le card delle partite sono piccoli tabelloni con i loghi delle squadre e il punteggio grande al centro. Il pallone dell'app entra da sinistra rotolando e, al passaggio del mouse, gira e si illumina d'azzurro. Nella modal dell'app una foto notturna di una partita sfuma dolcemente nel colore della modal.

---

## Extra e dettagli

- **Pulizia dell'input**: Il testo cercato viene ripulito con `trim()`, così una ricerca fatta di soli spazi non parte. Gestito da JS.
- **Messaggio "Nessun risultato disponibile"**: Mostrato nella colonna degli ultimi risultati quando l'API non restituisce partite giocate. Gestito da JS.
- **Logo opzionale**: Se una squadra non ha il logo, l'immagine non viene creata. Gestito da JS.
- **Bottone "Già nei preferiti" disabilitato**: Se la squadra è già salvata il bottone non è cliccabile ed è grigio. Gestito da JS e CSS.
- **Appuntamenti sempre aggiornati**: Si ricaricano anche quando aggiungi o rimuovi una preferita, non solo all'avvio. Gestito da JS.
- **Avviso per le squadre non caricate**: Un avviso giallo indica quali preferite non è stato possibile caricare. Gestito da JS.
- **Nessun doppione negli appuntamenti**: Se due preferite giocano tra loro, la partita compare una volta sola. Gestito da JS.
- **Messaggio "Nessuna squadra trovata per questo sport"**: Mostrato quando il filtro esclude tutte le squadre trovate. Gestito da JS.
- **Modal info squadra**: Informazioni complete sulla squadra al click sulla card. Gestito da HTML e JS.
- **Ricerca con svuotamento e scorrimento**: Con Cerca o Invio il campo si svuota e la pagina scende ai risultati. Gestito da JS.
- **Scorrimento alle liste degli eventi**: Alla chiusura della modal squadra la pagina porta alle liste. Gestito da JS.
- **Notifiche sui preferiti**: Un toast Bootstrap conferma ogni aggiunta o rimozione. Gestito da HTML, CSS e JS.
- **Barra di navigazione con tema e preferiti**: Tema chiaro/scuro ricordato tra le visite e bottone Preferiti con contatore. Gestito da HTML, CSS e JS.
- **Footer**: Copyright con l'anno aggiornato automaticamente. Gestito da HTML e JS.
- **Ultimi risultati della Premier League e delle tue squadre**: Due sezioni con le ultime partite. Gestito da HTML, CSS e JS.
- **Partite di esempio**: Completano le sezioni dei risultati quando l'API dà poche partite, sempre segnate dal badge "Esempio". Gestito da JS.
- **Striscia scorrevole con frecce**: 9 partite, di cui 1, 2 o 3 visibili secondo lo schermo. Gestito da CSS e JS.
- **Mostra/nascondi dei preferiti**: Lista chiusa all'avvio, apribile dal titolo o dalla barra. Gestito da HTML e JS.
- **Pannelli del footer**: About us e Accessibilità si aprono sotto il footer. Gestito da HTML e JS.
- **Modalità semplificata**: Versione ad alta leggibilità per chi ha difficoltà visive. Gestito da HTML, CSS e JS.
- **Pallone e modal dell'app**: Invito a scaricare l'app (in arrivo). Gestito da HTML, CSS e JS.
- **Ora e luogo negli appuntamenti**: Ora accanto alla data, stadio e paese a destra. Gestito da JS e CSS.
- **Stati e orari in italiano nella modal**: I codici dell'API (`NS`, `FT`…) sono tradotti e l'orario UTC è convertito in ora italiana. Gestito da JS.

---

## Accessibilità

- **Accessibilità da tastiera**: Le card sono raggiungibili con Tab e mostrano un contorno blu (`:focus-visible`). Si aprono con Invio o Spazio. I bottoni nelle card non sono annidati in un elemento `role="button"` (HTML non valido). Gestito da CSS e JS.
- **Accessibilità per screen reader**: Label nascosta sull'input, `aria-labelledby` sulle sezioni, `role="alert"` sull'errore, testo nascosto nello spinner e `aria-hidden` sulle icone decorative. Gestito da HTML.
- **Filtri e modal**: `aria-pressed` sul filtro attivo, eventi come `<button>` con `aria-haspopup="dialog"`, modal con `aria-labelledby` (Bootstrap restituisce il focus all'evento quando la modal si chiude), `aria-label` con il nome della squadra sui bottoni preferiti e rimuovi. Gestito da HTML e JS.
- **Gestione del focus e link**: Dopo la ricerca e alla chiusura della modal il focus passa al titolo dei risultati o dei dettagli (`tabindex="-1"`), lo scorrimento rispetta "riduci animazioni", i link esterni avvisano lo screen reader che si aprono in una nuova scheda, i colori sociali hanno `role="img"` con `aria-label` e le notifiche hanno `role="status"` e `aria-live="polite"`, così lo screen reader le legge senza spostare il focus. Gestito da HTML, JS e CSS.
- **Barra di navigazione**: `<nav>` con `aria-label`, bottone tema con `aria-label` che indica il tema che si attiverà, bottone Preferiti con `aria-label` che include il numero di squadre salvate. Gestito da HTML e JS.
- **Modalità semplificata**: Testo più grande del 20%, contrasto alto (bianco e nero puri), font Atkinson Hyperlegible, niente maiuscolo né corsivo, niente animazioni, link sempre sottolineati e contorno di focus più spesso; funziona con entrambi i temi. Gestito da HTML, CSS e JS.
- **Collapse, frecce e pallone**: `aria-expanded` sui bottoni dei collapse (aggiornato da Bootstrap), frecce della striscia con `aria-label` e `aria-controls`, finestrella del pallone raggiungibile da tastiera (`:focus-within`) e chiudibile con Esc. Le immagini decorative hanno `alt=""` o sono sfondi CSS, quindi lo screen reader le ignora. Gestito da HTML, CSS e JS.
- **Riduci animazioni**: Con `prefers-reduced-motion` le transizioni, il sollevamento delle card e degli eventi, la sottolineatura animata dei link del footer, l'ingresso della hero e il pallone che rotola vengono disattivati per chi ha attivato "riduci animazioni" nel sistema operativo. Gestito da CSS.

---

## Convenzioni di codice

- **camelCase** per variabili, funzioni e riferimenti agli elementi DOM.
- **PascalCase** per le classi e per i file che le contengono (`Squadra.js`, `Evento.js`).
- **UPPER_CASE** per le costanti di configurazione (`BASE_URL`).
- **Un modulo, un compito**: `api.js` non tocca il DOM, `ui.js` non esegue fetch, `storage.js` gestisce solo i preferiti in `localStorage`, `tema.js` solo il tema, `semplificata.js` solo la modalità semplificata e `segnaposto.js` solo le partite di esempio.
- **Variabili CSS** con prefisso `--sh-` (SportsHub), per non confonderle con quelle di Bootstrap (`--bs-`).
- **CSS con indice**: in cima a `style.css` c'è un indice delle 21 sezioni, numerate anche nelle intestazioni (per saltare a una sezione si cerca, per esempio, `===== 11.`).
- **Intestazione nei moduli JS**: ogni file inizia con un commento che spiega a cosa serve.
- **Commenti esplicativi** presenti in HTML, CSS e JS per agevolare la lettura del codice.

---

## Aggiornamenti

| Versione | Descrizione |
| :--- | :--- |
| **ver. 1.0** | Struttura HTML semantica e stile CSS con Bootstrap 5 |
| **ver. 2.0** | Versione base: ricerca squadre e dettagli eventi |
| **ver. 2.1** | Versione avanzata: preferiti, appuntamenti, filtri e modal |

---

## Crediti

- **Dati**: [TheSportsDB](https://www.thesportsdb.com).
- **Foto della hero**: Kampus Production su [Pexels](https://www.pexels.com/it-it/foto/campo-erba-sport-palla-8941651/).
- **Foto della modal dell'app**: Ferid Faiqoglu su [Pexels](https://www.pexels.com/it-it/foto/intensa-partita-di-calcio-con-contrasti-nello-stadio-di-baku-40189105/).
- **Icone**: [Bootstrap Icons](https://icons.getbootstrap.com).
- **Font**: Oswald, Barlow e Atkinson Hyperlegible da [Google Fonts](https://fonts.google.com).

---

## Realizzato da

| Persona | Ruolo |
| :--- | :--- |
| Lisa Irene Sciacca | README, HTML, CSS, JavaScript |