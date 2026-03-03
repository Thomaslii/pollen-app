const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.static("public")); // Frontend-Dateien

const PORT = process.env.PORT || 3000;

// Testroute
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend läuft 🌿" });
});

// Standorte
app.get("/api/locations", async (req, res) => {
  try {
    const response = await axios.get("https://epin.lgl.bayern.de/api/locations");
    res.json(response.data);
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Fehler beim Laden der Standorte" });
  }
});

// Messwerte letzte 7 Tage für ausgewählten Standort, aktuellster Wert pro Pollenart
app.get("/api/measurements", async (req, res) => {
  try {
    const locationId = req.query.location;
    if (!locationId) return res.status(400).json({ error: "location query missing" });

    const now = Math.floor(Date.now() / 1000);
    const sevenDaysAgo = now - 7 * 24 * 60 * 60;

    const response = await axios.get("https://epin.lgl.bayern.de/api/measurements", {
      params: {
        from: sevenDaysAgo,
        to: now,
        location: locationId
      }
    });

    const measurements = response.data.measurements;

    // Gruppieren nach Pollenart und nur den aktuellsten Wert behalten
    const latestPerPollen = {};
    measurements.forEach(m => {
      if (!latestPerPollen[m.pollen] || new Date(m.timestamp) > new Date(latestPerPollen[m.pollen].timestamp)) {
        latestPerPollen[m.pollen] = m;
      }
    });

    res.json(Object.values(latestPerPollen));
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Fehler beim Laden der Messwerte" });
  }
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
