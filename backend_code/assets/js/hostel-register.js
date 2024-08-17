import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, child, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"
import { getStorage, ref as ref2, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js"
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase();
const storage = getStorage(app);


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
      { value: 'ac', text: 'AC' },
      { value: 'non-ac', text: 'Non-AC' },
    ]);
    rowElem.appendChild(acElem);

    // Bathroom
    const bathroomElem = createSelectBox('Bathroom', `bathroom-${roomCount}`, true, [
      { value: 'attached', text: 'Attached' },
      { value: 'common', text: 'Common' },
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