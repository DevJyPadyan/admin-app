import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, child, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"
import { getStorage, ref as ref2, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js"
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase();
const storage = getStorage(app);

const addWeekButton = document.getElementById("addWeekButton");
const weekContainer = document.getElementById("weekContainer");

let weekCount = 0;

addWeekButton.addEventListener('click', () => {
    if (weekCount < 5) {
        weekCount++;
        createWeekForm(weekCount);
    } else {
        alert("You can only add up to 5 weeks.");
    }
});

function createWeekForm(weekNum) {
    const mainParentElem = document.createElement('div');
    mainParentElem.classList.add('col-12');

    const cardElem = document.createElement('div');
    cardElem.classList.add('card');
    cardElem.id = `week-${weekNum}`;

    const cardHeaderElem = document.createElement('div');
    cardHeaderElem.classList.add('card-header', 'd-flex', 'justify-content-between', 'align-items-center');

    // Add a clickable arrow to toggle the collapse
    const headerContent = document.createElement('div');
    headerContent.classList.add('d-flex', 'align-items-center');
    headerContent.innerHTML = `<h5 class="mb-0">Week ${weekNum}</h5>`;

    const dropdownArrow = document.createElement('span');
    dropdownArrow.classList.add('dropdown-arrow');
    dropdownArrow.style.cursor = 'pointer';
    dropdownArrow.innerHTML = '&#9662;'; // Down arrow

    dropdownArrow.addEventListener('click', () => {
        const collapseElem = document.getElementById(`collapseWeek${weekNum}`);
        collapseElem.classList.toggle('show');

        // Toggle the arrow direction
        if (collapseElem.classList.contains('show')) {
            dropdownArrow.innerHTML = '&#9662;'; // Down arrow
        } else {
            dropdownArrow.innerHTML = '&#9656;'; // Right arrow
        }
    });

    cardHeaderElem.appendChild(headerContent);
    headerContent.appendChild(dropdownArrow);

    const headerButtonsContainer = document.createElement('div');
    headerButtonsContainer.classList.add('d-flex', 'gap-2'); // Ensures buttons have some spacing

    const removeWeekBtn = document.createElement('button');
    removeWeekBtn.className = 'btn restaurant-button';
    removeWeekBtn.innerHTML = 'Remove Week';
    removeWeekBtn.onclick = () => {
        mainParentElem.remove();
        weekCount--;
    };

    const saveWeekBtn = document.createElement('button');
    saveWeekBtn.className = 'btn restaurant-button';
    saveWeekBtn.innerHTML = `Save Week ${weekNum}`;
    saveWeekBtn.onclick = () => saveWeek(weekNum);

    headerButtonsContainer.appendChild(saveWeekBtn);
    headerButtonsContainer.appendChild(removeWeekBtn);
    cardHeaderElem.appendChild(headerButtonsContainer);

    const collapseElem = document.createElement('div');
    collapseElem.id = `collapseWeek${weekNum}`;
    collapseElem.classList.add('collapse', 'show'); // Start with content shown

    const cardBodyElem = document.createElement('div');
    cardBodyElem.classList.add('card-body');

    const inputItemsElem = document.createElement('div');
    inputItemsElem.classList.add('input-items');

    const rowElem = document.createElement('div');
    rowElem.classList.add('row', 'gy-3');

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    days.forEach(day => {
        // Day Label
        const dayLabelElem = document.createElement('h4');
        dayLabelElem.innerText = day;
        rowElem.appendChild(dayLabelElem);

        // Meal times
        const mealTimes = ['Morning', 'Afternoon', 'Night'];

        mealTimes.forEach(mealTime => {
            // Meal Time Label
            const mealTimeLabelElem = document.createElement('h5');
            mealTimeLabelElem.innerText = `${mealTime}:`;
            mealTimeLabelElem.classList.add('mt-2'); // Adds margin top for spacing
            rowElem.appendChild(mealTimeLabelElem);

            // Main Dish Name
            rowElem.appendChild(createInputBox(`Main Dish Name`, `dishName-${weekNum}-${day}-${mealTime}`, 'text', true));

            // Side Dish Name
            rowElem.appendChild(createInputBox(`Side Dish Name`, `sideDishName-${weekNum}-${day}-${mealTime}`, 'text', true));

            // Dish Timing
            rowElem.appendChild(createTimeRangeInput(`dishTimingStart-${weekNum}-${day}-${mealTime}`, `dishTimingEnd-${weekNum}-${day}-${mealTime}`));
        });

        // Add a horizontal line to divide each day's section
        const horizontalLine = document.createElement('hr');
        rowElem.appendChild(horizontalLine);
    });

    // Append elements
    inputItemsElem.appendChild(rowElem);
    cardBodyElem.appendChild(inputItemsElem);
    collapseElem.appendChild(cardBodyElem);
    cardElem.appendChild(cardHeaderElem);
    cardElem.appendChild(collapseElem);
    mainParentElem.appendChild(cardElem);
    weekContainer.appendChild(mainParentElem);
}

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

// Helper function to create time range input fields
function createTimeRangeInput(startId, endId) {
    const colElem = document.createElement('div');
    colElem.classList.add('col-xl-6');

    const inputBoxElem = document.createElement('div');
    inputBoxElem.classList.add('input-box');

    const labelElem = document.createElement('h6');
    labelElem.innerText = 'Dish Timings';

    // Create a container for the time inputs
    const timeInputContainer = document.createElement('div');
    timeInputContainer.classList.add('d-flex', 'gap-2'); // Flexbox for horizontal alignment

    const startInputElem = document.createElement('input');
    startInputElem.type = 'time';
    startInputElem.id = startId;
    startInputElem.name = startId;
    startInputElem.classList.add('form-control');

    const endInputElem = document.createElement('input');
    endInputElem.type = 'time';
    endInputElem.id = endId;
    endInputElem.name = endId;
    endInputElem.classList.add('form-control');

    // Append time inputs to the container
    timeInputContainer.appendChild(startInputElem);
    timeInputContainer.appendChild(endInputElem);

    inputBoxElem.appendChild(labelElem);
    inputBoxElem.appendChild(timeInputContainer);
    colElem.appendChild(inputBoxElem);

    return colElem;
}

function saveWeek(weekNumber) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const hostelName = document.getElementById('hostelname').value;
    const weekData = {};

    days.forEach(day => {
        const mealTimes = ['Morning', 'Afternoon', 'Night'];
        weekData[day] = {};

        mealTimes.forEach(mealTime => {
            const dishName = document.getElementById(`dishName-${weekNumber}-${day}-${mealTime}`).value;
            const sideDishName = document.getElementById(`sideDishName-${weekNumber}-${day}-${mealTime}`).value;
            const dishTimingStart = document.getElementById(`dishTimingStart-${weekNumber}-${day}-${mealTime}`).value;
            const dishTimingEnd = document.getElementById(`dishTimingEnd-${weekNumber}-${day}-${mealTime}`).value;

            if (dishName && sideDishName && dishTimingStart && dishTimingEnd) {
                weekData[day][mealTime] = {
                    mainDish: dishName,
                    sideDish: sideDishName,
                    timing: `${dishTimingStart} - ${dishTimingEnd}`
                };
            } else {
                alert(`Please fill out all fields for ${day} (${mealTime})`);
                return;
            }
        });
    });

    if (Object.keys(weekData).length === days.length) {
        set(ref(db, `Hostel details/${hostelName}/weeks/week${weekNumber}`), weekData)
            .then(() => {
                alert(`Week ${weekNumber} saved successfully!`);
            })
            .catch((error) => {
                alert(`Error saving Week ${weekNumber}: ${error.message}`);
            });
    }
}

/*Hostel Multiple images upload*/
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

const addroom = document.getElementById("addroom");
const roomContainer = document.getElementById("room-container");

let roomCount = 0;

document.addEventListener('DOMContentLoaded', function () {
  addroom.addEventListener('click', () => {
    roomCount++;

    const mainParentElem = document.createElement('div');
    mainParentElem.classList.add('col-12');

    const cardElem = document.createElement('div');
    cardElem.classList.add('card');
    cardElem.id = `room-${roomCount}`;

    const cardHeaderElem = document.createElement('div');
    cardHeaderElem.classList.add('card-header');
    cardHeaderElem.innerHTML = `<h5>Room ${roomCount}</h5>`;

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

    // Remove Room Button
    const removeRoomBtn = document.createElement('span');
    removeRoomBtn.className = 'btn restaurant-button';
    removeRoomBtn.innerHTML = 'Remove Room';
    removeRoomBtn.onclick = () => {
      cardElem.remove();
    };
    rowElem.appendChild(removeRoomBtn);

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


/*Single image upload*/
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

//This code is used when modal is clicked
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
  var vegp = document.getElementById("nonvegp").value;
  var nonvegp = document.getElementById("vegp").value;
  var both = document.getElementById("bothp").value;

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

    //Storing room images data into an array called imagelink1[]
    if (files.length != 0) {
      for (let j = 0; j < files.length; j++) {
        const storageRef = ref2(storage, 'Roomimages/' + hname + '/room-' + i + '/' + files[j].name);
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
    hostelVegprice: vegp,
    hostelNonvegprice: nonvegp,
    hostelBothfoods: both,
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