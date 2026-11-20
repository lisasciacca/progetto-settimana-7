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
- **Squadre preferite**: Bottone "☆ Aggiungi ai preferiti" su ogni card. I preferiti vengono salvati in `localStorage` e restano anche dopo il refresh. Il bottone "Rimuovi" toglie una squadra, e il click su una preferita apre i suoi dettagli senza rifare la ricerca.
- **I tuoi prossimi appuntamenti**: All'avvio vengono caricati in parallelo con `Promise.allSettled` i prossimi eventi di tutte le preferite. Una squadra che fallisce non blocca le altre, e gli eventi sono mostrati in un'unica lista ordinata per data.
- **Filtro per sport**: I bottoni Tutti / Calcio / Basket / Football filtrano le squadre trovate in base al campo `strSport`.
- **Modal dettagli evento**: Il click su un evento apre una modal Bootstrap con tabellone, competizione, stagione, giornata, data, ora, stadio, città, paese e stato.
- **Modal info squadra**: Il click su una card apre una modal Bootstrap con banner, logo, nome completo e sigla, sport, campionato, paese, anno di fondazione, stadio, località, competizioni, colori sociali, storia della squadra e link a sito e social. Chiudendola, la pagina scende alle liste degli eventi.

## Tecnologie Utilizzate

- **HTML5**: Strutturazione semantica dell'interfaccia (`header`, `main`, `section`, `article`) con attributi di accessibilità.
- **CSS3**: Styling personalizzato, Flexbox, `clamp()`, transizioni e media query `prefers-reduced-motion`.
- **Bootstrap 5.3.8**: Collegato tramite CDN. Usato per griglia, utility, form, spinner, alert, badge e modal.
  > **Perché la 5.3.8:** è l'ultima versione stabile riportata nella documentazione ufficiale di Bootstrap, ed è quella a cui puntano i link CDN ufficiali. La 5.3.9, usata in un progetto precedente, non è riportata nella documentazione ufficiale, quindi si è scelta la versione verificata. Tutte le versioni 5.3.x contengono solo correzioni di bug, quindi classi e componenti funzionano allo stesso modo.
- **JavaScript (ES6+)**: Moduli ES (`import` / `export`), classi, `fetch` con `async/await`, `try/catch/finally`, `Promise.all`, `Promise.allSettled`, `AbortController`, debounce con `setTimeout`, `localStorage` / `JSON`, campi `static`, `Intl.DateTimeFormat`, API JavaScript di Bootstrap (`bootstrap.Modal`), `scrollIntoView()`, `matchMedia()` e manipolazione del DOM senza `innerHTML`.
- **TheSportsDB API v1**: API REST pubblica con la chiave gratuita di test `123`.

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
│   ├── img/               risorse grafiche (vuota per ora)
│   └── js/
│       ├── main.js        punto di ingresso: eventi e coordinamento
│       ├── api.js         chiamate fetch verso TheSportsDB
│       ├── ui.js          creazione degli elementi nel DOM
│       ├── storage.js     salvataggio dei preferiti in localStorage
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

Il titolo principale usa `clamp(2rem, 5vw, 2.5rem)` per ridursi in modo fluido sugli schermi piccoli. L'unica media query del CSS è `prefers-reduced-motion`, che disattiva le animazioni per chi ha attivato "riduci animazioni" nel sistema operativo.

---

## Albero del DOM

* **Intestazione (`<header class="hero">`)**:
  * Titolo `SportsHub`, sottotitolo e form di ricerca `#form-ricerca` con `role="search"`, input `#input-ricerca` (con label nascosta `visually-hidden`) e bottone "Cerca".
* **Contenuto principale (`<main class="container contenitore">`)**:
  * **Sezione preferiti (`<section aria-labelledby="titolo-preferiti">`)**:
    * Titolo `#titolo-preferiti` e contenitore `#lista-preferiti`, che contiene le card delle squadre salvate, oppure il messaggio di lista vuota.
  * **Sezione appuntamenti (`<section aria-labelledby="titolo-appuntamenti">`)**:
    * Titolo `#titolo-appuntamenti` e card `#lista-appuntamenti` con i prossimi eventi delle preferite, ordinati per data e popolati via JS.
  * **Sezione risultati (`<section aria-labelledby="titolo-risultati">`)**:
    * `#filtri-sport`: gruppo di bottoni del filtro per sport, con `role="group"`.
    * `#errore`: alert Bootstrap rosso con `role="alert"`, nascosto con `d-none`.
    * `#spinner`: spinner Bootstrap con testo nascosto "Caricamento...", nascosto con `d-none`.
    * `#lista-squadre`: contenitore delle card delle squadre trovate, popolato via JS. All'avvio mostra il messaggio "Inizia cercando una squadra qui sopra".
    * `#dettagli`: contenitore della card `.card-risultato` con i prossimi eventi e gli ultimi risultati, popolato via JS.
* **Finestre modali**:
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
3. **`storage.js` (i preferiti)**:
   - `caricaPreferiti()` legge la chiave `sportshub-preferiti` da `localStorage` con `JSON.parse` e restituisce un array (vuoto se non c'è niente o se il dato non è valido).
   - `salvaPreferiti()` salva l'array con `JSON.stringify`. Entrambe usano `try/catch`.
4. **`ui.js` (il DOM)**:
   - `creaElemento()` crea un tag con classi e testo tramite `textContent`. In tutto il progetto non viene mai usato `innerHTML`.
   - `mostraSpinner()` / `nascondiSpinner()` e `mostraErrore()` / `nascondiErrore()` aggiungono o tolgono la classe `d-none`.
   - `creaCardBase()` crea la parte comune delle card (logo, nome, lega, paese) con `data-id` e `tabindex="0"`. Le card dei risultati aggiungono il bottone stella, quelle dei preferiti il bottone "Rimuovi".
   - `segnaPreferito()` aggiorna testo, `aria-label` e attributo `disabled` del bottone stella.
   - `renderSquadre()` e `renderPreferiti()` svuotano il contenitore con `replaceChildren()` e creano una card per ogni squadra.
   - `renderDettagli()` crea la card dei dettagli. Le due colonne sono generate dalla stessa funzione di supporto `creaListaEventi()`.
   - Ogni evento è un `<button>` con `data-bs-toggle="modal"` e `data-bs-target="#modale-evento"`, così è Bootstrap ad aprire la modal.
   - `renderAppuntamenti()` crea la lista degli appuntamenti e l'eventuale avviso per le squadre non caricate.
   - `renderModaleEvento()` riempie la modal con il tabellone e un elenco `<dl>` dei dati dell'evento.
   - `renderModaleSquadra()` riempie la modal della squadra. I link esterni ricevono `https://` se manca e si aprono in una nuova scheda con `rel="noopener noreferrer"`; i colori sociali diventano pallini colorati con `style.backgroundColor`.
5. **`main.js` (il coordinatore)**:
   - `eseguiRicerca()` gestisce la ricerca con `async/await` e `try/catch/finally`. Viene chiamata dal **debounce** sull'evento `input` (400ms con `setTimeout` / `clearTimeout`) e dal submit del form.
   - A ogni nuova ricerca la precedente viene annullata con `AbortController`. Una richiesta annullata (`AbortError`) non mostra l'alert, e lo spinner viene nascosto solo se `controllerRicerca === controller`, cioè se è ancora la ricerca più recente.
   - Salva le squadre dell'ultima ricerca nell'array `squadreTrovate` e le mostra filtrate per sport con `squadreFiltrate()` e `mostraRisultati()`.
   - Il filtro usa l'event delegation su `#filtri-sport` e aggiorna `aria-pressed` sui bottoni.
   - `caricaAppuntamenti()` carica i prossimi eventi di tutte le preferite con `Promise.allSettled`, separa le risposte riuscite da quelle fallite, toglie i doppioni con `filter` + `findIndex` e ordina per data con `sort` e `localeCompare`. Un contatore `versioneAppuntamenti` ignora i caricamenti superati da uno più recente.
   - `aggiungiPreferito()` e `rimuoviPreferito()` aggiornano l'array `preferiti`, lo salvano, ridisegnano la sezione, ricaricano gli appuntamenti e aggiornano il bottone stella.
   - Usa l'**event delegation** su `#lista-squadre` e `#lista-preferiti`: un solo listener `click` per contenitore distingue il click sul bottone (aggiungi o rimuovi) da quello sulla card (apri i dettagli).
   - Un listener `keydown` apre la card anche con **Invio** o **Spazio**, richiamando `card.click()`, per chi naviga da tastiera.
   - `apriSquadra()` riempie la modal della squadra, la apre con `bootstrap.Modal.getOrCreateInstance().show()` e carica le liste degli eventi. Non si usa `data-bs-toggle` sulla card perché Bootstrap aprirebbe la modal anche cliccando i bottoni stella e Rimuovi al suo interno.
   - Sull'evento `hidden.bs.modal` della modal squadra, la pagina scende alle liste degli eventi.
   - `portaA()` fa scorrere la pagina fino a un elemento con `scrollIntoView()` (fluido, oppure immediato se `matchMedia` rileva "riduci animazioni") e ci sposta il focus con `focus({ preventScroll: true })`.
   - Al submit il testo viene salvato, il campo svuotato e la pagina portata a "Squadre trovate" con `portaA()`.
   - Sull'evento `show.bs.modal` di Bootstrap legge `event.relatedTarget` (il bottone cliccato), trova l'evento tramite il `data-id` e riempie la modal prima che compaia.

---

## Aspetto grafico

L'applicazione si presenta con un design pulito e sportivo. L'header è blu scuro (`#1b3366`), con il titolo e il form di ricerca centrati, e il resto della pagina ha uno sfondo grigio chiarissimo (`#f4f5f8`). Le card sono bianche, con angoli arrotondati e un'ombra leggera che le stacca dallo sfondo. Lo stesso blu dell'header ritorna nei titoli della card dei dettagli e nella linea sotto "Prossimi eventi" e "Ultimi risultati", per dare continuità. I punteggi sono evidenziati da un badge verde di Bootstrap (`bg-success`), mentre date, campionato e paese sono in grigio più piccolo, così risaltano i nomi delle squadre. Il font è Arial, lineare e molto leggibile. I messaggi informativi, come "Nessuna squadra trovata", sono in corsivo grigio. I filtri sono bottoni a pillola con bordo blu, pieni quando attivi; il bottone "Già nei preferiti" è grigio con cursore "non consentito"; nella modal un tabellone mette a confronto i loghi delle due squadre con il punteggio al centro. Nella modal della squadra la sigla è in un badge blu, i colori sociali sono pallini e i link a sito e social sono bottoni a pillola come i filtri.

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
- **Stati e orari in italiano nella modal**: I codici dell'API (`NS`, `FT`…) sono tradotti e l'orario UTC è convertito in ora italiana. Gestito da JS.

---

## Accessibilità

- **Accessibilità da tastiera**: Le card sono raggiungibili con Tab e mostrano un contorno blu (`:focus-visible`). Si aprono con Invio o Spazio. I bottoni nelle card non sono annidati in un elemento `role="button"` (HTML non valido). Gestito da CSS e JS.
- **Accessibilità per screen reader**: Label nascosta sull'input, `aria-labelledby` sulle sezioni, `role="alert"` sull'errore, testo nascosto nello spinner e `aria-hidden` sulle emoji decorative. Gestito da HTML.
- **Filtri e modal**: `aria-pressed` sul filtro attivo, eventi come `<button>` con `aria-haspopup="dialog"`, modal con `aria-labelledby` (Bootstrap restituisce il focus all'evento quando la modal si chiude), `aria-label` con il nome della squadra sui bottoni preferiti e rimuovi. Gestito da HTML e JS.
- **Gestione del focus e link**: Dopo la ricerca e alla chiusura della modal il focus passa al titolo dei risultati o dei dettagli (`tabindex="-1"`), lo scorrimento rispetta "riduci animazioni", i link esterni avvisano lo screen reader che si aprono in una nuova scheda e i colori sociali hanno `role="img"` con `aria-label`. Gestito da JS e CSS.
- **Riduci animazioni**: Con `prefers-reduced-motion` le transizioni e il sollevamento delle card vengono disattivati per chi ha attivato "riduci animazioni" nel sistema operativo. Gestito da CSS.

---

## Convenzioni di codice

- **camelCase** per variabili, funzioni e riferimenti agli elementi DOM.
- **PascalCase** per le classi e per i file che le contengono (`Squadra.js`, `Evento.js`).
- **UPPER_CASE** per le costanti di configurazione (`BASE_URL`).
- **Un modulo, un compito**: `api.js` non tocca il DOM, `ui.js` non esegue fetch e `storage.js` gestisce solo `localStorage`.
- **Commenti esplicativi** presenti in HTML, CSS e JS per agevolare la lettura del codice.

---

## Aggiornamenti

| Versione | Descrizione |
| :--- | :--- |
| **ver. 1.0** | Struttura HTML semantica e stile CSS con Bootstrap 5 |
| **ver. 2.0** | Versione base: ricerca squadre e dettagli eventi |
ver. 2.1 - Versione avanzata: preferiti, appuntamenti, filtri e modal

---

## Realizzato da

| Persona | Ruolo |
| :--- | :--- |
| Lisa Irene Sciacca | README, HTML, CSS, JavaScript |