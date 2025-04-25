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

      if (data.identify && data.identify.plant_name) {
        imageOutput.style.display = "block";
        imageOutput.src = `data:image/jpeg;base64,${imageBase64}`;
        analysisOutput.innerHTML = `<strong>Plant:</strong> ${data.identify.plant_name}`;
        careTips.innerHTML = `<strong>Health:</strong> ${data.health.health_assessment?.status || 'No health data available.'}`;
      } else {
        analysisOutput.innerHTML = "No plant detected. Try again.";
        careTips.innerHTML = "Ensure the image is clear and focused on the plant.";
      }
    } catch (error) {
      loader.style.display = "none";
      analysisOutput.innerHTML = "Error analyzing the plant.";
      careTips.innerHTML = "Please try again later.";
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
