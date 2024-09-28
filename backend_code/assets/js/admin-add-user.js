import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, child, update, remove, push } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getStorage, ref as ref2, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase();
const storage = getStorage(app);

//Populate hostel dropdown
async function populateHostelDropdown(prefilledHostel = "") {
  const hostelDropdown = document.getElementById("hostelDropdown");
  const hostelsRef = ref(db, "Hostel details/");

  try {
    const snapshot = await get(hostelsRef);
    if (snapshot.exists()) {
      const hostels = snapshot.val();
      hostelDropdown.innerHTML = '<option value="">Select Hostel</option>';
      for (let hostelName in hostels) {
        let option = document.createElement("option");
        option.value = hostelName;
        option.text = hostelName;
        hostelDropdown.appendChild(option);
      }

      // Prefill the dropdown with the user's hostel if available
      if (prefilledHostel) {
        hostelDropdown.value = prefilledHostel;
      }
    } else {
      console.log("No hostels found.");
    }
  } catch (error) {
    console.error("Error fetching hostels:", error);
  }
}
window.addEventListener('DOMContentLoaded', populateHostelDropdown);
const roomContainer = document.getElementById("roomContainer"); // Ensure you have a container for room details

const fetchRoomDetails = async () => {
  const hostelName = 'Perikitis'; // Assuming hostel name is prefilled
  const roomsRef = ref(db, `Hostel details/${hostelName}/rooms`);

  try {
    const snapshot = await get(roomsRef);
    const roomTableBody = document.querySelector("#roomTable tbody"); // Select the tbody element

    if (snapshot.exists()) {
      const roomsData = snapshot.val();
      roomTableBody.innerHTML = ''; // Clear existing room details

      Object.keys(roomsData).forEach((key) => {
        const roomData = roomsData[key];
        console.log('Room Data:', roomData);


        // Create a table row for each room
        const roomRow = document.createElement("tr");

        // Check if amenities is an array, otherwise set it to an empty string
        const amenities = typeof roomData.amenities === 'string'
          ? roomData.amenities.split(',').map(item => item.trim()).join(", ")
          : '';

        roomRow.innerHTML = `
                  <td>${key}</td>
                  <td>${roomData.roomType}</td>
                  <td>${roomData.floor}</td>
                  <td>${roomData.ac}</td>
                  <td>${amenities}</td>
                  <td>${roomData.bathroom}</td>
                  <td>${roomData.roomCount}</td>
                  <td>${roomData.price}</td>
              `;
        roomTableBody.appendChild(roomRow); // Append the row to the tbody
      });
    } else {
      alert('No rooms found for this hostel.');
    }
  } catch (error) {
    console.error('Error fetching rooms:', error);
  }
};

// Call fetchRoomDetails immediately when the JS file loads
fetchRoomDetails();

/*Hostel Multiple images upload*/
var files = [];
let imagelink = [];
let userUid = ''; // Global variable to store the generated unique ID

document.getElementById("files").addEventListener("change", function (e) {
  files = e.target.files;
});

document.getElementById("uploadImage").addEventListener("click", async function () {
  // Generate the uniqueID if it's not already created
  if (!userUid) {
    const userRef = push(ref(db, "User details")); // Push to generate a unique ID
    userUid = userRef.key; // Get the generated unique ID
  }

  // Checks if files are selected
  if (files.length != 0) {
    for (let i = 0; i < files.length; i++) {
      const storageRef = ref2(storage, 'userProof/' + uniqueID + '/govtProof/' + files[i].name); // Use uniqueID
      const upload = await uploadBytes(storageRef, files[i]);
      const imageUrl = await getDownloadURL(storageRef);
      imagelink.push(imageUrl);
    }

    const imageRef = ref(db, 'User details/' + uniqueID + '/proofData/');
    await set(imageRef, imagelink)
      .then(() => {
        alert("Image is uploading.. please click OK");
        alert("Image is uploaded. Please click OK");
        console.log('Image URLs have been successfully stored!');
      });
  } else {
    alert("No file chosen");
  }
});

registerUser.addEventListener('click', async (e) => {
  e.preventDefault(); // Prevent form submission before validation

  // Get input values
  var userName = document.getElementById("username").value;
  var userFullName = document.getElementById("userfullname").value;
  var userPhone = document.getElementById("userphone").value;
  var userGender = document.getElementById("usergender").value;
  var userEmail = document.getElementById("usermail").value;
  var userAddress1 = document.getElementById("useradd1").value;
  var userAddress2 = document.getElementById("useradd2").value;
  var userCity = document.getElementById("usercity").value;
  var userState = document.getElementById("userstate").value;
  var userPin = document.getElementById("userpin").value;
  var password1 = document.getElementById("pwd1").value;
  var password2 = document.getElementById("pwd2").value;
  var guardName = document.getElementById("guardname").value;
  var guardRelation = document.getElementById("guardrel").value;
  var guardEmail = document.getElementById("guardmail").value;
  var guardPhone = document.getElementById("guardphone").value;
  var guardAddress1 = document.getElementById("guardadd1").value;
  var guardAddress2 = document.getElementById("guardadd2").value;
  var guardState = document.getElementById("guardstate").value;
  var guardCity = document.getElementById("guardcity").value;
  var guardPin = document.getElementById("guardpin").value;
  var roomType = document.getElementById("roomtype").value;
  var floor = document.getElementById("floornum").value;
  var ac = document.getElementById("aircond").value;
  var totalAmount = document.getElementById("roomprice").value;
  var paymentComplete = document.getElementById("paymentComplete").value;
  var hostelDropdown = document.getElementById("hostelDropdown").value;

  // Validation for user and guardian details
  if (!userName || !userFullName || !userPhone || !userGender || !userEmail || !userAddress1 || !userCity || !userState || !userPin ||
    !password1 || !password2 || !guardName || !guardRelation || !guardEmail || !guardPhone || !guardAddress1 || !guardCity || !guardState
    || !guardPin || !roomType || !floor || !ac || !totalAmount || !paymentComplete) {
    alert("Please fill all required fields.");
    return;
  }

  // Email validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(userEmail)) {
    alert("Please enter a valid email address.");
    return;
  }

  // Phone validation
  if (userPhone.length !== 10) {
    alert("Phone number should be exactly 10 digits.");
    return;
  }

  if (guardPhone.length !== 10) {
    alert("Guardian's phone number should be exactly 10 digits.");
    return;
  }

  // Password match validation
  if (password1 !== password2) {
    alert("Passwords do not match.");
    return;
  }

  // Proof image validation
  if (files.length === 0) {
    alert("Please upload at least one proof image.");
    return;
  }
  if (!userUid) {
    alert("Please upload the image first before registering.");
    return;
  }

  try {
    // Fetch existing user details to avoid overwriting proofData
    const userRef = ref(db, "User details/" + userUid);
    const snapshot = await get(userRef);
    let existingData = snapshot.exists() ? snapshot.val() : {}; // Check if any existing data is present

    let newUserDetails = {
      userName: userName,
      userFullName: userFullName,
      userPhone: userPhone,
      userGender: userGender,
      userEmail: userEmail,
      userAddress1: userAddress1,
      userAddress2: userAddress2,
      userCity: userCity,
      userState: userState,
      userPin: userPin,
      password1: password1,
      password2: password2,
      guardName: guardName,
      guardRelation: guardRelation,
      guardEmail: guardEmail,
      guardPhone: guardPhone,
      guardAddress1: guardAddress1,
      guardAddress2: guardAddress2,
      guardState: guardState,
      guardCity: guardCity,
      guardPin: guardPin,
      userUid: userUid
    };

    // Include existing proofData if it exists
    if (existingData.proofData) {
      newUserDetails.proofData = existingData.proofData;
    }

    await set(userRef, newUserDetails); // Store user details

    // Store room details under the hostel's booking
    const bookingsRef = ref(db, "User details/" + userUid + '/Bookings/' + hostelDropdown + '/RoomDetails/');
    const roomDetails = {
      roomType: roomType,
      floor: floor,
      ac: ac,
      totalAmount: totalAmount,
      paymentComplete: paymentComplete
    };
    await set(bookingsRef, roomDetails);

    alert("User details and room booking added successfully");
    window.location.href = "././users.html";

  } catch (error) {
    alert("Error saving user details: " + error.message);
  }
});