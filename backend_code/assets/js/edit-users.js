import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getStorage, ref as ref2, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase();
const storage = getStorage(app);
var files = [];
let imagelink = [];
document.getElementById("files").addEventListener("change", function (e) {
  files = e.target.files;
});

// Upload images
document.getElementById("uploadImage").addEventListener("click", async function () {
  var userName = document.getElementById("username").value;
  if (files.length != 0) {
    const imageRef = ref(db, 'User details/' + userName + '/proofData/');
    const snapshot = await get(imageRef);
    let existingProofData = snapshot.exists() ? snapshot.val() : [];

    for (let i = 0; i < files.length; i++) {
      const storageRef = ref2(storage, 'userProof/' + userName + '/govtProof/' + files[i].name);
      await uploadBytes(storageRef, files[i]);
      const imageUrl = await getDownloadURL(storageRef);
      imagelink.push(imageUrl);
    }
    const updatedProofData = [...existingProofData, ...imagelink];
    await set(imageRef, updatedProofData);
    alert("Image(s) uploaded successfully!");
  } else {
    alert("No file chosen");
  }
});

// Populate hostel dropdown
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

// Autofill room price
async function autofillRoomPrice() {
  const hostelName = document.getElementById("hostelDropdown").value;
  const floor = document.getElementById("floornum").value;
  const roomType = document.getElementById("roomtype").value;
  const ac = document.getElementById("aircond").value;
  const roomPriceInput = document.getElementById("roomprice");

  if (hostelName && floor && roomType && ac) {
    // Construct the Firebase path based on the selected floor
    const floorPath = `Hostel details/${hostelName}/rooms/floor${floor}`;
    const roomRef = ref(db, floorPath);

    try {
      const snapshot = await get(roomRef);
      if (snapshot.exists()) {
        const rooms = snapshot.val();
        // Loop through each room under the selected floor
        for (let roomKey in rooms) {
          const room = rooms[roomKey];
          // Match the roomType and ac
          if (room.roomType === roomType && room.ac === ac) {
            roomPriceInput.value = room.price;
            return; // Once a match is found, stop further iterations
          }
        }
        roomPriceInput.value = ""; // No match found, clear the input
        alert("No room found with the selected criteria.");
      } else {
        console.log("No rooms found for the selected floor.");
        roomPriceInput.value = ""; // Clear input if no data found
      }
    } catch (error) {
      console.error("Error fetching room data:", error);
      roomPriceInput.value = ""; // Clear input in case of error
    }
  }
}

// Event listeners for dropdown and selections
document.getElementById("hostelDropdown").addEventListener("change", autofillRoomPrice);
document.getElementById("floornum").addEventListener("input", autofillRoomPrice);
document.getElementById("roomtype").addEventListener("change", autofillRoomPrice);
document.getElementById("aircond").addEventListener("change", autofillRoomPrice);

// Populate the hostel dropdown on page load
window.addEventListener('DOMContentLoaded', populateHostelDropdown);

async function prefillUserDetails() {
  const storedData = localStorage.getItem('userDetails');
  if (storedData) {
      const userData = JSON.parse(storedData);

      // Prefill form fields with user data
      document.getElementById("username").value = userData[0] || "";
      document.getElementById("userfullname").value = userData[1] || "";
      document.getElementById("usergender").value = userData[2] || "";
      document.getElementById("userphone").value = userData[3] || "";
      document.getElementById("usermail").value = userData[4] || "";
      document.getElementById("useradd1").value = userData[5] || "";
      document.getElementById("useradd2").value = userData[6] || "";
      document.getElementById("usercity").value = userData[7] || "";
      document.getElementById("userstate").value = userData[8] || "";
      document.getElementById("userpin").value = userData[9] || "";
      document.getElementById("guardname").value = userData[10] || "";
      document.getElementById("guardrel").value = userData[11] || "";
      document.getElementById("guardphone").value = userData[12] || "";
      document.getElementById("guardmail").value = userData[13] || "";
      document.getElementById("guardadd1").value = userData[14] || "";
      document.getElementById("guardadd2").value = userData[15] || "";
      document.getElementById("guardcity").value = userData[16] || "";
      document.getElementById("guardstate").value = userData[17] || "";
      document.getElementById("guardpin").value = userData[18] || "";
      document.getElementById("roomtype").value = userData[19] || "";
      document.getElementById("floornum").value = userData[20] || "";
      document.getElementById("aircond").value = userData[21] || "";
      document.getElementById("roomprice").value = userData[22] || "";
      document.getElementById("paymentComplete").value = userData[23] || ""; 
      document.getElementById("password1").value = userData[25] || ""; 

      const userName = userData[0];
      const bookingsRef = ref(db, "User details/" + userName + '/Bookings/');
      
      try {
          const snapshot = await get(bookingsRef);
          if (snapshot.exists()) {
              const bookingsData = snapshot.val();
              const hostelNames = Object.keys(bookingsData);
              if (hostelNames.length > 0) {
                  const prefilledHostel = hostelNames[0];
                  await populateHostelDropdown(prefilledHostel); // Pass the hostel name to prefill it
              }
          } else {
              console.log("No bookings found for this user.");
          }
      } catch (error) {
          console.error("Error fetching hostel names:", error);
      }

      updateDownloadLinks(userData[0]);
  } else {
      console.log("No User data found in localStorage.");
  }
}
// Ensure the form is prefilled when the page loads
window.addEventListener('DOMContentLoaded', prefillUserDetails);

updateUser.addEventListener('click', async (e) => {
  e.preventDefault();

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
  var guardName = document.getElementById("guardname").value;
  var guardRelation = document.getElementById("guardrel").value;
  var guardEmail = document.getElementById("guardmail").value;
  var guardPhone = document.getElementById("guardphone").value;
  var guardAddress1 = document.getElementById("guardadd1").value;
  var guardAddress2 = document.getElementById("guardadd2").value;
  var guardState = document.getElementById("guardstate").value;
  var guardCity = document.getElementById("guardcity").value;
  var guardPin = document.getElementById("guardpin").value;
  var password1 = document.getElementById("password1").value;
  var roomType = document.getElementById("roomtype").value;
  var floor = document.getElementById("floornum").value;
  var ac = document.getElementById("aircond").value;
  var totalAmount = document.getElementById("roomprice").value;
  var paymentComplete = document.getElementById("paymentComplete").value;
  var hostelName = document.getElementById("hostelDropdown").value;

  const userRef = ref(db, "User details/" + userName + '/');
  const bookingsRef = ref(db, "User details/" + userName + '/Bookings/' + hostelName + '/RoomDetails/');

  try {
    const snapshot = await get(userRef);
    let existingData = snapshot.exists() ? snapshot.val() : {};

    const roomDetails = {
      roomType: roomType,
      floor: floor,
      ac: ac,
      totalAmount: totalAmount,
      paymentComplete: paymentComplete || existingData.paymentComplete
    };

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
      password1,
      guardName: guardName,
      guardRelation: guardRelation,
      guardEmail: guardEmail,
      guardPhone: guardPhone,
      guardAddress1: guardAddress1,
      guardAddress2: guardAddress2,
      guardState: guardState,
      guardCity: guardCity,
      guardPin: guardPin,
    };

    if (existingData.proofData) {
      newUserDetails.proofData = existingData.proofData;
    }

    await set(userRef, newUserDetails);

    await set(bookingsRef, roomDetails);

    alert("User details and room booking updated successfully");
    window.location.href = "././users.html";
  } catch (error) {
    alert("Error fetching or saving user details: " + error.message);
  }
});