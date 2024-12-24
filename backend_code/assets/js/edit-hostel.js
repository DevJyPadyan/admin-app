import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, onValue, child, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"
import { getStorage, ref as ref2, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js"
import { firebaseConfig } from "./firebase-config.js";
//import { firebaseConfig } from "./hostel-register.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase();
const storage = getStorage(app);

async function displayHostelImages(hostelName) {
    const imageRef = ref(db, `Hostel details/${hostelName}/ImageData/`);
    try {
        const snapshot = await get(imageRef);
        if (snapshot.exists()) {
            const imageUrls = snapshot.val();
            const imageContainer = document.getElementById('hostelImageContainer');
            imageContainer.innerHTML = ''; // Clear existing images

            imageUrls.forEach(url => {
                const img = document.createElement('img');
                img.src = url;
                img.alt = 'Hostel Image';
                img.style.width = '100px';
                img.style.height = '100px';
                img.style.margin = '5px';
                imageContainer.appendChild(img);
            });
        } else {
            console.log('No images found for this hostel.');
        }
    } catch (error) {
        console.error('Error fetching images:', error);
    }
}

/*Multiple images upload*/
var files = [];
let imagelink = [];
document.getElementById("files").addEventListener("change", function (e) {
    files = e.target.files;
    for (let i = 0; i < files.length; i++) {
    }
});

document.getElementById("uploadImage").addEventListener("click", async function () {

    var hostelName = document.getElementById("hostelname").value;

    //checks if files are selected
    if (files.length != 0) {
        //Loops through all the selected files
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

/* Start of adding room details using dynamic form handling*/

document.addEventListener('DOMContentLoaded', function () {
    const addRoomButton = document.getElementById("addroom");
    const roomContainer = document.getElementById("additional-room-container");

    let roomCount = 0;  // Initialize room count

    addRoomButton.addEventListener('click', () => {
        addRoomForm(); // Create a new room container
    });

    function addRoomForm() {
        roomCount++;  // Increment room count every time a new room is added

        const mainParentElem = document.createElement('div');
        mainParentElem.classList.add('col-12');

        const roomElem = document.createElement("div");
        roomElem.classList.add("card", "mb-3", "additional-room-container");
        roomElem.id = `room-${roomCount}`; // Ensure `.card` gets a unique ID

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

        // Add floor number input field
        rowElem.appendChild(createInputBox("Floor Number", `floorNumber-${roomCount}`, "number", true));

        // Add form fields (room type, amenities, price, etc.)
        rowElem.appendChild(createSelectBox("Room Type", `roomType-${roomCount}`, true, [
            { value: '1 sharing', text: '1 sharing' },
            { value: '2 sharing', text: '2 sharing' },
            { value: '3 sharing', text: '3 sharing' },
            { value: '4 sharing', text: '4 sharing' }
        ]));
        rowElem.appendChild(createInputBox("Room Count", `roomCount-${roomCount}`, "number", true));
        rowElem.appendChild(createInputBox("Room Number", `roomNumber-${roomCount}`, "text", false, "e.g.,101, 102 .."));
        rowElem.appendChild(createInputBox("Amenities", `amenities-${roomCount}`, "text", false, "e.g., WiFi, Laundry"));
        rowElem.appendChild(createInputBox("Price", `price-${roomCount}`, "number", true));
        rowElem.appendChild(createInputBox("Upload Room Images", `roomImage-${roomCount}`, "file", false, "", true));

        rowElem.appendChild(createSelectBox("Bathroom Type", `bathroom-${roomCount}`, true, [
            { value: "attached", text: "attached" },
            { value: "common", text: "common" }
        ]));

        rowElem.appendChild(createSelectBox("AC Type", `acType-${roomCount}`, true, [
            { value: "ac", text: "ac" },
            { value: "non-ac", text: "non-ac" }
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
});
/* End of adding room details using dynamic form handling*/

/*start of Get Menu and Get Room details from firebase DB*/
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
    const getMenuDetailsButton = document.getElementById("getMenuDetails");

    const morningTimeContainer = document.getElementById("morningTimeContainer");
    const afternoonTimeContainer = document.getElementById("afternoonTimeContainer");
    const nightTimeContainer = document.getElementById("nightTimeContainer");

    // Append time range inputs for morning, afternoon, and night
    morningTimeContainer.appendChild(createTimeRangeInput('morningStart', 'morningEnd'));
    afternoonTimeContainer.appendChild(createTimeRangeInput('afternoonStart', 'afternoonEnd'));
    nightTimeContainer.appendChild(createTimeRangeInput('nightStart', 'nightEnd'));
    const weekDropdown = document.createElement('select');
    weekDropdown.id = 'weekDropdown';
    weekDropdown.style.marginLeft = '10px';

    const weekContainer = document.getElementById('weekContainer');

    // Add options to the week dropdown
    const weekOptions = ['week1', 'week2', 'week3', 'week4', 'week5'];
    weekOptions.forEach(week => {
        const option = document.createElement('option');
        option.value = week;
        option.innerText = week;
        weekDropdown.appendChild(option);
    });

    const labelText = document.createElement('span');
    labelText.innerText = 'Select Week:';
    labelText.style.marginRight = '10px';

    // Add dropdown to the UI
    const dropdownContainer = document.createElement('div');
    dropdownContainer.style.marginTop = '20px';
    dropdownContainer.style.marginLeft = '820px';
    dropdownContainer.appendChild(labelText);
    dropdownContainer.appendChild(weekDropdown);
    document.getElementById('mealTimeContainer').appendChild(dropdownContainer);

    // Ensure the dropdown is available when you try to access it
    getMenuDetailsButton.addEventListener('click', async () => {
        const hostelName = document.getElementById("hostelname").value;
        const weeksRef = ref(db, `Hostel details/${hostelName}/weeks`);

        try {
            const snapshot = await get(weeksRef);
            if (snapshot.exists()) {
                const weeksData = snapshot.val();
                console.log(weeksData);

                // Clear existing week containers before creating forms
                weekContainer.innerHTML = '';

                // Initialize dropdown with the first week selected
                weekDropdown.value = 'week1';
                await displayWeekDetails('week1'); // Display week 1 details by default

                // Optionally, you can loop here if you want to keep the dropdown in sync with the week data
            } else {
                alert('No week details found for this hostel.');
            }
        } catch (error) {
            console.error('Error fetching week details:', error);
        }
    });

    // Fetch and display week details on dropdown change
    weekDropdown.addEventListener('change', async () => {
        const selectedWeek = weekDropdown.value; // Make sure weekDropdown exists before this line
        if (selectedWeek) { // Check if selectedWeek is defined
            await displayWeekDetails(selectedWeek);
        }
    });

    // Function to display week details in the week container
    async function displayWeekDetails(weekNum) {
        const hostelName = document.getElementById("hostelname").value;
        const weekRef = ref(db, `Hostel details/${hostelName}/weeks/${weekNum}`);

        try {
            const snapshot = await get(weekRef);
            if (snapshot.exists()) {
                const weekData = snapshot.val();
                console.log(weekData);

                // Clear existing week containers
                weekContainer.innerHTML = '';

                // Create week form for the selected week
                createWeekForm(weekNum.replace('week', ''), weekData); // Remove 'week' prefix for numbering

                // Fill in the meal timings (morning, afternoon, night)
                const mondayData = weekData['Monday'];
                const morningTiming = mondayData['morning'].timing.split(' - ');
                const afternoonTiming = mondayData['afternoon'].timing.split(' - ');
                const nightTiming = mondayData['night'].timing.split(' - ');

                document.getElementById('morningStart').value = convertTo24Hour(morningTiming[0]);
                document.getElementById('morningEnd').value = convertTo24Hour(morningTiming[1]);
                document.getElementById('afternoonStart').value = convertTo24Hour(afternoonTiming[0]);
                document.getElementById('afternoonEnd').value = convertTo24Hour(afternoonTiming[1]);
                document.getElementById('nightStart').value = convertTo24Hour(nightTiming[0]);
                document.getElementById('nightEnd').value = convertTo24Hour(nightTiming[1]);
            } else {
                alert(`No details found for ${weekNum}.`);
            }
        } catch (error) {
            console.error('Error fetching week details:', error);
        }
    }

    // Create week forms and populate dish dropdowns
    function createWeekForm(weekNum, weekData) {
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

                const mainDishValue = weekData[day]?.[mealTime]?.mainDish || '';  // Retrieve mainDish
                const sideDishValue = weekData[day]?.[mealTime]?.sideDish || '';  // Retrieve sideDish            

                console.log(`Main Dish for ${day}, ${mealTime}:`, mainDishValue);
                console.log(`Side Dish for ${day}, ${mealTime}:`, sideDishValue);

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

                // Create Main Dish Dropdown
                const mainDishOptions = ['select main dish', 'Idly', 'Poori', 'Iddiyappam', 'Dosa', 'Pongal', 'Chapathi', 'Upma', 'Parotta',
                    'Sambar rice', 'Tomato rice', 'Veg meals', 'Curd rice', 'Lemon rice', 'Veg briyani', 'Paneer fried rice', 'Gobi rice', 'Rasam rice'];
                rowElem.appendChild(createSelectBox1('Main Dish', `mainDish-${weekNum}-${day}-${mealTime}`, true, mainDishOptions, mainDishValue));


                // Create Side Dish Dropdown
                const sideDishOptions = ['select side dish', 'Chutney', 'Sambar', 'Masala vada', 'Butter masala', 'Betroot poriyal', 'Potato fry',
                    'Kootu', 'Appalam', 'Paneer butter masala', 'Gobi 65', 'Channa Masala', 'Daal', 'Cabbage poriyal', 'Raita', 'Kurma'];
                rowElem.appendChild(createSelectBox1('Side Dish', `sideDish-${weekNum}-${day}-${mealTime}`, true, sideDishOptions, sideDishValue));

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


    // Helper function to create select boxes
    function createSelectBox1(labelText, selectId, required, options, selectedValue = '') {
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
        if (required) selectElem.required = true;

        // Ensure options is an array before using forEach
        const optionArray = Array.isArray(options) ? options : [];

        optionArray.forEach(option => {
            const optElem = document.createElement('option');
            optElem.value = option;
            optElem.innerText = option;

            if (option === selectedValue) {
                optElem.selected = true;
            }

            selectElem.appendChild(optElem);
        });

        inputBoxElem.appendChild(labelElem);
        inputBoxElem.appendChild(selectElem);
        colElem.appendChild(inputBoxElem);

        return colElem;
    }
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
    // Prefill hostel details on page load
    window.addEventListener('load', prefillHostelDetails);

    // Fetch and prefill room details when "Get Room" button is clicked 
    getRoomButton.addEventListener('click', async () => {
        const hostelName = document.getElementById("hostelname").value;
        const roomsRef = ref(db, `Hostel details/${hostelName}/rooms`);

        try {
            const snapshot = await get(roomsRef);
            if (snapshot.exists()) {
                const roomsData = snapshot.val();
                floorsContainer.innerHTML = ''; // Clear existing floor containers

                // Loop through each floor and its rooms
                Object.keys(roomsData).forEach((floorKey) => {
                    const floorData = roomsData[floorKey];
                    const floorNumber = floorKey.replace('floor', ''); // Extract floor number
                    createFloorContainer(floorNumber, floorData); // Create floor container
                });
            } else {
                console.log('No rooms data found for this hostel.'); // Debug: Log if no data exists
                alert('No rooms found for this hostel.');
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    });

    // Function to create a floor container with grouped rooms
    function createFloorContainer(floorNumber, floorData) {
        const floorElem = document.createElement("div");
        floorElem.classList.add("col-12", "mb-4");
        floorElem.id = floorNumber;

        const cardElem = document.createElement("div");
        cardElem.classList.add("card");

        const cardHeaderElem = document.createElement("div");
        cardHeaderElem.classList.add("card-header", "d-flex", "justify-content-between", "align-items-center");

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

            // Loop through room configurations (e.g., "ac", "non-ac")
            Object.keys(roomTypeData.rooms).forEach((roomConfigKey) => {
                const rooms = roomTypeData.rooms[roomConfigKey];

                // Loop through individual rooms
                Object.keys(rooms).forEach((roomKey) => {
                    const roomDetails = rooms[roomKey];
                    createRoomContainer(roomWrapper, floorNumber, roomKey, roomDetails);
                });
            });
        });

        cardElem.appendChild(cardHeaderElem);
        cardElem.appendChild(cardBodyElem);
        floorElem.appendChild(cardElem);
        floorsContainer.appendChild(floorElem);
    }

    function createRoomContainer(parentElem, floorNumber, roomKey, roomDetails) {
        const mainParentElem = document.createElement('div');
        mainParentElem.classList.add('col-12');

        const roomElem = document.createElement("div");
        roomElem.classList.add("card", "mb-3", "room-container");

        // Add the data-floor attribute
        roomElem.setAttribute("data-floor", floorNumber);
        roomElem.id = `room-${roomKey}`; // Add an ID to the room container for image functionality

        const roomHeader = document.createElement("div");
        roomHeader.classList.add("card-header", "d-flex", "justify-content-between", "align-items-center");

        const roomLabel = document.createElement("h6");
        roomLabel.innerText = `Room ${roomKey.replace('room', '')} (${roomDetails.roomType}) - Floor ${floorNumber}`;

        const deleteIcon = document.createElement("a");
        deleteIcon.className = "ri-delete-bin-line";
        deleteIcon.style.fontSize = "24px";
        deleteIcon.style.cursor = "pointer";
        deleteIcon.id = `delete-room-${roomKey}`;

        deleteIcon.addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete this room?')) {
                try {

                    const hostelName = document.getElementById("hostelname").value;
                    const roomType = roomDetails.roomType;
                    const roomConfig = roomDetails.ac;
                    const roomPath = `Hostel details/${hostelName}/rooms/floor${floorNumber}/${roomType}/rooms/${roomConfig}/${roomKey}`;

                    console.log('Deleting from Firebase path:', roomPath);
                    await remove(ref(db, roomPath));
                    // Remove the room from the DOM
                    const roomElement = document.getElementById(`room-${roomKey}`);
                    if (roomElement) {
                        roomElement.remove();
                    }
                    alert('Room deleted successfully.');
                } catch (error) {
                    console.error('Error deleting room:', error);
                    alert('Failed to delete room.');
                }
            }
        });

        roomHeader.appendChild(roomLabel);
        roomHeader.appendChild(deleteIcon);

        const roomBody = document.createElement("div");
        roomBody.classList.add("card-body");

        const rowElem = document.createElement("div");
        rowElem.classList.add("row", "gy-3");

        // Prefill room data
        rowElem.appendChild(createSelectBox('Room Type', `roomType-${floorNumber}-${roomKey}`, true, ['1 sharing', '2 sharing', '3 sharing', '4 sharing'], roomDetails.roomType));
        rowElem.appendChild(createInputBox('Room Count', `roomCount-${floorNumber}-${roomKey}`, 'number', true, '', true, roomDetails.roomCount));
        rowElem.appendChild(createInputBox('Room Number', `roomNumber-${floorNumber}-${roomKey}`, 'number', true, '', true, roomDetails.roomNumber));
        rowElem.appendChild(createInputBox('Amenities', `amenities-${floorNumber}-${roomKey}`, 'text', false, 'e.g. WiFi, Laundry', false, roomDetails.amenities));
        rowElem.appendChild(createSelectBox('Air Conditioning', `acType-${floorNumber}-${roomKey}`, true, ['ac', 'non-ac'], roomDetails.ac));
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
        }, 0); // Using a timeout to ensure DOM rendering is complete
    }

    function displayRoomImages(roomKey, images) {
        const roomCard = document.getElementById(`room-${roomKey}`);
        if (roomCard) {
            let imageContainer = roomCard.querySelector('.image-preview-container');
            if (!imageContainer) {
                console.warn(`Image container not found for room ${roomKey}.`);
                return;
            }
            // Clear any existing images or messages
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
    // Prefill hostel details from localStorage
    function prefillHostelDetails() {
        const storedData = localStorage.getItem('hosteldetailsAdmin');
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

            displayHostelImages(hostelData[0]);

        } else {
            console.log("No hostel data found in localStorage.");
        }
    }

});

// Fetch and update hostel details
updateHostel.addEventListener('click', async (e) => {

    let hostelName = document.getElementById("hostelname").value;
    let htype = document.getElementById("hosteltype").value;
    let hphone = document.getElementById("hostelphone").value;
    let hemail = document.getElementById("hostelemail").value;
    let hadd1 = document.getElementById("hosteladd1").value;
    let hadd2 = document.getElementById("hosteladd2").value;
    let hcity = document.getElementById("hostelcity").value;
    let hstate = document.getElementById("hostelstate").value;
    let hpin = document.getElementById("hostelpin").value;
    let hfloorsDB = document.getElementById("hostelfloorsDB").value;

    // Fetch existing hostel details
    let existingHostelRef = ref(db, `Hostel details/${hostelName}`);
    let existingHostelSnapshot = await get(existingHostelRef);
    let existingHostelDetails = existingHostelSnapshot.exists() ? existingHostelSnapshot.val() : {};

    let floorContainers = document.querySelectorAll('.floorsContainer');

    for (let floorElem of floorContainers) {
        let roomElements = floorElem.querySelectorAll('.room-container');

        for (let roomElem of roomElements) {
            let floorKey = roomElem.getAttribute('data-floor');
            let roomKey = roomElem.id.split('-')[1];
            let roomType = document.getElementById(`roomType-${floorKey}-${roomKey}`).value;
            let roomCount = parseInt(document.getElementById(`roomCount-${floorKey}-${roomKey}`).value, 10);
            let amenities = document.getElementById(`amenities-${floorKey}-${roomKey}`).value;
            let ac = document.getElementById(`acType-${floorKey}-${roomKey}`).value;
            let bathroom = document.getElementById(`bathroom-${floorKey}-${roomKey}`).value;
            let price = (document.getElementById(`price-${floorKey}-${roomKey}`).value); // Ensure price is a float
            let remarks = document.getElementById(`remarks-${floorKey}-${roomKey}`).value;

            let imageInput = document.getElementById(`roomImage-${roomKey}`);
            let files = imageInput.files;
            let imagelink1 = [];

            if (files.length !== 0) {
                for (let j = 0; j < files.length; j++) {
                    let storageRef = ref2(storage, `images/${hostelName}/room-${roomKey}/${files[j].name}`);
                    await uploadBytes(storageRef, files[j]);
                    let imageUrl = await getDownloadURL(storageRef);
                    imagelink1.push(imageUrl);
                }
            }

            console.log(db, `Hostel details/${hostelName}/rooms/floor${floorKey}/${roomType}/rooms/${ac}/room${roomKey}`);
            // Fetch existing roomType level
            let existingRoomTypeRef = ref(db, `Hostel details/${hostelName}/rooms/floor${floorKey}/${roomType}`);
            let existingRoomTypeSnapshot = await get(existingRoomTypeRef);
            let existingRoomTypeData = existingRoomTypeSnapshot.exists() ? existingRoomTypeSnapshot.val() : {};

            let existingRoomTypeBedsAvailable = existingRoomTypeData.bedsAvailable || 0;

            // Update roomType-level
            await update(
                ref(db, `Hostel details/${hostelName}/rooms/floor${floorKey}/${roomType}`),
                {
                    floor: floorKey,
                    price: price,
                    roomCount: roomCount,
                    roomType: roomType,
                    bedsAvailable: existingRoomTypeBedsAvailable,
                }
            ).catch((error) => {
                console.error(`Error updating roomType details for ${roomType}:`, error);
                alert(`Error updating roomType details for ${roomType}: ${error}`);
            });

            // Fetch existing room-level data
            let existingRoomRef = ref(db, `Hostel details/${hostelName}/rooms/floor${floorKey}/${roomType}/rooms/${ac}/${roomKey}`);
            let existingRoomSnapshot = await get(existingRoomRef);
            let existingRoomData = existingRoomSnapshot.exists() ? existingRoomSnapshot.val() : {};
            let existingBeds = existingRoomData.beds || {};
            let existingBedsAvailable = existingRoomData.bedsAvailable;
            // Update room-level details 
            let roomnum = roomKey.match(/\d+/)[0];
            let existingImages = existingRoomData.imagesLink || []; // Fetch existing images
            let updatedImages = imagelink1.length > 0 ? [...existingImages, ...imagelink1] : existingImages;

            await update(
                ref(db, `Hostel details/${hostelName}/rooms/floor${floorKey}/${roomType}/rooms/${ac}/${roomKey}`),
                {
                    roomNumber: roomnum,
                    floor: floorKey,
                    ac: ac,
                    roomCount: roomCount,
                    roomType: roomType,
                    bathroom: bathroom,
                    price: price,
                    amenities: amenities,
                    remarks: remarks,
                    imagesLink: updatedImages, // Use updated images array
                    bedsAvailable: existingBedsAvailable, // Retain existing bedsAvailable value
                }
            ).catch((error) => {
                console.error(`Error updating room details for Room ${roomKey}:`, error);
                alert(`Error updating room details for Room ${roomKey}: ${error}`);
            });

            await update(
                ref(db, `Hostel details/${hostelName}/rooms/floor${floorKey}/${roomType}/rooms/${ac}/${roomKey}/beds`),
                {
                    beds: existingBeds, // Retain existing beds data
                }
            ).catch((error) => {
                console.error(`Error updating bed details for Room ${roomKey}:`, error);
                alert(`Error updating room details for Room ${roomKey}: ${error}`);
            });
        }
    }

    // `.additional-room-container`
    let additionalRoomContainers = document.querySelectorAll('.additional-room-container');
    debugger;

    for (let roomElem of additionalRoomContainers) {
        let uniqueId = roomElem.id.split('-')[1]; // Extract unique ID for each room container

        // Fetch the room data for this container
        let floor = document.getElementById(`floorNumber-${uniqueId}`).value;
        let roomType = document.getElementById(`roomType-${uniqueId}`).value;
        let roomCount = parseInt(document.getElementById(`roomCount-${uniqueId}`).value, 10);
        let roomNumbers = document.getElementById(`roomNumber-${uniqueId}`).value.split(',').map(num => num.trim()); // Parse room numbers from comma-separated input
        let amenities = document.getElementById(`amenities-${uniqueId}`).value;
        let price = document.getElementById(`price-${uniqueId}`).value;
        let bathroom = document.getElementById(`bathroom-${uniqueId}`).value;
        let ac = document.getElementById(`acType-${uniqueId}`).value;
        let remarks = document.getElementById(`remarks-${uniqueId}`).value;

        if (floor > hfloorsDB) {
            hfloorsDB = floor; // Update hfloorsDB if needed
        }

        // Calculate beds available based on roomType and roomCount
        const roomTypeBedsAvailable = parseInt(roomType.match(/\d+/)[0]) * roomCount;

        // Beds available per room.
        const bedsAvailableForRoom = parseInt(roomType.match(/\d+/)[0]);

        let imageInput = document.getElementById(`roomImage-${uniqueId}`);
        let files = imageInput.files;
        let imageLinks = [];

        if (files.length !== 0) {
            for (let file of files) {
                let storageRef = ref2(storage, `images/${hostelName}/room-${roomNumbers[0]}/${file.name}`);
                await uploadBytes(storageRef, file);
                let imageUrl = await getDownloadURL(storageRef);
                imageLinks.push(imageUrl);
            }
        }

        // Update roomType-level details
        await update(ref(db, `Hostel details/${hostelName}/rooms/floor${floor}/${roomType}`), {
            roomType: roomType,
            roomCount: roomCount,
            bedsAvailable: roomTypeBedsAvailable,
        }).catch((error) => console.error(`Error updating roomType details for ${roomType}:`, error));

        // Loop through each room number from the comma-separated list
        for (let roomNumber of roomNumbers) {
            // Update the room-level details for each room number
            await update(ref(db, `Hostel details/${hostelName}/rooms/floor${floor}/${roomType}/rooms/${ac}/room${roomNumber}`), {
                floor: floor,
                roomType: roomType,
                roomNumber: roomNumber,
                roomCount: roomCount,
                amenities: amenities,
                ac: ac,
                bathroom: bathroom,
                price: price,
                remarks: remarks,
                bedsAvailable: bedsAvailableForRoom,
                imagesLink: imageLinks,
                beds: {} // Empty object to represent initial bed status
            });

            // Insert bed data for the current room (e.g., "bed 1", "bed 2", etc.)
            for (let bedIndex = 1; bedIndex <= bedsAvailableForRoom; bedIndex++) {
                const bedKey = `bed ${bedIndex}`;
                await update(ref(db, `Hostel details/${hostelName}/rooms/floor${floor}/${roomType}/rooms/${ac}/room${roomNumber}/beds`), {
                    [bedKey]: 'not booked', // Initial status of the bed
                }).catch((error) => {
                    alert(`Error updating bed ${bedKey}: ${error}`);
                });
            }
        }
    }

    // Update hostel-level details (generic hostel info)
    await update(ref(db, `Hostel details/${hostelName}/`), {
        hostelName: hostelName,
        hostelType: htype,
        hostelPhone: hphone,
        hostelEmail: hemail,
        hostelAddress1: hadd1,
        hostelAddress2: hadd2,
        hostelCity: hcity,
        hostelState: hstate,
        hostelPin: hpin,
        hostelFloors: hfloorsDB,
        extras: existingHostelDetails.extras || {}, // Retain extras
    });


    let weeks = {}; // Collect week details
    let weekCount = document.querySelectorAll('.card[id^="week-"]').length;
    let weekDropdown = document.getElementById('weekDropdown');

    let selectedWeeks = weekDropdown ? Array.from(weekDropdown.selectedOptions).map(option => option.value) : [];

    if (weekCount > 0 && selectedWeeks.length > 0) { // Ensure there are weeks to process
        let days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        let weeksRef = ref(db, `Hostel details/${hostelName}/weeks`);
        let snapshot = await get(weeksRef);
        let existingWeeks = snapshot.exists() ? snapshot.val() : {};

        selectedWeeks.forEach(selectedWeek => {
            let weekData = {};
            days.forEach(day => {
                weekData[day] = {};
                let mealTimes = ['morning', 'afternoon', 'night'];
                mealTimes.forEach(mealTime => {
                    let mainDishElement = document.getElementById(`mainDish-1-${day}-${mealTime}`);
                    let sideDishElement = document.getElementById(`sideDish-1-${day}-${mealTime}`);

                    let dishName = mainDishElement ? mainDishElement.value : '';
                    let sideDishName = sideDishElement ? sideDishElement.value : '';

                    console.log(`Processing Day: ${day}, Meal Time: ${mealTime}, Main Dish: ${dishName}, Side Dish: ${sideDishName}`);

                    if (dishName !== 'select main dish' && sideDishName !== 'select side dish') {
                        let timing = getMealTimings(mealTime);
                        weekData[day][mealTime.toLowerCase()] = {
                            mainDish: dishName,
                            sideDish: sideDishName,
                            timing: `${convertTo12Hour(timing.start)} - ${convertTo12Hour(timing.end)}`
                        };
                    }
                });
            });

            existingWeeks[selectedWeek] = weekData;
        });

        await update(ref(db, `Hostel details/${hostelName}/weeks`), existingWeeks);
    }

    alert("Hostel details updated successfully");
    window.location.href = "././hostel-list.html";

    // Function to get global meal timings
    function getMealTimings(mealTime) {
        return {
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
        }[mealTime.toLowerCase()];
    }

    // Function to convert timings to 12-hour format
    function convertTo12Hour(time24) {
        if (!time24) return '';
        let [hours, minutes] = time24.split(':');
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${hours}:${minutes} ${ampm}`;
    }
});
