import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, child, update, remove, push, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getStorage, ref as ref2, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase();
const storage = getStorage(app);


const tbody = document.getElementById("tbody1");


// Fetch room details for the selected hostel
async function populateHostelDropdown1() {
    const hostelDropdown1 = document.getElementById("hostelDropdown1");
    const hostelsRef = ref(db, "Hostel details/");

    try {
        console.log("Fetching hostels from Firebase...");
        const snapshot = await get(hostelsRef);
        console.log("Snapshot received:", snapshot.exists(), snapshot.val());

        if (snapshot.exists()) {
            const hostels = snapshot.val();
            console.log("Hostels data:", hostels);

            hostelDropdown1.innerHTML = '<option value="">Select Hostel</option>';
            for (let hostelName in hostels) {
                let option = document.createElement("option");
                option.value = hostelName;
                option.text = hostelName;
                hostelDropdown1.appendChild(option);
            }

            // Log the dropdown element to ensure it's correctly referenced
            console.log("Dropdown populated:", hostelDropdown1.innerHTML);

            // Attach the event listener here
            hostelDropdown1.addEventListener("change", async function () {
                console.log("Dropdown change event triggered"); // Check if this log shows up
                const hostelName = this.value; // Get the selected hostel name
                console.log("Selected Hostel:", hostelName); // Log the selected hostel name
                tbody.innerHTML = '';//clearing table rows fully, when user/admin changes the hostel name
                if (hostelName) {
                    await fetchRoomDetails(hostelName); // Ensure this function is correctly defined and returns a promise
                } else {
                    alert("Please select a valid hostel.");
                }
            });
        } else {
            console.log("No hostels found.");
        }
    } catch (error) {
        console.error("Error fetching hostels for hostelDropdown1:", error);
    }
}
window.addEventListener('DOMContentLoaded', populateHostelDropdown1);

// Fetch bed details of the room based on selected hostel and calculate the vacancy
async function fetchRoomDetails(hostelName) {
    console.log("Fetching room details for:", hostelName); // Log to see if this function is called
    const roomsRef = ref(db, `Hostel details/${hostelName}/rooms/`);

    try {
        const snapshot = await get(roomsRef);
        console.log("Room details snapshot received:", snapshot.exists(), snapshot.val());
        let expenseId = 1
        if (snapshot.exists()) {
            const rooms = snapshot.val();
            for (let floor in rooms) {
                for (let room in rooms[floor]) {
                    const roomData = rooms[floor][room];
                    let bedCount = [];
                    let bedBooked = 0;
                    let bedNotbooked = 0;
                    for (let bed in roomData.beds) {
                        bedCount.push(bed);
                        const bedData = roomData.beds[bed];
                        if (bedData == 'booked') {
                            bedBooked++;
                        }
                        else if (bedData == 'not booked') {
                            bedNotbooked++;
                        }
                    }
                    // Append data to the table
                    appendExpenseRow(
                        expenseId++,
                        roomData.floor,
                        roomData.roomNumber,
                        roomData.roomType + ", " + roomData.ac + " " + roomData.bathroom + ", " + roomData.amenities,
                        roomData.price,
                        bedCount.length,
                        bedNotbooked,
                        bedBooked,
                    );
                }
            }
        } else {
            console.log("No rooms found for this hostel.");
        }
    } catch (error) {
        console.error("Error fetching room details:", error);
    }
}


// Function to append a single expense record to the table
const appendExpenseRow = (
    id,
    floor,
    roomNo,
    roomType,
    roomPrice,
    totalBeds,
    availableBedsCount,
    bookedBedsCount
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


    td1.innerText = id;
    td2.innerText = floor;
    td3.innerText = roomNo;
    td4.innerText = roomType;
    td5.innerText = roomPrice;
    td6.innerText = totalBeds;
    td7.innerText = availableBedsCount;
    td8.innerText = bookedBedsCount;

    var detailsButton = document.createElement('a');
    detailsButton.innerHTML = '<a data-bs-toggle="modal" data-bs-target="#viewRoomDetails" style="cursor:pointer; color:orange; text-decoration: underline">Deatils </a>';
    detailsButton.onclick = function (event) {
        event.stopPropagation(); // Prevent row click event
        loadBedView(floor, roomNo);
    };

    // Remove reference to the removed columns
    // Example: Append the remove button to the correct column
    td9.appendChild(detailsButton);

    trow.append(td1, td2, td3, td4, td5, td6, td7, td8, td9);
    tbody.appendChild(trow);
};

/**
 * loading the bed view for that particular hostel's floor is clicked via details td in the table.
 * @param {*} floor 
 * @param {*} roomNo 
 */
function loadBedView(floor, roomNo) {
    const hostelName = document.getElementById("hostelDropdown1").value;
    const dbref = ref(db, 'Hostel details/' + hostelName + '/rooms/' + "floor" + floor + '/' + "room" + roomNo + '/beds');
    let hostelBedAvailability = []
    onValue(dbref, (snapshot) => {
        console.log(snapshot)
        hostelBedAvailability = [];
        const parentContainer = document.getElementById('bedParent');
        parentContainer.innerHTML = '';//removing the previous loaded data and setting it up freshly in the below for loop.
        snapshot.forEach(iterator => {
            console.log(iterator.val())
            hostelBedAvailability.push(iterator.val());
            const elem = document.createElement('div');
            elem.classList.add('card');
            //if room is already booked, then blocking the user not to select the room.
            if (iterator.val() == 'booked') {
                elem.style.backgroundColor = "#FF7F7F";
                elem.style.border = "1px solid #FF7F7F"
                elem.style.color = "red";
                elem.style.pointerEvents = "none";
            }
            else {
                elem.style.backgroundColor = "white";
                elem.style.border = "1px solid black"
                elem.style.pointerEvents = "none";
            }
            elem.innerHTML = `<div class="card-body">Bed - ${iterator.val()}</div>`;
            parentContainer.appendChild(elem);
        })
    })
    console.log(hostelBedAvailability, 'Hostel details/' + hostelName + '/rooms/' + "floor" + floor + '/' + "room" + roomNo + '/beds');


    // let bedId = 'bed ' + i;
    // elem.setAttribute("id", bedId);
    // elem.dataset.bedId = bedId;
    // elem.addEventListener('click', bedSelection);

}
// Call the function to fetch and display data on page load
// window.addEventListener("load", fetchAndDisplayExpenses);