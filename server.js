const express = require('express');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

app.post('/analyze', upload.single('image'), async (req, res) => {
  const imagePath = req.file.path;
  const formData = new FormData();
  formData.append('images', fs.createReadStream(imagePath));
  formData.append('modifiers', ['crops_fast', 'similar_images']);
  formData.append('plant_language', 'en');
  formData.append('plant_details', [
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
  ]);
  formData.append('disease_details', [
    'description',
    'treatment',
    'common_names'
  ]);

  try {
    const response = await axios.post('https://api.plant.id/v2/identify', formData, {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        'Api-Key': process.env.PLANT_ID_API_KEY
      }
    });

    fs.unlinkSync(imagePath); // clean up
    res.json(response.data);
  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ error: 'Failed to analyze plant' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
