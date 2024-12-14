import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, child, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"
import { getStorage, ref as ref2, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js"
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase();
const storage = getStorage(app);

const extrasContainer = document.getElementById('extras-container');
const addItemButton = document.getElementById('addItemButton');
const removeItemButton = document.getElementById('removeItemButton');

// Track the number of extra items added
let extraItemCount = 0;

// Event listener to add new food input fields dynamically
addItemButton.addEventListener('click', () => {
  extraItemCount++;

  const newRow = document.createElement('div');
  newRow.classList.add('extra-row', 'mt-2');

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

// Event listener to remove the last added food input fields
removeItemButton.addEventListener('click', () => {
  const rows = extrasContainer.querySelectorAll('.extra-row'); // Select all rows with 'extra-row' class

  if (rows.length > 0) {
    const lastRow = rows[rows.length - 1]; // Get the last row
    extrasContainer.removeChild(lastRow); // Remove the last row
    extraItemCount--;
  } else {
    alert('No more items to remove!'); // Alert if no rows are left
  }
});

const addWeekButton = document.getElementById("addWeekButton");
const weekContainer = document.getElementById("weekContainer");

const morningTimeContainer = document.getElementById("morningTimeContainer");
const afternoonTimeContainer = document.getElementById("afternoonTimeContainer");
const nightTimeContainer = document.getElementById("nightTimeContainer");

// Append time range inputs for meals at the initial level
morningTimeContainer.appendChild(createTimeRangeInput('morningStart', 'morningEnd'));
afternoonTimeContainer.appendChild(createTimeRangeInput('afternoonStart', 'afternoonEnd'));
nightTimeContainer.appendChild(createTimeRangeInput('nightStart', 'nightEnd'));

let existingWeeks = [];   // Declare globally to store existing weeks from Firebase
let existingNumericWeeks = [];  // Store numeric week values for internal comparison

document.addEventListener('DOMContentLoaded', async () => {
  const hostelName = document.getElementById('hostelname').value;

  // Fetch existing weeks from Firebase and set the global variables
  existingWeeks = await getExistingWeeks(hostelName);

  // Convert Firebase weeks (like 'week1', 'week2') into numeric values for internal comparison
  existingNumericWeeks = existingWeeks.map(week => parseInt(week.replace('week', '')));

  // Initialize the week count for display purposes
  let weekCount = 1;

  // Create Week 1 container on load
  createWeekForm(weekCount);

  // Add checkboxes for Week 2 to Week 5 after Week 1 container
  addWeekCheckboxes(weekCount, existingNumericWeeks);

  // Add event listener for the Add Menu button to find and display the next missing week
  document.getElementById('addWeekButton').addEventListener('click', async () => {
    const nextWeek = await findNextAvailableWeek(existingNumericWeeks);
    console.log(`Next available week: ${nextWeek !== null ? nextWeek : 'None'}`);

    if (!nextWeek) {
      alert('All weeks are already added!');
      return;
    }

    // Create the next missing week form
    createWeekForm(nextWeek);
    addWeekCheckboxes(nextWeek, existingNumericWeeks);

    // Update the existing numeric weeks after adding a new week
    existingNumericWeeks.push(nextWeek);
    existingWeeks.push(`week${nextWeek}`);  // Also update the original array with the 'week' prefix
  });
});

async function getExistingWeeks(hostelName) {
  const snapshot = await get(ref(db, `Hostel details/${hostelName}/weeks`));
  return snapshot.exists() ? Object.keys(snapshot.val()) : [];
}

// Function to add checkboxes for copying Week 1 data to Week 2 to Week 5
async function addWeekCheckboxes(currentWeekNum, existingNumericWeeks) {
  const container = document.createElement('div');
  container.classList.add('mt-3');

  const labelElem = document.createElement('h6');
  labelElem.innerText = "Choose the below checkboxes to copy week data";
  labelElem.style.marginBottom = '10px';
  container.appendChild(labelElem);

  const checkboxContainer = document.createElement('div');
  checkboxContainer.classList.add('d-flex', 'gap-3');

  // Define the weeks for checkboxes (2 to 5, as per your requirement)
  const weeks = [2, 3, 4, 5];

  // Iterate through the weeks to create checkboxes
  weeks.forEach(week => {
    const checkboxElem = document.createElement('div');
    checkboxElem.classList.add('form-check', 'form-check-inline');

    const inputElem = document.createElement('input');
    inputElem.type = 'checkbox';
    inputElem.id = `week${week}`;
    inputElem.classList.add('form-check-input');

    const weekLabelElem = document.createElement('label');
    weekLabelElem.htmlFor = `week${week}`;
    weekLabelElem.innerText = `Week ${week}`;
    weekLabelElem.classList.add('form-check-label');

    // Check if the numeric week is present in existing weeks (strip the 'week' prefix for comparison)
    const weekExists = existingNumericWeeks.includes(week); // Check using numeric comparison
    inputElem.disabled = weekExists; // Disable checkbox if week exists
    if (weekExists) {
      weekLabelElem.style.color = 'gray'; // Indicate the week is already added
    }

    checkboxElem.appendChild(inputElem);
    checkboxElem.appendChild(weekLabelElem);
    checkboxContainer.appendChild(checkboxElem);

    // Add event listener to handle the checkbox selection for copying data
    inputElem.addEventListener('change', async (event) => {
      if (event.target.checked) {
        await copyWeekData(currentWeekNum, week);  // Copy from Week 1 to the selected week
      }
    });
  });

  container.appendChild(checkboxContainer);
  document.getElementById('weekContainer').appendChild(container);
}

// Function to copy Week 1 data to the selected week in Firebase
async function copyWeekData(sourceWeek, targetWeek) {
  const weekData = {};

  // Fetch global meal timings
  const mealTimesData = {
    morning: {
      start: document.getElementById('morningStart').value,
      end: document.getElementById('morningEnd').value
    },
    afternoon: {
      start: document.getElementById('afternoonStart').value,
      end: document.getElementById('afternoonEnd').value
    },
    night: {
      start: document.getElementById('nightStart').value,
      end: document.getElementById('nightEnd').value
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  days.forEach(day => {
    weekData[day] = {};
    const mealTimes = ['morning', 'afternoon', 'night'];

    mealTimes.forEach(mealTime => {
      const dishName = document.getElementById(`mainDish-${sourceWeek}-${day}-${mealTime}`).value;
      const sideDishName = document.getElementById(`sideDish-${sourceWeek}-${day}-${mealTime}`).value;

      if (dishName !== 'select main dish' && sideDishName !== 'select side dish') {
        const timing = mealTimesData[mealTime.toLowerCase()]; // Get timing for the current meal
        weekData[day][mealTime.toLowerCase()] = {
          mainDish: dishName,
          sideDish: sideDishName,
          timing: `${convertTo12Hour(timing.start)} - ${convertTo12Hour(timing.end)}`
        };
      }
    });
  });

  const hostelName = document.getElementById('hostelname').value;

  // Save the copied data for the selected week in Firebase (add 'week' prefix when saving)
  await set(ref(db, `Hostel details/${hostelName}/weeks/week${targetWeek}`), weekData)
    .then(() => {
      alert(`Week ${sourceWeek} data copied to Week ${targetWeek}!`);

      // Update existingWeeks and existingNumericWeeks to include the newly copied week
      if (!existingWeeks.includes(`week${targetWeek}`)) {
        existingWeeks.push(`week${targetWeek}`);  // Add 'week' prefix for Firebase
        existingNumericWeeks.push(targetWeek);    // Numeric value for internal comparison
      }
    })
    .catch((error) => alert(`Error copying data: ${error.message}`));
}

// Helper function to find the next available week number
async function findNextAvailableWeek(existingNumericWeeks) {
  const availableWeeks = [2, 3, 4, 5].filter(week => !existingNumericWeeks.includes(week));
  return availableWeeks.length > 0 ? availableWeeks[0] : null;
}

//function to create week containers
function createWeekForm(weekNum) {
  const mainParentElem = document.createElement('div');
  mainParentElem.classList.add('col-12');

  const cardElem = document.createElement('div');
  cardElem.classList.add('card');
  cardElem.id = `week-${weekNum}`;

  const cardHeaderElem = document.createElement('div');
  cardHeaderElem.classList.add('card-header', 'd-flex', 'justify-content-between', 'align-items-center');

  const headerContent = document.createElement('div');
  headerContent.classList.add('d-flex', 'align-items-center');
  headerContent.innerHTML = `<h5 class="mb-0">Week ${weekNum}</h5>`;

  const dropdownArrow = document.createElement('span');
  dropdownArrow.classList.add('dropdown-arrow', 'ri-arrow-down-s-line');
  dropdownArrow.style.fontSize = '27px';
  dropdownArrow.style.marginLeft = '10px';

  dropdownArrow.addEventListener('click', () => {
    const collapseElem = document.getElementById(`collapseWeek${weekNum}`);
    collapseElem.classList.toggle('show');
    dropdownArrow.classList.toggle('ri-arrow-down-s-line');
    dropdownArrow.classList.toggle('ri-arrow-right-s-line');
  });

  cardHeaderElem.appendChild(headerContent);
  headerContent.appendChild(dropdownArrow);

  const headerButtonsContainer = document.createElement('div');
  headerButtonsContainer.classList.add('d-flex', 'gap-2');

  const saveWeekBtn = document.createElement('button');
  saveWeekBtn.className = 'btn restaurant-button';
  saveWeekBtn.innerHTML = `Save Week ${weekNum}`;
  saveWeekBtn.onclick = () => saveWeek(weekNum);

  headerButtonsContainer.appendChild(saveWeekBtn);
  cardHeaderElem.appendChild(headerButtonsContainer);

  const collapseElem = document.createElement('div');
  collapseElem.id = `collapseWeek${weekNum}`;
  collapseElem.classList.add('collapse', 'show');

  const cardBodyElem = document.createElement('div');
  cardBodyElem.classList.add('card-body');

  // Container for vertical days and dish inputs
  const weekLayout = document.createElement('div');
  weekLayout.classList.add('d-flex');

  // Create vertical days list
  const navTabs = document.createElement('ul');
  navTabs.classList.add('nav', 'flex-column', 'nav-pills'); // Vertical layout
  navTabs.role = 'tablist';

  // Container for tab contents (right side)
  const tabContent = document.createElement('div');
  tabContent.classList.add('tab-content', 'flex-grow-1', 'ps-3'); // Right side content

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  days.forEach((day, index) => {
    const navItem = document.createElement('li');
    navItem.classList.add('nav-item');

    const navLink = document.createElement('a');
    navLink.classList.add('nav-link');
    if (index === 0) navLink.classList.add('active');
    navLink.id = `week${weekNum}-${day}-tab`;
    navLink.dataset.bsToggle = 'tab';
    navLink.href = `#week${weekNum}-${day}`;
    navLink.role = 'tab';
    navLink.innerText = day;

    navItem.appendChild(navLink);
    navTabs.appendChild(navItem);

    const tabPane = document.createElement('div');
    tabPane.classList.add('tab-pane', 'fade');
    if (index === 0) tabPane.classList.add('show', 'active');
    tabPane.id = `week${weekNum}-${day}`;
    tabPane.role = 'tabpanel';

    // Create meal cards
    const mealTimes = ['morning', 'afternoon', 'night'];

    mealTimes.forEach(mealTime => {
      const mealCard = document.createElement('div');
      mealCard.classList.add('card', 'mb-3', 'mt-3');

      const mealCardBodyElem = document.createElement('div');
      mealCardBodyElem.classList.add('card-body', 'bg-light', 'input-items');
      mealCard.style.marginBottom = '5px'; // Reduce or remove the bottom margin of the meal card
      mealCardBodyElem.style.padding = '10px'; // Keep reduced padding
      mealCardBodyElem.style.marginLeft = '0'; // No negative margin
      mealCardBodyElem.style.marginBottom = '-20px'; // Remove bottom margin inside the card body
      mealCardBodyElem.style.marginTop = '-10px'; // Keep top margin minimal

      const headerWrapper = document.createElement('div');
      headerWrapper.style.display = 'flex';
      headerWrapper.style.justifyContent = 'center';
      headerWrapper.style.marginBottom = '10px'; // Optional margin

      const mealTimeHeader = document.createElement('h5');
      mealTimeHeader.innerText = mealTime;
      mealTimeHeader.style.textDecoration = 'underline';
      mealTimeHeader.style.color = 'orange'; // Set underline color

      headerWrapper.appendChild(mealTimeHeader);
      tabPane.appendChild(headerWrapper); // Append to the tabPane before the meal card


      const rowElem = document.createElement('div');
      rowElem.classList.add('row', 'gy-3');

      // Main Dish Dropdown
      const mainDishOptions = ['select main dish', 'Idly', 'Poori', 'Iddiyappam', 'Dosa', 'Pongal', 'Chapathi', 'Upma', 'Parotta',
        'Sambar rice', 'Tomato rice', 'Veg meals', 'Curd rice', 'Lemon rice', 'Veg briyani', 'Paneer fried rice', 'Gobi rice', 'Rasam rice'];
      rowElem.appendChild(createSelectBox1('Main Dish', `mainDish-${weekNum}-${day}-${mealTime}`, mainDishOptions));

      // Side Dish Dropdown
      const sideDishOptions = ['select side dish', 'Chutney', 'Sambar', 'Masala vada', 'Butter masala', 'Betroot poriyal', 'Potato fry',
        'Kootu', 'Appalam', 'Paneer butter masala', 'Gobi 65', 'Channa Masala', 'Daal', 'Cabbage poriyal', 'Raita', 'Kurma'];
      rowElem.appendChild(createSelectBox1('Side Dish', `sideDish-${weekNum}-${day}-${mealTime}`, sideDishOptions));

      mealCardBodyElem.appendChild(rowElem);
      mealCard.appendChild(mealCardBodyElem);
      tabPane.appendChild(mealCard);
    });

    tabContent.appendChild(tabPane);
  });

  // Append vertical tabs and right content to layout container
  weekLayout.appendChild(navTabs); // Left side (days)
  weekLayout.appendChild(tabContent); // Right side (meal inputs)

  cardBodyElem.appendChild(weekLayout); // Add layout to card body
  collapseElem.appendChild(cardBodyElem);
  cardElem.appendChild(cardHeaderElem);
  cardElem.appendChild(collapseElem);
  mainParentElem.appendChild(cardElem);
  weekContainer.appendChild(mainParentElem);
}

// Create a select box for dishes
function createSelectBox1(labelText, selectId, options) {
  const colElem = document.createElement('div');
  colElem.classList.add('col-xl-6');

  const inputBoxElem = document.createElement('div');
  inputBoxElem.classList.add('input-box');

  const labelElem = document.createElement('h6');
  labelElem.innerText = labelText;

  const selectElem = document.createElement('select');
  selectElem.id = selectId;
  selectElem.name = selectId;
  selectElem.classList.add('form-control');

  options.forEach(option => {
    const optElem = document.createElement('option');
    optElem.value = option;
    optElem.innerText = option;
    selectElem.appendChild(optElem);
  });

  inputBoxElem.appendChild(labelElem);
  inputBoxElem.appendChild(selectElem);
  colElem.appendChild(inputBoxElem);

  return colElem;
}


// Save week function
function saveWeek(weekNumber) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hostelName = document.getElementById('hostelname').value;
  const weekData = {};

  // Fetch global meal timings
  const mealTimesData = {
    morning: {
      start: document.getElementById('morningStart').value,
      end: document.getElementById('morningEnd').value
    },
    afternoon: {
      start: document.getElementById('afternoonStart').value,
      end: document.getElementById('afternoonEnd').value
    },
    night: {
      start: document.getElementById('nightStart').value,
      end: document.getElementById('nightEnd').value
    }
  };

  days.forEach(day => {
    weekData[day] = {};
    const mealTimes = ['morning', 'afternoon', 'night'];
    mealTimes.forEach(mealTime => {
      const dishName = document.getElementById(`mainDish-${weekNumber}-${day}-${mealTime}`).value;
      const sideDishName = document.getElementById(`sideDish-${weekNumber}-${day}-${mealTime}`).value;

      if (dishName !== 'select main dish' && sideDishName !== 'select side dish') {
        const timing = mealTimesData[mealTime.toLowerCase()];
        weekData[day][mealTime.toLowerCase()] = {
          mainDish: dishName,
          sideDish: sideDishName,
          timing: `${convertTo12Hour(timing.start)} - ${convertTo12Hour(timing.end)}`
        };
      }
    });
  });

  set(ref(db, `Hostel details/${hostelName}/weeks/week${weekNumber}`), weekData)
    .then(() => alert(`Week ${weekNumber} saved successfully!`))
    .catch((error) => alert(`Error saving Week ${weekNumber}: ${error.message}`));
}
// Helper functions
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
function convertTo12Hour(time24) {
  const [hours, minutes] = time24.split(':');
  const period = +hours >= 12 ? 'PM' : 'AM';
  const hours12 = (+hours % 12 || 12).toString().padStart(2, '0');
  return `${hours12}:${minutes} ${period}`;
}
/* End of Storing menu details*/

/* Start of Multiple image upload for hostel images*/

var files = [];
let imagelink = [];
document.getElementById("files").addEventListener("change", function (e) {
  files = e.target.files;
  for (let i = 0; i < files.length; i++) {
  }
});

document.getElementById("uploadImage").addEventListener("click", async function () {

  var hname = document.getElementById("hostelname").value;
  var htype = document.getElementById("hosteltype").value;
  var hphone = document.getElementById("hostelphone").value;
  var hemail = document.getElementById("hostelemail").value;
  var hadd1 = document.getElementById("hosteladd1").value;
  var hadd2 = document.getElementById("hosteladd2").value;
  var hcity = document.getElementById("hostelcity").value;
  var hstate = document.getElementById("hostelstate").value;
  var hpin = document.getElementById("hostelpin").value;

  //checks if files are selected
  if (files.length != 0) {
    //Loops through all the selected files
    for (let i = 0; i < files.length; i++) {
      const storageRef = ref2(storage, 'images/' + hname + '/hostelImg/' + files[i].name);
      const upload = await uploadBytes(storageRef, files[i]);
      const imageUrl = await getDownloadURL(storageRef);
      imagelink.push(imageUrl);
    }

    const imageRef = ref(db, 'Hostel details/' + hname + '/ImageData/' + '/');
    set(imageRef, imagelink)
      .then(() => {
        alert("To start uploading, please click OK");
        alert("Image is uploading, please click OK");
        alert("Image is uploaded");
        console.log('Image URLs have been successfully stored!');
      })

  } else {
    alert("No file chosen");
  }
});
/* End of Multiple image upload for hostel images*/

/* Start of adding room details using dynamic form handling*/
const addroom = document.getElementById("addroom");
const roomContainer = document.getElementById("room-container");
let roomCount = 0;
document.addEventListener('DOMContentLoaded', function () {
  addroom.addEventListener('click', () => {

    const floorInput = document.getElementById("hostelfloors");
    const floors = floorInput.value;

    // Check if the number of floors is entered
    if (floors <= 0 || isNaN(floors)) {
      alert("Please enter a valid number of floors before adding a room.");
      return; // Stop the function if number of floors is not valid
    }
    roomCount++;

    const mainParentElem = document.createElement('div');
    mainParentElem.classList.add('col-12');

    const cardElem = document.createElement('div');
    cardElem.classList.add('card');
    cardElem.id = `room-${roomCount}`;

    const cardHeaderElem = document.createElement('div');
    cardHeaderElem.classList.add('card-header', 'd-flex', 'justify-content-between', 'align-items-center');

    // Room label
    const roomLabel = document.createElement('h5');
    roomLabel.innerText = `Room ${roomCount}`;

    // Delete icon
    const deleteIcon = document.createElement('a');
    deleteIcon.className = 'ri-delete-bin-line';
    deleteIcon.style.fontSize = '24px';
    deleteIcon.style.cursor = 'pointer';
    deleteIcon.onclick = () => {
      cardElem.remove();
      roomCount--;
    };

    // Add room label and delete icon to header
    cardHeaderElem.appendChild(roomLabel);
    cardHeaderElem.appendChild(deleteIcon);

    const cardBodyElem = document.createElement('div');
    cardBodyElem.classList.add('card-body');

    const inputItemsElem = document.createElement('div');
    inputItemsElem.classList.add('input-items');

    const rowElem = document.createElement('div');
    rowElem.classList.add('row', 'gy-3');

    // Floor
    // rowElem.appendChild(createInputBox('Floor', `floor-${roomCount}`, 'number', true));
    const floorarr = numberToArray(document.getElementById("hostelfloors").value);
    rowElem.appendChild(createSelectBox('Floor', `floor-${roomCount}`, true, floorarr));


    // Room Type
    const roomTypeElem = createSelectBox('Room Type', `roomType-${roomCount}`, true, [
      { value: '1 sharing', text: '1 sharing' },
      { value: '2 sharing', text: '2 sharing' },
      { value: '3 sharing', text: '3 sharing' },
      { value: '4 sharing', text: '4 sharing' },
    ]);
    rowElem.appendChild(roomTypeElem);

    // Room Count
    rowElem.appendChild(createInputBox('Room Count', `roomCount-${roomCount}`, 'number', true));

    // Amenities
    rowElem.appendChild(createInputBox('Amenities', `amenities-${roomCount}`, 'text', false, 'e.g. WiFi, Laundry'));

    // Air Conditioning
    const acElem = createSelectBox('Air Conditioning', `ac-${roomCount}`, true, [
      { value: 'ac', text: 'ac' },
      { value: 'non-ac', text: 'non-ac' },
    ]);
    rowElem.appendChild(acElem);

    // Bathroom
    const bathroomElem = createSelectBox('Bathroom', `bathroom-${roomCount}`, true, [
      { value: 'attached', text: 'attached' },
      { value: 'common', text: 'common' },
    ]);
    rowElem.appendChild(bathroomElem);

    // Price
    rowElem.appendChild(createInputBox('Price', `price-${roomCount}`, 'number', true));

    // Upload Room Images
    rowElem.appendChild(createInputBox('Upload Room Images', `roomImage-${roomCount}`, 'file', false, '', true));

    // Append elements
    inputItemsElem.appendChild(rowElem);
    cardBodyElem.appendChild(inputItemsElem);
    cardElem.appendChild(cardHeaderElem);
    cardElem.appendChild(cardBodyElem);
    mainParentElem.appendChild(cardElem);
    roomContainer.appendChild(mainParentElem);
  });

  // Helper function to create input boxes
  function createInputBox(labelText, inputId, inputType, required, placeholder = '', multiple = false) {
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
    if (multiple) inputElem.multiple = true;

    inputBoxElem.appendChild(labelElem);
    inputBoxElem.appendChild(inputElem);
    colElem.appendChild(inputBoxElem);

    return colElem;
  }

  function numberToArray(number) { const result = []; for (let i = 1; i <= number; i++) { result.push(i); } return result; }

  // Helper function to create select boxes
  function createSelectBox(labelText, selectId, required, options) {
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

    options.forEach(option => {
      const optElem = document.createElement('option');
      if (option.value && option.text) {
        optElem.value = option.value;
        optElem.text = option.text;
      }
      else {
        //sets the floor drop down box in dynamic forms when number of floors entered
        optElem.value = option;
        optElem.text = `Floor ${option}`;

      }
      selectElem.appendChild(optElem);
    });

    inputBoxElem.appendChild(labelElem);
    inputBoxElem.appendChild(selectElem);
    colElem.appendChild(inputBoxElem);

    return colElem;
  }
});

/* End of adding room details using dynamic form handling*/


/*Start of single image upload*/
/*let hostelimg;
uploadImage.addEventListener('click', (e) => {

    upload();
});
async function upload() {
    const fileInput = document.getElementById("files");
    const file = fileInput.files[0];

    if (file) {
        const storageRef = ref2(storage, `uploaded_images/${file.name}`);
        await uploadBytes(storageRef, file);

        const imageURL = await getDownloadURL(storageRef);
        const imagePreview = document.getElementById("imagePreview");
        imagePreview.src = imageURL;
        //console.log(imageURL);
        hostelimg = imageURL;
        sessionStorage.setItem('hostelurl', hostelimg);
        console.log(hostelimg);
        //image.append(imageURL);
    }
}*/
/*End of single image upload*/

/*Start of storing room details inside modal*/
/*addroom.addEventListener('click', (e) => {
  var hname = document.getElementById("hostelname").value;
  var htype = document.getElementById("hosteltype").value;
  var hphone = document.getElementById("hostelphone").value;
  var hemail = document.getElementById("hostelemail").value;
  var hadd1 = document.getElementById("hosteladd1").value;
  var hadd2 = document.getElementById("hosteladd2").value;
  var hcity = document.getElementById("hostelcity").value;
  var hstate = document.getElementById("hostelstate").value;
  var hpin = document.getElementById("hostelpin").value;
  var hrent = document.getElementById("roomprice").value;
  var hfood = document.getElementById("foodprice").value;
  var ac = document.getElementById("acprice").value;
  var nonac = document.getElementById("nonprice").value;

  var roomtype = document.getElementById("rtype").value;
  var roomno = document.getElementById("rnumber").value;
  var roomprice = document.getElementById("rprice").value;
  var roomfac = document.getElementById("rfac").value;

  set(ref(db, 'Hostel details/' + hname + '/Room details/' + roomtype), {

    Roomtype: roomtype,
    Roomno: roomno,
    Roomprice: roomprice,
    Roomfac: roomfac

  })
  alert("Room details added successfully");
});*/
/*Start of storing room details inside modal*/

/*Start of storing hostel details when register button is clicked*/
registerHostel.addEventListener('click', async (e) => {
  var hname = document.getElementById("hostelname").value;
  var htype = document.getElementById("hosteltype").value;
  var hphone = document.getElementById("hostelphone").value;
  var hemail = document.getElementById("hostelemail").value;
  var hadd1 = document.getElementById("hosteladd1").value;
  var hadd2 = document.getElementById("hosteladd2").value;
  var hcity = document.getElementById("hostelcity").value;
  var hstate = document.getElementById("hostelstate").value;
  var hpin = document.getElementById("hostelpin").value;
  var hfloors = document.getElementById("hostelfloors").value;

  const extras = [];
  const foodNameInputs = document.querySelectorAll('.food-name');
  const foodPriceInputs = document.querySelectorAll('.food-price');

  foodNameInputs.forEach((input, index) => {
    const foodName = input.value.trim();
    const foodPrice = foodPriceInputs[index].value.trim();

    if (foodName && foodPrice) {
      extras.push({ foodName: foodName, foodPrice: foodPrice, available:'yes' });
    }
  });

  if (!hname || !htype || !hphone || !hemail || !hadd1 || !hcity || !hstate || !hpin) {
    alert("Please fill in all required fields.");
    return;
  }

  // Validate email
  const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
  if (!hemail.match(emailPattern)) {
    alert("Please enter a valid email address.");
    return;
  }

  // Validate phone number (should be exactly 10 digits)
  if (hphone.length !== 10 || isNaN(hphone)) {
    alert("Phone number should be exactly 10 digits.");
    return;
  }

  // Validate if at least one image is uploaded
  if (files.length === 0) {
    alert("Please upload at least one image.");
    return;
  }

  let rooms = {};
  for (let i = 1; i <= roomCount; i++) {
    const floor = document.getElementById(`floor-${i}`).value;
    const roomType = document.getElementById(`roomType-${i}`).value;
    const roomCountVal = document.getElementById(`roomCount-${i}`).value;
    const amenities = document.getElementById(`amenities-${i}`).value;
    const ac = document.getElementById(`ac-${i}`).value;
    const bathroom = document.getElementById(`bathroom-${i}`).value;
    const price = document.getElementById(`price-${i}`).value;
    const imageInput = document.getElementById(`roomImage-${i}`);
    const files = imageInput.files;
    let imagelink1 = [];

    // Storing room images data into an array called imagelink1[]
    if (files.length != 0) {
      for (let j = 0; j < files.length; j++) {
        const storageRef = ref2(storage, 'Roomimages/' + hname + '/room-' + i + '/' + files[j].name);
        await uploadBytes(storageRef, files[j]);
        const imageUrl = await getDownloadURL(storageRef);
        imagelink1.push(imageUrl);
      }
    }

    // Create or get the floor object
    if (!rooms[`floor${floor}`]) {
      rooms[`floor${floor}`] = {};
    }

    // Add room to the corresponding floor
    rooms[`floor${floor}`][`room${i}`] = {
      roomNumber: i, // Store the room number
      floor: floor,   // Store the floor number
      ac: ac,
      roomCount: roomCountVal,
      bathroom: bathroom,
      roomType: roomType,
      price: price,
      amenities: amenities,
      imagesLink: imagelink1
    };
  }
  update(ref(db, "Hostel details/" + hname + '/'), {
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
    extras: extras,
    rooms: rooms
  })
    .then(() => {
      //console.log(db, "Hostel details/" + hname)
      alert("Hostel details added successfully");
      window.location.href = "././products.html";
    })
    .catch((error) => {
      alert(error);
    });
});
/*End of storing hostel details when register button is clicked*/
