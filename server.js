// ✅ Final fixed version of SmartPlantAI server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express(); // ✅ Define app before using it
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // ✅ Serve frontend files from /public

// Plant Identification + Health
app.post('/identify', async (req, res) => {
  const { imageBase64 } = req.body;

  try {
    const API_KEY = process.env.PLANT_ID_API_KEY;

    const identifyRes = await axios.post('https://api.plant.id/v2/identify', {
      images: [imageBase64],
      similar_images: true
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': API_KEY
      }
    });

    const healthRes = await axios.post('https://api.plant.id/v2/health_assessment', {
      images: [imageBase64]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': API_KEY
      }
    });

    res.json({
      identify: identifyRes.data?.suggestions?.[0] || {},
      health: healthRes.data?.health_assessment || {}
    });
  } catch (error) {
    console.error('❌ Error analyzing the plant:', error.message);
    res.status(500).json({ error: 'Failed to analyze the plant.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ SmartPlantAI server running at http://localhost:${PORT}`);
});
