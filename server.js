const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// CORS erlauben, damit deine HTML-Datei (auch auf GitHub) zugreifen darf
app.use(cors());

app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Kein Suchbegriff angegeben." });

    try {
        // Der Indexer fragt das unzensierte, freie HTTPS-Wissensnetz ab
        const webUrl = `https://wikipedia.org{encodeURIComponent(query)}&format=json`;
        const response = await fetch(webUrl);
        const data = await response.json();

        let results = [];
        if (data && data.query && data.query.search) {
            data.query.search.forEach((item, index) => {
                if (index < 4) { // Die besten 4 Internetquellen extrahieren
                    results.push({
                        title: item.title,
                        url: `https://wikipedia.org{encodeURIComponent(item.title.replace(/ /g, "_"))}`,
                        content: item.snippet.replace(/<\/?[^>]+(>|$)/g, "") + "..."
                    });
                }
            });
        }

        // Ergebnisse ohne Wartezeit direkt an die HTML zurückschicken
        res.json({ results: results });

    } catch (error) {
        res.status(500).json({ error: "Fehler beim Durchsuchen des Internets." });
    }
});

app.listen(PORT, () => console.log(`Indexer läuft auf Port ${PORT}`));
