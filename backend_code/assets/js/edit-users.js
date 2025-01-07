import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, child, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getStorage, ref as ref2, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase();
const storage = getStorage(app);
let phone = "";

let userUid;
var files = [];
let imagelink = [];
document.getElementById("files").addEventListener("change", function (e) {
  files = e.target.files;
});

// Upload images
document.getElementById("uploadImage").addEventListener("click", async function () {
  var userName = document.getElementById("username").value;

  // Fetch userUid based on userName before proceeding with the upload
  await fetchUserId(userName);

  if (!userUid) {
    alert("User not found");
    return;
  }

  if (files.length != 0) {
    // Use userUid instead of userName for both Storage and Database paths
    const imageRef = ref(db, 'User details/' + userUid + '/proofData/');
    const snapshot = await get(imageRef);
    let existingProofData = snapshot.exists() ? snapshot.val() : [];

    for (let i = 0; i < files.length; i++) {
      // Update the storage path to include userUid
      const storageRef = ref2(storage, 'userProof/' + userUid + '/govtProof/' + files[i].name);
      await uploadBytes(storageRef, files[i]);
      const imageUrl = await getDownloadURL(storageRef);
      imagelink.push(imageUrl);
    }

    const updatedProofData = [...existingProofData, ...imagelink];
    await set(imageRef, updatedProofData);
    alert("Image is uploading.. please click OK");
    alert("Image is uploaded. Please click OK");
  } else {
    alert("No file chosen");
  }
});

async function fetchUserId(username) {
  const usersRef = ref(db, 'User details'); // Reference to user details in Firebase

  try {
    const userSnapshot = await get(usersRef);
    if (userSnapshot.exists()) {
      const usersData = userSnapshot.val();
      console.log(usersData);

      // Find user UID based on username
      for (const [uid, userDetails] of Object.entries(usersData)) {
        if (userDetails.userName === username) {
          userUid = uid; // Store the userUid in the global variable
          break;
        }
      }

      // Call the function to update download links after fetching userId
      await updateDownloadLinks();
    } else {
      console.log("No users found.");
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
  }
}

async function updateDownloadLinks() {
  const imageRef = ref(db, `User details/${userUid}/proofData/`); // Use userId for accessing proof data
  const downloadContainer = document.getElementById("downloadimage");

  try {
    const snapshot = await get(imageRef);
    if (snapshot.exists()) {
      const proofData = snapshot.val();
      downloadContainer.innerHTML = ""; // Clear any existing content

      // Assuming proofData is an array where indices are numeric
      Object.entries(proofData).forEach(([fileName, url], index) => {
        const link = document.createElement('a');
        link.href = url;
        link.innerText = `Download ${index + 1}`; // Display +1 for each index
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

// Populate hostel dropdown and prefill the selected hostel
async function populateHostelDropdown(prefilledHostel = "") {
  // const hostelDropdown = document.getElementById("hostelDropdown");
  // const hostelsRef = ref(db, "Hostel details/");

  // try {
  //   const snapshot = await get(hostelsRef);
  //   if (snapshot.exists()) {
  //     const hostels = snapshot.val();
  //     hostelDropdown.innerHTML = '<option value="">Select Hostel</option>';
  //     for (let hostelName in hostels) {
  //       let option = document.createElement("option");
  //       option.value = hostelName;
  //       option.text = hostelName;
  //       hostelDropdown.appendChild(option);
  //     }

  //     // Prefill the dropdown with the user's hostel if available
  //     if (prefilledHostel) {
  //       hostelDropdown.value = prefilledHostel;
  //     }
  //   } else {
  //     console.log("No hostels found.");
  //   }
  // } catch (error) {
  //   console.error("Error fetching hostels:", error);
  // }
}

//Auto fill room price
let debounceTimer;

async function autofillRoomPrice() {
  const hostelName = document.getElementById("hostelDropdown").value;
  const floor = document.getElementById("floornum").value;
  const roomType = document.getElementById("roomtype").value;
  const ac = document.getElementById("aircond").value;
  const roomPriceInput = document.getElementById("roomprice");

  // Clear price if any field is missing
  if (!hostelName || !floor || !roomType || !ac) {
    roomPriceInput.value = "";
    return;
  }

  // Construct the Firebase path based on the selected floor
  const floorPath = `Hostel details/${hostelName}/rooms/floor${floor}`;
  const roomRef = ref(db, floorPath);

  try {
    const snapshot = await get(roomRef);
    if (snapshot.exists()) {
      const rooms = snapshot.val();

      // Find a matching room based on roomType and ac
      for (const roomKey in rooms) {
        const room = rooms[roomKey];
        if (room.roomType === roomType && room.ac === ac) {
          roomPriceInput.value = room.price;
          return; // Stop further processing once a match is found
        }
      }

      // If no matches are found
      roomPriceInput.value = "";
      alert("No room found matching the selected criteria.");
    } else {
      roomPriceInput.value = "";
      console.log("No rooms found for the selected floor.");
    }
  } catch (error) {
    console.error("Error fetching room data:", error);
    roomPriceInput.value = ""; // Clear input in case of error
  }
}

// Debounced input change handling
function debounceAutofill() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(autofillRoomPrice, 300); // Adjust debounce delay as needed
}

// Event listeners for dropdowns and inputs
// document.getElementById("hostelDropdown").addEventListener("change", debounceAutofill);
// document.getElementById("floornum").addEventListener("input", debounceAutofill);
// document.getElementById("roomtype").addEventListener("change", debounceAutofill);
// document.getElementById("aircond").addEventListener("change", debounceAutofill);

// window.addEventListener('DOMContentLoaded', populateHostelDropdown);

async function prefillUserDetails() {
  const storedData = localStorage.getItem('userDetailsAmin');
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
    // document.getElementById("roomtype").value = userData[19] || "";
    // document.getElementById("floornum").value = userData[20] || "";
    // document.getElementById("aircond").value = userData[21] || "";
    // document.getElementById("roomprice").value = userData[22] || "";
    // document.getElementById("paymentComplete").value = userData[23] || "";
    // document.getElementById("hostelDropdown").value = userData[24] || "";

    //const userId='afqOCDeMdqXcjsWv0sJ5ebd4xO32';
    const username = userData[0];
    fetchUserId(username);
    const usersRef = ref(db, 'User details'); // Reference to user details in Firebase

    try {
      const userSnapshot = await get(usersRef);
      if (userSnapshot.exists()) {
        const usersData = userSnapshot.val();
        console.log(usersData);
        let userUid = null;

        // Find user UID based on username
        for (const [uid, userDetails] of Object.entries(usersData)) {
          if (userDetails.userName === username) {
            userUid = uid;
            phone = userDetails.userPhone
            const href = "https://api.whatsapp.com/send?phone=" + phone;
            document.getElementById('whatsapp').href = href;
            break;
          }
        }
        prefillAdditionalDetails();
        if (userUid) {
          // Fetch bookings for the found userId
          const bookingsRef = ref(db, `User details/${userUid}/Bookings`);
          const bookingsSnapshot = await get(bookingsRef);

          if (bookingsSnapshot.exists()) {
            const bookingsData = bookingsSnapshot.val();
            const hostelNames = Object.keys(bookingsData);
            if (hostelNames.length > 0) {
              const prefilledHostel = hostelNames[0];  // This is the prefilled hostel name
              // Call populateHostelDropdown AFTER fetching the hostel
              await populateHostelDropdown(prefilledHostel); // Pass the prefilled hostel name
            }
          } else {
            console.log("No bookings found for this user.");
            await populateHostelDropdown(); // Still populate the dropdown in case there are no bookings
          }
        } else {
          console.log("User not found for the given username.");
          await populateHostelDropdown(); // Populate dropdown if user is not found
        }
      } else {
        console.log("No user data found.");
        await populateHostelDropdown(); // If no user data, still populate dropdown
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }

    // Call to update download links
    updateDownloadLinks(userData[0]);
  } else {
    console.log("No User data found in localStorage.");
    await populateHostelDropdown(); // If no user data, still populate dropdown
  }
}
// Ensure the form is prefilled when the page loads
window.addEventListener('DOMContentLoaded', prefillUserDetails);

updateUser.addEventListener("click", async (e) => {
  e.preventDefault();

  const userName = document.getElementById("username").value;

  // Fetch user ID before proceeding with the update
  await fetchUserId(userName);

  if (!userUid) {
    alert("User not found");
    return;
  }

  const userFullName = document.getElementById("userfullname").value;
  const userPhone = document.getElementById("userphone").value;
  phone = document.getElementById("userphone").value;
  const userGender = document.getElementById("usergender").value;
  const userEmail = document.getElementById("usermail").value;
  const userAddress1 = document.getElementById("useradd1").value;
  const userAddress2 = document.getElementById("useradd2").value;
  const userCity = document.getElementById("usercity").value;
  const userState = document.getElementById("userstate").value;
  const userPin = document.getElementById("userpin").value;
  const guardName = document.getElementById("guardname").value;
  const guardRelation = document.getElementById("guardrel").value;
  const guardEmail = document.getElementById("guardmail").value;
  const guardPhone = document.getElementById("guardphone").value;
  const guardAddress1 = document.getElementById("guardadd1").value;
  const guardAddress2 = document.getElementById("guardadd2").value;
  const guardState = document.getElementById("guardstate").value;
  const guardCity = document.getElementById("guardcity").value;
  const guardPin = document.getElementById("guardpin").value;
  // const roomType = document.getElementById("roomtype").value;
  // const floor = document.getElementById("floornum").value;
  // const ac = document.getElementById("aircond").value;
  // const totalAmount = document.getElementById("roomprice").value;
  // const paymentComplete = document.getElementById("paymentComplete").value;
  // const newHostelName = document.getElementById("hostelDropdown").value;

  const userDetailRef = ref(db, `User details/${userUid}/`);
  // const bookingsRef = ref(db, `User details/${userUid}/Bookings`);

  try {
    // Fetch existing user data
    const userSnapshot = await get(userDetailRef);
    const existingUserData = userSnapshot.exists() ? userSnapshot.val() : {};

    // Remove old hostel booking if necessary
    // if (existingUserData.Bookings) {
    //   const oldHostelName = Object.keys(existingUserData.Bookings).find(
    //     (hostel) => hostel !== newHostelName
    //   );
    //   if (oldHostelName) {
    //     const oldBookingRef = ref(db, `User details/${userUid}/Bookings/${oldHostelName}`);
    //     await set(oldBookingRef, null); // Clear old booking data
    //   }
    // }

    // Update user details
    const updatedUserData = {
      ...existingUserData, // Preserve existing data
      userFullName,
      userName,
      userPhone,
      userGender,
      userEmail,
      userAddress1,
      userAddress2,
      userCity,
      userState,
      userPin,
      guardName,
      guardRelation,
      guardEmail,
      guardPhone,
      guardAddress1,
      guardAddress2,
      guardState,
      guardCity,
      guardPin,
      proofData: existingUserData.proofData, // Preserve proof data
    };

    await set(userDetailRef, updatedUserData);

    // Update booking details for the selected hostel
    // const updatedBookingData = {
    //   roomType,
    //   floor,
    //   ac,
    //   totalAmount,
    //   paymentComplete: paymentComplete || existingUserData.paymentComplete, // Preserve payment status if not updated
    // };

    // const newBookingRef = ref(db, `User details/${userUid}/Bookings/${newHostelName}/RoomDetails`);
    // await set(newBookingRef, updatedBookingData);

    alert("User details updated successfully");
    window.location.href = "././users.html";
  } catch (error) {
    console.error("Error updating user details or bookings:", error);
    alert("Error updating user details. Please try again.");
  }
});

async function prefillAdditionalDetails() {
  const dbref = ref(db);
  console.log(userUid);
  if (userUid) {
    await get(child(dbref, "User details/" + userUid + '/Bookings/'))
      .then((snapshot) => {
        // console.log(snapshot,JSON.stringify(snapshot))
        if (snapshot.exists()) {
          setUserHistoryDetails(snapshot.val())
        }

      })
      .catch((error) => {
        alert("error" + error);
      });
  }
}
function setUserHistoryDetails(bookingObj) {
  let expenseId = 1;
  for (let perBookingKey in bookingObj) {
    let bookingRec = bookingObj[perBookingKey].RoomDetails;
    // console.log(JSON.stringify(bookingRec));
    let paymentHistoryObj = bookingRec.PaymentDetails;
    let vacationObj = bookingRec.Vacation;
    let checkoutObj = {
      adminApprovalForCheckout: bookingRec.adminApprovalForCheckout,
      roomCheckoutDateByUser: bookingRec.roomCheckoutDateByUser,
      roomCheckoutDateByAdmin: bookingRec.roomCheckoutDateByAdmin,
      status: bookingRec.status
    };
    console.log(checkoutObj)
    let bookingId = perBookingKey;
    let hostelRoom = bookingRec.room;
    let hostelac = bookingRec.ac;
    let hostelName = bookingRec.hostelName;
    let hostelFloor = bookingRec.floor;
    let hostelType = bookingRec.roomType;
    let roomStatus = bookingRec.status;
    let roomBookedDate = bookingRec.roomBookedDate;
    let bedId = bookingRec.bedId;
    let roomRent = bookingRec.roomRent;


    addTableRow(expenseId, bookingId, hostelName, hostelFloor,
      hostelType, hostelac, hostelRoom, bedId, roomRent, roomBookedDate, roomStatus,
      paymentHistoryObj, vacationObj, checkoutObj);
    console.log(JSON.stringify(paymentHistoryObj), JSON.stringify(vacationObj), JSON.stringify(checkoutObj));
    expenseId++;
  }
}


const tbody1 = document.getElementById("tbody1");
const addTableRow = async (
  id,
  bookingId, hostelName, hostelFloor,
  hostelType, hostelac, hostelRoom,
  bedId, roomRent, roomBookedDate, roomStatus,
  paymentHistoryObj, vacationObj, checkoutObj

) => {
  const trow = document.createElement("tr");

  const td1 = document.createElement("td");
  const td2 = document.createElement("td");
  const td3 = document.createElement("td");
  const td4 = document.createElement("td");
  const td5 = document.createElement("td");
  const td6 = document.createElement("td");
  const td7 = document.createElement("td");
  const td8 = document.createElement("td");
  const td9 = document.createElement("td");
  const td10 = document.createElement("td");
  const td11 = document.createElement("td");
  const td12 = document.createElement("td");
  const td13 = document.createElement("td");
  const td14 = document.createElement("td");
  // const td15 = document.createElement("td");


  td1.innerText = id;
  td2.innerText = bookingId;
  td3.innerText = hostelName;
  td4.innerText = hostelFloor;
  td5.innerText = hostelType;
  td6.innerText = hostelac;
  td7.innerText = hostelRoom;
  td8.innerText = bedId;
  td9.innerText = roomRent;
  td10.innerText = roomBookedDate;
  td11.innerText = roomStatus;

  var paymentDetailsButton = document.createElement('a');
  paymentDetailsButton.innerHTML = '<a data-bs-toggle="modal" data-bs-target="#viewPaymentDetails" style="cursor:pointer; color:orange; text-decoration: underline">Payment Details</a>';
  paymentDetailsButton.onclick = function (event) {
    event.stopPropagation(); // Prevent row click event
    fillPaymentDetails(paymentHistoryObj);
  };

  td12.appendChild(paymentDetailsButton);

  var vacationDetailsButton = document.createElement('a');
  vacationDetailsButton.innerHTML = '<a data-bs-toggle="modal" data-bs-target="#viewVacationDetails" style="cursor:pointer; color:orange; text-decoration: underline">Vacation Details</a>';
  vacationDetailsButton.onclick = function (event) {
    event.stopPropagation(); // Prevent row click event
    let hostelDetails = [];
    hostelDetails.push(bookingId);
    hostelDetails.push(hostelName);
    hostelDetails.push(hostelFloor);
    hostelDetails.push(hostelType);
    hostelDetails.push(hostelac);
    hostelDetails.push(hostelRoom);
    hostelDetails.push(bedId);
    fillVacationDetails(vacationObj, hostelDetails);
  };

  td13.appendChild(vacationDetailsButton);

  var detailsButton = document.createElement('a');
  detailsButton.innerHTML = '<a data-bs-toggle="modal" data-bs-target="#viewCheckoutDetails" style="cursor:pointer; color:orange; text-decoration: underline">Checkout Details</a>';
  detailsButton.onclick = function (event) {
    event.stopPropagation(); // Prevent row click event
    let hostelDetails = [];
    hostelDetails.push(bookingId);
    hostelDetails.push(hostelName);
    hostelDetails.push(hostelFloor);
    hostelDetails.push(hostelType);
    hostelDetails.push(hostelac);
    hostelDetails.push(hostelRoom);
    hostelDetails.push(bedId);
    fillCheckoutDetails(checkoutObj, hostelDetails);
  };

  td14.appendChild(detailsButton);

  trow.append(td1, td2, td3, td4, td5, td6, td7, td8, td9, td10, td11, td12, td13, td14);
  tbody1.appendChild(trow);
};

const tbody2 = document.getElementById("tbody2");
function fillPaymentDetails(paymentHistoryObj) {
  let i = 1;
  if (paymentHistoryObj != undefined) {
    tbody2.innerHTML = "";
    for (let key in paymentHistoryObj) {
      let paymentDetails = paymentHistoryObj[key];
      console.log(paymentDetails.paymentDate)
      let paydate = String(paymentDetails.paymentDate).split('T');
      console.log(paydate)
      loadPaymentTale(i, paymentDetails.paymenttransId, paymentDetails.paymentAmount, paydate[0], paymentDetails.paymentMode)
      i++;
    }
  }
}
function loadPaymentTale(iterator, transId, amount, mode, date) {
  const trow = document.createElement("tr");
  const td1 = document.createElement("td");
  const td2 = document.createElement("td");
  const td3 = document.createElement("td");
  const td4 = document.createElement("td");
  const td5 = document.createElement("td");
  const td6 = document.createElement("td");

  td1.innerText = iterator;
  td2.innerText = transId;
  td3.innerText = amount;
  td4.innerText = date;
  td5.innerText = mode;

  trow.append(td1, td2, td3, td4, td5);
  tbody2.appendChild(trow);
}

function fillCheckoutDetails(checkoutObj, hostelDetails) {
  console.log(JSON.stringify(checkoutObj))
  document.getElementById('checkoutdate_user').value = "";
  document.getElementById('checkoutdate_admin').value = "";
  document.getElementById('checkout_approval').value = "";
  if (checkoutObj != undefined) {
    document.getElementById('checkoutdate_user').value = (checkoutObj.roomCheckoutDateByUser).split('T')[0];
    document.getElementById('checkoutdate_admin').value = checkoutObj.roomCheckoutDateByAdmin || '';
    document.getElementById('checkout_approval').value = checkoutObj.adminApprovalForCheckout;
    hostelInfo = hostelDetails;
  }
}

approveCheckout.addEventListener('click', () => {
  let adminDate = document.getElementById('checkoutdate_admin').value;
  let status = document.getElementById('checkout_approval').value;
  if (adminDate != '' && status != 'approved') {
    storeCheckoutDetails(adminDate);
  }
  else {
    alert("Checkout is done.")
  }
});
async function storeCheckoutDetails(adminDate) {

  let sharing_childer_previous_bedCount = 0;
  let room_childer_previous_bedCount = 0;
  const dbref = ref(db);
  console.log("Hostel details/" + hostelInfo[1] + '/rooms/' + hostelInfo[2] + '/' + hostelInfo[3])
  console.log("Hostel details/" + hostelInfo[1] + '/rooms/' + hostelInfo[2] + '/' + hostelInfo[3] + '/rooms/' + hostelInfo[4] + '/' + hostelInfo[5])
  await get(child(dbref, "Hostel details/" + hostelInfo[1] + '/rooms/' + hostelInfo[2] + '/' + hostelInfo[3]))
    .then(async (snapshot) => {
      console.log(snapshot.val().bedsAvailable)
      sharing_childer_previous_bedCount = snapshot.val().bedsAvailable;
      await get(child(dbref, "Hostel details/" + hostelInfo[1] + '/rooms/' + hostelInfo[2] + '/' + hostelInfo[3] + '/rooms/' + hostelInfo[4] + '/' + hostelInfo[5]))
        .then((snapshot) => {
          room_childer_previous_bedCount = snapshot.val().bedsAvailable;
        })
        .catch((error) => {
          alert(error);
        });
    })
    .catch((error) => {
      alert(error);
    });

  await update(ref(db, "Hostel details/" + hostelInfo[1] + '/rooms/' + hostelInfo[2] + '/' + hostelInfo[3]), {
    bedsAvailable: (Number(sharing_childer_previous_bedCount) + 1)
  })
    .then(async () => {
      await update(ref(db, "Hostel details/" + hostelInfo[1] + '/rooms/' + hostelInfo[2] + '/' + hostelInfo[3] + '/rooms/' + hostelInfo[4] + '/' + hostelInfo[5]), {
        bedsAvailable: (Number(room_childer_previous_bedCount) + 1)

      })
        .then(async () => {
          await update(ref(db, "Hostel details/" + hostelInfo[1] + '/rooms/' + hostelInfo[2] + '/' + hostelInfo[3] + '/rooms/' + hostelInfo[4] + '/' + hostelInfo[5] + '/beds/' + hostelInfo[6]), {
            status: "not booked",
            checkoutDate: adminDate,
            adminApprovalForCheckout: "approved"

          })
            .then(async () => {
              await update(ref(db, "User details/" + userUid + '/Bookings/' + hostelInfo[0] + '/RoomDetails/'), {
                roomCheckoutDateByAdmin: adminDate,
                adminApprovalForCheckout: "approved"

              })
                .then(() => {
                  alert("Approved Successfully");
                  location.reload();
                })
                .catch((error) => {
                  alert(error);
                });
            })
        })
    })
    .catch((error) => {
      alert(error);
    });
  console.log(sharing_childer_previous_bedCount, room_childer_previous_bedCount)


}
let hostelInfo = [];
updateVacationBtn.addEventListener('click', () => {
  let from = document.getElementById('vacation_fromdate').value;
  let to = document.getElementById('vacation_todate').value;
  console.log("User details/" + userUid + '/Bookings/' + hostelInfo[0] + '/RoomDetails/Vacation/')
  if (from != '' && to != '') {
    update(ref(db, "User details/" + userUid + '/Bookings/' + hostelInfo[0] + '/RoomDetails/Vacation/'), {
      fromDate: from,
      toDate: to,
      vacationstatus: 'yes vacation' + '/' + userUid + '/' + from + '/' + to,
    })
      .then(() => {
        let bedId = hostelInfo[6];
        update(ref(db, "Hostel details/" + hostelInfo[1] + '/Rooms on Vacation/' + hostelInfo[2] + '/' + hostelInfo[5] + '/beds/'), {
          [bedId]: 'yes vacation' + '/' + userUid + '/' + from + '/' + from,
        })
          .then(() => {
            alert("Vacation updated");
            location.reload();
          })
          .catch((error) => {
            alert(error);
          });
      })
      .catch((error) => {
        alert(error);
      });
  }
  else {
    alert("please enter dates for vacation.")
  }
});

cancelVacationBtn.addEventListener('click', () => {
  let from = "";
  let to = "";
  console.log("User details/" + userUid + '/Bookings/' + hostelInfo[0] + '/RoomDetails/Vacation/')
  update(ref(db, "User details/" + userUid + '/Bookings/' + hostelInfo[0] + '/RoomDetails/Vacation/'), {
    fromDate: from,
    toDate: to,
    vacationstatus: 'no vacation' + '/' + userUid + '/' + from + '/' + to,
  })
    .then(() => {
      let bedId = hostelInfo[6];
      update(ref(db, "Hostel details/" + hostelInfo[1] + '/Rooms on Vacation/' + hostelInfo[2] + '/' + hostelInfo[5] + '/beds/'), {
        [bedId]: 'no vacation' + '/' + userUid + '/' + from + '/' + from,
      })
        .then(() => {
          alert("Vacation Cancelled for this Room");
          location.reload();
        })
        .catch((error) => {
          alert(error);
        });
    })
    .catch((error) => {
      alert(error);
    });
})

function fillVacationDetails(vacationObj, hostelDetails) {
  console.log(JSON.stringify(vacationObj))
  document.getElementById('vacation_fromdate').value = "";
  document.getElementById('vacation_todate').value = "";
  if (vacationObj != undefined) {
    console.log(vacationObj.fromDate)
    hostelInfo = hostelDetails;
    document.getElementById('vacation_fromdate').value = vacationObj.fromDate;
    document.getElementById('vacation_todate').value = vacationObj.toDate;
  }

}
// window.addEventListener('DOMContentLoaded', prefillAdditionalDetails);