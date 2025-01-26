const URL = "./my_model/";

let isOpenWebcam = false;

let model, webcam, labelContainer, maxPredictions;
let currentMode = "webcam"; // default mode
const uploadedImage = document.getElementById("uploaded-image");
let wbutton = document.getElementById("webcam-button");

let wbcontainer = document.getElementById("webcam-container");

async function modelLoad() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // load the model and metadata
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  console.log("Loading Model Complete!");
}

async function init() {
  const webcamContainer = document.getElementById("webcam-container");

  if (!isOpenWebcam) {
    // Show webcam container and loading indicator
    wbcontainer.style.display = "block";
    document.getElementById("loading").textContent = "loading...";
    
    isOpenWebcam = true;

    currentMode = "webcam"; // Set mode to webcam

    // Setup or restart the webcam
    if (!webcam) {
      const flip = true;
      webcam = new tmImage.Webcam(width = 400 , height =400, flip); // Create new webcam instance
      await webcam.setup();
    }

    await webcam.play(); // Start webcam playback
    window.requestAnimationFrame(loop);

    // Check if webcam canvas already exists
    if (!webcamContainer.querySelector("canvas")) {
      webcamContainer.appendChild(webcam.canvas); // Append only if not already appended
    }

    // Setup label container
    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = ""; // Clear existing labels
    for (let i = 0; i < maxPredictions; i++) {
      labelContainer.appendChild(document.createElement("div"));
    }
  }

  document.getElementById("loading").textContent = ""; // Clear loading text
}



async function loop() {
  if (currentMode === "webcam") {
    webcam.update(); // Update the webcam frame
    await predict(webcam.canvas);
    window.requestAnimationFrame(loop);
  }
}




async function predict(inputElement) {
  const prediction = await model.predict(inputElement);

  // Find the prediction with the highest probability
  const highestPrediction = prediction.reduce((prev, current) =>
    prev.probability > current.probability ? prev : current
  );

  // Display the highest prediction
  labelContainer.innerHTML = ""; // Clear existing labels
  labelContainer.innerHTML =
    highestPrediction.className +
    ": " +
    highestPrediction.probability.toFixed(2);
}
