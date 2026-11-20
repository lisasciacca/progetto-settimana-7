import { cercaSquadre, caricaEventi } from "./Api.js";
import {
  mostraSpinner,
  nascondiSpinner,
  mostraErrore,
  nascondiErrore,
  renderSquadre,
  renderDettagli,
} from "./Ui.js";

const form = document.getElementById("form-ricerca");
const input = document.getElementById("input-ricerca");
const listaSquadre = document.getElementById("lista-squadre");
const dettagli = document.getElementById("dettagli");

// Stato: le squadre dell'ultima ricerca
let squadreTrovate = [];

// ===== RICERCA =====
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = input.value.trim();
  if (!query) return;

  nascondiErrore();
  listaSquadre.replaceChildren();
  dettagli.replaceChildren();
  mostraSpinner();

  try {
    squadreTrovate = await cercaSquadre(query);
    renderSquadre(listaSquadre, squadreTrovate);
  } catch (error) {
    console.error(error);
    mostraErrore("Impossibile cercare le squadre. Riprova più tardi.");
  } finally {
    nascondiSpinner();
  }
});

// ===== DETTAGLI =====
async function apriDettagli(id) {
  const squadra = squadreTrovate.find((s) => s.id === id);
  if (!squadra) return;

  nascondiErrore();
  dettagli.replaceChildren();
  mostraSpinner();

  try {
    const { prossimi, ultimi } = await caricaEventi(id);
    renderDettagli(dettagli, squadra, prossimi, ultimi);
  } catch (error) {
    console.error(error);
    mostraErrore("Impossibile caricare gli eventi della squadra. Riprova.");
  } finally {
    nascondiSpinner();
  }
}

// Event delegation: un solo listener per tutte le card
listaSquadre.addEventListener("click", (event) => {
  const card = event.target.closest(".card-squadra");
  if (!card) return;
  apriDettagli(card.dataset.id);
});

// Accessibilità: Invio o Spazio sulla card con il focus
listaSquadre.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;

  const card = event.target.closest(".card-squadra");
  if (!card) return;

  event.preventDefault(); // evita lo scroll della pagina con lo Spazio
  apriDettagli(card.dataset.id);
});