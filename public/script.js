function login() {
  const user = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  if (user && pass) {
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("appContainer").style.display = "flex";
  } else {
    alert("Please enter email and password.");
  }
}

function analyzeImage() {
  const loader = document.getElementById("loader");
  const output = document.getElementById("analysisOutput");
  const tips = document.getElementById("careTips");
  const input = document.getElementById("imageInput");
  const plantImg = document.getElementById("plantImage");

  if (input.files.length === 0) {
    output.innerText = "Please select an image.";
    tips.innerText = "No image selected.";
    return;
  }

  const file = input.files[0];
  const reader = new FileReader();

  reader.onloadend = async function () {
    const base64Image = reader.result.replace(/^data:image\/\w+;base64,/, '');
    loader.style.display = "block";

    try {
      const res = await fetch("https://smartplantai.onrender.com/identify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ imageBase64: base64Image })
      });

      const data = await res.json();
      loader.style.display = "none";

      const plant = data.identify?.plant_details || {};
      const health = data.health || {};
      const plantName = plant.common_names?.[0] || "Unknown Plant";
      const scientific = plant.scientific_name || "N/A";
      const description = plant.wiki_description?.value || "No description available.";
      const probability = (data.identify?.probability * 100).toFixed(2);
      const disease = health?.is_healthy_probability
        ? health.is_healthy_probability > 0.6 ? "Healthy" : "Needs Attention"
        : "Unknown";

      output.innerHTML = `
        <h3>${plantName}</h3>
        <p><strong>Scientific Name:</strong> <em>${scientific}</em></p>
        <p><strong>Confidence:</strong> ${probability}%</p>
        <p><strong>Health Assessment:</strong> ${disease}</p>
        <p><strong>Description:</strong> ${description}</p>
      `;

      tips.innerText = health.diseases?.length
        ? `Potential issues: ${health.diseases.map(d => d.name).join(', ')}`
        : "Water regularly. Avoid overexposure to sun. Fertilize monthly.";

      plantImg.src = reader.result;
      plantImg.style.display = "block";
    } catch (err) {
      loader.style.display = "none";
      output.innerText = "Error during analysis.";
      console.error(err);
    }
  };

  reader.readAsDataURL(file);
}

function toggleReminder() {
  alert("Watering reminders activated! You will be notified weekly (mock).");
}
