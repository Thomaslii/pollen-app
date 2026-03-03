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

// Pollendaten
app.get("/api/pollen", async (req, res) => {
  try {
    const response = await axios.get("https://epin.lgl.bayern.de/api/pollen");
    res.json(response.data);
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Fehler beim Laden der Pollendaten" });
  }
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

// Messwerte letzte 7 Tage
app.get("/api/measurements", async (req, res) => {
  try {
    const now = Math.floor(Date.now() / 1000);
    const sevenDaysAgo = now - 7 * 24 * 60 * 60;

    const response = await axios.get("https://epin.lgl.bayern.de/api/measurements", {
      params: {
        from: sevenDaysAgo,
        to: now
      }
    });

    res.json(response.data.measurements);
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Fehler beim Laden der Messwerte" });
  }
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
