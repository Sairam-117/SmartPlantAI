// script.js

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (email && password) {
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("appContainer").style.display = "flex";
  } else {
    alert("Please enter both email and password.");
  }
}

function analyzeImage() {
  const fileInput = document.getElementById("imageInput");
  const loader = document.getElementById("loader");
  const analysisOutput = document.getElementById("analysisOutput");
  const careTips = document.getElementById("careTips");
  const plantImage = document.getElementById("plantImage");

  if (!fileInput.files.length) {
    alert("Please upload an image first.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const imageBase64 = e.target.result.split(",")[1];
    loader.style.display = "block";
    analysisOutput.innerHTML = "Analyzing...";
    careTips.innerHTML = "";
    plantImage.style.display = "none";

    fetch("/identify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64 }),
    })
      .then((res) => res.json())
      .then((data) => {
        loader.style.display = "none";
        const plant = data.identify || {};
        const health = data.health || {};

        plantImage.src = e.target.result;
        plantImage.style.display = "block";

        const name = plant.plant_name || "Unknown Plant";
        const sciName = plant.scientific_name || "N/A";
        const probability = (plant.probability * 100).toFixed(2);
        const description = plant.details?.description || "No description available.";
        const growth = plant.details?.growth_habit || "N/A";
        const edible = plant.details?.edible ? "Yes" : "No";
        const medicinal = plant.details?.medicinal ? "Yes" : "No";
        const toxicity = plant.details?.toxicity || "N/A";

        const issues = health.diseases?.length
          ? health.diseases.map(d => `${d.name} (${(d.probability * 100).toFixed(1)}%)`).join(", ")
          : "No disease detected";

        analysisOutput.innerHTML = `
          <strong>Plant Name:</strong> ${name}<br>
          <strong>Scientific Name:</strong> ${sciName}<br>
          <strong>Confidence:</strong> ${probability}%<br>
          <strong>Description:</strong> ${description}<br>
          <strong>Growth Habit:</strong> ${growth}<br>
          <strong>Edible:</strong> ${edible}<br>
          <strong>Medicinal Use:</strong> ${medicinal}<br>
          <strong>Toxicity:</strong> ${toxicity}<br>
          <strong>Potential Issues:</strong> ${issues}
        `;

        careTips.innerHTML = health.diseases?.length
          ? `Tips: Monitor for symptoms of ${issues.split(",")[0]}. Maintain proper watering and light.`
          : "Your plant looks healthy! Keep watering regularly and provide indirect sunlight.";
      })
      .catch((err) => {
        loader.style.display = "none";
        console.error("Error analyzing image:", err);
        analysisOutput.innerHTML = "Failed to analyze image.";
      });
  };

  reader.readAsDataURL(fileInput.files[0]);
}

function toggleReminder() {
  const reminderEnabled = document.getElementById("reminderToggle").checked;
  alert(reminderEnabled ? "Watering reminders enabled!" : "Reminders disabled.");
}
