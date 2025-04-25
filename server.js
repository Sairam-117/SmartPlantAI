const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set up Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage: storage });

// POST /analyze endpoint
app.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    const imagePath = req.file.path;

    // Read the image file
    const imageData = fs.readFileSync(imagePath);

    // Prepare the form data
    const formData = new FormData();
    formData.append('images', imageData, {
      filename: req.file.filename,
      contentType: req.file.mimetype
    });

    // Send the image to the Plant.id API
    const response = await axios.post('https://api.plant.id/v2/identify', formData, {
      headers: {
        ...formData.getHeaders(),
        'Api-Key': process.env.PLANT_ID_API_KEY
      }
    });

    // Delete the uploaded image after processing
    fs.unlinkSync(imagePath);

    // Extract relevant data from the API response
    const suggestions = response.data.suggestions;
    if (suggestions && suggestions.length > 0) {
      const bestMatch = suggestions[0];
      const result = {
        plantName: bestMatch.plant_name,
        scientificName: bestMatch.scientific_name,
        confidence: bestMatch.probability * 100,
        description: bestMatch.description || 'N/A',
        growthHabit: bestMatch.growth_habit || 'N/A',
        edible: bestMatch.edible ? 'Yes' : 'No',
        medicinalUse: bestMatch.medicinal ? 'Yes' : 'No',
        toxicity: bestMatch.toxicity || 'N/A',
        potentialIssues: bestMatch.potential_issues || 'N/A'
      };
      res.json(result);
    } else {
      res.status(404).json({ error: 'Plant not identified.' });
    }
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Failed to analyze the image.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
