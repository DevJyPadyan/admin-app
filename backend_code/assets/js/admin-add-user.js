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

  var userName = document.getElementById("username").value;
  //checks if files are selected
  if (files.length != 0) {
    //Loops through all the selected files
    for (let i = 0; i < files.length; i++) {
      const storageRef = ref2(storage, 'userProof/' + userName + '/govtProof/' + files[i].name);
      const upload = await uploadBytes(storageRef, files[i]);
      const imageUrl = await getDownloadURL(storageRef);
      imagelink.push(imageUrl);
    }

    const imageRef = ref(db, 'User details/' + userName + '/proofData/' + '/');
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
registerUser.addEventListener('click', async (e) => { 
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
  var floorNumber = document.getElementById("floornum").value;
  var AirConditioning = document.getElementById("aircond").value;
  var roomPrice = document.getElementById("roomprice").value;


  // Reference to user data
  const userRef = ref(db, "User details/" + userName + '/');
  
  // Fetch existing proof data
  try {
    const snapshot = await get(userRef);
    let existingData = snapshot.exists() ? snapshot.val() : {};

    // If there is existing proofData, merge it with new user details
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
      roomType: roomType,
      floorNumber: floorNumber,
      AirConditioning: AirConditioning,
      roomPrice: roomPrice
    };

    // Merge with existing proofData if available
    if (existingData.proofData) {
      newUserDetails.proofData = existingData.proofData;
    }

    // Update the user details along with proofData
    await set(userRef, newUserDetails);

    alert("User details added successfully");
    window.location.href = "././users.html";
  } catch (error) {
    alert("Error fetching or saving user details: " + error.message);
  }
});
