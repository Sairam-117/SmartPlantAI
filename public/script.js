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
  const loader = document.getElementById('loader');
  const output = document.getElementById('analysisOutput');
  const tips = document.getElementById('careTips');
  const input = document.getElementById('imageInput');
  const plantImg = document.getElementById('plantImage');

  if (input.files.length === 0) {
    output.innerText = "Please select an image.";
    tips.innerText = "No image selected.";
    return;
  }

  loader.style.display = "block";

  setTimeout(() => {
    loader.style.display = "none";

    // Plant result display with scientific name and health
    const plantName = "Fiddle Leaf Fig";
    const scientificName = "Ficus lyrata";
    const healthStatus = "Good";

    output.innerHTML = `
      <h3>${plantName}</h3>
      <p><strong>Scientific Name:</strong> <em>${scientificName}</em></p>
      <p><strong>Health Assessment:</strong> ${healthStatus}</p>
      <p><strong>Description:</strong> 
      The Fiddle Leaf Fig is a striking houseplant known for its broad, waxy leaves. 
      It's sensitive to overwatering, prefers bright indirect sunlight, and needs consistent humidity. 
      It's excellent for air purification and interior decoration.
      </p>
    `;

    tips.innerText = "Water once a week. Let the topsoil dry out before watering again. Keep in bright, indirect light.";
    plantImg.src = "https://upload.wikimedia.org/wikipedia/commons/e/e5/Ficus_lyrata_2zz.jpg";
    plantImg.style.display = "block";
  }, 2000);
}