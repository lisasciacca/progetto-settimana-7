// tema.js – Tema chiaro / scuro
const CHIAVE_TEMA = "sportshub-tema";

// Tema di partenza: quello scelto dall'utente, altrimenti lo scuro (predefinito)
export function temaIniziale() {
  try {
    const salvato = localStorage.getItem(CHIAVE_TEMA);
    if (salvato === "light" || salvato === "dark") return salvato;
  } catch (error) {
    console.error("Impossibile leggere il tema:", error);
  }

  return "dark";
}

// Applica il tema a tutta la pagina (Bootstrap legge data-bs-theme)
export function applicaTema(tema) {
  document.documentElement.setAttribute("data-bs-theme", tema);
}

// Ricorda la scelta per le visite successive
export function salvaTema(tema) {
  try {
    localStorage.setItem(CHIAVE_TEMA, tema);
  } catch (error) {
    console.error("Impossibile salvare il tema:", error);
  }
}