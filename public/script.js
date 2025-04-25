// script.js

// Login Functionality
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (email && password) {
    // Hide login page and show the main app
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("appContainer").style.display = "flex";
  } else {
    alert("Please enter both email and password.");
  }
}

// Analyze Image Functionality
async function analyzeImage() {
  const imageInput = document.getElementById("imageInput");
  const loader = document.getElementById("loader");
  const imageOutput = document.getElementById("plantImage");
  const analysisOutput = document.getElementById("analysisOutput");
  const careTips = document.getElementById("careTips");

  if (!imageInput.files.length) {
    alert("Please upload an image.");
    return;
  }

  loader.style.display = "inline-block";
  analysisOutput.innerText = "Analyzing...";

  const file = imageInput.files[0];
  const reader = new FileReader();

  reader.onloadend = async function () {
    const imageBase64 = reader.result.split(",")[1];

    try {
      const response = await fetch("/identify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageBase64 }),
      });

      const data = await response.json();
      loader.style.display = "none";

      if (data.identify && data.identify.plant_details) {
        const plant = data.identify.plant_details;
        const health = data.health.health_assessment;

        imageOutput.style.display = "block";
        imageOutput.src = `data:image/jpeg;base64,${imageBase64}`;

        const plantName = plant.common_names?.[0] || "Unknown Plant";
        const scientificName = plant.scientific_name || "N/A";
        const confidence = (data.identify.probability * 100).toFixed(2);
        const description = plant.wiki_description?.value || "No description available.";
        const diseaseStatus = health?.status || "No health data available.";
        const diseaseSymptoms = health?.diseases?.map(d => d.name).join(", ") || "No disease detected.";

        analysisOutput.innerHTML = `
          <h3>${plantName}</h3>
          <p><strong>Scientific Name:</strong> ${scientificName}</p>
          <p><strong>Confidence:</strong> ${confidence}%</p>
          <p><strong>Health Status:</strong> ${diseaseStatus}</p>
          <p><strong>Description:</strong> ${description}</p>
          <p><strong>Potential Issues:</strong> ${diseaseSymptoms}</p>
        `;

        // Provide dynamic and realistic care tips
        if (diseaseStatus === "Healthy") {
          careTips.innerHTML = "Your plant looks healthy! Keep watering it regularly, but avoid overwatering.";
        } else if (diseaseSymptoms) {
          careTips.innerHTML = `The plant may have the following issues: ${diseaseSymptoms}. Consider improving watering schedule, light exposure, and soil conditions.`;
        } else {
          careTips.innerHTML = "No major issues detected. Maintain a healthy watering and sunlight routine.";
        }
      } else {
        analysisOutput.innerHTML = "No plant detected. Please try again with a clearer image.";
        careTips.innerHTML = "Ensure the image is clear and focused on the plant.";
      }
    } catch (error) {
      loader.style.display = "none";
      analysisOutput.innerHTML = "Error analyzing the plant. Please try again.";
      careTips.innerHTML = "Something went wrong. Please try again later.";
    }
  };

  reader.readAsDataURL(file);
}

// Watering Reminder Toggle
function toggleReminder() {
  const reminderToggle = document.getElementById("reminderToggle");
  if (reminderToggle.checked) {
    alert("Watering reminder enabled.");
  } else {
    alert("Watering reminder disabled.");
  }
}
