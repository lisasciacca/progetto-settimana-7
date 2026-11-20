// Gestione dei preferiti in localStorage
const CHIAVE_PREFERITI = "sportshub-preferiti";

// Legge i preferiti salvati → array (vuoto se non c'è niente o se il dato è rovinato)
export function caricaPreferiti() {
  try {
    const salvati = localStorage.getItem(CHIAVE_PREFERITI);
    if (!salvati) return [];

    const preferiti = JSON.parse(salvati);
    return Array.isArray(preferiti) ? preferiti : [];
  } catch (error) {
    console.error("Impossibile leggere i preferiti:", error);
    return [];
  }
}

// Salva l'array dei preferiti come stringa JSON
export function salvaPreferiti(preferiti) {
  try {
    localStorage.setItem(CHIAVE_PREFERITI, JSON.stringify(preferiti));
  } catch (error) {
    console.error("Impossibile salvare i preferiti:", error);
  }
}