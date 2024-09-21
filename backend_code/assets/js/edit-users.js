import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
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

// Event listener for file selection
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

async function updateDownloadLinks(userName) {
  const imageRef = ref(db, 'User details/' + userName + '/proofData/');
  const downloadContainer = document.getElementById("downloadimage");

  try {
    const snapshot = await get(imageRef);
    if (snapshot.exists()) {
      const proofData = snapshot.val();
      downloadContainer.innerHTML = ""; // Clear any existing content

      proofData.forEach((url, index) => {
        const link = document.createElement('a');
        link.href = url;
        link.innerText = `Download ${index + 1}`;
        link.target = '_blank';
        downloadContainer.appendChild(link);
        downloadContainer.appendChild(document.createElement('br')); // Create a <br> element
      });
    } else {
      downloadContainer.innerHTML = "No images available for download.";
    }
  } catch (error) {
    console.error("Error fetching proof data:", error);
    downloadContainer.innerHTML = "Error loading images.";
  }
}

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
    document.getElementById("paymentComplete").value = userData[23] || ""; // Fix here
    document.getElementById("password1").value = userData[25] || ""; 

    const userName = userData[0]; // Assuming the username is the first element in userData
    const bookingsRef = ref(db, "User details/" + userName + '/Bookings/');
    
    try {
      const snapshot = await get(bookingsRef);
      if (snapshot.exists()) {
        const bookingsData = snapshot.val();
        // Get the first hostel name (you may adjust this logic based on your requirements)
        const hostelNames = Object.keys(bookingsData);
        if (hostelNames.length > 0) {
          document.getElementById("hostelName").value = hostelNames[0]; // Set the first hostel name
        }
      } else {
        console.log("No bookings found for this user.");
      }
    } catch (error) {
      console.error("Error fetching hostel names:", error);
    }

    console.log(userData);
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
  var paymentComplete = document.getElementById("paymentComplete").value; // Add this line
  var hostelName = document.getElementById("hostelName").value;

  const userRef = ref(db, "User details/" + userName + '/');
  const bookingsRef = ref(db, "User details/" + userName + '/Bookings/' + hostelName + '/RoomDetails/');

  try {
    const snapshot = await get(userRef);
    let existingData = snapshot.exists() ? snapshot.val() : {};

    // Create room details object
    const roomDetails = {
      roomType: roomType,
      floor: floor,
      ac: ac,
      totalAmount: totalAmount,
      paymentComplete: paymentComplete || existingData.paymentComplete // Use the new payment status
    };

    // Construct new user details
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
      password1,password1,
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

    // Merge with existing proofData if available
    if (existingData.proofData) {
      newUserDetails.proofData = existingData.proofData;
    }

    // Update the user details
    await set(userRef, newUserDetails);

    // Store room details under the hostel's booking
    await set(bookingsRef, roomDetails);

    alert("User details and room booking updated successfully");
    window.location.href = "././users.html";
  } catch (error) {
    alert("Error fetching or saving user details: " + error.message);
  }
});