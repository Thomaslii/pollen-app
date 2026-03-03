const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static("public"));

const PORT = 3000;

// ⚠️ Für lokale Entwicklung bei Firmen-PCs / Proxy
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Pollenarten von ePIN
app.get("/api/pollen", async (req, res) => {
  try {
    const response = await axios.get("https://epin.lgl.bayern.de/api/pollen");
    res.json(response.data); // Array ["Abies","Acer",...]
  } catch (error) {
    console.error(error.message);
    // Fallback auf Beispiel-Daten
    res.json(["Betula", "Alnus", "Ambrosia", "Acer"]);
  }
});

// Standorte von ePIN
app.get("/api/locations", async (req, res) => {
  try {
    const response = await axios.get("https://epin.lgl.bayern.de/api/locations");
    const locations = response.data.map(l => ({ id: l.id, name: l.name }));
    res.json(locations);
  } catch (error) {
    console.error(error.message);
    // Fallback auf Beispiel-Standorte
    res.json([
      { id: "DEALTO", name: "Altötting" },
      { id: "DEFEUC", name: "Feucht" },
      { id: "DEBIED", name: "Biedersteiner Straße" }
    ]);
  }
});

// Messwerte von ePIN (letzte 24h)
app.get("/api/measurements", async (req, res) => {
  try {
    const to = Math.floor(Date.now() / 1000);
    const from = to - 24 * 60 * 60;
    const response = await axios.get(`https://epin.lgl.bayern.de/api/measurements?from=${from}&to=${to}`);

    const measurements = [];
    response.data.measurements.forEach(m => {
      if (m.data && m.data.length > 0) {
        const last = m.data[m.data.length - 1];
        measurements.push({
          location: m.location,
          pollen: m.polle,
          value: last.value
        });
      }
    });

    res.json(measurements);
  } catch (error) {
    console.error(error.message);
    // Fallback auf Beispiel-Messwerte
    res.json([
      { location: "DEALTO", pollen: "Betula", value: 12 },
      { location: "DEALTO", pollen: "Alnus", value: 5 },
      { location: "DEFEUC", pollen: "Ambrosia", value: 30 },
      { location: "DEBIED", pollen: "Acer", value: 2 }
    ]);
  }
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});