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
const addroom = document.getElementById("addroom");
const roomContainer = document.getElementById("room-container");

document.addEventListener('DOMContentLoaded', function () {
    let roomCount = 0; // This will track the number of rooms

    addroom.addEventListener('click', async () => {
        try {
            var hostelName = document.getElementById("hostelname").value;
            var noOfFloors = parseInt(document.getElementById("hostelfloors").value); // Get the number of floors from input
            const roomsRef = ref(db, `Hostel details/${hostelName}/rooms`);
            const snapshot = await get(roomsRef);

            let roomCount = 0;

            if (snapshot.exists()) {
                const roomsData = snapshot.val();
                roomCount = getRoomCountFromData(roomsData); // Get existing room count from Firebase data
            }

            roomCount++; // Increment room count for the new room
            const floorOptions = numberToArray(noOfFloors); // Generate floor options array

            addRoomForm(roomCount, {}, floorOptions); // Pass the floor options array
        } catch (error) {
            console.error('Error fetching room count:', error);
        }
    });

    // Helper function to convert number to array for floor options
    function numberToArray(number) {
        const result = [];
        for (let i = 1; i <= number; i++) {
            result.push(i);
        }
        return result;
    }

    function addRoomForm(roomNumber, roomData = {}, floorOptions = []) {
        const mainParentElem = document.createElement('div');
        mainParentElem.classList.add('col-12');

        const cardElem = document.createElement('div');
        cardElem.classList.add('card');
        cardElem.id = `room-${roomNumber}`;

        const cardHeaderElem = document.createElement('div');
        cardHeaderElem.classList.add('card-header');
        cardHeaderElem.innerHTML = `<h5>Room ${roomNumber}</h5>`;
        const removeRoomBtn = document.createElement('span');
        removeRoomBtn.className = 'btn restaurant-button';
        removeRoomBtn.innerHTML = 'Remove Room';
        removeRoomBtn.onclick = () => {
            cardElem.remove();
        };
        cardHeaderElem.appendChild(removeRoomBtn);

        const cardBodyElem = document.createElement('div');
        cardBodyElem.classList.add('card-body');

        const inputItemsElem = document.createElement('div');
        inputItemsElem.classList.add('input-items');

        const rowElem = document.createElement('div');
        rowElem.classList.add('row', 'gy-3');

        // Create and prefill form fields
        const floorSelectOptions = floorOptions.map(floor => `Floor ${floor}`);
        rowElem.appendChild(createSelectBox('Floor', `floor-${roomNumber}`, true, floorSelectOptions, `Floor ${roomData.floor}`));
        rowElem.appendChild(createSelectBox('Room Type', `roomType-${roomNumber}`, true, ['1 sharing', '2 sharing', '3 sharing', '4 sharing'], roomData.roomType));
        rowElem.appendChild(createInputBox('Room Count', `roomCount-${roomNumber}`, 'number', true, '', false, roomData.roomCount));
        rowElem.appendChild(createInputBox('Amenities', `amenities-${roomNumber}`, 'text', false, 'e.g. WiFi, Laundry', false, roomData.amenities));
        rowElem.appendChild(createSelectBox('Air Conditioning', `ac-${roomNumber}`, true, ['ac', 'non-ac'], roomData.ac));
        rowElem.appendChild(createSelectBox('Bathroom', `bathroom-${roomNumber}`, true, ['attached', 'common'], roomData.bathroom));
        rowElem.appendChild(createInputBox('Price', `price-${roomNumber}`, 'number', true, '', false, roomData.price));

        // Add image upload input 
        const imageInput = document.createElement('input');
        imageInput.type = 'file';
        imageInput.id = `roomImage-${roomNumber}`;
        imageInput.name = `roomImage-${roomNumber}`;
        imageInput.multiple = true;
        imageInput.classList.add('form-control');
        const imageLabel = document.createElement('h6');
        imageLabel.innerText = 'Upload Images';
        const imageBox = document.createElement('div');
        imageBox.classList.add('col-xl-6');
        imageBox.classList.add('input-box');
        imageBox.appendChild(imageLabel);
        imageBox.appendChild(imageInput);
        rowElem.appendChild(imageBox);

        // Append elements
        inputItemsElem.appendChild(rowElem);
        cardBodyElem.appendChild(inputItemsElem);
        cardElem.appendChild(cardHeaderElem);
        cardElem.appendChild(cardBodyElem);
        mainParentElem.appendChild(cardElem);
        roomContainer.appendChild(mainParentElem);
    }

    // Helper function to get room count from data
    function getRoomCountFromData(roomsData) {
        let count = 0;
        Object.keys(roomsData).forEach(floorKey => {
            const floorRooms = roomsData[floorKey];
            count += Object.keys(floorRooms).length;
        });
        return count;
    }

    // Helper function to create input boxes
    function createInputBox(labelText, inputId, inputType, required, placeholder = '', multiple = false, value = '') {
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

        options.forEach(option => {
            const optElem = document.createElement('option');
            optElem.value = option.replace('Floor ', ''); // Store only the floor number (1, 2, etc.)
            optElem.text = option; // Display as "Floor 1", "Floor 2", etc.

            if (optElem.value === selectedValue.replace('Floor ', '')) {
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
/* End of adding room details using dynamic form handling*/

/*start of Get Menu and Get Room details from firebase DB*/
let roomCount = 0; // Track the number of rooms

document.addEventListener('DOMContentLoaded', function () {
    const getRoomButton = document.getElementById("getroom");
    const roomContainer = document.getElementById("room-container");
    const getMenuDetailsButton = document.getElementById("getMenuDetails");
    const weekDropdown = document.createElement('select');
    weekDropdown.id = 'weekDropdown';
    const weekContainer = document.getElementById('weekContainer');

    // Add options to the week dropdown
    const weekOptions = ['week1', 'week2', 'week3', 'week4', 'week5'];
    weekOptions.forEach(week => {
        const option = document.createElement('option');
        option.value = week;
        option.innerText = week;
        weekDropdown.appendChild(option);
    });

    // Add dropdown to the UI
    const dropdownContainer = document.createElement('div');
    dropdownContainer.style.marginTop = '20px';
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
                const mainDishOptions = ['select main dish', 'Idly', 'Dosa', 'Pongal', 'Chapathi', 'Upma', 'Parotta',
                    'Sambar rice', 'Tomato rice', 'Veg meals', 'Curd rice', 'Lemon rice', 'Veg briyani'];
                rowElem.appendChild(createSelectBox1('Main Dish', `mainDish-${weekNum}-${day}-${mealTime}`, true, mainDishOptions, mainDishValue));


                // Create Side Dish Dropdown
                const sideDishOptions = ['select side dish', 'Chutney', 'Sambar', 'Masala vada', 'Butter masala', 'Betroot poriyal',
                    'Potato fry', 'Kootu', 'Appalam', 'Paneer butter masala'];
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
    // Convert 12-hour time format to 24-hour
    function convertTo24Hour(time12h) {
        if (!time12h) return '';

        const [time, modifier] = time12h.split(' ');
        let [hours, minutes] = time.split(':');

        if (modifier === 'AM' && hours === '12') {
            hours = '00'; // Convert 12 AM to 00 hours
        } else if (modifier === 'PM' && hours !== '12') {
            hours = (parseInt(hours, 10) + 12).toString(); // Convert PM hours
        }

        return `${hours}:${minutes}`;
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
                roomContainer.innerHTML = ''; // Clear existing room forms

                // Loop through each floor and its rooms
                Object.keys(roomsData).forEach((floorKey) => {
                    const floorData = roomsData[floorKey];
                    const floorNumber = floorKey.replace('floor', ''); // Extract only the floor number

                    Object.keys(floorData).forEach((roomKey) => {
                        const roomData = floorData[roomKey];
                        const roomNumber = roomKey.replace('room', ''); // Extract only the room number

                        // Prefill the form with room and floor data
                        addRoomForm(roomNumber, roomData, floorNumber);

                        // Call displayRoomImages with roomNumber and imagesLink from roomData
                        if (Array.isArray(roomData.imagesLink)) {
                            displayRoomImages(roomNumber, roomData.imagesLink);
                        } else {
                            console.log(`No images found for room ${roomNumber}`);
                        }
                    });
                });
            } else {
                alert('No rooms found for this hostel.');
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    });
    //Function which displays the room images from firebase database
    function displayRoomImages(roomNumber, images) {
        const roomCard = document.getElementById(`room-${roomNumber}`);

        if (roomCard) {
            const existingImageContainer = roomCard.querySelector('.image-preview-container');

            // If image container already exists (from a previous call), clear it
            if (existingImageContainer) {
                existingImageContainer.innerHTML = '';
            } else {
                // Create a new container for image previews
                const imageContainer = document.createElement('div');
                imageContainer.classList.add('image-preview-container');
                roomCard.querySelector('.input-items .row').appendChild(imageContainer);
            }

            // Check if images are available in the array
            if (images && images.length > 0) {
                images.forEach((imageUrl) => {
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.alt = 'Room Image';
                    img.style.width = '100px';
                    img.style.height = '100px';
                    img.style.margin = '5px';
                    img.classList.add('image-preview');
                    roomCard.querySelector('.image-preview-container').appendChild(img);
                });
            } else {
                console.log(`No images found for room ${roomNumber}`);
            }
        }
    }
    // Function to create and prefill the room form
    function addRoomForm(roomNumber, roomData = {}, floorNumber) {
        const mainParentElem = document.createElement('div');
        mainParentElem.classList.add('col-12');

        const cardElem = document.createElement('div');
        cardElem.classList.add('card');
        cardElem.id = `room-${roomNumber}`;

        const cardHeaderElem = document.createElement('div');
        cardHeaderElem.classList.add('card-header', 'd-flex', 'justify-content-between', 'align-items-center');

        const roomLabel = document.createElement('h5');
        roomLabel.innerText = `Room ${roomNumber}`; // Display room number

        const deleteIcon = document.createElement('span');
        deleteIcon.classList.add('ri-delete-bin-line');
        deleteIcon.style.fontSize = '24px';
        deleteIcon.style.cursor = 'pointer';
        deleteIcon.id = `delete-room-${roomNumber}`;

        cardHeaderElem.appendChild(roomLabel);
        cardHeaderElem.appendChild(deleteIcon);

        const cardBodyElem = document.createElement('div');
        cardBodyElem.classList.add('card-body');

        const inputItemsElem = document.createElement('div');
        inputItemsElem.classList.add('input-items');

        const rowElem = document.createElement('div');
        rowElem.classList.add('row', 'gy-3');

        // Create and prefill form fields
        rowElem.appendChild(createInputBox('Floor', `floor-${roomNumber}`, 'text', true, '', false, floorNumber));
        rowElem.appendChild(createSelectBox('Room Type', `roomType-${roomNumber}`, true, ['1 sharing', '2 sharing', '3 sharing', '4 sharing'], roomData.roomType));
        rowElem.appendChild(createInputBox('Room Count', `roomCount-${roomNumber}`, 'number', true, '', false, roomData.roomCount));
        rowElem.appendChild(createInputBox('Amenities', `amenities-${roomNumber}`, 'text', false, 'e.g. WiFi, Laundry', false, roomData.amenities));
        rowElem.appendChild(createSelectBox('Air Conditioning', `ac-${roomNumber}`, true, ['ac', 'non-ac'], roomData.ac));
        rowElem.appendChild(createSelectBox('Bathroom', `bathroom-${roomNumber}`, true, ['attached', 'common'], roomData.bathroom));
        rowElem.appendChild(createInputBox('Price', `price-${roomNumber}`, 'number', true, '', false, roomData.price));

        // Add image upload input 
        const imageInput = document.createElement('input');
        imageInput.type = 'file';
        imageInput.id = `roomImage-${roomNumber}`;
        imageInput.name = `roomImage-${roomNumber}`;
        imageInput.multiple = true;
        imageInput.classList.add('form-control');

        const imageLabel = document.createElement('h6');
        imageLabel.innerText = 'Upload Images';
        const imageBox = document.createElement('div');
        imageBox.classList.add('col-xl-6', 'input-box');
        imageBox.appendChild(imageLabel);
        imageBox.appendChild(imageInput);
        rowElem.appendChild(imageBox);

        // Append elements
        inputItemsElem.appendChild(rowElem);
        cardBodyElem.appendChild(inputItemsElem);
        cardElem.appendChild(cardHeaderElem);
        cardElem.appendChild(cardBodyElem);
        mainParentElem.appendChild(cardElem);
        roomContainer.appendChild(mainParentElem);

        // Delete room logic
        deleteIcon.addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete this room?')) {
                try {
                    const hostelName = document.getElementById("hostelname").value;
                    const roomPath = `Hostel details/${hostelName}/rooms/floor${floorNumber}/room${roomNumber}`;
    
                    await remove(ref(db, roomPath));
                    document.getElementById(`room-${roomNumber}`).remove();
                    alert('Room deleted successfully.');
                } catch (error) {
                    console.error('Error deleting room:', error);
                    alert('Failed to delete room.');
                }
            }
        });
    }
    // Helper function to create input boxes
    function createInputBox(labelText, inputId, inputType, required, placeholder = '', multiple = false, value = '') {
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

        options.forEach(option => {
            const optElem = document.createElement('option');
            if (option.value && option.text) {
                optElem.value = option.value;
                optElem.text = option.text;
            }
            else {
                optElem.value = option;
                optElem.text = option;

            }
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

    // Helper function to convert number to array for floor options
    function numberToArray(number) {
        const result = [];
        for (let i = 1; i <= number; i++) {
            result.push(i);
        }
        return result;
    }

    // Prefill hostel details from localStorage
    function prefillHostelDetails() {
        const storedData = localStorage.getItem('hosteldetails');
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

            displayHostelImages(hostelData[0]);

        } else {
            console.log("No hostel data found in localStorage.");
        }
    }

});

// Updating hostel details in Firebase
updateHostel.addEventListener('click', async (e) => {
    e.preventDefault();

    var hostelName = document.getElementById("hostelname").value;
    var htype = document.getElementById("hosteltype").value;
    var hphone = document.getElementById("hostelphone").value;
    var hemail = document.getElementById("hostelemail").value;
    var hadd1 = document.getElementById("hosteladd1").value;
    var hadd2 = document.getElementById("hosteladd2").value;
    var hcity = document.getElementById("hostelcity").value;
    var hstate = document.getElementById("hostelstate").value;
    var hpin = document.getElementById("hostelpin").value;
    const rooms = {};

    const roomElements = document.querySelectorAll('.card[id^="room-"]');

    for (let roomElem of roomElements) {
        const roomKey = roomElem.id.split('-')[1];
        const floor = document.getElementById(`floor-${roomKey}`).value;
        const roomType = document.getElementById(`roomType-${roomKey}`).value;
        const roomCountVal = document.getElementById(`roomCount-${roomKey}`).value;
        const amenities = document.getElementById(`amenities-${roomKey}`).value;
        const ac = document.getElementById(`ac-${roomKey}`).value;
        const bathroom = document.getElementById(`bathroom-${roomKey}`).value;
        const price = document.getElementById(`price-${roomKey}`).value;

        const imageInput = document.getElementById(`roomImage-${roomKey}`);
        const files = imageInput.files;
        let imagelink1 = [];

        // Upload new images if any
        if (files.length != 0) {
            for (let j = 0; j < files.length; j++) {
                const storageRef = ref2(storage, 'images/' + hostelName + '/room-' + roomKey + '/' + files[j].name);
                await uploadBytes(storageRef, files[j]);
                const imageUrl = await getDownloadURL(storageRef);
                imagelink1.push(imageUrl);
            }
        }

        const floorKey = `floor${floor}`;

        // Add room details to the rooms object
        if (!rooms[floorKey]) {
            rooms[floorKey] = {};
        }

        rooms[floorKey][`room${roomKey}`] = {
            ac,
            roomCount: roomCountVal,
            bathroom,
            roomType: roomType,
            price: price,
            amenities: amenities,
            imagesLink: imagelink1.length > 0 ? imagelink1 : [] // Keep existing if no new images
        };
    }

    // Always update hostel details
    await update(ref(db, "Hostel details/" + hostelName + '/'), {
        hostelName: hostelName,
        hostelType: htype,
        hostelPhone: hphone,
        hostelEmail: hemail,
        hostelAddress1: hadd1,
        hostelAddress2: hadd2,
        hostelCity: hcity,
        hostelState: hstate,
        hostelPin: hpin,
        rooms: rooms
    });

    let weeks = {}; // Collect week details
    const weekCount = document.querySelectorAll('.card[id^="week-"]').length;
    const weekDropdown = document.getElementById('weekDropdown'); // Access the dropdown here

    // Ensure the dropdown exists before trying to access its value
    const selectedWeeks = weekDropdown ? Array.from(weekDropdown.selectedOptions).map(option => option.value) : []; // Get all selected weeks

    console.log(`Week Count: ${weekCount}, Selected Weeks: ${selectedWeeks}`); // Debugging log

    if (weekCount > 0 && selectedWeeks.length > 0) { // Ensure there are weeks to process
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        // Fetch existing weeks from Firebase
        const weeksRef = ref(db, `Hostel details/${hostelName}/weeks`);
        const snapshot = await get(weeksRef);
        let existingWeeks = snapshot.exists() ? snapshot.val() : {};

        // Process the selected weeks
        selectedWeeks.forEach(selectedWeek => {
            const weekData = {};
            days.forEach(day => {
                weekData[day] = {};
                const mealTimes = ['morning', 'afternoon', 'night'];
                mealTimes.forEach(mealTime => {
                    const mainDishElement = document.getElementById(`mainDish-1-${day}-${mealTime}`);
                    const sideDishElement = document.getElementById(`sideDish-1-${day}-${mealTime}`);

                    const dishName = mainDishElement ? mainDishElement.value : ''; // Check for existence
                    const sideDishName = sideDishElement ? sideDishElement.value : ''; // Check for existence

                    console.log(`Processing Day: ${day}, Meal Time: ${mealTime}, Main Dish: ${dishName}, Side Dish: ${sideDishName}`); // Debugging log

                    if (dishName !== 'select main dish' && sideDishName !== 'select side dish') {
                        const timing = getMealTimings(mealTime); // Fetch the global timings
                        weekData[day][mealTime.toLowerCase()] = {
                            mainDish: dishName,
                            sideDish: sideDishName,
                            timing: `${convertTo12Hour(timing.start)} - ${convertTo12Hour(timing.end)}`
                        };
                    }
                });
            });

            // Update the existing weeks data with the new week data
            existingWeeks[selectedWeek] = weekData;
        });

        // Update Firebase with the merged weeks data
        await update(ref(db, "Hostel details/" + hostelName + '/weeks'), existingWeeks);
    }

    alert("Hostel details updated successfully");
    window.location.href = "././products.html";

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
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        return `${hours}:${minutes} ${ampm}`;
    }
});