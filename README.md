# SPORTSHUB - Web app di ricerca squadre

Questa repository contiene il codice sorgente di **SportsHub**, una web app che permette di cercare una squadra sportiva e di consultarne i prossimi eventi e gli ultimi risultati. I dati arrivano in tempo reale dall'API pubblica di **TheSportsDB**. Il progetto è stato sviluppato come progetto d'esame del corso di Web Development.

---

> **Stato del progetto:** in sviluppo, versione base completata. Questo file viene aggiornato a mano a mano che il progetto viene realizzato.

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

## Tecnologie Utilizzate

- **HTML5**: Strutturazione semantica dell'interfaccia (`header`, `main`, `section`, `article`) con attributi di accessibilità.
- **CSS3**: Styling personalizzato, Flexbox, `clamp()`, transizioni e media query `prefers-reduced-motion`.
- **Bootstrap 5.3.8**: Collegato tramite CDN. Usato per griglia, utility, form, spinner, alert e badge.
  > **Perché la 5.3.8:** è l'ultima versione stabile riportata nella documentazione ufficiale di Bootstrap, ed è quella a cui puntano i link CDN ufficiali. La 5.3.9, usata in un progetto precedente, non è riportata nella documentazione ufficiale, quindi si è scelta la versione verificata. Tutte le versioni 5.3.x contengono solo correzioni di bug, quindi classi e componenti funzionano allo stesso modo.
- **JavaScript (ES6+)**: Moduli ES (`import` / `export`), classi, `fetch` con `async/await`, `try/catch/finally`, `Promise.all`, `Intl.DateTimeFormat` e manipolazione del DOM senza `innerHTML`.
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

Il titolo principale usa `clamp(2rem, 5vw, 2.5rem)` per ridursi in modo fluido sugli schermi piccoli. L'unica media query del CSS è `prefers-reduced-motion`, che disattiva le animazioni per chi ha attivato "riduci animazioni" nel sistema operativo.

---

## Albero del DOM

* **Intestazione (`<header class="hero">`)**:
  * Titolo `SportsHub`, sottotitolo e form di ricerca `#form-ricerca` con `role="search"`, input `#input-ricerca` (con label nascosta `visually-hidden`) e bottone "Cerca".
* **Contenuto principale (`<main class="container contenitore">`)**:
  * **Sezione preferiti (`<section aria-labelledby="titolo-preferiti">`)**:
    * Titolo `#titolo-preferiti` e contenitore `#lista-preferiti`, che per ora contiene solo il messaggio "Non hai ancora salvato nessuna squadra".
  * **Sezione risultati (`<section aria-labelledby="titolo-risultati">`)**:
    * `#errore`: alert Bootstrap rosso con `role="alert"`, nascosto con `d-none`.
    * `#spinner`: spinner Bootstrap con testo nascosto "Caricamento...", nascosto con `d-none`.
    * `#lista-squadre`: contenitore delle card delle squadre trovate, popolato via JS. All'avvio mostra il messaggio "Inizia cercando una squadra qui sopra".
    * `#dettagli`: contenitore della card `.card-risultato` con i prossimi eventi e gli ultimi risultati, popolato via JS.

---

## Validazione del campo di ricerca

### 1. Regole HTML5

| Campo | Regola | Cosa controlla il browser |
| ----- | ----- | ----- |
| **Nome della squadra** | `type="search"` + `required` | Che non sia vuoto prima di inviare il form |

### 2. Controllo tramite JavaScript (`main.js`)

`required` non blocca un input che contiene solo spazi, quindi il valore viene ripulito con `trim()` e controllato di nuovo:

```javascript
const query = input.value.trim();
if (!query) return;
```

**Sequenza di ricerca:**
> Clic su Cerca → `required` blocca l'invio se il campo è vuoto → `preventDefault()` blocca il ricaricamento della pagina → `trim()` toglie gli spazi e, se non resta nulla, lo script si interrompe → si nascondono l'errore precedente e i vecchi risultati → compare lo spinner → `cercaSquadre()` interroga l'API → vengono mostrate le card oppure "Nessuna squadra trovata" → in caso di errore compare l'alert rosso → in ogni caso il `finally` nasconde lo spinner.

---

## Come funziona

Il codice JavaScript è diviso in **moduli ES**, ognuno con un solo compito:

1. **`Squadra.js` ed `Evento.js` (le classi)**:
   - `Squadra` traduce i dati dell'API (`idTeam`, `strTeam`, `strBadge`, `strLeague`, `strCountry`, `strSport`) nelle proprietà `id`, `nome`, `logo`, `lega`, `paese` e `sport`. Se `lega` o `paese` mancano, l'operatore `??` li sostituisce con un trattino.
   - `Evento` mappa `id`, `data`, `casa`, `trasferta`, `punteggioCasa` e `punteggioTrasferta`. Il metodo `dataFormattata()` usa `Intl.DateTimeFormat("it-IT")` per trasformare `2026-05-17` in `17/05/2026`. Il metodo `punteggio()` restituisce `3 – 1`, oppure una stringa vuota se la partita non è ancora stata giocata.
2. **`api.js` (le chiamate all'API)**:
   - La funzione interna `getJSON()` esegue la `fetch`, controlla `response.ok` e lancia un errore se la risposta non è valida.
   - `cercaSquadre(query)` costruisce l'URL con `new URL()` e `searchParams` e restituisce un array di oggetti `Squadra` (vuoto se `teams` è `null`).
   - `caricaEventi(idTeam)` avvia le due richieste in parallelo con `Promise.all` e restituisce `{ prossimi, ultimi }`. Attenzione: `eventsnext.php` usa la chiave `events`, mentre `eventslast.php` usa `results`.
3. **`ui.js` (il DOM)**:
   - `creaElemento()` crea un tag con classi e testo tramite `textContent`. In tutto il progetto non viene mai usato `innerHTML`.
   - `mostraSpinner()` / `nascondiSpinner()` e `mostraErrore()` / `nascondiErrore()` aggiungono o tolgono la classe `d-none`.
   - `renderSquadre()` svuota il contenitore con `replaceChildren()` e crea una card per ogni squadra, con `data-id`, `tabindex="0"` e `role="button"`.
   - `renderDettagli()` crea la card dei dettagli. Le due colonne sono generate dalla stessa funzione di supporto `creaListaEventi()`.
4. **`main.js` (il coordinatore)**:
   - Gestisce il submit del form con `async/await` e `try/catch/finally`.
   - Salva le squadre dell'ultima ricerca nell'array `squadreTrovate`.
   - Usa l'**event delegation** su `#lista-squadre`: un solo listener `click` trova la card cliccata con `closest(".card-squadra")`, legge il `dataset.id` e chiama `apriDettagli()`.
   - Un secondo listener `keydown` apre i dettagli anche con **Invio** o **Spazio**, per chi naviga da tastiera.

---

## Aspetto grafico

L'applicazione si presenta con un design pulito e sportivo. L'header è blu scuro (`#1b3366`), con il titolo e il form di ricerca centrati, e il resto della pagina ha uno sfondo grigio chiarissimo (`#f4f5f8`). Le card sono bianche, con angoli arrotondati e un'ombra leggera che le stacca dallo sfondo. Lo stesso blu dell'header ritorna nei titoli della card dei dettagli e nella linea sotto "Prossimi eventi" e "Ultimi risultati", per dare continuità. I punteggi sono evidenziati da un badge verde di Bootstrap (`bg-success`), mentre date, campionato e paese sono in grigio più piccolo, così risaltano i nomi delle squadre. Il font è Arial, lineare e molto leggibile. I messaggi informativi, come "Nessuna squadra trovata", sono in corsivo grigio.

---

## Extra e dettagli

- **Pulizia dell'input**: Il testo cercato viene ripulito con `trim()`, così una ricerca fatta di soli spazi non parte. Gestito da JS.
- **Messaggio "Nessun risultato disponibile"**: Mostrato nella colonna degli ultimi risultati quando l'API non restituisce partite giocate. Gestito da JS.
- **Logo opzionale**: Se una squadra non ha il logo, l'immagine non viene creata. Gestito da JS.

---

## Accessibilità

- **Accessibilità da tastiera**: Le card sono raggiungibili con Tab e mostrano un contorno blu (`:focus-visible`). Si aprono con Invio o Spazio. Gestito da CSS e JS.
- **Accessibilità per screen reader**: Label nascosta sull'input, `aria-labelledby` sulle sezioni, `role="alert"` sull'errore, testo nascosto nello spinner e `aria-hidden` sulle emoji decorative. Gestito da HTML.
- **Riduci animazioni**: Con `prefers-reduced-motion` le transizioni e il sollevamento delle card vengono disattivati per chi ha attivato "riduci animazioni" nel sistema operativo. Gestito da CSS.

---

## Convenzioni di codice

- **camelCase** per variabili, funzioni e riferimenti agli elementi DOM.
- **PascalCase** per le classi e per i file che le contengono (`Squadra.js`, `Evento.js`).
- **UPPER_CASE** per le costanti di configurazione (`BASE_URL`).
- **Un modulo, un compito**: `api.js` non tocca il DOM e `ui.js` non esegue fetch.
- **Commenti esplicativi** presenti in HTML, CSS e JS per agevolare la lettura del codice.

---

## Aggiornamenti

| Versione | Descrizione |
| :--- | :--- |
| **ver. 1.0** | Struttura HTML semantica e stile CSS con Bootstrap 5 |

---

## Realizzato da

| Persona | Ruolo |
| :--- | :--- |
| Lisa Irene Sciacca | README, HTML, CSS, JavaScript |

# Base
Dettagli squadra
strutture e funzionalità rigide, solo aggiunte

# Intermedio
Squadre preferite (se mettiamo nei preferiti una squadra che già c'è spunta la squadra è già nei preferiti)
Debouce sulla ricerca


# Extra
Caricamento in parallelo preferite (puoi farlo come vuoi)
Filtro per scort
modale dettagli evento