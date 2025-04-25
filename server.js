const express = require('express');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from the 'public' directory

app.post('/analyze', upload.single('image'), async (req, res) => {
  const imagePath = req.file.path;

  try {
    const imageData = fs.readFileSync(imagePath, { encoding: 'base64' });

    const response = await axios.post('https://api.plant.id/v2/identify', {
      images: [imageData],
      modifiers: ['crops_fast', 'similar_images'],
      plant_language: 'en',
      plant_details: [
        'common_names',
        'url',
        'name_authority',
        'wiki_description',
        'taxonomy',
        'synonyms',
        'edible_parts',
        'propagation_methods',
        'medicinal',
        'toxicity',
        'growth_habit',
        'watering',
        'description'
      ],
      disease_details: ['description', 'treatment', 'common_names']
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': process.env.PLANT_ID_API_KEY
      }
    });

    fs.unlinkSync(imagePath); // Clean up uploaded image

    const result = response.data;
    const suggestion = result?.suggestions?.[0] || {};
    const plantDetails = suggestion?.plant_details || {};

    const plantName = suggestion?.plant_name;
    const scientificName = plantDetails?.scientific_name || 'N/A';

    const displayName = plantName && plantName.toLowerCase() !== 'unknown plant'
      ? plantName
      : scientificName;

    const responseData = {
      name: displayName,
      scientificName: scientificName,
      probability: suggestion?.probability ? (suggestion.probability * 100).toFixed(2) : 'N/A',
      description: plantDetails?.wiki_description?.value || 'No description available.',
      growthHabit: plantDetails?.growth_habit || 'N/A',
      edible: plantDetails?.edible_parts?.length ? 'Yes' : 'No',
      medicinal: plantDetails?.medicinal ? 'Yes' : 'No',
      toxicity: plantDetails?.toxicity || 'N/A',
      issues: result?.health_assessment?.diseases?.length
        ? result.health_assessment.diseases.map(i => `${i.name} (${(i.probability * 100).toFixed(1)}%)`).join(', ')
        : 'No major issues detected'
    };

    res.json(responseData);
  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ error: 'Failed to analyze plant' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
