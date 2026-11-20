// semplificata.js – Modalità semplificata (accessibilità)
const CHIAVE_SEMPLIFICATA = "sportshub-semplificata";

// Stato di partenza: quello salvato, altrimenti spenta
export function semplificataIniziale() {
  try {
    return localStorage.getItem(CHIAVE_SEMPLIFICATA) === "true";
  } catch (error) {
    console.error("Impossibile leggere la modalità semplificata:", error);
    return false;
  }
}

// Attiva o disattiva le regole CSS [data-semplificata="true"]
export function applicaSemplificata(attiva) {
  if (attiva) {
    document.documentElement.setAttribute("data-semplificata", "true");
  } else {
    document.documentElement.removeAttribute("data-semplificata");
  }
}

// Ricorda la scelta per le visite successive
export function salvaSemplificata(attiva) {
  try {
    localStorage.setItem(CHIAVE_SEMPLIFICATA, String(attiva));
  } catch (error) {
    console.error("Impossibile salvare la modalità semplificata:", error);
  }
}