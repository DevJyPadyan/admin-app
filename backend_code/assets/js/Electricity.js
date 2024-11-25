import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, onValue, child, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"
import { getStorage, ref as ref2, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js"
import { firebaseConfig } from "./firebase-config.js";
//import { firebaseConfig } from "./hostel-register.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase();
const storage = getStorage(app);
const addRoomButton = document.getElementById("addroom");
const roomContainer = document.getElementById("room-container");
let roomCount = 0;

document.addEventListener("DOMContentLoaded", function () {
  addRoomButton.addEventListener("click", () => {
    const totalElectricityCostInput = document.getElementById("totalElectricityCost");
    const totalElectricityCost = parseFloat(totalElectricityCostInput.value);

    if (isNaN(totalElectricityCost) || totalElectricityCost <= 0) {
      alert("Please enter a valid total electricity cost before adding a room.");
      return; // Stop if total electricity cost is invalid
    }

    roomCount++;

    const mainParentElem = document.createElement("div");
    mainParentElem.classList.add("col-12");

    const cardElem = document.createElement("div");
    cardElem.classList.add("card");
    cardElem.id = `room-${roomCount}`;

    const cardHeaderElem = document.createElement("div");
    cardHeaderElem.classList.add(
      "card-header",
      "d-flex",
      "justify-content-between",
      "align-items-center"
    );

    // Room Label
    const roomLabel = document.createElement("h5");
    roomLabel.innerText = `Room ${roomCount}`;

    // Delete Icon
    const deleteIcon = document.createElement("a");
    deleteIcon.className = "ri-delete-bin-line";
    deleteIcon.style.fontSize = "24px";
    deleteIcon.style.cursor = "pointer";
    deleteIcon.onclick = () => {
      cardElem.remove();
      roomCount--;
    };

    cardHeaderElem.appendChild(roomLabel);
    cardHeaderElem.appendChild(deleteIcon);

    const cardBodyElem = document.createElement("div");
    cardBodyElem.classList.add("card-body");

    const inputItemsElem = document.createElement("div");
    inputItemsElem.classList.add("input-items");

    const rowElem = document.createElement("div");
    rowElem.classList.add("row", "gy-3");

    // Electricity Cost
    const electricityCostInput = createInputBox(
      `Electricity Cost (Room ${roomCount})`,
      `electricityCost-${roomCount}`,
      "number",
      true,
      "Enter electricity cost"
    );
    rowElem.appendChild(electricityCostInput);

    // Occupants
    const occupantsInput = createInputBox(
      `Occupants (Room ${roomCount})`,
      `occupants-${roomCount}`,
      "number",
      true,
      "Enter number of occupants"
    );
    rowElem.appendChild(occupantsInput);

    // Cost Per Occupant (Read-Only)
    const costPerOccupantInput = createInputBox(
      `Cost Per Occupant (Room ${roomCount})`,
      `costPerOccupant-${roomCount}`,
      "text",
      false,
      "Calculated automatically",
      false,
      true
    );
    rowElem.appendChild(costPerOccupantInput);

    // Room Consumption Share (Read-Only)
    const roomConsumptionShareInput = createInputBox(
      `Room Consumption Share (Room ${roomCount})`,
      `roomConsumptionShare-${roomCount}`,
      "text",
      false,
      "Calculated automatically",
      false,
      true
    );
    rowElem.appendChild(roomConsumptionShareInput);

    inputItemsElem.appendChild(rowElem);
    cardBodyElem.appendChild(inputItemsElem);
    cardElem.appendChild(cardHeaderElem);
    cardElem.appendChild(cardBodyElem);
    mainParentElem.appendChild(cardElem);
    roomContainer.appendChild(mainParentElem);

    // Add Event Listeners for Calculations
    const electricityInputElem = document.getElementById(`electricityCost-${roomCount}`);
    const occupantsInputElem = document.getElementById(`occupants-${roomCount}`);
    const costPerOccupantElem = document.getElementById(`costPerOccupant-${roomCount}`);
    const roomConsumptionElem = document.getElementById(`roomConsumptionShare-${roomCount}`);

    const calculateFields = () => {
      const electricityCost = parseFloat(electricityInputElem.value);
      const occupants = parseInt(occupantsInputElem.value, 10);

      if (!isNaN(electricityCost) && !isNaN(occupants) && occupants > 0) {
        // Calculate Cost Per Occupant
        costPerOccupantElem.value = (electricityCost / occupants).toFixed(2);

        // Calculate Room Consumption Share
        roomConsumptionElem.value = ((electricityCost / totalElectricityCost) * 100).toFixed(2);
      } else {
        costPerOccupantElem.value = "";
        roomConsumptionElem.value = "";
      }
    };

    electricityInputElem.addEventListener("input", calculateFields);
    occupantsInputElem.addEventListener("input", calculateFields);
  });

  // Helper Function to Create Input Boxes
  function createInputBox(labelText, inputId, inputType, required, placeholder = "", readOnly = false, isMultiple = false) {
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
    inputElem.placeholder = placeholder;
    inputElem.readOnly = readOnly;
    if (required) inputElem.required = true;
    if (isMultiple) inputElem.multiple = true;

    inputBoxElem.appendChild(labelElem);
    inputBoxElem.appendChild(inputElem);
    colElem.appendChild(inputBoxElem);

    return colElem;
  }
});

document.getElementById('saveData').addEventListener('click', function () {
    const totalElectricityCost = parseFloat(document.getElementById('totalElectricityCost').value);
    const floorNumber = document.getElementById('floorNumber').value;
    const month = document.getElementById('month').value;

    if (!floorNumber || isNaN(totalElectricityCost) || !month) {
        alert('Please enter all required fields.');
        return;
    }
    const hostelName = document.getElementById('hostelName').value;

    const data = {
        totalElectricityCost,
        rooms: {}
    };

    for (let i = 1; i <= roomCount; i++) {
        const electricityCostElem = document.getElementById(`electricityCost-${i}`);
        const occupantsElem = document.getElementById(`occupants-${i}`);
        const costPerOccupantElem = document.getElementById(`costPerOccupant-${i}`);
        const roomConsumptionElem = document.getElementById(`roomConsumptionShare-${i}`);

        if (!electricityCostElem || !occupantsElem || !costPerOccupantElem || !roomConsumptionElem) {
            alert(`Please ensure all fields for Room ${i} are correctly filled.`);
            return;
        }

        const electricityCost = parseFloat(electricityCostElem.value);
        const occupants = parseInt(occupantsElem.value, 10);
        const costPerOccupant = parseFloat(costPerOccupantElem.value);
        const roomConsumptionShare = parseFloat(roomConsumptionElem.value);

        if (isNaN(electricityCost) || isNaN(occupants) || isNaN(costPerOccupant) || isNaN(roomConsumptionShare)) {
            alert(`Please fill valid data for Room ${i}.`);
            return;
        }

        data.rooms[`room${i}`] = {
            occupants,
            electricityCost,
            costPerOccupant,
            roomConsumptionShare
        };
    }

    const dbPath = `Inventory/Electricity Expenses/${hostelName}/${floorNumber}/${month}`;
    const dbRef = ref(db, dbPath);

    set(dbRef, data)
        .then(() => {
            alert('Data saved successfully!');
        })
        .catch((error) => {
            console.error('Error saving data:', error);
            alert('Failed to save data. Please try again.');
        });
});