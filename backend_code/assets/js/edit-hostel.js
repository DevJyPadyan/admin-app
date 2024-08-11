import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, onValue, child, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"
import { getStorage, ref as ref2, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js"
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase();
const storage = getStorage(app);


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


let hostelist = [];
let flag = 0;
let tbody = document.getElementById("tbody1");


/*Functionality for editing a data*/
function view() {
    var table = document.getElementById('table_id');
    var cells = table.getElementsByTagName('td');

    for (var i = 0; i < cells.length; i++) {
        // Take each cell
        var cell = cells[i];
        // do something on onclick event for cell
        cell.onclick = function () {
            // Get the row id where the cell exists
            var rowId = this.parentNode.rowIndex;

            var rowsNotSelected = table.getElementsByTagName('tr');
            for (var row = 0; row < rowsNotSelected.length; row++) {
                rowsNotSelected[row].style.backgroundColor = "";
                rowsNotSelected[row].classList.remove('selected');
            }
            var rowSelected = table.getElementsByTagName('tr')[rowId];
            rowSelected.style.backgroundColor = "yellow";
            rowSelected.className += " selected";
            // msg = 'The ID of the company is: ' + rowSelected.cells[0].innerHTML;
            var hosname = rowSelected.cells[1].innerHTML;
            var hostype = rowSelected.cells[2].innerHTML;
            var hosadd1 = rowSelected.cells[3].innerHTML;
            var hosadd2 = rowSelected.cells[4].innerHTML;
            var hoscity = rowSelected.cells[5].innerHTML;
            var hosstate = rowSelected.cells[6].innerHTML;
            var hosphone = rowSelected.cells[7].innerHTML;
            var hosemail = rowSelected.cells[8].innerHTML;
            var hospin = rowSelected.cells[9].innerHTML;
            var hosvegp = rowSelected.cells[10].innerHTML;
            var hosnvegp = rowSelected.cells[11].innerHTML;
            var both = rowSelected.cells[12].innerHTML;
            var data = [];
            data.push(hosname);
            data.push(hostype);
            data.push(hosadd1);
            data.push(hosadd2);
            data.push(hoscity);
            data.push(hosstate);
            data.push(hosphone);
            data.push(hosemail);
            data.push(hospin);
            data.push(hosvegp);
            data.push(hosnvegp);
            data.push(both);
            localStorage.setItem('hosteldetails', JSON.stringify(data));
            console.log(data);
            //window.location.href = 'edit-hostel.html';

        }
    }
}

let roomCount = 0; // Track the number of rooms

document.addEventListener('DOMContentLoaded', function () {
    const getRoomButton = document.getElementById("getroom");
    const roomContainer = document.getElementById("room-container");

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
                });
            } else {
                alert('No rooms found for this hostel.');
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    });

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
        rowElem.appendChild(createSelectBox('Room Type', `roomType-${roomNumber}`, true, ['single', 'double', 'triple', '4 sharing'], roomData.roomtype));
        rowElem.appendChild(createInputBox('Room Count', `roomCount-${roomNumber}`, 'number', true, '', false, roomData.roomcount));
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
            roomtype: roomType,
            roomcount: roomCountVal,
            amenities: amenities,
            ac: ac,
            bathroom: bathroom,
            price: price,
            images: imagelink1
        });
    }

    update(ref(db, "Hostel details/" + hname + '/'), {
        Hostelname: hname,
        Hosteltype: htype,
        Hostelphone: hphone,
        Hostelemail: hemail,
        Hosteladd1: hadd1,
        Hosteladd2: hadd2,
        Hostelcity: hcity,
        Hostelstate: hstate,
        Hostelpin: hpin,
        Hostevegprice: vegp,
        HostelNvegprice: nonvegp,
        Hostelboth: both,
        rooms: rooms
    })
        .then(() => {
            alert("Hostel details updated successfully");
            window.location.href = "././products.html";
        })
        .catch((error) => {
            alert(error);
        });
});