require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.static("public"));

app.post("/identify", async (req, res) => {
  const { imageBase64 } = req.body;
  const API_KEY = process.env.PLANT_ID_API_KEY;

  try {
    const [identifyRes, healthRes] = await Promise.all([
      axios.post(
        "https://api.plant.id/v2/identify",
        {
          images: [imageBase64],
          similar_images: true,
          organs: ["leaf", "flower", "fruit", "bark"],
          details: ["common_names", "url", "wiki_description", "taxonomy", "synonyms", "edibility", "growth_habit", "medicinal", "toxicity"],
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Api-Key": API_KEY
          }
        }
      ),
      axios.post(
        "https://api.plant.id/v2/health_assessment",
        {
          images: [imageBase64],
          similar_images: false
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Api-Key": API_KEY
          }
        }
      )
    ]);

    const suggestion = identifyRes.data?.suggestions?.[0] || {};
    const health = healthRes.data?.health_assessment || {};

    res.json({
      identify: {
        plant_details: suggestion?.plant_details || {},
        probability: suggestion?.probability || 0,
        description: suggestion?.plant_details?.wiki_description || {},
      },
      health: {
        is_healthy_probability: health?.is_healthy?.probability || null,
        diseases: health?.diseases || [],
        status: health?.is_healthy?.status || "Unknown"
      }
    });

  } catch (err) {
    console.error("❌ API error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to analyze plant." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
