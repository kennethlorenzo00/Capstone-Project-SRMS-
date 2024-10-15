let imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');
let colonyCountElement = document.getElementById('colonyCount');
let colonyListElement = document.getElementById('colonyList');
let colonies = []; // To store colony data including ID, bounding rect, and validity

inputElement.addEventListener('change', (e) => {
  imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false);

function processImage() {
  let blurSize = parseInt(document.getElementById('blurSize').value);
  let threshBlockSize = parseInt(document.getElementById('threshBlockSize').value);
  let threshC = parseFloat(document.getElementById('threshC').value);
  let minColonySize = parseInt(document.getElementById('minColonySize').value);
  let maxColonySize = parseInt(document.getElementById('maxColonySize').value);

  let mat = cv.imread(imgElement);
  let gray = new cv.Mat();
  let thresh = new cv.Mat();
  
  cv.cvtColor(mat, gray, cv.COLOR_RGB2GRAY, 0);
  cv.GaussianBlur(gray, gray, new cv.Size(blurSize, blurSize), 0);
  cv.adaptiveThreshold(gray, thresh, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, threshBlockSize, threshC);

  // Create a circular mask for the petri dish
  let mask = new cv.Mat.zeros(thresh.rows, thresh.cols, cv.CV_8UC1);
  let center = new cv.Point(thresh.cols / 2, thresh.rows / 2);
  let radius = Math.min(thresh.cols, thresh.rows) / 2 - 40;
  cv.circle(mask, center, radius, new cv.Scalar(255), -1);

  // Apply the mask to focus on the petri dish area
  let masked = new cv.Mat();
  cv.bitwise_and(thresh, mask, masked);

  // Detect contours (colonies)
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(masked, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

  // Clear previous colony list and colonies array
  colonyListElement.innerHTML = '';
  colonies = [];

  // Colony count
  let colonyCount = 0;

  // Draw yellow squares around detected colonies inside the petri dish
  for (let i = 0; i < contours.size(); i++) {
    let rect = cv.boundingRect(contours.get(i));
    let area = rect.width * rect.height;
    
    // Filter out detections based on size
    if (area >= minColonySize && area <= maxColonySize) {
      let size = Math.max(rect.width, rect.height);
      let point1 = new cv.Point(rect.x, rect.y);
      let point2 = new cv.Point(rect.x + size, rect.y + size);
      
      // Only draw colonies if they are well within the petri dish
      let centerX = rect.x + rect.width / 2;
      let centerY = rect.y + rect.height / 2;
      let distanceFromCenter = Math.sqrt(Math.pow(centerX - center.x, 2) + Math.pow(centerY - center.y, 2));
      
      if (distanceFromCenter < radius - 20) {
        colonyCount++;
        let colonyId = `colony-${colonyCount}`;
        
        // Draw the rectangle and "ID: X" on the image
        cv.rectangle(mat, point1, point2, [255, 255, 0, 255], 2);
        let textPosition = new cv.Point(rect.x + 5, rect.y + 20);
        cv.putText(mat, `ID: ${colonyCount}`, textPosition, cv.FONT_HERSHEY_SIMPLEX, 0.5, [255, 255, 255, 255], 2);

        // Store the colony info (including bounding rect and validity)
        colonies.push({ id: colonyId, rect: rect, valid: true });

        // Add colony to list with a checkbox
        let colonyElement = document.createElement('div');
        colonyElement.innerHTML = 
          `<label>ID: ${colonyCount}:</label>
          <input type="checkbox" class="colony-checkbox" id="${colonyId}" data-id="${colonyCount}" checked> Valid`;
        colonyListElement.appendChild(colonyElement);

        // Add event listener for validation toggle
        let checkbox = document.getElementById(colonyId);
        checkbox.addEventListener('change', (e) => {
          let colonyIndex = colonies.findIndex(colony => colony.id === colonyId);
          if (colonyIndex !== -1) {
            toggleColonyVisibility(colonyIndex);
          }
        });
      }
    }
  }

  // Display total colony count
  colonyCountElement.innerHTML = colonyCount;

  cv.imshow('canvasOutput', mat);

  mat.delete();
  gray.delete();
  thresh.delete();
  masked.delete();
  contours.delete();
  hierarchy.delete();
  mask.delete();
}

// Toggle the visibility of a colony and update the image
function toggleColonyVisibility(index) {
  colonies[index].valid = !colonies[index].valid;
  drawValidColonies();
  updateValidColonyCount();
}

// Redraw the image with only the valid colonies and their IDs
function drawValidColonies() {
  let blurSize = parseInt(document.getElementById('blurSize').value);
  let mat = cv.imread(imgElement);
  let gray = new cv.Mat();
  cv.cvtColor(mat, gray, cv.COLOR_RGB2GRAY, 0);
  cv.GaussianBlur(gray, gray, new cv.Size(blurSize, blurSize), 0);

  // Draw only valid colonies and their IDs
  colonies.forEach((colony, index) => {
    if (colony.valid) {
      let rect = colony.rect;
      let size = Math.max(rect.width, rect.height);
      let point1 = new cv.Point(rect.x, rect.y);
      let point2 = new cv.Point(rect.x + size, rect.y + size);
      cv.rectangle(mat, point1, point2, [255, 255, 0, 255], 2);
      let textPosition = new cv.Point(rect.x + 5, rect.y + 20);
      cv.putText(mat, `ID: ${index + 1}`, textPosition, cv.FONT_HERSHEY_SIMPLEX, 0.5, [255, 255, 255, 255], 2);
    }
  });

  cv.imshow('canvasOutput', mat);
  mat.delete();
  gray.delete();
}

// Update the displayed colony count with only valid colonies
function updateValidColonyCount() {
  let validColonyCount = colonies.filter(colony => colony.valid).length;
  colonyCountElement.innerHTML = validColonyCount;
}

// Update output when the user changes any input field
document.querySelectorAll('#blurSize, #threshBlockSize, #threshC, #minColonySize, #maxColonySize').forEach(input => {
  input.addEventListener('input', processImage);
});

// Allow the user to add colonies by clicking on the canvas
document.getElementById('canvasOutput').addEventListener('click', (event) => {
  let canvas = event.target;
  let rect = canvas.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;

  // Add a manually marked colony at the clicked position
  let newColonyId = `colony-${colonies.length + 1}`;
  let newColonyRect = { x: x - 15, y: y - 15, width: 30, height: 30 };
  
  colonies.push({ id: newColonyId, rect: newColonyRect, valid: true });

  let newColonyElement = document.createElement('div');
  newColonyElement.innerHTML = `<label>ID: ${colonies.length}:</label>
    <input type="checkbox" class="colony-checkbox" id="${newColonyId}" data-id="${colonies.length}" checked> Valid`;
  colonyListElement.appendChild(newColonyElement);

  let checkbox = document.getElementById(newColonyId);
  checkbox.addEventListener('change', (e) => {
    let colonyIndex = colonies.findIndex(colony => colony.id === newColonyId);
    if (colonyIndex !== -1) {
      toggleColonyVisibility(colonyIndex);
    }
  });

  // Draw the colony
  drawValidColonies();
  updateValidColonyCount();
});

// Run processImage after the image is loaded
imgElement.onload = function () {
  processImage();
};

var Module = {
  onRuntimeInitialized: function() {
    document.getElementById('status').innerText = 'OpenCV.js is ready!';
  }
};
