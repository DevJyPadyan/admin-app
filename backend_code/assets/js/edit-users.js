import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, child, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"
import { getStorage, ref as ref2, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js"
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase();
const storage = getStorage(app);
var files = [];
let imagelink = [];
document.getElementById("files").addEventListener("change", function (e) {
  files = e.target.files;
  for (let i = 0; i < files.length; i++) {
  }
});
// Event listener for file selection
document.getElementById("uploadImage").addEventListener("click", async function () {

  var userName = document.getElementById("username").value;
  //checks if files are selected
  if (files.length != 0) {
    const imageRef = ref(db, 'User details/' + userName + '/proofData/' + '/');
    // Fetch existing proof data
    const snapshot = await get(imageRef);
    let existingProofData = snapshot.exists() ? snapshot.val() : [];

    //Loops through all the selected files
    for (let i = 0; i < files.length; i++) {
      const storageRef = ref2(storage, 'userProof/' + userName + '/govtProof/' + files[i].name);
      const upload = await uploadBytes(storageRef, files[i]);
      const imageUrl = await getDownloadURL(storageRef);
      imagelink.push(imageUrl);
    }
    const updatedProofData = [...existingProofData, ...imagelink];
    // Update proofData in the database
    set(imageRef, updatedProofData)
      .then(() => {
        alert("To start uploading, please click OK");
        alert("Image is uploading, Please click OK");
        alert("Image is uploaded, Please click OK");
        console.log('Image URLs have been successfully updated!');
      })
      .catch((error) => {
        console.error("Error uploading images: ", error);
      });

  } else {
    alert("No file chosen");
  }
});

async function updateDownloadLinks(userName) {
  const imageRef = ref(db, 'User details/' + userName + '/proofData/');
  const downloadContainer = document.getElementById("downloadimage");

  try {
    // Fetch the proof data from Firebase
    const snapshot = await get(imageRef);
    if (snapshot.exists()) {
      const proofData = snapshot.val();
      downloadContainer.innerHTML = ""; // Clear any existing content

      // Loop through the image URLs and create download links
      proofData.forEach((url, index) => {
        const link = document.createElement('a');
        link.href = url;
        link.innerText = `Download ${index + 1}`;
        link.target = '_blank';

        downloadContainer.appendChild(link); // Append the link to the container

        const br = document.createElement('br'); // Create a <br> element
        downloadContainer.appendChild(br);

      });
    } else {
      downloadContainer.innerHTML = "No images available for download.";
    }
  } catch (error) {
    console.error("Error fetching proof data:", error);
    downloadContainer.innerHTML = "Error loading images.";
  }
}

function prefillUserDetails() {
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
  var roomType = document.getElementById("roomtype").value;
  var floorNumber = document.getElementById("floornum").value;
  var AirConditioning = document.getElementById("aircond").value;
  var roomPrice = document.getElementById("roomprice").value;

  update(ref(db, "User details/" + userName + '/'), {
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
    guardName: guardName,
    guardRelation: guardRelation,
    guardEmail: guardEmail,
    guardPhone: guardPhone,
    guardAddress1: guardAddress1,
    guardAddress2: guardAddress2,
    guardState: guardState,
    guardPin: guardPin,
    guardCity: guardCity,
    roomType: roomType,
    floorNumber: floorNumber,
    AirConditioning: AirConditioning,
    roomPrice: roomPrice

  })
    .then(() => {
      alert("User details updated successfully");
      window.location.href = "././users.html";
    })
    .catch((error) => {
      alert(error);
    });
});
