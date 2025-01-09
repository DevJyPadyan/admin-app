import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, onValue, child, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"
import { getStorage, ref as ref2, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js"
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase();
const storage = getStorage(app);

// Step-based navigation
let currentStep = 1;
var files = [];
let imagelink = [];
let hostelfloorsDBval = 0; // Global variable to store the number of hostel floors
let isWeekContainerSetup = false; // Flag to prevent duplicate setup

function nextStep(step) {
    document.getElementById(`step${currentStep}`).classList.remove("active");
    document.getElementById(`step${step}`).classList.add("active");
    updateProgressBar(step);
    updateProgressIndicators(step);

    currentStep = step;

    if (step === 3) {
        if (!isWeekContainerSetup) {
            setupWeekContainer();
            prefillDishTimings();
            isWeekContainerSetup = true;
        }
    }
}

function prevStep(step) {
    document.getElementById(`step${currentStep}`).classList.remove("active");
    document.getElementById(`step${step}`).classList.add("active");
    updateProgressBar(step);
    updateProgressIndicators(step);
    currentStep = step;
}


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
  

function updateProgressBar(step) {
    const progressBar = document.getElementById("progressBar");
    const progressPercentage = (step / 4) * 100;
    progressBar.style.width = `${progressPercentage}%`;
    progressBar.innerText = `Step ${step} of 4`;
}

function updateProgressIndicators(step) {
    const circles = Array.from(document.querySelectorAll(".circle"));
    const lines = Array.from(document.querySelectorAll(".line"));

    circles.forEach((circle) => circle.classList.remove("completed"));
    lines.forEach((line) => line.classList.remove("completed"));

    circles.forEach((circle, index) => {
        if (index + 1 <= step) circle.classList.add("completed");
    });
    lines.forEach((line, index) => {
        if (index + 1 < step) line.classList.add("completed");
    });
}

document.getElementById("prevButton").addEventListener("click", () => prevStep(currentStep - 1));

// Prefill Hostel Details
function prefillHostelDetails() {
    const storedData = localStorage.getItem("hosteldetailsAdmin");
    if (storedData) {
        const hostelData = JSON.parse(storedData);
        document.getElementById("hostelname").value = hostelData[0] || "";
        document.getElementById("hosteltype").value = hostelData[1] || "";
        document.getElementById("hosteladd1").value = hostelData[2] || "";
        document.getElementById("hosteladd2").value = hostelData[3] || "";
        document.getElementById("hostelcity").value = hostelData[4] || "";
        document.getElementById("hostelstate").value = hostelData[5] || "";
        document.getElementById("hostelphone").value = hostelData[6] || "";
        document.getElementById("hostelemail").value = hostelData[7] || "";
        document.getElementById("hostelpin").value = hostelData[8] || "";
        document.getElementById("hostelfloorsDB").value = hostelData[9] || "";
        hostelfloorsDBval = Number(hostelData[9]);

        displayHostelImages(hostelData[0]);
    } else {
        console.log("No hostel data found in localStorage.");
    }
}
document.getElementById("files").addEventListener("change", function (e) {
    files = e.target.files;
    for (let i = 0; i < files.length; i++) {
    }
});
document.getElementById("uploadImage").addEventListener("click", async function () {

    var hostelName = document.getElementById("hostelname").value;
    if (files.length != 0) {     //checks if files are selected
        for (let i = 0; i < files.length; i++) {
            const storageRef = ref2(storage, 'images/' + hostelName + '/hostelImg/' + files[i].name);
            const upload = await uploadBytes(storageRef, files[i]);
            const imageUrl = await getDownloadURL(storageRef);
            imagelink.push(imageUrl);
        }
        const imageRef = ref(db, 'Hostel details/' + hostelName + '/ImageData/' + '/');
        set(imageRef, imagelink)
            .then(() => {
                alert("To start uploading, please click OK");
                alert("Image is uploading, Please click OK");
                alert("Image is uploaded, Please click OK");
                console.log('Image URLs have been successfully stored!');
            })

    } else {
        alert("No file chosen");
    }
});

/* start of weekly menu data storing in firebase db*/
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

addStyles1();
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

/*async function updateDishTimingsForWeek() {
    const hostelName = document.getElementById("hostelname").value;

    const morningStart = document.getElementById("morningStart").value;
    const morningEnd = document.getElementById("morningEnd").value;
    const afternoonStart = document.getElementById("afternoonStart").value;
    const afternoonEnd = document.getElementById("afternoonEnd").value;
    const eveningStart = document.getElementById("eveningStart").value;
    const eveningEnd = document.getElementById("eveningEnd").value;
    const nightStart = document.getElementById("nightStart").value;
    const nightEnd = document.getElementById("nightEnd").value;

    const timings = {
        "Breakfast": { "dishTimings": `${morningStart} - ${morningEnd}` },
        "Lunch": { "dishTimings": `${afternoonStart} - ${afternoonEnd}` },
        "Snacks": { "dishTimings": `${eveningStart} - ${eveningEnd}` },
        "Dinner": { "dishTimings": `${nightStart} - ${nightEnd}` }
    };

    // Update dish timings for all weeks globally
    const weeksRef = ref(db, `Hostel details/${hostelName}/weeks`);
    const snapshot = await get(weeksRef);
    
    if (snapshot.exists()) {
        const weeksData = snapshot.val();
        for (const weekKey in weeksData) {
            // For each week, update dish timings
            for (const dayKey in weeksData[weekKey]) {
                for (const sessionKey in timings) {
                    weeksData[weekKey][dayKey][sessionKey].dishTimings = timings[sessionKey].dishTimings;
                }
            }
        }

        // Save the updated data back to Firebase
        await set(weeksRef, weeksData);

        console.log("Dish timings updated globally across all weeks.");
    } else {
        console.error("No weeks data found.");
    }
}*/

async function prefillDishTimings() {

    // Fetch week1 data from Firebase
    const weekData = await getWeekDataFromFirebase(1); // Assuming week1 holds the timings

    if (!weekData) {
        console.error("No data found for week1");
        return;
    }

    // Define mapping for sessions to container IDs
    const sessionToInputMap = {
        Breakfast: {
            start: "morningStart",
            end: "morningEnd"
        },
        Lunch: {
            start: "afternoonStart",
            end: "afternoonEnd"
        },
        Snacks: {
            start: "eveningStart",
            end: "eveningEnd"
        },
        Dinner: {
            start: "nightStart",
            end: "nightEnd"
        }
    };

    // Iterate through each session in week1
    for (const [day, dayData] of Object.entries(weekData)) {
        for (const [session, sessionData] of Object.entries(dayData)) {
            const timings = sessionData.dishTimings; // Get dishTimings for this session
            if (timings && sessionToInputMap[session]) {
                const { start, end } = sessionToInputMap[session];
                const [startTime, endTime] = timings.split(" - "); // Assuming "9:00 AM - 10:00 AM" format
                document.getElementById(start).value = convertTo24Hour(startTime);
                document.getElementById(end).value = convertTo24Hour(endTime);
            }
        }
    }
    function convertTo24Hour(time12h) {
        if (!time12h) return '';

        const [time, modifier] = time12h.split(' ');
        let [hours, minutes] = time.split(':');

        if (modifier === 'AM' && hours === '12') {
            hours = '00'; // Convert 12 AM to 00 hours
        } else if (modifier === 'PM' && hours !== '12') {
            hours = (parseInt(hours, 10) + 12).toString(); // Convert PM hours
        }

        // Ensure two digits for hours and minutes
        hours = hours.padStart(2, '0');
        minutes = minutes.padStart(2, '0');

        return `${hours}:${minutes}`; // Returns in "HH:mm" format
    }
}

async function getWeekDataFromFirebase(weekCounter) {
    const hostelName = document.getElementById("hostelname").value;
    const weekRef = ref(db, `Hostel details/${hostelName}/weeks/week${weekCounter}`);
    const snapshot = await get(weekRef);
    if (snapshot.exists()) {
        return snapshot.val();
    } else {
        return null;
    }
}

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
    const foodData = await fetchFoodData(); // Fetch the full food menu data
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    // Fetch existing weeks and create containers
    const existingWeeks = await getExistingWeeks();

    if (existingWeeks.length === 0) {
        alert("No weeks found in the database.");
        return;
    }

    // Iterate through existing weeks and create containers
    existingWeeks.forEach((week) => {
        const weekNumber = parseInt(week.replace("week", ""), 10);
        addWeekContainer(weekNumber, foodData);
    });


    async function addWeekContainer(weekCounter, foodData) {
        const foodSelectorDiv = document.createElement("div");
        foodSelectorDiv.classList.add("food-selector");
        foodSelectorDiv.id = `food-selector-${weekCounter}`;

        // Collapsible container header with text and a plus button
        const collapsibleHeaderDiv = document.createElement("div");
        collapsibleHeaderDiv.classList.add("collapsible-header");

        // Creating the header content (week number and plus button)
        const headerContentDiv = document.createElement("div");
        headerContentDiv.style.display = "flex";
        headerContentDiv.style.justifyContent = "space-between";
        headerContentDiv.style.alignItems = "center"; // Ensures text and button are vertically centered

        const weekTextDiv = document.createElement("div");
        weekTextDiv.textContent = `Week ${weekCounter}`;
        headerContentDiv.appendChild(weekTextDiv); // Add week text to the left

        const plusButton = document.createElement("button");
        plusButton.textContent = "+";
        plusButton.classList.add("plus-button");
        headerContentDiv.appendChild(plusButton); // Add plus button to the right

        collapsibleHeaderDiv.appendChild(headerContentDiv);
        foodSelectorDiv.appendChild(collapsibleHeaderDiv);

        const collapsibleButton = collapsibleHeaderDiv.querySelector(".collapsible");

        const contentDiv = document.createElement("div");
        contentDiv.classList.add("content");
        contentDiv.style.display = "none"; // Initially collapsed
        foodSelectorDiv.appendChild(contentDiv);

        const weekHeaderDiv = document.createElement("div");
        weekHeaderDiv.innerHTML = `<center><h2>Week ${weekCounter}</h2></center><br>`;
        contentDiv.appendChild(weekHeaderDiv);

        const tabsDiv = document.createElement("div");
        tabsDiv.classList.add("tabs");
        tabsDiv.innerHTML = daysOfWeek
            .map((day, index) => `<button data-day="${day}" class="${index === 0 ? "active" : ""}">${day}</button>`)
            .join("");
        contentDiv.appendChild(tabsDiv);

        const dayDetailsDiv = document.createElement("div");
        dayDetailsDiv.classList.add("day-details");
        dayDetailsDiv.innerHTML = daysOfWeek
            .map(
                (day, index) => `
        <div class="day-container ${index === 0 ? "active" : ""}" id="details-${day}-${weekCounter}">
            <center><h3>${day}</h3></center>
            <div class="session-grid">
                ${["Breakfast", "Lunch", "Snacks", "Dinner"]
                        .map((session) => createMealCard(session, day, weekCounter, foodData))
                        .join("")}
            </div>
        </div>`
            )
            .join("");
        contentDiv.appendChild(dayDetailsDiv);

        const actionsDiv = document.createElement("div");
        actionsDiv.classList.add("actions");
        contentDiv.appendChild(actionsDiv);

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
        contentDiv.appendChild(errorMessageDiv);

        document.getElementById("foodSelectorsContainer").appendChild(foodSelectorDiv);

        // Prefill the week data from Firebase
        await prefillWeekData(weekCounter, foodData);

        setupTabs(tabsDiv, dayDetailsDiv, weekCounter);
        setupNavigation(actionsDiv, dayDetailsDiv, weekCounter);

        // Add event listener for collapsible button
        if (plusButton) {
            plusButton.addEventListener("click", () => {
                contentDiv.style.display = contentDiv.style.display === "none" ? "block" : "none";
            });
        } else {
            console.error("Collapsible button not found.");
        }
    }

    async function prefillWeekData(weekCounter, foodData) {
        const weekData = await getWeekDataFromFirebase(weekCounter);

        if (!weekData) {
            console.error(`No data found for week ${weekCounter}`);
            return;
        }

        const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        daysOfWeek.forEach((day) => {
            const dayContainer = document.getElementById(`details-${day}-${weekCounter}`);
            if (!dayContainer) {
                console.warn(`No container found for ${day} in week ${weekCounter}`);
                return;
            }

            // Prefill the checkboxes based on Firebase data
            const sessionCards = dayContainer.querySelectorAll(".meal-card");
            sessionCards.forEach((card) => {
                const sessionName = card.dataset.session;
                const sessionData = weekData[day]?.[sessionName]?.dishes || [];

                sessionData.forEach((dish) => {
                    const checkBox = card.querySelector(`input[data-name="${dish.name}"]`);
                    if (checkBox) {
                        checkBox.checked = true; // Precheck the boxes for matching dishes
                    }
                });
            });
        });
    }

    function createMealCard(session, day, weekCounter, foodData) {
        const sessionData = foodData[session]?.dishes || [];
        const options = sessionData
            .map(
                (dish) => `
        <div class="meal-item">
            <img src="${dish.image}" alt="${dish.mainDish}" />
            <label>
                <input type="checkbox" value="${dish.id}" data-name="${dish.mainDish}" data-image="${dish.image}">
                ${dish.mainDish}
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
            errorMessage.style.display = "none";

            if (currentDayIndex < daysOfWeek.length - 1) {
                // Navigate to the next day
                dayContainers[currentDayIndex].classList.remove("active");
                currentDayIndex++;
                dayContainers[currentDayIndex].classList.add("active");
                backButton.disabled = false;
                nextButton.textContent = currentDayIndex === daysOfWeek.length - 1 ? "Submit" : "Next";
            } else if (nextButton.textContent === "Submit") {
                // Save the data only when the button is labeled "Submit"
                await saveWeekDataToFirebase(weekCounter);
                alert(`Week ${weekCounter} selections saved!`);
            }
        });
    }
    async function saveWeekDataToFirebase(weekCounter) {
        const hostelName = document.getElementById("hostelname").value;

        // Fetch existing week data to preserve the dish timings
        const weekRef = ref(db, `Hostel details/${hostelName}/weeks/week${weekCounter}`);
        const snapshot = await get(weekRef);
        let existingWeekData = snapshot.exists() ? snapshot.val() : {};

        // Prepare new week data
        const weekData = {};
        daysOfWeek.forEach(day => {
            const dayContainer = document.getElementById(`details-${day}-${weekCounter}`);
            if (!dayContainer) return;

            weekData[day] = {};

            const sessionCards = dayContainer.querySelectorAll(".meal-card");
            sessionCards.forEach(card => {
                const sessionName = card.dataset.session;
                const selectedDishes = [];
                const checkboxes = card.querySelectorAll("input[type='checkbox']:checked");

                checkboxes.forEach(checkbox => {
                    const image = checkbox.dataset.image;
                    const dishName = checkbox.dataset.name;
                    const beverage = checkbox.dataset.beverage;
                    const specialDish = checkbox.dataset.special_dish;

                    selectedDishes.push({
                        image: image,
                        name: dishName,
                        beverage: beverage || null,
                        specialDish: specialDish || null,
                    });
                });

                if (selectedDishes.length > 0) {
                    // Ensure that dish timings are preserved and only dishes are updated
                    if (!weekData[day]) weekData[day] = {};
                    if (!weekData[day][sessionName]) {
                        weekData[day][sessionName] = { dishes: selectedDishes };
                    } else {
                        // Keep existing dish timings and update only dishes
                        weekData[day][sessionName].dishes = selectedDishes;
                    }

                    // Preserve the existing dish timings for each session
                    if (existingWeekData[day] && existingWeekData[day][sessionName]) {
                        weekData[day][sessionName].dishTimings = existingWeekData[day][sessionName].dishTimings;
                    }
                }
            });
        });

        // Save the modified week data to Firebase
        try {
            await set(weekRef, weekData);
            console.log(`Week ${weekCounter} data successfully updated.`);
        } catch (error) {
            console.error(`Error updating week ${weekCounter} data:`, error);
        }
    }
    async function getExistingWeeks() {
        const hname = document.getElementById("hostelname").value;

        if (!hname) {
            console.error("Hostel name is missing. Ensure the 'hostelname' input field has a value.");
            return [];
        }

        const snapshot = await get(ref(db, `Hostel details/${hname}/weeks`));

        if (snapshot.exists()) {
            console.log("Existing weeks data:", Object.keys(snapshot.val())); // Debug log
            return Object.keys(snapshot.val());
        } else {
            console.warn("No weeks data found in Firebase.");
            return [];
        }
    }
}
/*End of weekly menu data storing in firebase db*/

// Display Hostel Images
async function displayHostelImages(hostelName) {
    const imageRef = ref(db, `Hostel details/${hostelName}/ImageData/`);
    console.log(imageRef);
    try {
        const snapshot = await get(imageRef);
        if (snapshot.exists()) {
            const imageUrls = snapshot.val();
            const imageContainer = document.getElementById("hostelImageContainer");
            imageContainer.innerHTML = ""; // Clear existing images

            imageUrls.forEach((url) => {
                const img = document.createElement("img");
                img.src = url;
                img.alt = "Hostel Image";
                img.style.width = "100px";
                img.style.height = "100px";
                img.style.margin = "5px";
                imageContainer.appendChild(img);
            });
        } else {
            console.log("No images found for this hostel.");
        }
    } catch (error) {
        console.error("Error fetching images:", error);
    }
}
/* adding extra floors functionality*/
document.addEventListener('DOMContentLoaded', function () {
    prefillHostelDetails();

    const existingFloorsInput = document.getElementById("hostelfloorsDB");
    const existingFloors = parseInt(existingFloorsInput.value, 10);
    console.log(`Existing floors: ${existingFloors}`);

    if (isNaN(existingFloors)) {
        console.error("Error: existingFloors is not a valid number.");
        return;
    }

    const addFloorsButton = document.getElementById("addExtrafloors");
    const extrafloorsContainer = document.getElementById("floors-container");

    addFloorsButton.addEventListener("click", () => {
        const floorInput = document.getElementById("hostelExtraFloors");
        const numExtraFloors = parseInt(floorInput.value, 10);
        console.log(`Number of extra floors: ${numExtraFloors}`);

        if (numExtraFloors <= 0 || isNaN(numExtraFloors)) {
            alert("Please enter a valid number of floors.");
            return;
        }

        extrafloorsContainer.innerHTML = "";
        const totalFloors = existingFloors + numExtraFloors;

        for (let i = existingFloors + 1; i <= totalFloors; i++) {
            console.log(`Creating floor container for floor ${i}`);
            createExtraFloorContainer(i);
        }
    });

    function createExtraFloorContainer(floorNumber) {
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
            createRoomContainerforExtra(cardBodyElem, floorNumber);
        });

        cardBodyElem.appendChild(addRoomButton);
        cardElem.appendChild(cardHeaderElem);
        cardElem.appendChild(cardBodyElem);
        floorElem.appendChild(cardElem);
        extrafloorsContainer.appendChild(floorElem);
    }

    function createRoomContainerforExtra(parentElem, floorNumber) {
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

        rowElem.appendChild(createSelectBoxforExtra("Room Type", `roomType-${floorNumber}-${roomCount}`, true, [
            /*{ value: '1 sharing', text: '1 sharing' },*/
            { value: '2 sharing', text: '2 sharing' },
            { value: '3 sharing', text: '3 sharing' },
            /*{ value: '4 sharing', text: '4 sharing' }*/
        ]));
        rowElem.appendChild(createInputBoxforExtra("Room Count", `roomCount-${floorNumber}-${roomCount}`, "number", true));
        rowElem.appendChild(createInputBoxforExtra("Amenities", `amenities-${floorNumber}-${roomCount}`, "text", false, "e.g., WiFi, Laundry"));
        rowElem.appendChild(createInputBoxforExtra("Price", `price-${floorNumber}-${roomCount}`, "number", true));
        rowElem.appendChild(createInputBoxforExtra("Upload Room Images", `roomImage-${floorNumber}-${roomCount}`, "file", false, "", true));

        rowElem.appendChild(createSelectBoxforExtra("Bathroom Type", `bathroom-${floorNumber}-${roomCount}`, true, [
            { value: "attached", text: "attached" },
            { value: "common", text: "common" },
        ]));

        rowElem.appendChild(createSelectBoxforExtra("AC Type", `acType-${floorNumber}-${roomCount}`, true, [
            { value: "ac", text: "ac" },
            { value: "non_ac", text: "non-ac" },
        ]));

        rowElem.appendChild(createInputBoxforExtra("Remarks", `remarks-${floorNumber}-${roomCount}`, "text", false, "Additional comments"));

        roomBody.appendChild(rowElem);

        roomElem.appendChild(roomHeader);
        roomElem.appendChild(roomBody);

        mainParentElem.appendChild(roomElem);
        roomWrapper.appendChild(mainParentElem);
    }

    function createInputBoxforExtra(labelText, inputId, inputType, required, placeholder = "", multiple = false) {
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

    function createSelectBoxforExtra(labelText, selectId, required, options) {
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
/* End of adding room details using dynamic form handling*/
document.addEventListener('DOMContentLoaded', function () {


    const addRoomButton = document.getElementById("addroom");
    const roomContainer = document.getElementById("additional-room-container");

    let roomCount = 0;  // Initialize room count

    addRoomButton.addEventListener('click', () => {
        addRoomForm(); // Create a new room container
    });

    function addRoomForm() {
        roomCount++;

        const mainParentElem = document.createElement('div');
        mainParentElem.classList.add('col-12');

        const roomElem = document.createElement("div");
        roomElem.classList.add("card", "mb-3", "additional-room-container");
        roomElem.id = `room-${roomCount}`;

        const roomHeader = document.createElement("div");
        roomHeader.classList.add("card-header", "d-flex", "justify-content-between", "align-items-center");

        const roomLabel = document.createElement("h6");
        roomLabel.innerText = `Additional room data (Room ${roomCount})`;

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

        // Add floor number dropdown
        const floorArr = numberToArray(hostelfloorsDBval);
        rowElem.appendChild(createSelectBox('Floor', `floor-${roomCount}`, true, floorArr));

        // Add form fields (room type, amenities, price, etc.)
        rowElem.appendChild(createSelectBox("Room Type", `roomType-${roomCount}`, true, [
            /*{ value: '1 sharing', text: '1 sharing' },*/
            { value: '2 sharing', text: '2 sharing' },
            { value: '3 sharing', text: '3 sharing' },
            /*{ value: '4 sharing', text: '4 sharing' }*/
        ]));
        rowElem.appendChild(createInputBox("Room Count", `roomCount-${roomCount}`, "number", true));
        rowElem.appendChild(createInputBox("Amenities", `amenities-${roomCount}`, "text", false, "e.g., WiFi, Laundry"));
        rowElem.appendChild(createInputBox("Price", `price-${roomCount}`, "number", true));
        rowElem.appendChild(createInputBox("Upload Room Images", `roomImage-${roomCount}`, "file", false, "", true));

        rowElem.appendChild(createSelectBox("Bathroom Type", `bathroom-${roomCount}`, true, [
            { value: "attached", text: "attached" },
            { value: "common", text: "common" }
        ]));

        rowElem.appendChild(createSelectBox("AC Type", `acType-${roomCount}`, true, [
            { value: "ac", text: "ac" },
            { value: "non_ac", text: "non-ac" }
        ]));

        rowElem.appendChild(createInputBox("Remarks", `remarks-${roomCount}`, "text", false, "Additional comments"));

        roomBody.appendChild(rowElem);

        roomElem.appendChild(roomHeader);
        roomElem.appendChild(roomBody);

        mainParentElem.appendChild(roomElem);
        roomContainer.appendChild(mainParentElem);
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
    function numberToArray(number) {
        const result = [];
        for (let i = 1; i <= number; i++) {
            result.push({ value: i, text: `Floor ${i}` });
        }
        return result;
    }
});
/* End of adding room details using dynamic form handling*/

/*start of Get Room details from firebase DB*/
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
    const getRoomButton = document.getElementById("getroom");
    const floorsContainer = document.getElementById("floorsContainer");


    getRoomButton.addEventListener("click", async () => {
        const hostelName = document.getElementById("hostelname").value;
        const roomType = document.getElementById("roomType").value; // Selected roomType
        const acType = document.getElementById("acType").value; // Selected acType

        console.log(`Fetching rooms for Hostel: ${hostelName}, Room Type: ${roomType}, AC Type: ${acType}`);

        const roomsRef = ref(db, `Hostel details/${hostelName}/rooms`);

        try {
            const snapshot = await get(roomsRef);
            if (snapshot.exists()) {
                const roomsData = snapshot.val();
                console.log("Rooms data fetched successfully:", roomsData);

                floorsContainer.innerHTML = ""; // Clear existing floor containers
                console.log("Cleared existing floor containers.");

                // Loop through each floor and filter rooms based on roomType and acType
                Object.keys(roomsData).forEach((floorKey) => {
                    const floorData = roomsData[floorKey];
                    console.log(`Processing Floor: ${floorKey}`, floorData);

                    const filteredFloorData = {}; // Object to store filtered data for this floor

                    if (floorData[roomType]) {
                        console.log(`Found matching Room Type (${roomType}) on Floor: ${floorKey}`);
                        const roomCategory = floorData[roomType]["rooms"][acType];
                        if (roomCategory) {
                            console.log(`Found matching AC Type (${acType}) on Floor: ${floorKey}`);
                            filteredFloorData[roomType] = {
                                ...floorData[roomType],
                                rooms: {
                                    [acType]: roomCategory
                                }
                            };
                        } else {
                            console.log(`No rooms found for AC Type (${acType}) on Floor: ${floorKey}`);
                        }
                    } else {
                        console.log(`No rooms found for Room Type (${roomType}) on Floor: ${floorKey}`);
                    }

                    if (Object.keys(filteredFloorData).length > 0) {
                        const floorNumber = floorKey.replace("floor", ""); // Extract floor number
                        console.log(`Creating floor container for Floor ${floorNumber}`);
                        createFloorContainer(floorNumber, filteredFloorData); // Create floor container
                    }
                });
            } else {
                console.log("No rooms data found for this hostel.");
                alert("No rooms found for this hostel.");
            }
        } catch (error) {
            console.error("Error fetching rooms:", error);
        }
    });

    // Function to create a floor container with grouped rooms (Unchanged)
    function createFloorContainer(floorNumber, floorData) {
        console.log(`Creating floor container for Floor ${floorNumber} with data:`, floorData);

        const floorElem = document.createElement("div");
        floorElem.classList.add("col-12", "mb-4");
        floorElem.id = floorNumber;

        const cardElem = document.createElement("div");
        cardElem.classList.add("card");

        const cardHeaderElem = document.createElement("div");
        cardHeaderElem.classList.add(
            "card-header",
            "d-flex",
            "justify-content-between",
            "align-items-center"
        );

        const floorLabel = document.createElement("h5");
        floorLabel.innerText = `Floor ${floorNumber}`;
        cardHeaderElem.appendChild(floorLabel);

        const cardBodyElem = document.createElement("div");
        cardBodyElem.classList.add("card-body");

        const roomWrapper = document.createElement("div");
        roomWrapper.classList.add("room-wrapper", "d-flex", "flex-column", "gap-3");
        cardBodyElem.appendChild(roomWrapper);

        // Loop through room types (e.g., "2 sharing")
        Object.keys(floorData).forEach((roomTypeKey) => {
            const roomTypeData = floorData[roomTypeKey];
            console.log(`Processing Room Type: ${roomTypeKey}`, roomTypeData);

            // Loop through room configurations (e.g., "ac", "non-ac")
            Object.keys(roomTypeData.rooms).forEach((roomConfigKey) => {
                const rooms = roomTypeData.rooms[roomConfigKey];
                console.log(`Processing Room Configuration: ${roomConfigKey}`, rooms);

                // Loop through individual rooms
                Object.keys(rooms).forEach((roomKey) => {
                    const roomDetails = rooms[roomKey];
                    console.log(`Creating room container for Room: ${roomKey}`, roomDetails);
                    createRoomContainer(roomWrapper, floorNumber, roomKey, roomDetails);
                });
            });
        });

        cardElem.appendChild(cardHeaderElem);
        cardElem.appendChild(cardBodyElem);
        floorElem.appendChild(cardElem);
        floorsContainer.appendChild(floorElem);
        console.log(`Added Floor ${floorNumber} container to the DOM.`);
    }

    // Function to create a room container (Unchanged)
    function createRoomContainer(parentElem, floorNumber, roomKey, roomDetails) {
        console.log(`Creating room container for Room Key: ${roomKey}`, roomDetails);

        const mainParentElem = document.createElement("div");
        mainParentElem.classList.add("col-12");

        const roomElem = document.createElement("div");
        roomElem.classList.add("card", "mb-3", "room-container");

        // Add the data-floor attribute
        roomElem.setAttribute("data-floor", floorNumber);
        roomElem.id = `room-${roomKey}`;

        const roomHeader = document.createElement("div");
        roomHeader.classList.add(
            "card-header",
            "d-flex",
            "justify-content-between",
            "align-items-center"
        );

        const roomLabel = document.createElement("h6");
        roomLabel.innerText = `Room ${roomKey.replace("room", "")} (${roomDetails.roomType}) - Floor ${floorNumber}`;

        const deleteIcon = document.createElement("a");
        deleteIcon.className = "ri-delete-bin-line";
        deleteIcon.style.fontSize = "24px";
        deleteIcon.style.cursor = "pointer";
        deleteIcon.id = `delete-room-${roomKey}`;

        deleteIcon.addEventListener("click", async () => {
            if (confirm("Are you sure you want to delete this room?")) {
                try {
                    const hostelName = document.getElementById("hostelname").value;
                    const roomType = roomDetails.roomType;
                    const roomConfig = roomDetails.ac;
                    const roomPath = `Hostel details/${hostelName}/rooms/floor${floorNumber}/${roomType}/rooms/${roomConfig}/${roomKey}`;

                    console.log("Deleting from Firebase path:", roomPath);
                    await remove(ref(db, roomPath));

                    const roomElement = document.getElementById(`room-${roomKey}`);
                    if (roomElement) {
                        roomElement.remove();
                    }
                    alert("Room deleted successfully.");
                } catch (error) {
                    console.error("Error deleting room:", error);
                    alert("Failed to delete room.");
                }
            }
        });

        roomHeader.appendChild(roomLabel);
        roomHeader.appendChild(deleteIcon);

        const roomBody = document.createElement("div");
        roomBody.classList.add("card-body");

        const rowElem = document.createElement("div");
        rowElem.classList.add("row", "gy-3");
        const roomTypeSelect = createSelectBox('Room Type', `roomType-${floorNumber}-${roomKey}`, true, ['1 sharing', '2 sharing', '3 sharing', '4 sharing'], roomDetails.roomType);
        rowElem.appendChild(roomTypeSelect);

        // Log the room type to console for debugging
        console.log(`Prefilled Room Type for room ${roomKey} (Floor ${floorNumber}): ${roomDetails.roomType}`);
        rowElem.appendChild(createInputBox('Room Count', `roomCount-${floorNumber}-${roomKey}`, 'number', true, '', true, roomDetails.roomCount));
        rowElem.appendChild(createInputBox('Room Number', `roomNumber-${floorNumber}-${roomKey}`, 'text', false, '', true, roomDetails.roomNumber));
        rowElem.appendChild(createInputBox('Amenities', `amenities-${floorNumber}-${roomKey}`, 'text', false, 'e.g. WiFi, Laundry', false, roomDetails.amenities));
        rowElem.appendChild(createSelectBox('Air Conditioning', `acType-${floorNumber}-${roomKey}`, true, ['ac', 'non_ac'], roomDetails.ac));
        rowElem.appendChild(createSelectBox('Bathroom', `bathroom-${floorNumber}-${roomKey}`, true, ['attached', 'common'], roomDetails.bathroom));
        rowElem.appendChild(createInputBox('Price', `price-${floorNumber}-${roomKey}`, 'number', true, '', false, roomDetails.price));
        rowElem.appendChild(createInputBox("Remarks", `remarks-${floorNumber}-${roomKey}`, "text", false, "Additional comments", false, roomDetails.remarks || ''));

        // Add image upload functionality
        const imageInput = document.createElement('input');
        imageInput.type = 'file';
        imageInput.id = `roomImage-${roomKey}`;
        imageInput.name = `roomImage-${roomKey}`;
        imageInput.multiple = true;
        imageInput.classList.add('form-control');

        const imageLabel = document.createElement('h6');
        imageLabel.innerText = 'Upload Images';
        const imageBox = document.createElement('div');
        imageBox.classList.add('col-xl-6', 'input-box');
        imageBox.appendChild(imageLabel);
        imageBox.appendChild(imageInput);
        rowElem.appendChild(imageBox);

        // Add the image preview container
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('image-preview-container', 'd-flex', 'flex-wrap', 'gap-2', 'mt-3');
        rowElem.appendChild(imageContainer);

        roomBody.appendChild(rowElem);

        roomElem.appendChild(roomHeader);
        roomElem.appendChild(roomBody);

        mainParentElem.appendChild(roomElem);
        parentElem.appendChild(mainParentElem);

        setTimeout(() => {
            if (Array.isArray(roomDetails.imagesLink)) {
                displayRoomImages(roomKey, roomDetails.imagesLink || []);
            } else {
                console.warn(`No images available for room ${roomKey}`);
            }
        }, 0);
    }

    function displayRoomImages(roomKey, images) {
        const roomCard = document.getElementById(`room-${roomKey}`);
        if (roomCard) {
            let imageContainer = roomCard.querySelector('.image-preview-container');
            if (!imageContainer) {
                console.warn(`Image container not found for room ${roomKey}.`);
                return;
            }

            imageContainer.innerHTML = '';
            if (images.length > 0) {
                images.forEach((imageUrl) => {
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.alt = 'Room Image';
                    img.style.width = '100px';
                    img.style.height = '100px';
                    img.style.objectFit = 'cover';
                    img.classList.add('image-preview', 'border', 'rounded');
                    imageContainer.appendChild(img);
                });
            } else {
                const noImageText = document.createElement('p');
                noImageText.innerText = 'No images available';
                noImageText.classList.add('text-muted');
                imageContainer.appendChild(noImageText);
            }
        } else {
            console.warn(`Room card not found for room ${roomKey}.`);
        }
    }

    // Helper function to create input boxes
    function createInputBox(labelText, inputId, inputType, required, placeholder = '', readOnly = false, value = '') {
        const colElem = document.createElement('div');
        colElem.classList.add('col-xl-6');

        const inputBoxElem = document.createElement('div');
        inputBoxElem.classList.add('input-box');

        const labelElem = document.createElement('h6');
        labelElem.innerText = labelText;

        const inputElem = document.createElement('input');
        inputElem.type = inputType;
        inputElem.id = inputId;
        inputElem.name = inputId;
        if (required) inputElem.required = true;
        if (placeholder) inputElem.placeholder = placeholder;
        if (readOnly) inputElem.readOnly = true; // Make input read-only
        inputElem.value = value; // Prefill value

        inputBoxElem.appendChild(labelElem);
        inputBoxElem.appendChild(inputElem);
        colElem.appendChild(inputBoxElem);

        return colElem;
    }

    // Helper function to create select boxes
    function createSelectBox(labelText, selectId, required, options, selectedValue = '') {
        const colElem = document.createElement('div');
        colElem.classList.add('col-xl-6');

        const inputBoxElem = document.createElement('div');
        inputBoxElem.classList.add('input-box');

        const labelElem = document.createElement('h6');
        labelElem.innerText = labelText;

        const selectElem = document.createElement('select');
        selectElem.id = selectId;
        selectElem.name = selectId;
        if (required) selectElem.required = true;

        // Ensure options is always an array
        if (!Array.isArray(options)) {
            console.error(`Error: options is not an array for ${labelText}. Using an empty array.`);
            options = [];
        }

        options.forEach(option => {
            const optElem = document.createElement('option');

            // Handle options that may be objects with 'value' and 'text' properties
            if (typeof option === 'object' && option.value && option.text) {
                optElem.value = option.value;
                optElem.text = option.text;
            } else {
                // If option is not an object, treat it as a simple value
                optElem.value = option;
                optElem.text = option;
            }

            // Set the selected value
            if (optElem.value === selectedValue) {
                optElem.selected = true;
            }

            selectElem.appendChild(optElem);
        });

        inputBoxElem.appendChild(labelElem);
        inputBoxElem.appendChild(selectElem);
        colElem.appendChild(inputBoxElem);

        return colElem;
    }
});

// Step 1: Save Hostel Details
document.getElementById("nextButtonStep1").addEventListener("click", async () => {
    const hostelName = document.getElementById("hostelname").value;
    const hostelType = document.getElementById("hosteltype").value;
    const hostelPhone = document.getElementById("hostelphone").value;
    const hostelEmail = document.getElementById("hostelemail").value;
    const hostelAddress1 = document.getElementById("hosteladd1").value;
    const hostelAddress2 = document.getElementById("hosteladd2").value;
    const hostelCity = document.getElementById("hostelcity").value;
    const hostelState = document.getElementById("hostelstate").value;
    const hostelPin = document.getElementById("hostelpin").value;

    const modifiedDetails = {
        hostelName,
        hostelType,
        hostelPhone,
        hostelEmail,
        hostelAddress1,
        hostelAddress2,
        hostelCity,
        hostelState,
        hostelPin,
    };

    const storedData = JSON.parse(localStorage.getItem("hosteldetailsAdmin")) || [];
    const isModified = Object.keys(modifiedDetails).some(
        (key) => modifiedDetails[key] !== storedData[Object.keys(modifiedDetails).indexOf(key)]
    );

    if (isModified) {
        const db = getDatabase(); // Ensure Firebase is initialized
        try {
            await update(ref(db, `Hostel details/${hostelName}/`), modifiedDetails);
            alert("Hostel details updated successfully!");
        } catch (error) {
            console.error("Error updating hostel details:", error);
            alert("Failed to update hostel details.");
            return;
        }
    } else {
        alert("Hostel details are not modified, moving to Step 2.");
    }

    nextStep(2);
});

// Step 2: Save Floor and Room Details
document.getElementById("nextButtonStep2").addEventListener("click", async () => {
    alert("Started loading the hostel room details..");
    showLoader();
    try {
        const hname = document.getElementById("hostelname").value;
        let roomNumberCounter = 1;

        // Fetch existing hostel details
        const existingHostelRef = ref(db, `Hostel details/${hname}`);
        const existingHostelSnapshot = await get(existingHostelRef);
        const existingHostelDetails = existingHostelSnapshot.exists() ? existingHostelSnapshot.val() : {};

        let uploadPromises = []; // Store all image upload promises here

        let floorContainers = document.querySelectorAll('.floorsContainer');

        // Loop through all floor containers
        for (let floorElem of floorContainers) {
            let roomElements = floorElem.querySelectorAll('.room-container');

            // Loop through all room elements within the current floor
            for (let roomElem of roomElements) {
                let floorKey = roomElem.getAttribute('data-floor');
                let roomKey = roomElem.id.split('-')[1];
                let roomType = document.getElementById(`roomType-${floorKey}-${roomKey}`).value;
                let roomCount = parseInt(document.getElementById(`roomCount-${floorKey}-${roomKey}`).value, 10);
                let amenities = document.getElementById(`amenities-${floorKey}-${roomKey}`).value;
                let ac = document.getElementById(`acType-${floorKey}-${roomKey}`).value;
                let bathroom = document.getElementById(`bathroom-${floorKey}-${roomKey}`).value;
                let price = parseFloat(document.getElementById(`price-${floorKey}-${roomKey}`).value);
                let remarks = document.getElementById(`remarks-${floorKey}-${roomKey}`).value;

                let imageInput = document.getElementById(`roomImage-${roomKey}`);
                let files = imageInput.files;
                let imagelink1 = [];

                // Upload images in parallel
                if (files.length !== 0) {
                    let imageUploadPromises = Array.from(files).map((file) => {
                        let storageRef = ref2(storage, `images/${hname}/room-${roomKey}/${file.name}`);
                        return uploadBytes(storageRef, file).then(() => getDownloadURL(storageRef));
                    });
                    uploadPromises.push(...imageUploadPromises);  // Push all image upload promises to the array
                }

                // Fetch existing roomType data
                let existingRoomTypeRef = ref(db, `Hostel details/${hname}/rooms/floor${floorKey}/${roomType}`);
                let existingRoomTypeSnapshot = await get(existingRoomTypeRef);
                let existingRoomTypeData = existingRoomTypeSnapshot.exists() ? existingRoomTypeSnapshot.val() : {};
                let existingRoomTypeBedsAvailable = existingRoomTypeData.bedsAvailable || 0;

                // Retain or update acPrice and nonacPrice
                let updatedAcPrice = ac === "ac" ? price : existingRoomTypeData.acPrice || 0; // Update if `ac` is chosen, retain otherwise
                let updatedNonAcPrice = ac === "non_ac" ? price : existingRoomTypeData.nonacPrice || 0; // Update if `non_ac` is chosen, retain otherwise;

                // Fetch existing room data for updating room-level information
                let existingRoomRef = ref(db, `Hostel details/${hname}/rooms/floor${floorKey}/${roomType}/rooms/${ac}/${roomKey}`);
                let existingRoomSnapshot = await get(existingRoomRef);
                let existingRoomData = existingRoomSnapshot.exists() ? existingRoomSnapshot.val() : {};
                let existingBeds = existingRoomData.beds || {};
                let existingBedsAvailable = existingRoomData.bedsAvailable;

                // Ensure imagesLink is defined before updating
                let existingImages = existingRoomData.imagesLink || []; // Default to empty array if undefined
                let updatedImages = imagelink1.length > 0 ? [...existingImages, ...imagelink1] : existingImages;

                // Update roomType data
                await update(ref(db, `Hostel details/${hname}/rooms/floor${floorKey}/${roomType}`), {
                    floor: floorKey,
                    roomType: roomType,
                    acPrice: updatedAcPrice, // Update or retain acPrice
                    nonacPrice: updatedNonAcPrice, // Update or retain nonacPrice
                    price: price, // General price field, if applicable
                    bedsAvailable: existingRoomTypeBedsAvailable,
                }).catch((error) => {
                    console.error(`Error updating roomType details for ${roomType}:`, error);
                    alert(`Error updating roomType details for ${roomType}: ${error}`);
                });

                const roomNumber = roomKey.replace(/^room/, '');
                // Update room-level details
                await update(ref(db, `Hostel details/${hname}/rooms/floor${floorKey}/${roomType}/rooms/${ac}/${roomKey}`), {
                    roomNumber: roomNumber,
                    floor: floorKey,
                    ac: ac,
                    roomCount: roomCount,
                    roomType: roomType,
                    bathroom: bathroom,
                    price: price,
                    amenities: amenities,
                    remarks: remarks,
                    imagesLink: updatedImages, // Use updated images array (even if empty)
                    bedsAvailable: existingBedsAvailable,
                }).catch((error) => {
                    console.error(`Error updating room details for Room ${roomKey}:`, error);
                    alert(`Error updating room details for Room ${roomKey}: ${error}`);
                });

                // Update bed details
                await set(ref(db, `Hostel details/${hname}/rooms/floor${floorKey}/${roomType}/rooms/${ac}/${roomKey}/beds`), existingBeds)
                    .catch((error) => {
                        console.error(`Error updating bed details for Room ${roomKey}:`, error);
                        alert(`Error updating bed details for Room ${roomKey}: ${error}`);
                    });
            }
        }

        // Wait for all image uploads to finish
        await Promise.all(uploadPromises);
        

        let additionalRoomContainers = document.querySelectorAll('.additional-room-container');

        for (let roomElem of additionalRoomContainers) {
            let uniqueId = roomElem.id.split('-')[1];
            let floor = parseInt(document.getElementById(`floor-${uniqueId}`).value, 10);
            let roomType = document.getElementById(`roomType-${uniqueId}`).value;
            let roomCount = parseInt(document.getElementById(`roomCount-${uniqueId}`).value, 10);
            let amenities = document.getElementById(`amenities-${uniqueId}`).value;
            let price = document.getElementById(`price-${uniqueId}`).value;
            let bathroom = document.getElementById(`bathroom-${uniqueId}`).value;
            let ac = document.getElementById(`acType-${uniqueId}`).value;
            let remarks = document.getElementById(`remarks-${uniqueId}`).value;

            // Calculate beds available
            const roomTypeBedsAvailable = parseInt(roomType.match(/\d+/)[0]) * roomCount;

            // Handle images upload
            let imageInput = document.getElementById(`roomImage-${uniqueId}`);
            let files = imageInput.files;
            let imageLinks = [];

            if (files.length !== 0) {
                for (let file of files) {
                    let storageRef = ref2(storage, `images/${hname}/room-${uniqueId}/${file.name}`);
                    await uploadBytes(storageRef, file);
                    let imageUrl = await getDownloadURL(storageRef);
                    imageLinks.push(imageUrl);
                }
            }

            // Update roomType-level details in Firebase
            const roomTypePath = `Hostel details/${hname}/rooms/floor${floor}/${roomType}`;

            // Initialize acPrice and nonacPrice based on the AC type
            const acPrice = ac === 'ac' ? price : 0;
            const nonacPrice = ac === 'non_ac' ? price : 0;

            // Construct the roomTypeData object
            const roomTypeData = {
                floor: floor,
                roomType: roomType,
                acPrice: acPrice,
                nonacPrice: nonacPrice,
                imagesLink: imageLinks,
                bedsAvailable: roomTypeBedsAvailable,
            };

            // Update the database
            await update(ref(db, roomTypePath), roomTypeData)
            // Loop through each room and add room-level details
            for (let roomSubIndex = 1; roomSubIndex <= roomCount; roomSubIndex++) {
                const roomNumber = `R${roomNumberCounter++}_F${floor}`;
                const roomPath = `${roomTypePath}/rooms/${ac}/room${roomNumber}`;

                const roomData = {
                    floor: floor,
                    roomType: roomType,
                    roomNumber: roomNumber,
                    roomCount: roomCount,
                    amenities: amenities,
                    ac: ac,
                    bathroom: bathroom,
                    price: price,
                    remarks: remarks,
                    bedsAvailable: roomTypeBedsAvailable,
                    imagesLink: imageLinks,
                };
                await update(ref(db, roomPath), roomData);

                // Add bed-level data
                let bedsData = {};
                for (let bedIndex = 1; bedIndex <= roomTypeBedsAvailable; bedIndex++) {
                    const bedKey = `bed ${bedIndex}`;
                    bedsData[bedKey] = {
                        status: "not booked" // Object with the desired structure
                    };
                }

                // Update beds in Firebase
                const bedsPath = `${roomPath}/beds`;
                await update(ref(db, bedsPath), bedsData);
            }
        }


        const floorCount = document.querySelectorAll('.card-header h5').length;

        let roomsObject = {};

        for (let floorIndex = 1; floorIndex <= floorCount; floorIndex++) {
            const floorNumber = floorIndex;
            let roomNumberCounter = 1;

            const roomContainers = document.querySelectorAll(`.room-container[data-floor="${floorNumber}"]`);

            if (roomContainers.length === 0) {
                console.warn(`No room containers found for floor ${floorNumber}. Skipping.`);
                continue;
            }

            for (let roomIndex = 0; roomIndex < roomContainers.length; roomIndex++) {
                const roomElem = roomContainers[roomIndex];

                // Validate that all required fields exist
                const roomCountElem = roomElem.querySelector(`#roomCount-${floorNumber}-${roomIndex + 1}`);
                const roomTypeElem = roomElem.querySelector(`#roomType-${floorNumber}-${roomIndex + 1}`);
                const amenitiesElem = roomElem.querySelector(`#amenities-${floorNumber}-${roomIndex + 1}`);
                const acTypeElem = roomElem.querySelector(`#acType-${floorNumber}-${roomIndex + 1}`);
                const bathroomElem = roomElem.querySelector(`#bathroom-${floorNumber}-${roomIndex + 1}`);
                const priceElem = roomElem.querySelector(`#price-${floorNumber}-${roomIndex + 1}`);
                const remarksElem = roomElem.querySelector(`#remarks-${floorNumber}-${roomIndex + 1}`);
                const imageInputElem = roomElem.querySelector(`#roomImage-${floorNumber}-${roomIndex + 1}`);

                // Skip this room if any required input is missing
                if (!roomCountElem || !roomTypeElem || !amenitiesElem || !acTypeElem || !bathroomElem || !priceElem || !remarksElem) {
                    console.warn(`Missing required input fields for room ${roomIndex + 1} on floor ${floorNumber}. Skipping.`);
                    continue;
                }

                const roomCount = parseInt(roomCountElem.value, 10);
                const roomType = roomTypeElem.value;
                const amenities = amenitiesElem.value;
                const acType = acTypeElem.value;
                const bathroom = bathroomElem.value;
                const price = priceElem.value;
                const remarks = remarksElem.value;
                let roomImages = [];

                const acPrice = acType === 'ac' ? price : 0;
                const nonacPrice = acType === 'non_ac' ? price : 0;
                console.log(acPrice,nonacPrice);

                if (imageInputElem && imageInputElem.files.length > 0) {
                    const files = imageInputElem.files;
                    const uploadPromises = [];
                    for (let i = 0; i < files.length; i++) {
                        const storageRef = ref2(storage, `Roomimages/${hname}/floor${floorNumber}/room-${roomIndex + 1}/${files[i].name}`);
                        const uploadPromise = uploadBytes(storageRef, files[i]).then(async () => {
                            const imageUrl = await getDownloadURL(storageRef);
                            roomImages.push(imageUrl);
                        });
                        uploadPromises.push(uploadPromise);
                    }

                    await Promise.all(uploadPromises); // Wait for all image uploads
                }

                const roomTypeBedsAvailable = parseInt(roomType.match(/\d+/)[0]) * roomCount;

                // Initialize floor if not already present
                if (!roomsObject[`floor${floorNumber}`]) {
                    roomsObject[`floor${floorNumber}`] = {};
                }

                // Initialize room type under the floor if not already present
                if (!roomsObject[`floor${floorNumber}`][roomType]) {
                    roomsObject[`floor${floorNumber}`][roomType] = {
                        floor: floorNumber,
                        acPrice: acPrice,
                        nonacPrice: nonacPrice,
                        roomCount: roomCount,
                        roomType: roomType,
                        imagesLink:roomImages, 
                        bedsAvailable: roomTypeBedsAvailable,
                        rooms: {}
                    };
                }

                // Add AC type to the rooms object
                if (!roomsObject[`floor${floorNumber}`][roomType].rooms[acType]) {
                    roomsObject[`floor${floorNumber}`][roomType].rooms[acType] = {};
                }


                for (let roomSubIndex = 1; roomSubIndex <= roomCount; roomSubIndex++) {
                    const roomNumber = `R${roomNumberCounter++}_F${floorNumber}`;
                    const bedsAvailableForRoom = parseInt(roomType.match(/\d+/)[0]);

                    roomsObject[`floor${floorNumber}`][roomType].rooms[acType][`room${roomNumber}`] = {
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
                        roomsObject[`floor${floorNumber}`][roomType].rooms[acType][`room${roomNumber}`].beds[bedKey] = { status: "not booked" };
                    }
                }
            }
        }


        await update(ref(db, `Hostel details/${hname}/rooms`), roomsObject);

        const additionalFloorsInput = document.getElementById("hostelExtraFloors");
        const additionalFloors = parseInt(additionalFloorsInput.value, 10) || 0;

        // Get the current number of floors from Firebase
        const hostelFloorsRef = ref(db, `Hostel details/${hname}/hostelFloors`);

        const existingFloorsSnapshot = await get(hostelFloorsRef);
        const existingFloors = existingFloorsSnapshot.exists() ? parseInt(existingFloorsSnapshot.val(), 10) : 0;

        // Calculate the new total number of floors
        const totalFloors = existingFloors + additionalFloors;

        // Update `hostelFloors` in Firebase only if the new total is greater
        if (totalFloors > existingFloors) {
            await update(ref(db, `Hostel details/${hname}`), {
                hostelFloors: totalFloors,
            });
            console.log(`Updated total floors to ${totalFloors}`);
        } else {
            console.log(`No update needed. Existing floors: ${existingFloors}, Additional floors: ${additionalFloors}`);
        }

        hideLoader();
        alert("Room details saved successfully!");
        nextStep(3);
    } catch (error) {
        console.error("Error saving room details:", error);
        alert("Error saving room details: " + error.message);
    }
});

// Step 4: Weekly menu
document.getElementById("nextButtonStep3").addEventListener("click", async () => {
    try {
        //await updateDishTimingsForWeek();
        nextStep(4); // Step 4 is the dummy Submit page
    } catch (error) {
        console.error("Error saving extras data:", error);
        alert("Error saving extras data: " + error.message);
    }
});

// Step 4: Final Submit
document.getElementById("submitButton").addEventListener("click", async () => {
    const hname = document.getElementById("hostelname").value;
    if (!hname) {
        alert("Hostel name is missing. Please complete the earlier steps.");
        return;
    }

    const db = getDatabase(); // Ensure Firebase is initialized
    await set(ref(db, `Hostel details/${hname}/status`), { completed: true });

    alert("Your form has been successfully submitted!");
    redirectToHome();
});

// Redirect to home or any desired page
function redirectToHome() {
    window.location.href = "hostel-list.html";
}

// Prefill details on load
document.addEventListener("DOMContentLoaded", prefillHostelDetails);
