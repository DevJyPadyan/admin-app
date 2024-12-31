import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, child, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"
import { getStorage, ref as ref2, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js"
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase();
const storage = getStorage(app);

let files = [];
let imagelink = [];
let currentStep = 1; // Initialize the current step

function showLoader() {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.style.display = "flex";
  }
}

// Hide loader
function hideLoader() {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.style.display = "none";
  }
}

// Step-based navigation
function nextStep(step) {

  document.getElementById(`step${currentStep}`).classList.remove("active");
  document.getElementById(`step${step}`).classList.add("active");

  // Update progress bar and indicators
  updateProgressBar(step);
  updateProgressIndicators(step);

  // Update the current step
  currentStep = step;
  if (step === 3) {
    setupWeekContainer();
  }
}

function prevStep(step) {

  document.getElementById(`step${currentStep}`).classList.remove("active");
  document.getElementById(`step${step}`).classList.add("active");

  // Update progress bar and indicators
  updateProgressBar(step);
  updateProgressIndicators(step);

  // Update the current step
  currentStep = step;
}

function updateProgressBar(step) {
  const progressBar = document.getElementById("progressBar");

  const progressPercentage = (step / 4) * 100;

  progressBar.style.width = `${progressPercentage}%`;
  progressBar.innerText = `Step ${step} of 4`;
}

function updateProgressIndicators(step) {

  const circle1 = document.getElementById("circle1");
  const circle2 = document.getElementById("circle2");
  const circle3 = document.getElementById("circle3");
  const circle4 = document.getElementById("circle4");
  const line1 = document.getElementById("line1");
  const line2 = document.getElementById("line2");
  const line3 = document.getElementById("line3");


  circle1.classList.remove("completed");
  circle2.classList.remove("completed");
  circle3.classList.remove("completed");
  circle4.classList.remove("completed");
  line1.classList.remove("completed");
  line2.classList.remove("completed");
  line3.classList.remove("completed");

  // Update progress indicators based on the current step
  if (step >= 1) circle1.classList.add("completed");
  if (step >= 2) {
    circle2.classList.add("completed");
    line1.classList.add("completed");
  }
  if (step >= 3) {
    circle3.classList.add("completed");
    line2.classList.add("completed");
  }
  if (step === 4) {
    circle4.classList.add("completed");
    line3.classList.add("completed");
  }

  // Update active step text
  document.querySelectorAll(".step-text").forEach((text, index) => {
    if (index + 1 === step) {
      text.classList.add("active");
    } else {
      text.classList.remove("active");
    }
  });
}

const extrasContainer = document.getElementById("extras-container");
const addItemButton = document.getElementById("addItemButton");
const removeItemButton = document.getElementById("removeItemButton");

let extraItemCount = 0; //Track the number of extra items added

addItemButton.addEventListener("click", () => {
  extraItemCount++;

  const newRow = document.createElement("div");
  newRow.classList.add("extra-row", "mt-2");

  newRow.innerHTML = `
                    <div class="input-items">
                        <div class="row gy-3">
                            <div class="col-xl-6">
                                <div class="input-box">
                                    <h6>Food Name</h6>
                                    <input type="text" class="food-name"
                                        placeholder="Enter Food Name">
                                </div>
                            </div>
                            <div class="col-xl-6">
                                <div class="input-box">
                                    <h6>Food Price</h6>
                                    <input type="text" class="food-price"
                                        placeholder="Enter Food Price (in Rs)">
                                </div>
                            </div>
                        </div>
                    </div>
  `;

  extrasContainer.appendChild(newRow);
});

// Event listener for removing the food item
removeItemButton.addEventListener("click", () => {
  const rows = extrasContainer.querySelectorAll(".extra-row");

  if (rows.length > 0) {
    const lastRow = rows[rows.length - 1]; // Get the last row
    extrasContainer.removeChild(lastRow); // Remove the last row
    extraItemCount--;
  } else {
    alert("No more items to remove!");
  }
});
document.getElementById("files").addEventListener("change", function (e) {
  files = e.target.files;
  for (let i = 0; i < files.length; i++) {
  }
});
document.getElementById("uploadImage").addEventListener("click", async function () {
  const hname = document.getElementById("hostelname").value;

  if (files.length === 0) { // Check if files are selected
    alert("No file chosen");
    return;
  }

  // Upload each file
  for (let i = 0; i < files.length; i++) {
    const storageRef = ref2(storage, 'images/' + hname + '/hostelImg/' + files[i].name);
    const upload = await uploadBytes(storageRef, files[i]);
    const imageUrl = await getDownloadURL(storageRef);
    imagelink.push(imageUrl);
  }

  // Store image URLs in Firebase Database
  const imageRef = ref(db, 'Hostel details/' + hname + '/ImageData/' + '/');
  set(imageRef, imagelink)
    .then(() => {
      alert("To start uploading, please click OK");
      alert("Image is uploading, please click OK");
      alert("Image is uploaded");
      //console.log("Image URLs have been successfully stored!");
    })
    .catch((error) => {
      console.error("Error uploading images: ", error.message);
      alert("Error uploading images. Please try again.");
    });
});


/* Start of adding room details using dynamic form handling */
document.addEventListener('DOMContentLoaded', function () {
  function addStyles() {
    const styles = `
      /* Ensure full-width layout for Room Containers */
        .room-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
        }

        .card-body .btn.restaurant-button {
          margin-bottom: 1rem;
        }

        .room-container {
          border: 1px solid #ddd;
          border-radius: 5px;
          background-color: #f9f9f9;
          padding: 15px;
        }

        .card-header {
          background-color: #f1f1f1;
          border-bottom: 1px solid #ddd;
        }
        
        .input-box select {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }

      .input-box select:focus {
        border-color: #66afe9;
        outline: none;
        box-shadow: 0 0 5px rgba(102, 175, 233, 0.6);
      }
        
    `;

    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
  }

  // Call this function to inject the CSS when the script loads
  addStyles();

  // Dynamic Floor and Room Management
  const addFloorsButton = document.getElementById("addfloors");
  const floorsContainer = document.getElementById("floors-container");

  addFloorsButton.addEventListener('click', () => {
    const floorInput = document.getElementById("hostelfloors");
    const numFloors = parseInt(floorInput.value);

    if (numFloors <= 0 || isNaN(numFloors)) {
      alert("Please enter a valid number of floors.");
      return;
    }

    floorsContainer.innerHTML = "";
    for (let i = 1; i <= numFloors; i++) {
      createFloorContainer(i);
    }
  });

  function createFloorContainer(floorNumber) {
    const floorElem = document.createElement("div");
    floorElem.classList.add("col-12", "mb-4");

    const cardElem = document.createElement("div");
    cardElem.classList.add("card");

    const cardHeaderElem = document.createElement("div");
    cardHeaderElem.classList.add("card-header", "d-flex", "justify-content-between", "align-items-center");

    const floorLabel = document.createElement("h5");
    floorLabel.innerText = `Floor ${floorNumber}`;
    cardHeaderElem.appendChild(floorLabel);

    const cardBodyElem = document.createElement("div");
    cardBodyElem.classList.add("card-body");

    const addRoomButton = document.createElement("button");
    addRoomButton.type = "button";
    addRoomButton.classList.add("btn", "restaurant-button", "mb-3");
    addRoomButton.innerText = "Add Room Info";
    addRoomButton.addEventListener("click", () => {
      createRoomContainer(cardBodyElem, floorNumber);
    });

    cardBodyElem.appendChild(addRoomButton);
    cardElem.appendChild(cardHeaderElem);
    cardElem.appendChild(cardBodyElem);
    floorElem.appendChild(cardElem);
    floorsContainer.appendChild(floorElem);
  }

  function createRoomContainer(parentElem, floorNumber) {
    const roomCount = parentElem.querySelectorAll(".room-container").length + 1;

    let roomWrapper = parentElem.querySelector(".room-wrapper");
    if (!roomWrapper) {
      roomWrapper = document.createElement("div");
      roomWrapper.classList.add("room-wrapper", "d-flex", "flex-column", "gap-3");
      parentElem.appendChild(roomWrapper);
    }

    const mainParentElem = document.createElement('div');
    mainParentElem.classList.add('col-12');

    const roomElem = document.createElement("div");
    roomElem.classList.add("card", "mb-3", "room-container");

    roomElem.setAttribute("data-floor", floorNumber);

    const roomHeader = document.createElement("div");
    roomHeader.classList.add("card-header", "d-flex", "justify-content-between", "align-items-center");

    const roomLabel = document.createElement("h6");
    roomLabel.innerText = `Room ${roomCount} (Floor ${floorNumber})`;

    const deleteIcon = document.createElement("a");
    deleteIcon.className = "ri-delete-bin-line";
    deleteIcon.style.fontSize = "24px";
    deleteIcon.style.cursor = "pointer";
    deleteIcon.onclick = () => mainParentElem.remove();

    roomHeader.appendChild(roomLabel);
    roomHeader.appendChild(deleteIcon);

    const roomBody = document.createElement("div");
    roomBody.classList.add("card-body");

    const rowElem = document.createElement("div");
    rowElem.classList.add("row", "gy-3");

    rowElem.appendChild(createSelectBox("Room Type", `roomType-${floorNumber}-${roomCount}`, true, [
      { value: '1 sharing', text: '1 sharing' },
      { value: '2 sharing', text: '2 sharing' },
      { value: '3 sharing', text: '3 sharing' },
      { value: '4 sharing', text: '4 sharing' }
    ]));
    rowElem.appendChild(createInputBox("Room Count", `roomCount-${floorNumber}-${roomCount}`, "number", true));
    rowElem.appendChild(createInputBox("Amenities", `amenities-${floorNumber}-${roomCount}`, "text", false, "e.g., WiFi, Laundry"));
    rowElem.appendChild(createInputBox("Price", `price-${floorNumber}-${roomCount}`, "number", true));
    rowElem.appendChild(createInputBox("Upload Room Images", `roomImage-${floorNumber}-${roomCount}`, "file", false, "", true));

    rowElem.appendChild(createSelectBox("Bathroom Type", `bathroom-${floorNumber}-${roomCount}`, true, [
      { value: "attached", text: "attached" },
      { value: "common", text: "common" },
    ]));

    rowElem.appendChild(createSelectBox("AC Type", `acType-${floorNumber}-${roomCount}`, true, [
      { value: "ac", text: "ac" },
      { value: "non-ac", text: "non-ac" },
    ]));

    rowElem.appendChild(createInputBox("Remarks", `remarks-${floorNumber}-${roomCount}`, "text", false, "Additional comments"));

    roomBody.appendChild(rowElem);

    roomElem.appendChild(roomHeader);
    roomElem.appendChild(roomBody);

    mainParentElem.appendChild(roomElem);
    roomWrapper.appendChild(mainParentElem);
  }

  function createInputBox(labelText, inputId, inputType, required, placeholder = "", multiple = false) {
    const colElem = document.createElement("div");
    colElem.classList.add("col-xl-6");

    const inputBoxElem = document.createElement("div");
    inputBoxElem.classList.add("input-box");

    const labelElem = document.createElement("h6");
    labelElem.innerText = labelText;

    const inputElem = document.createElement("input");
    inputElem.type = inputType;
    inputElem.id = inputId;
    inputElem.name = inputId;
    if (required) inputElem.required = true;
    if (placeholder) inputElem.placeholder = placeholder;
    if (multiple) inputElem.multiple = true;

    inputBoxElem.appendChild(labelElem);
    inputBoxElem.appendChild(inputElem);
    colElem.appendChild(inputBoxElem);

    return colElem;
  }

  function createSelectBox(labelText, selectId, required, options) {
    const colElem = document.createElement("div");
    colElem.classList.add("col-xl-6");

    const inputBoxElem = document.createElement("div");
    inputBoxElem.classList.add("input-box");

    const labelElem = document.createElement("h6");
    labelElem.innerText = labelText;

    const selectElem = document.createElement("select");
    selectElem.id = selectId;
    selectElem.name = selectId;
    if (required) selectElem.required = true;

    options.forEach(option => {
      const optElem = document.createElement("option");
      optElem.value = option.value;
      optElem.text = option.text;
      selectElem.appendChild(optElem);
    });

    inputBoxElem.appendChild(labelElem);
    inputBoxElem.appendChild(selectElem);
    colElem.appendChild(inputBoxElem);

    return colElem;
  }
});

// Helper function to format time to 12-hour format with AM/PM
function formatTimeToAmPm(time24) {
  const [hours, minutes] = time24.split(':');
  const hoursInt = parseInt(hours);
  const period = hoursInt >= 12 ? 'PM' : 'AM';
  const hours12 = hoursInt % 12 || 12; // Convert 0 to 12 for midnight
  return `${hours12}:${minutes} ${period}`;
}

// Function to create time range input elements for food menu timings
function createTimeRangeInput(startId, endId) {
  const colElem = document.createElement('div');
  colElem.classList.add('col-xl-6');

  const inputBoxElem = document.createElement('div');
  inputBoxElem.classList.add('input-box');

  const timeInputContainer = document.createElement('div');
  timeInputContainer.classList.add('d-flex', 'gap-2');

  const startLabelElem = document.createElement('label');
  startLabelElem.innerText = 'From:';
  const startInputElem = document.createElement('input');
  startInputElem.type = 'time';
  startInputElem.id = startId;
  startInputElem.name = startId;

  const endLabelElem = document.createElement('label');
  endLabelElem.innerText = 'To:';
  const endInputElem = document.createElement('input');
  endInputElem.type = 'time';
  endInputElem.id = endId;
  endInputElem.name = endId;

  timeInputContainer.appendChild(startLabelElem);
  timeInputContainer.appendChild(startInputElem);
  timeInputContainer.appendChild(endLabelElem);
  timeInputContainer.appendChild(endInputElem);

  inputBoxElem.appendChild(timeInputContainer);
  colElem.appendChild(inputBoxElem);

  return colElem;
}
const morningTimeContainer = document.getElementById("morningTimeContainer");
const afternoonTimeContainer = document.getElementById("afternoonTimeContainer");
const eveningTimeContainer = document.getElementById("eveningTimeContainer");
const nightTimeContainer = document.getElementById("nightTimeContainer");

morningTimeContainer.appendChild(createTimeRangeInput('morningStart', 'morningEnd'));
afternoonTimeContainer.appendChild(createTimeRangeInput('afternoonStart', 'afternoonEnd'));
eveningTimeContainer.appendChild(createTimeRangeInput('eveningStart', 'eveningEnd'));
nightTimeContainer.appendChild(createTimeRangeInput('nightStart', 'nightEnd'));


//style CSS for food selector container
function addStyles1() {
  const styles1 = `
.food-selector {
            font-family: Arial, sans-serif;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
            max-width: 1200px;
            margin: 1rem auto;
            padding: 1rem;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        .tabs {
            display: flex;
            justify-content: space-around;
            background: linear-gradient(to right, #f2a93e, #f07054);
            color: white;
        }
        .tabs button {
            flex: 1;
            background: none;
            border: none;
            color: white;
            font-size: 1rem;
            padding: 0.5rem 1rem;
            text-align: center;
            cursor: pointer;
        }
        .tabs button.active {
            background-color: #444;
            border-bottom: 2px solid #4CAF50;
        }
        .container {
            padding: 1rem;
        }
        .day-container {
            display: none;
        }
        .day-container.active {
            display: block;
        }
        .session-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
        }
        .meal-card {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
            padding: 1rem;
            border: 1px solid #ccc;
            border-radius: 8px;
            background-color: #fff;
        }
        .meal-options {
            width: 100%;
        }
        .meal-item {
            display: flex;
            margin-bottom: 0.5rem;
        }
        .meal-item img {
            width: 70px;
            height: 70px;
            margin-right: 0.5rem;
            border-radius: 4px;
        }
        .actions {
            text-align: center;
            margin-top: 1rem;
            display: flex;
            justify-content: space-between;
        }
        .actions button {
            background-color: #4CAF50;
            color: white;
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .actions button:hover {
            background-color: #45a049;
        }
        .actions button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        .error {
            color: red;
            font-weight: bold;
            margin-top: 1rem;
        }
  `;

  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles1;
  document.head.appendChild(styleSheet);
}

// Call this function to inject the CSS when the script loads
addStyles1();

async function fetchFoodData() {
  const foodMenuRef = ref(db, "Food Menu");
  const snapshot = await get(foodMenuRef);
  if (snapshot.exists()) {
    return snapshot.val();
  } else {
    console.error("No data found at 'Food Menu' path");
    return null;
  }
}
async function setupWeekContainer() {
  const foodData = await fetchFoodData();

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  let weekCounter = 0;

  // Clear any existing event listener on the button
  addWeekButton.onclick = null;

  addWeekButton.onclick = async () => {
    const existingWeeks = await getExistingWeeks();
    if (existingWeeks.length === 0) {
      addWeek(1); // Create Week 1 if no weeks exist
    } else {
      const nextWeek = findNextMissingWeek(existingWeeks);
      addWeek(nextWeek); // Create the next missing week
    }
  };

  function findNextMissingWeek(existingWeeks) {
    const numericWeeks = existingWeeks.map(week => parseInt(week.replace('week', ''), 10));
    for (let i = 1; i <= numericWeeks.length + 1; i++) {
      if (!numericWeeks.includes(i)) {
        return i;
      }
    }
  }

  async function addWeek(weekCounter) {
    const foodSelectorDiv = document.createElement("div");
    foodSelectorDiv.classList.add("food-selector");
    foodSelectorDiv.id = `food-selector-${weekCounter}`;

    const weekHeaderDiv = document.createElement("div");
    weekHeaderDiv.innerHTML = `<center><h2>Week ${weekCounter}</h2></center><br>`;
    foodSelectorDiv.appendChild(weekHeaderDiv);

    const tabsDiv = document.createElement("div");
    tabsDiv.classList.add("tabs");
    tabsDiv.innerHTML = daysOfWeek
      .map((day, index) => `<button data-day="${day}" class="${index === 0 ? "active" : ""}">${day}</button>`)
      .join("");
    foodSelectorDiv.appendChild(tabsDiv);

    const dayDetailsDiv = document.createElement("div");
    dayDetailsDiv.classList.add("day-details");
    dayDetailsDiv.innerHTML = daysOfWeek
      .map(
        (day, index) => `
          <div class="day-container ${index === 0 ? "active" : ""}" id="details-${day}-${weekCounter}">
            <center><h3>${day}</h3></center>
            <div class="session-grid">
              ${["Breakfast", "Lunch", "Snacks", "Dinner"]
            .map(session => createMealCard(session, day, weekCounter, foodData))
            .join("")}
            </div>
          </div>`
      )
      .join("");
    foodSelectorDiv.appendChild(dayDetailsDiv);

    const actionsDiv = document.createElement("div");
    actionsDiv.classList.add("actions");
    foodSelectorDiv.appendChild(actionsDiv);

    const backButton = document.createElement("button");
    backButton.id = `back-btn-${weekCounter}`;
    backButton.disabled = true;
    backButton.innerText = "Back";
    actionsDiv.appendChild(backButton);

    const nextButton = document.createElement("button");
    nextButton.id = `next-btn-${weekCounter}`;
    nextButton.innerText = "Next";
    actionsDiv.appendChild(nextButton);

    const errorMessageDiv = document.createElement("div");
    errorMessageDiv.id = `error-message-${weekCounter}`;
    errorMessageDiv.classList.add("error");
    errorMessageDiv.style.display = "none";
    foodSelectorDiv.appendChild(errorMessageDiv);

    document.getElementById("foodSelectorsContainer").appendChild(foodSelectorDiv);

    const existingWeeks = await getExistingWeeks();
    addWeekCheckboxes(weekCounter, existingWeeks);

    setupTabs(tabsDiv, dayDetailsDiv, weekCounter);
    setupNavigation(actionsDiv, dayDetailsDiv, weekCounter);
  }

  // Function to create week checkboxes for week2, week3, week4, and week5
  function addWeekCheckboxes(currentWeekNum, existingWeeks) {
    const container = document.createElement("div");
    container.classList.add("mt-3");

    const labelElem = document.createElement("h6");
    labelElem.innerText = "Choose the below checkboxes to copy week data";
    labelElem.style.marginBottom = "10px";
    container.appendChild(labelElem);

    const checkboxContainer = document.createElement("div");
    checkboxContainer.classList.add("d-flex", "gap-3");

    [2, 3, 4, 5].forEach(week => {
      const checkboxElem = document.createElement("div");
      checkboxElem.classList.add("form-check", "form-check-inline");

      const inputElem = document.createElement("input");
      inputElem.type = "checkbox";
      inputElem.id = `week${week}`;
      inputElem.classList.add("form-check-input");

      const weekLabelElem = document.createElement("label");
      weekLabelElem.htmlFor = `week${week}`;
      weekLabelElem.innerText = `Week ${week}`;
      weekLabelElem.classList.add("form-check-label");

      checkboxElem.appendChild(inputElem);
      checkboxElem.appendChild(weekLabelElem);
      checkboxContainer.appendChild(checkboxElem);

      const weekExists = existingWeeks.includes(`week${week}`);
      inputElem.disabled = weekExists;
      if (weekExists) {
        weekLabelElem.style.color = 'gray';
      }

      // Event listener for checkbox change
      inputElem.addEventListener("change", async (event) => {
        if (event.target.checked) {
          await copyWeekData(currentWeekNum, week);
        }
      });
    });

    container.appendChild(checkboxContainer);
    document.getElementById(`food-selector-${currentWeekNum}`).appendChild(container);
  }

  function createMealCard(session, day, weekCounter, foodData) {
    const sessionData = foodData[session]?.dishes || [];
    const options = sessionData
      .map(
        dish => ` 
          <div class="meal-item">
            <img src="${dish.image}" alt="${dish.name}" />
            <label>
              <input type="checkbox" value="${dish.id}" data-name="${dish.mainDish}" data-beverage="${dish.beverages}" data-special_dish="${dish.specialDish}" data-image="${dish.image}">
              ${dish.mainDish}
              ${dish.sideDish}
              ${dish.beverages ? `<br><small><b>Beverages:</b> ${dish.beverages}</small>` : ""}
              ${dish.specialDish ? `<br><small><b>Special Dish:</b> ${dish.specialDish}</small>` : ""}
            </label>
          </div>`
      )
      .join("");

    return `
      <div class="meal-card" data-session="${session}">
        <h3>${session}</h3>
        <div class="meal-options">${options}</div>
      </div>`;
  }

  function setupTabs(tabsDiv, dayDetailsDiv, weekCounter) {
    const tabs = tabsDiv.querySelectorAll("button");
    const dayContainers = dayDetailsDiv.querySelectorAll(".day-container");

    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const day = tab.dataset.day;

        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        dayContainers.forEach(container => {
          if (container.id.includes(day)) {
            container.classList.add("active");
          } else {
            container.classList.remove("active");
          }
        });
      });
    });
  }

  function setupNavigation(actionsDiv, dayDetailsDiv, weekCounter) {
    const backButton = actionsDiv.querySelector(`#back-btn-${weekCounter}`);
    const nextButton = actionsDiv.querySelector(`#next-btn-${weekCounter}`);
    const errorMessage = document.getElementById(`error-message-${weekCounter}`);

    const dayContainers = dayDetailsDiv.querySelectorAll(".day-container");
    let currentDayIndex = 0;

    backButton.addEventListener("click", () => {
      if (currentDayIndex > 0) {
        dayContainers[currentDayIndex].classList.remove("active");
        currentDayIndex--;
        dayContainers[currentDayIndex].classList.add("active");
        backButton.disabled = currentDayIndex === 0;
        nextButton.textContent = "Next";
      }
    });

    nextButton.addEventListener("click", async () => {
      if (!validateDaySelection(daysOfWeek[currentDayIndex], weekCounter)) {
        errorMessage.textContent = `Please select at least one option for each session on ${daysOfWeek[currentDayIndex]}.`;
        errorMessage.style.display = "block";
        return;
      }

      errorMessage.style.display = "none";

      if (currentDayIndex < daysOfWeek.length - 1) {
        dayContainers[currentDayIndex].classList.remove("active");
        currentDayIndex++;
        dayContainers[currentDayIndex].classList.add("active");
        backButton.disabled = false;
        if (currentDayIndex === daysOfWeek.length - 1) nextButton.textContent = "Submit";
      } else {
        await logSelections(weekCounter);
        alert(`Week ${weekCounter} selections saved!`);
      }
    });
  }

  function validateDaySelection(day, weekCounter) {
    const checkboxes = document.querySelectorAll(`#details-${day}-${weekCounter} input[type="checkbox"]`);
    return Array.from(checkboxes).some(checkbox => checkbox.checked);
  }

  async function logSelections(weekCounter) {
    const hname = document.getElementById("hostelname").value;
    const selections = {};
    const breakfastStart = document.getElementById("morningStart").value;
    const breakfastEnd = document.getElementById("morningEnd").value;
    const lunchStart = document.getElementById("afternoonStart").value;
    const lunchEnd = document.getElementById("afternoonEnd").value;
    const snacksStart = document.getElementById("eveningStart").value;
    const snacksEnd = document.getElementById("eveningEnd").value;
    const dinnerStart = document.getElementById("nightStart").value;
    const dinnerEnd = document.getElementById("nightEnd").value;

    const timings = {
      Breakfast: `${formatTimeToAmPm(breakfastStart)} - ${formatTimeToAmPm(breakfastEnd)}`,
      Lunch: `${formatTimeToAmPm(lunchStart)} - ${formatTimeToAmPm(lunchEnd)}`,
      Snacks: `${formatTimeToAmPm(snacksStart)} - ${formatTimeToAmPm(snacksEnd)}`,
      Dinner: `${formatTimeToAmPm(dinnerStart)} - ${formatTimeToAmPm(dinnerEnd)}`
    };

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    daysOfWeek.forEach(day => {
      const daySelections = {};
      const checkboxes = document.querySelectorAll(`#details-${day}-${weekCounter} input[type="checkbox"]:checked`);
      checkboxes.forEach(checkbox => {
        const session = checkbox.closest(".meal-card").dataset.session;

        if (!daySelections[session]) {
          daySelections[session] = {
            dishes: [],
            dishTimings: timings[session]
          };
        }

        daySelections[session].dishes.push({
          name: checkbox.dataset.name,
          beverage: checkbox.dataset.beverage,
          special_dish: checkbox.dataset.special_dish,
          image: checkbox.dataset.image
        });
      });

      selections[day] = daySelections;
    });

    try {
      await update(ref(db, `Hostel details/${hname}/weeks/week${weekCounter}`), selections);
      console.log(`Selections for week ${weekCounter} have been successfully updated.`);
    } catch (error) {
      console.error("Error updating selections:", error);
      alert("Failed to update selections. Please try again.");
    }
  }

  async function copyWeekData(sourceWeek, targetWeek) {
    const hname = document.getElementById("hostelname").value;

    // Retrieve the data of the source week
    const sourceWeekRef = ref(db, `Hostel details/${hname}/weeks/week${sourceWeek}`);
    let sourceWeekData;
    try {
      const snapshot = await get(sourceWeekRef);
      if (snapshot.exists()) {
        sourceWeekData = snapshot.val();
      } else {
        console.error("Source week data does not exist.");
        alert(`No data found for week ${sourceWeek}.`);
        return;
      }
    } catch (error) {
      console.error("Error retrieving source week data:", error);
      alert("Failed to retrieve source week data. Please try again.");
      return;
    }

    // Copy data of sorece week
    const targetWeekRef = ref(db, `Hostel details/${hname}/weeks/week${targetWeek}`);
    try {
      await update(targetWeekRef, sourceWeekData);
      alert(`Data copied from week ${sourceWeek} to week ${targetWeek} successfully!`);
    } catch (error) {
      console.error(`Error copying data to week ${targetWeek}:`, error);
      alert(`Failed to copy data to week ${targetWeek}. Please try again.`);
    }
  }

  // Function to get existing weeks from Firebase
  async function getExistingWeeks() {
    const hname = document.getElementById("hostelname").value;
    try {
      const snapshot = await get(ref(db, `Hostel details/${hname}/weeks`));
      return snapshot.exists() ? Object.keys(snapshot.val()) : [];
    } catch (error) {
      console.error("Error fetching existing weeks:", error);
      alert("Failed to fetch existing weeks. Please try again.");
      return [];
    }
  }
}
// Next step 1: Save Hostel Details
document.getElementById("nextButtonStep1").addEventListener("click", async () => {
  try {
    const hostelDetails = {
      hostelName: document.getElementById("hostelname").value,
      hostelType: document.getElementById("hosteltype").value,
      hostelPhone: document.getElementById("hostelphone").value,
      hostelEmail: document.getElementById("hostelemail").value,
      hostelAddress1: document.getElementById("hosteladd1").value,
      hostelAddress2: document.getElementById("hosteladd2").value,
      hostelCity: document.getElementById("hostelcity").value,
      hostelState: document.getElementById("hostelstate").value,
      hostelPin: document.getElementById("hostelpin").value,
    };

    // Validate required fields
    if (Object.values(hostelDetails).some((value) => !value)) {
      alert("Please fill in all required fields.");
      return;
    }

    await update(ref(db, `Hostel details/${hostelDetails.hostelName}`), hostelDetails);
    alert("Hostel details saved successfully!");
    nextStep(2);
  } catch (error) {
    console.error("Error saving hostel details:", error);
    alert("Error saving hostel details: " + error.message);
  }
});

// Next step 2: Save Floor and Room Details
document.getElementById("nextButtonStep2").addEventListener("click", async () => {
  alert("Started loading the hostel room details..");
  showLoader();
  try {
    const floorCount = document.querySelectorAll('.card-header h5').length;
    const hname = document.getElementById("hostelname").value;
    const hostelFloors = document.getElementById("hostelfloors").value;

    let roomsObject = {};

    for (let floorIndex = 1; floorIndex <= floorCount; floorIndex++) {
      const floorNumber = floorIndex;
      let roomNumberCounter = 1;

      const roomContainers = document.querySelectorAll(`.room-container[data-floor="${floorNumber}"]`);

      for (let roomIndex = 0; roomIndex < roomContainers.length; roomIndex++) {
        const roomElem = roomContainers[roomIndex];
        const roomCount = parseInt(roomElem.querySelector(`#roomCount-${floorNumber}-${roomIndex + 1}`).value);
        const roomType = roomElem.querySelector(`#roomType-${floorNumber}-${roomIndex + 1}`).value;
        const amenities = roomElem.querySelector(`#amenities-${floorNumber}-${roomIndex + 1}`).value;
        const acType = roomElem.querySelector(`#acType-${floorNumber}-${roomIndex + 1}`).value; // AC type
        const bathroom = roomElem.querySelector(`#bathroom-${floorNumber}-${roomIndex + 1}`).value;
        const price = roomElem.querySelector(`#price-${floorNumber}-${roomIndex + 1}`).value;
        const remarks = roomElem.querySelector(`#remarks-${floorNumber}-${roomIndex + 1}`).value;
        const imageInput = roomElem.querySelector(`#roomImage-${floorNumber}-${roomIndex + 1}`);
        const files = imageInput.files;
        let roomImages = [];

        const roomTypeBedsAvailable = parseInt(roomType.match(/\d+/)[0]) * roomCount;

        // Uploading images asynchronously
        const uploadPromises = [];
        for (let i = 0; i < files.length; i++) {
          const storageRef = ref2(storage, `Roomimages/${hname}/floor${floorNumber}/room-${roomIndex + 1}/${files[i].name}`);
          const uploadPromise = uploadBytes(storageRef, files[i]).then(async () => {
            const imageUrl = await getDownloadURL(storageRef);
            roomImages.push(imageUrl);
          });
          uploadPromises.push(uploadPromise);
        }

        await Promise.all(uploadPromises);

        // Initialize floor if not already present
        if (!roomsObject[`floor${floorNumber}`]) {
          roomsObject[`floor${floorNumber}`] = {};
        }

        // Initialize room type under the floor if not already present
        if (!roomsObject[`floor${floorNumber}`][roomType]) {
          roomsObject[`floor${floorNumber}`][roomType] = {
            floor: floorNumber,
            price: price,
            roomCount: roomCount,
            roomType: roomType,
            bedsAvailable: roomTypeBedsAvailable,
            rooms: {}
          };
        }

        // Add AC type to the rooms object
        if (!roomsObject[`floor${floorNumber}`][roomType].rooms[acType]) {
          roomsObject[`floor${floorNumber}`][roomType].rooms[acType] = {};
        }

        // Add rooms with the correct format
        for (let roomSubIndex = 1; roomSubIndex <= roomCount; roomSubIndex++) {
          const roomNumber = `roomR${roomNumberCounter++}_F${floorNumber}`;
          const bedsAvailableForRoom = parseInt(roomType.match(/\d+/)[0]);

          roomsObject[`floor${floorNumber}`][roomType].rooms[acType][roomNumber] = {
            ac: acType,
            bathroom: bathroom,
            amenities: amenities,
            remarks: remarks,
            roomNumber: roomNumber,
            price: price,
            roomType: roomType,
            bedsAvailable: bedsAvailableForRoom,
            roomCount: roomCount,
            floor: floorNumber,
            imagesLink: roomImages,
            beds: {}
          };

          // Add beds to the room
          for (let bedIndex = 1; bedIndex <= bedsAvailableForRoom; bedIndex++) {
            const bedKey = `bed ${bedIndex}`;
            roomsObject[`floor${floorNumber}`][roomType].rooms[acType][roomNumber].beds[bedKey] = "not booked";
          }
        }
      }
    }

    // Save the entire roomsObject to Firebase
    await update(ref(db, `Hostel details/${hname}/rooms`), roomsObject);
    await update(ref(db, `Hostel details/${hname}`), { hostelFloors: hostelFloors });

    hideLoader();
    alert("Room details saved successfully!");
    nextStep(3);
  } catch (error) {
    console.error("Error saving room details:", error);
    alert("Error saving room details: " + error.message);
  }
});

// Next step 3: Weekly Menu
document.getElementById("nextButtonStep3").addEventListener("click", async () => {
  try {

    const extrasContainer = document.getElementById("extras-container");
    const foodNameInputs = extrasContainer.querySelectorAll(".food-name");
    const foodPriceInputs = extrasContainer.querySelectorAll(".food-price");

    const extras = {};
    foodNameInputs.forEach((input, index) => {
      const foodName = input.value.trim();
      const foodPrice = foodPriceInputs[index].value.trim();

      if (foodName && foodPrice) {
        extras[index] = {
          foodName: foodName,
          foodPrice: foodPrice,
          available: 'yes'
        };
      }
    });

    if (extras.length === 0) {
      alert("No extras have been added. Please add at least one item before proceeding.");
      return;
    }

    const hname = document.getElementById("hostelname").value;
    await update(ref(db, `Hostel details/${hname}/extras`), extras)

    alert("Food Menu data updated successfully!")
    nextStep(4); // Step 4 is the dummy Submit page
  } catch (error) {
    console.error("Error saving extras data:", error);
    alert("Error saving extras data: " + error.message);
  }
});

// Handle "Submit" button click on Step 4
document.getElementById("submitButton").addEventListener("click", async () => {
  try {
    const hname = document.getElementById("hostelname").value;
    if (!hname) {
      alert("Hostel name is missing. Please complete the earlier steps.");
      return;
    }

    await set(ref(db, `Hostel details/${hname}/status`), { completed: true });

    alert("Your form has been successfully submitted!");
    redirectToHome(); // Redirect user after submission
  } catch (error) {
    console.error("Error during submission:", error);
    alert("Error during submission: " + error.message);
  }
});

function redirectToHome() {
  window.location.href = "hostel-list.html"; // Replace with your desired home page URL
}

// Navigation Buttons
document.getElementById("prevButton").addEventListener("click", () => prevStep(currentStep - 1));

// Save Hostel Details, Floors, and Rooms
/*document.getElementById("nextButton").addEventListener("click", async () => {
  try {
    const hname = document.getElementById("hostelname").value;
    const htype = document.getElementById("hosteltype").value;
    const hphone = document.getElementById("hostelphone").value;
    const hemail = document.getElementById("hostelemail").value;
    const hadd1 = document.getElementById("hosteladd1").value;
    const hadd2 = document.getElementById("hosteladd2").value;
    const hcity = document.getElementById("hostelcity").value;
    const hstate = document.getElementById("hostelstate").value;
    const hpin = document.getElementById("hostelpin").value;
    const hfloors = document.getElementById("hostelfloors").value;

    // Validate required fields
    if (!hname || !htype || !hphone || !hemail || !hadd1 || !hcity || !hstate || !hpin || !hfloors) {
      alert("Please fill in all required fields.");
      return;
    }

    // Save hostel details
    const hostelDetails = {
      hostelName: hname,
      hostelType: htype,
      hostelPhone: hphone,
      hostelEmail: hemail,
      hostelAddress1: hadd1,
      hostelAddress2: hadd2,
      hostelCity: hcity,
      hostelState: hstate,
      hostelPin: hpin,
      hostelFloors: hfloors,
    };

    await set(ref(db, `Hostel details/${hname}`), hostelDetails);

    // Save Floor and Room Details
    const floorCount = document.querySelectorAll('.card-header h5').length; // Counting the number of floors

    for (let floorIndex = 1; floorIndex <= floorCount; floorIndex++) {
      const floorNumber = floorIndex;
      let roomNumberCounter = 1; // Counter to keep track of room numbers for the floor

      // Get all room containers for the current floor
      const roomContainers = document.querySelectorAll(`.room-container[data-floor="${floorNumber}"]`);

      // Loop through room containers and process each room
      for (let roomIndex = 0; roomIndex < roomContainers.length; roomIndex++) {
        const roomElem = roomContainers[roomIndex];
        const roomCount = parseInt(roomElem.querySelector(`#roomCount-${floorNumber}-${roomIndex + 1}`).value);
        const roomType = roomElem.querySelector(`#roomType-${floorNumber}-${roomIndex + 1}`).value;
        const amenities = roomElem.querySelector(`#amenities-${floorNumber}-${roomIndex + 1}`).value;
        const ac = roomElem.querySelector(`#acType-${floorNumber}-${roomIndex + 1}`).value;
        const bathroom = roomElem.querySelector(`#bathroom-${floorNumber}-${roomIndex + 1}`).value;
        const price = roomElem.querySelector(`#price-${floorNumber}-${roomIndex + 1}`).value;
        const remarks = roomElem.querySelector(`#remarks-${floorNumber}-${roomIndex + 1}`).value;
        const imageInput = roomElem.querySelector(`#roomImage-${floorNumber}-${roomIndex + 1}`);
        const files = imageInput.files;
        let roomImages = [];

        // Calculate roomTypeBedsAvailable at the room type level
        const roomTypeBedsAvailable = parseInt(roomType.match(/\d+/)[0]) * roomCount;

        // Upload Room Images and save links
        for (let i = 0; i < files.length; i++) {
          const storageRef = ref2(storage, `Roomimages/${hname}/floor${floorNumber}/room-${roomIndex + 1}/${files[i].name}`);
          await uploadBytes(storageRef, files[i]);
          const imageUrl = await getDownloadURL(storageRef);
          roomImages.push(imageUrl);
          console.log(`Uploaded Image ${i + 1}: ${imageUrl}`);
        }

        // Save room type data
        await update(ref(db, `Hostel details/${hname}/rooms/floor${floorNumber}/${roomType}`), {
          floor: floorNumber,
          price: price,
          roomCount: roomCount,
          roomType: roomType,
          bedsAvailable: roomTypeBedsAvailable,
        });

        // Loop to handle each room based on roomCount

        // Loop to handle each room based on roomCount
        for (let roomSubIndex = 1; roomSubIndex <= roomCount; roomSubIndex++) {
          const roomNumber = `F${floorNumber}_R${roomNumberCounter++}`; // Incrementing the room number counter
          const bedsAvailableForRoom = parseInt(roomType.match(/\d+/)[0]);

          // Save individual room data
          await update(ref(db, `Hostel details/${hname}/rooms/floor${floorNumber}/${roomType}/rooms/${ac}/room${roomNumber}`), {
            ac: ac,
            bathroom: bathroom,
            amenities: amenities,
            remarks: remarks,
            roomNumber: roomNumber,
            price: price,
            roomType: roomType,
            bedsAvailable: bedsAvailableForRoom,
            floor: floorNumber,
            imagesLink: roomImages,
          });

          // Save bed data for each room
          for (let bedIndex = 1; bedIndex <= bedsAvailableForRoom; bedIndex++) {
            const bedKey = `bed ${bedIndex}`;
            await update(ref(db, `Hostel details/${hname}/rooms/floor${floorNumber}/${roomType}/rooms/${ac}/room${roomNumber}/beds/${bedKey}`), {
              status: "not booked",
            });
          }
        }
      }
    }

    alert("Hostel, Floor, and Room Data Saved Successfully!");
    nextStep(2); // Move to Step 2 only if everything is successful

  } catch (error) {
    console.error("Error saving data:", error);
    alert("Error saving data: " + error.message);
  }
});
*/