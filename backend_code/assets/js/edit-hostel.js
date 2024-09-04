import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, onValue, child, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"
import { getStorage, ref as ref2, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js"
import { firebaseConfig } from "./firebase-config.js";

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
                alert("Image is uploading.. Give OK after 5 secs");
                console.log('Image URLs have been successfully stored!');
            })

    } else {
        alert("No file chosen");
    }
});

let roomCount = 0; // Track the number of rooms

document.addEventListener('DOMContentLoaded', function () {
    const getRoomButton = document.getElementById("getroom");
    const roomContainer = document.getElementById("room-container");
    const getMenuDetailsButton = document.getElementById("getMenuDetails");
    const weekContainer = document.getElementById("weekContainer");

    getMenuDetailsButton.addEventListener('click', async () => {
        const hostelName = document.getElementById("hostelname").value; // Assuming hostel name is prefilled
        const weeksRef = ref(db, `Hostel details/${hostelName}/weeks`);

        try {
            const snapshot = await get(weeksRef);
            if (snapshot.exists()) {
                const weeksData = snapshot.val();
                weekContainer.innerHTML = ''; // Clear existing week containers

                Object.keys(weeksData).forEach((weekNum, index) => {
                    const weekData = weeksData[weekNum];
                    createWeekForm(index + 1, weekData);
                });
            } else {
                alert('No week details found for this hostel.');
            }
        } catch (error) {
            console.error('Error fetching week details:', error);
        }
    });

    // Function to create week containers and prefill them with data
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
        dropdownArrow.style.marginBottom = '15px';
        dropdownArrow.style.marginTop = '10px';

        dropdownArrow.addEventListener('click', () => {
            const collapseElem = document.getElementById(`collapseWeek${weekNum}`);
            collapseElem.classList.toggle('show');

            if (collapseElem.classList.contains('show')) {
                dropdownArrow.classList.replace('ri-arrow-right-s-line', 'ri-arrow-down-s-line');
            } else {
                dropdownArrow.classList.replace('ri-arrow-down-s-line', 'ri-arrow-right-s-line');
            }
        });

        cardHeaderElem.appendChild(headerContent);
        headerContent.appendChild(dropdownArrow);

        const collapseElem = document.createElement('div');
        collapseElem.id = `collapseWeek${weekNum}`;
        collapseElem.classList.add('collapse', 'show');

        const cardBodyElem = document.createElement('div');
        cardBodyElem.classList.add('card-body');

        const navTabs = document.createElement('ul');
        navTabs.classList.add('nav', 'nav-tabs');
        navTabs.role = 'tablist';

        const tabContent = document.createElement('div');
        tabContent.classList.add('tab-content', 'mt-3');

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
            navLink.innerText = day.substring(0, 3);

            navItem.appendChild(navLink);
            navTabs.appendChild(navItem);

            const tabPane = document.createElement('div');
            tabPane.classList.add('tab-pane', 'fade');
            if (index === 0) tabPane.classList.add('show', 'active');
            tabPane.id = `week${weekNum}-${day}`;
            tabPane.role = 'tabpanel';

            const mealTimes = ['Morning', 'Afternoon', 'Night'];
            mealTimes.forEach(mealTime => {
                const mealCard = document.createElement('div');
                mealCard.classList.add('card', 'mb-3', 'mt-3');

                const mealCardBodyElem = document.createElement('div');
                mealCardBodyElem.classList.add('card-body', 'bg-light', 'input-items');
                mealCardBodyElem.style.padding = '15px';
                mealCardBodyElem.style.marginLeft = '-15px';
                mealCardBodyElem.style.marginBottom = '15px';
                mealCardBodyElem.style.marginTop = '10px';

                const mealTimeLabelElem = document.createElement('h5');
                mealTimeLabelElem.innerText = `${mealTime}:`;
                mealTimeLabelElem.classList.add('mt-2', 'mb-3');
                mealCardBodyElem.appendChild(mealTimeLabelElem);

                const rowElem = document.createElement('div');
                rowElem.classList.add('row', 'gy-3');

                // Main Dish Name
                rowElem.appendChild(createInputBox(`Main Dish Name`, `dishName-${weekNum}-${day}-${mealTime}`, 'text', true, '', false, weekData[day]?.[mealTime]?.mainDish || ''));

                // Side Dish Name
                rowElem.appendChild(createInputBox(`Side Dish Name`, `sideDishName-${weekNum}-${day}-${mealTime}`, 'text', true, '', false, weekData[day]?.[mealTime]?.sideDish || ''));

                // Dish Timing
                const timingRange = weekData[day]?.[mealTime]?.timing || '';
                const [start12h, end12h] = timingRange.split(' - ').map(time => time.trim());
                const start24h = convertTo24Hour(start12h);
                const end24h = convertTo24Hour(end12h);
                rowElem.appendChild(createTimeRangeInput(`dishTimingStart-${weekNum}-${day}-${mealTime}`, `dishTimingEnd-${weekNum}-${day}-${mealTime}`, start24h, end24h));

                mealCardBodyElem.appendChild(rowElem);
                mealCard.appendChild(mealCardBodyElem);
                tabPane.appendChild(mealCard);
            });

            tabContent.appendChild(tabPane);
        });

        cardBodyElem.appendChild(navTabs);
        cardBodyElem.appendChild(tabContent);
        collapseElem.appendChild(cardBodyElem);
        cardElem.appendChild(cardHeaderElem);
        cardElem.appendChild(collapseElem);
        mainParentElem.appendChild(cardElem);
        weekContainer.appendChild(mainParentElem);
    }

    // Helper function to convert 12-hour time to 24-hour format for input fields
    // Helper function to convert 12-hour time to 24-hour format for input fields
    function convertTo24Hour(time12h) {
        if (!time12h) return '';

        const [time, modifier] = time12h.split(' ');
        let [hours, minutes] = time.split(':');

        if (modifier === 'AM' && hours === '12') {
            hours = '00'; // Convert 12 AM to 00 hours
        } else if (modifier === 'PM' && hours !== '12') {
            hours = (parseInt(hours, 10) + 12).toString(); // Convert PM hours
        }

        // Ensure hours is two digits
        if (hours.length === 1) hours = '0' + hours;

        return `${hours}:${minutes}`;
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
        if (multiple) inputElem.multiple = multiple;
        inputElem.value = value;

        inputBoxElem.appendChild(labelElem);
        inputBoxElem.appendChild(inputElem);
        colElem.appendChild(inputBoxElem);

        return colElem;
    }

    // Helper function to create time range input fields
    function createTimeRangeInput(startId, endId, startValue = '', endValue = '') {
        const colElem = document.createElement('div');
        colElem.classList.add('col-xl-6');

        const inputBoxElem = document.createElement('div');
        inputBoxElem.classList.add('input-box');

        const labelElem = document.createElement('h6');
        labelElem.innerText = 'Dish Timings';

        const timeInputContainer = document.createElement('div');
        timeInputContainer.classList.add('d-flex', 'align-items-center');

        const startInput = document.createElement('input');
        startInput.type = 'time';
        startInput.id = startId;
        startInput.name = startId;
        startInput.value = startValue;

        const endInput = document.createElement('input');
        endInput.type = 'time';
        endInput.id = endId;
        endInput.name = endId;
        endInput.value = endValue;

        timeInputContainer.appendChild(startInput);
        timeInputContainer.appendChild(endInput);

        inputBoxElem.appendChild(labelElem);
        inputBoxElem.appendChild(timeInputContainer);
        colElem.appendChild(inputBoxElem);

        return colElem;
    }

    // Prefill hostel details on page load
    window.addEventListener('load', prefillHostelDetails);

    // Fetch and prefill room details when "Get Room" button is clicked
    getRoomButton.addEventListener('click', async () => {
        const hostelName = document.getElementById("hostelname").value; // Assuming hostel name is prefilled
        const roomsRef = ref(db, `Hostel details/${hostelName}/rooms`);

        try {
            const snapshot = await get(roomsRef);
            if (snapshot.exists()) {
                const roomsData = snapshot.val();
                roomContainer.innerHTML = ''; // Clear existing room forms

                Object.keys(roomsData).forEach((key, index) => {
                    const roomData = roomsData[key];
                    roomCount = index + 1;

                    addRoomForm(roomCount, roomData); // Prefill the form with room data
                    displayRoomImages(roomCount, roomData.images || []);
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
            const imageContainer = document.createElement('div');
            imageContainer.classList.add('image-preview-container');

            images.forEach((imageUrl) => {

                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = 'Hostel Image';
                img.style.width = '100px';
                img.style.height = '100px';
                img.style.margin = '5px';
                img.classList.add('image-preview');
                imageContainer.appendChild(img);
            });

            const fileInputBox = roomCard.querySelector(`#roomImage-${roomNumber}`).parentElement;
            fileInputBox.appendChild(imageContainer);
        }
    }

    // Function to create and prefill the room form
    function addRoomForm(roomNumber, roomData = {}) {
        const mainParentElem = document.createElement('div');
        mainParentElem.classList.add('col-12');

        const cardElem = document.createElement('div');
        cardElem.classList.add('card');
        cardElem.id = `room-${roomNumber}`;

        const cardHeaderElem = document.createElement('div');
        cardHeaderElem.classList.add('card-header');
        cardHeaderElem.innerHTML = `<h5>Room ${roomNumber}</h5>`;

        const cardBodyElem = document.createElement('div');
        cardBodyElem.classList.add('card-body');

        const inputItemsElem = document.createElement('div');
        inputItemsElem.classList.add('input-items');

        const rowElem = document.createElement('div');
        rowElem.classList.add('row', 'gy-3');

        // Create and prefill form fields
        rowElem.appendChild(createInputBox('Floor', `floor-${roomNumber}`, 'text', true, '', false, roomData.floor, true));
        rowElem.appendChild(createSelectBox('Room Type', `roomType-${roomNumber}`, true, ['1 sharing', '2 sharing', '3 sharing', '4 sharing'], roomData.roomType));
        rowElem.appendChild(createInputBox('Room Count', `roomCount-${roomNumber}`, 'number', true, '', false, roomData.roomCount));
        rowElem.appendChild(createInputBox('Amenities', `amenities-${roomNumber}`, 'text', false, 'e.g. WiFi, Laundry', false, roomData.amenities));
        rowElem.appendChild(createSelectBox('Air Conditioning', `ac-${roomNumber}`, true, ['ac', 'non-ac'], roomData.ac));
        rowElem.appendChild(createSelectBox('Bathroom', `bathroom-${roomNumber}`, true, ['Attached', 'Common'], roomData.bathroom));
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
            document.getElementById("vegp").value = hostelData[9] || "";
            document.getElementById("nonvegp").value = hostelData[10] || "";
            document.getElementById("bothp").value = hostelData[11] || "";

            displayHostelImages(hostelData[0]);

        } else {
            console.log("No hostel data found in localStorage.");
        }
    }

});

// Updating hostel details in Firebase
updateHostel.addEventListener('click', async (e) => {
    e.preventDefault();

    var hname = document.getElementById("hostelname").value;
    var htype = document.getElementById("hosteltype").value;
    var hphone = document.getElementById("hostelphone").value;
    var hemail = document.getElementById("hostelemail").value;
    var hadd1 = document.getElementById("hosteladd1").value;
    var hadd2 = document.getElementById("hosteladd2").value;
    var hcity = document.getElementById("hostelcity").value;
    var hstate = document.getElementById("hostelstate").value;
    var hpin = document.getElementById("hostelpin").value;

    let rooms = [];

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

        if (files.length != 0) {
            for (let j = 0; j < files.length; j++) {
                const storageRef = ref2(storage, 'images/' + hname + '/room-' + i + '/' + files[j].name);
                await uploadBytes(storageRef, files[j]);
                const imageUrl = await getDownloadURL(storageRef);
                imagelink1.push(imageUrl);
            }
        }

        rooms.push({
            floor: floor,
            roomType: roomType,
            roomCount: roomCountVal,
            amenities: amenities,
            ac: ac,
            bathroom: bathroom,
            price: price,
            images: imagelink1
        });
    }
    let weeks = {}; // Collect week details
    const weekCount = document.querySelectorAll('.card[id^="week-"]').length;

    for (let i = 1; i <= weekCount; i++) {
        const weekData = {};
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        days.forEach(day => {
            const mealTimes = ['Morning', 'Afternoon', 'Night'];
            weekData[day] = {};

            mealTimes.forEach(mealTime => {
                const mainDish = document.getElementById(`dishName-${i}-${day}-${mealTime}`).value;
                const sideDish = document.getElementById(`sideDishName-${i}-${day}-${mealTime}`).value;
                const dishTimingStart = document.getElementById(`dishTimingStart-${i}-${day}-${mealTime}`).value;
                const dishTimingEnd = document.getElementById(`dishTimingEnd-${i}-${day}-${mealTime}`).value;

                if (mainDish && sideDish && dishTimingStart && dishTimingEnd) {
                    weekData[day][mealTime] = {
                        mainDish,
                        sideDish,
                        timing: `${dishTimingStart} - ${dishTimingEnd}`
                    };
                }
            });
        });

        weeks[`week${i}`] = weekData;
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
        rooms: rooms,
        weeks: weeks

    })
        .then(() => {
            alert("Hostel details updated successfully");
            window.location.href = "././products.html";
        })
        .catch((error) => {
            alert(error);
        });
});
