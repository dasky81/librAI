export default async function handler(req, res) {
  // 1. Gestione CORS e Metodi (Vercel gestisce CORS di base, ma controlliamo il metodo)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Recupera la chiave API dalle variabili d'ambiente di Vercel
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Configurazione server errata: API Key mancante' });
  }

  // 3. Estrai il prompt inviato dal frontend
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt mancante' });
  }

  try {
    // 4. Chiama Gemini (Server to Server)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    // 5. Restituisci i dati al frontend
    if (!response.ok) {
      throw new Error(data.error?.message || 'Errore nella chiamata a Gemini');
    }

    res.status(200).json(data);

  } catch (error) {
    console.error("Errore Serverless:", error);
    res.status(500).json({ error: error.message });
  }
}
