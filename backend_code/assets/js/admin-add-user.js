import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, onValue, child, update, remove, push } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getStorage, ref as ref2, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase();
const storage = getStorage(app);

// Fetch room details for the selected hostel and populate the hostel dropdown
// Populate hostel dropdown
async function populateHostelDropdown1() {
  const hostelDropdown1 = document.getElementById("hostelDropdown1");
  const hostelsRef = ref(db, "Hostel details/");

  try {
    const snapshot = await get(hostelsRef);
    if (snapshot.exists()) {
      const hostels = snapshot.val();

      // Populate hostel dropdown
      hostelDropdown1.innerHTML = '<option value="">Select Hostel</option>';
      for (let hostelName in hostels) {
        let option = document.createElement("option");
        option.value = hostelName;
        option.text = hostelName;
        hostelDropdown1.appendChild(option);
      }
    } else {
      console.log("No hostels found.");
    }
  } catch (error) {
    console.error("Error fetching hostels for hostelDropdown1:", error);
  }
}

// Fetch room details based on selected filters
async function fetchFilteredRoomDetails() {
  const hostelName = document.getElementById("hostelDropdown1").value;
  const roomType = document.getElementById("roomType").value;
  const acType = document.getElementById("acType").value;
  const bathroomType = document.getElementById("bathroomType").value;

  if (!hostelName) {
    alert("Please select a hostel name.");
    return;
  }

  console.log("Applying filters:", {
    hostelName,
    roomType,
    acType,
    bathroomType,
  });

  const roomsRef = ref(db, `Hostel details/${hostelName}/rooms/`);
  try {
    const snapshot = await get(roomsRef);
    const roomTableBody = document.querySelector("#roomTable tbody");
    roomTableBody.innerHTML = ""; // Clear previous table data

    if (snapshot.exists()) {
      const rooms = snapshot.val();
      let matchedRooms = 0; // Counter to track matched rooms

      for (let floorKey in rooms) {
        const floor = rooms[floorKey];
        for (let roomTypeKey in floor) {
          if (roomType !== "all" && roomTypeKey !== roomType) continue;

          const roomTypeData = floor[roomTypeKey];
          for (let acTypeKey in roomTypeData.rooms) {
            if (acType !== "all" && acTypeKey !== acType) continue;

            const acRooms = roomTypeData.rooms[acTypeKey];
            for (let roomKey in acRooms) {
              const roomData = acRooms[roomKey];

              if (bathroomType !== "all" && roomData.bathroom !== bathroomType) continue;

              const row = roomTableBody.insertRow();
              row.innerHTML = `
                <td>${roomData.floor}</td>
                <td>${roomData.roomNumber}</td>
                <td>${roomData.roomType}</td>
                <td>${roomData.ac}</td>
                <td>${roomData.amenities}</td>
                <td>${roomData.bathroom}</td>
                <td>${roomData.price}</td>
                <td>
                  <a data-bs-toggle="modal" data-bs-target="#viewRoomDetails" style="cursor:pointer; color:orange; text-decoration:underline">View beds</a> |
                  <a data-bs-toggle="modal" data-bs-target="#viewExtrasModal" style="cursor:pointer; color:orange; text-decoration:underline">View extras</a>
                </td>
              `;

              // Attach event listener to "View beds" link
              const viewBedsLink = row.querySelector("a:first-of-type");
              viewBedsLink.addEventListener("click", (event) => {
                event.stopPropagation();
                loadBedView(
                  roomData.floor,
                  roomData.roomNumber,
                  roomData.roomType,
                  acTypeKey,
                  roomData.bathroom,
                  roomData.price
                );
              });

              // Attach event listener to "View extras" link
              const viewExtrasLink = row.querySelector("a:last-of-type");
              viewExtrasLink.addEventListener("click", (event) => {
                event.stopPropagation();
                loadExtrasView();
              });

              matchedRooms++;
            }
          }
        }
      }

      if (matchedRooms === 0) {
        roomTableBody.innerHTML = "<tr><td colspan='8'>No rooms match the selected filters.</td></tr>";
      }
    } else {
      console.log("No rooms found for this hostel.");
      roomTableBody.innerHTML = "<tr><td colspan='8'>No rooms available.</td></tr>";
    }
  } catch (error) {
    console.error("Error fetching filtered room details:", error);
  }
}

let selectedExtras = {}; // Object to store selected extras

async function loadExtrasView() {
  const hostelName = document.getElementById("hostelDropdown1").value;

  if (!hostelName) {
    alert("Please select a hostel name.");
    return;
  }

  const extrasRef = ref(db, `Hostel details/${hostelName}/extras`);
  const extraTableBody = document.querySelector("#extraTable tbody");

  try {
    const snapshot = await get(extrasRef);

    extraTableBody.innerHTML = ""; // Clear previous data

    if (snapshot.exists()) {
      const extras = snapshot.val();
      console.log("Extras Data:", extras);

      extras.forEach((extra, index) => {
        const row = document.createElement("tr");

        // Checkbox cell
        const checkboxCell = document.createElement("td");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("extra-checkbox");
        checkbox.dataset.index = index;


        checkbox.addEventListener("change", (e) => {
          if (e.target.checked) {
            selectedExtras[index] = {
              foodName: extra.foodName,
              foodPrice: extra.foodPrice,
            };
          } else {
            delete selectedExtras[index];
          }
          console.log("Selected Extras:", selectedExtras);
        });

        checkboxCell.appendChild(checkbox);
        row.appendChild(checkboxCell);


        const foodNameCell = document.createElement("td");
        foodNameCell.textContent = extra.foodName;
        row.appendChild(foodNameCell);

        const foodPriceCell = document.createElement("td");
        foodPriceCell.textContent = `₹${extra.foodPrice}`;
        row.appendChild(foodPriceCell);

        extraTableBody.appendChild(row);
      });

      // Show the modal
      const viewExtrasModal = new bootstrap.Modal(
        document.getElementById("viewExtrasModal")
      );
      viewExtrasModal.show();
    } else {
      console.log("No extras found for this hostel.");
      extraTableBody.innerHTML =
        "<tr><td colspan='3'>No extras available.</td></tr>";
    }
  } catch (error) {
    console.error("Error fetching extras:", error);
    extraTableBody.innerHTML =
      "<tr><td colspan='3'>Error loading extras data.</td></tr>";
  }
}


// Attach event listeners for dynamic filtering
function attachFilterEventListeners() {
  const filterInputs = [
    document.getElementById("hostelDropdown1"),
    document.getElementById("roomType"),
    document.getElementById("acType"),
    document.getElementById("bathroomType"),
  ];

  filterInputs.forEach((input) => {
    input.addEventListener("change", fetchFilteredRoomDetails);
  });
}

// Initialize dropdowns and attach listeners
document.addEventListener("DOMContentLoaded", () => {
  populateHostelDropdown1();
  attachFilterEventListeners();
});


let selectedDetails = {};
let isUpdatingBedStatus = false; // Flag to prevent unnecessary UI reloads

// Load bed view for the selected room
async function loadBedView(floor, roomNo, roomType, acType, bathroom, price) {
  const hostelName = document.getElementById("hostelDropdown1").value;

  const dbref = ref(
    db,
    `Hostel details/${hostelName}/rooms/floor${floor}/${roomType}/rooms/${acType}/room${roomNo}/beds`
  );

  const parentContainer = document.getElementById("bedParent");
  parentContainer.innerHTML = ""; // Clear any previous data

  await onValue(dbref, (snapshot) => {
    if (isUpdatingBedStatus) return; // Skip UI update if we're already updating the status

    const beds = snapshot.val();
    if (!beds) {
      parentContainer.innerHTML = "<p>No beds available.</p>";
      return;
    }

    parentContainer.innerHTML = "";
    for (let key in beds) {
      let bed = beds[key];

      const elem = document.createElement("div");
      elem.classList.add("card");
      elem.style.cursor = "pointer";


      if (bed.status === "booked") {
        elem.style.backgroundColor = "#FF7F7F"; 
        elem.style.border = "1px solid #FF7F7F";
        elem.style.color = "red";
        elem.style.pointerEvents = "none";
      } else {
        elem.style.backgroundColor = "white";
        elem.style.border = "1px solid black";

        // Add event listener for bed selection
        elem.addEventListener("click", async () => {

          const cards = parentContainer.querySelectorAll(".card");
          cards.forEach((card) => {
            card.style.backgroundColor = "white";
            card.style.color = "black";
          });

          elem.style.backgroundColor = "lightgreen";
          elem.style.color = "black";

          // Store selected bed details
          selectedDetails = {
            floor,
            roomNumber: roomNo,
            roomType,
            ac: acType,
            bedId: key,
            bathroomType: bathroom || "N/A",
            price: price || "N/A",
            hostelName,
          };

          console.log("Selected Bed Details:", selectedDetails);

          // Temporarily disable updates to avoid UI reset
          isUpdatingBedStatus = true;

          // Update the bed status in Firebase as "booked"
          const bedRef = ref(
            db,
            `Hostel details/${hostelName}/rooms/floor${floor}/${roomType}/rooms/${acType}/room${roomNo}/beds/${key}`
          );

          try {
            await update(bedRef, { status: "booked" });
            console.log(`Bed ${key} status updated to "booked".`);

            // Re-enable updates after a brief delay
            setTimeout(() => {
              isUpdatingBedStatus = false;
            }, 500);
          } catch (error) {
            console.error("Error updating bed status:", error);
            isUpdatingBedStatus = false;
          }
        });
      }

      elem.innerHTML = `<div class="card-body">${key} - ${bed.status}</div>`;
      parentContainer.appendChild(elem);
    }
  });
}

// Attach event listener to the "Apply Filter" button
document.getElementById("applyFilter").addEventListener("click", fetchFilteredRoomDetails);


function confirmSelection() {
  // Ensure a bed has been selected
  if (Object.keys(selectedDetails).length === 0) {
    alert("Please select a bed before confirming.");
    return;
  }

  // Find and highlight the corresponding table row
  const roomTableBody = document.querySelector("#roomTable tbody");
  const rows = roomTableBody.querySelectorAll("tr");

  rows.forEach((row) => {
    const floor = row.cells[0].textContent.trim();
    const roomNumber = row.cells[1].textContent.trim();

    const selectedFloor = selectedDetails.floor.toString().trim();
    const selectedRoomNumber = selectedDetails.roomNumber.toString().trim();


    if (floor === selectedFloor && roomNumber === selectedRoomNumber) {
      row.style.backgroundColor = "lightgreen"; // Highlight the row
    } else {

      row.style.backgroundColor = ""; 
    }
  });

  const modal = bootstrap.Modal.getInstance(document.getElementById("viewRoomDetails"));
  modal.hide();

  console.log("Selected Row Data:", selectedDetails);
}


// Attach event listener to the "OK" button in the modal
document.getElementById("confirmBooking").addEventListener("click", confirmSelection);


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
      const storageRef = ref2(storage, 'userProof/' + userUid + '/govtProof/' + files[i].name); // Use uniqueID
      const upload = await uploadBytes(storageRef, files[i]);
      const imageUrl = await getDownloadURL(storageRef);
      imagelink.push(imageUrl);
    }

    const imageRef = ref(db, 'User details/' + userUid + '/proofData/');
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
  var paymentMode = document.getElementById("paymentMode").value;
  var paymentId = document.getElementById("paymentId").value;
  var paymentComments = document.getElementById("paymentComments").value;
  // var paymentComplete = document.getElementById("paymentComplete").value;
  var paymentComplete = "yes";

  // Validation for user and guardian details
  if (!userName || !userFullName || !userPhone || !userGender || !userEmail || !userAddress1 || !userCity || !userState || !userPin ||
    !password1 || !password2 || !guardName || !guardRelation || !guardEmail || !guardPhone || !guardAddress1 || !guardCity || !guardState
    || !guardPin || !paymentMode || !paymentComplete) {
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
      guardianDetails: "yes",
      proofSubmission: "yes",
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

    // Generate current timestamp for booking
    const currentTimestamp = new Date().toISOString();
    const currentDate = new Date().toDateString(); // Get the current date string

    // Format the timestamp to use as a valid Firebase key
    const formattedTimestamp = currentTimestamp
      .replace(/[.]/g, "_")
      .replace(/[:]/g, "_")
      .replace(/[-]/g, "_")
      .replace(/T/g, "_")
      .replace(/Z/g, "");

    // Room and payment details
    const roomDetails = {
      roomType: selectedDetails.roomType,
      floor: selectedDetails.floor,
      ac: selectedDetails.ac,
      totalAmount: selectedDetails.price,
      paymentComplete: "yes",
      paymentDate: currentTimestamp,
      paymenttransId: paymentMode === "Online" ? paymentId : null,
      paymentComments: paymentMode === "Manual" ? paymentComments : null,
      room: selectedDetails.roomNumber,
      roomBookedDate: currentTimestamp,
      hostelName: selectedDetails.hostelName,
      status: "Updated",
      bedId: selectedDetails.bedId,
      roomRent: selectedDetails.price,
      extras: Object.values(selectedExtras), // Add extras as an array
    };

    // Store the room details in bookings
    const bookingsRef = ref(db, `User details/${userUid}/Bookings/${currentDate}/RoomDetails/`);
    await set(bookingsRef, roomDetails);


    const paymentDetails = {
      [formattedTimestamp]: {
        paymentAmount: selectedDetails.price,
        paymentDate: currentTimestamp,
        paymentMode: paymentMode,
        paymenttransId: paymentMode === "Online" ? paymentId : null,
      }
    };

    const paymentRef = ref(db, `User details/${userUid}/Bookings/${currentDate}/RoomDetails/PaymentDetails/`);
    await set(paymentRef, paymentDetails);

    alert("User details and room booking added successfully");
    window.location.href = "././users.html";

  } catch (error) {
    alert("Error saving user details: " + error.message);
  }
});
