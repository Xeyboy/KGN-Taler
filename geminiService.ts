import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialAdvice = async (
  balance: number,
  transactions: Transaction[]
): Promise<string> => {
  try {
    const recentTransactions = transactions.slice(0, 10);
    const transactionSummary = JSON.stringify(recentTransactions);

    const prompt = `
      Du bist ein freundlicher, motivierender Finanzberater für Schüler, die die Schulwährung "KGN Taler" nutzen.
      
      Aktuelles Guthaben: ${balance} KGN Taler.
      Letzte Transaktionen: ${transactionSummary}

      Bitte analysiere kurz das Ausgabeverhalten.
      1. Gib eine kurze Zusammenfassung (auf Deutsch).
      2. Mache einen lustigen oder hilfreichen Spar-Tipp basierend auf den Ausgaben (z.B. weniger Süßigkeiten am Kiosk, wenn das oft vorkommt).
      3. Bleib kurz und prägnant (max 3-4 Sätze).
      Nutze Emojis.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Konnte keine Finanztipps laden.";
  } catch (error) {
    console.error("Error fetching Gemini advice:", error);
    return "Hoppla! Mein KI-Gehirn macht gerade eine Pause. Versuche es später noch einmal.";
  }
};