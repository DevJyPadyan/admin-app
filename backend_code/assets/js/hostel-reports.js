import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, child, update, remove, push, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getStorage, ref as ref2, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";
import { export_table_to_csv } from "././export-table.js"

const app = initializeApp(firebaseConfig);
const db = getDatabase();
const storage = getStorage(app);

hostelDropdown3.addEventListener("change", function () {
    let option = this.value;
    if (option == 'vacancy') {
        document.getElementById('vacancy-table-div').style.display = 'block';
        document.getElementById('beds-table-div').style.display = 'none';
    }

    if (option == 'rooms') {
        document.getElementById('beds-table-div').style.display = 'block';
        document.getElementById('vacancy-table-div').style.display = 'none';
    }

});

const tbody = document.getElementById("tbody1");
const tbody2 = document.getElementById("tbody2");

// Fetch hostel details for the selected dropdown
async function populateHostelDropdown1() {
    const hostelDropdown1 = document.getElementById("hostelDropdown1");
    const hostelsRef = ref(db, "Hostel details/");

    try {
        console.log("Fetching hostels from Firebase...");
        const snapshot = await get(hostelsRef);

        if (snapshot.exists()) {
            const hostels = snapshot.val();
            hostelDropdown1.innerHTML = '<option value="">Select Hostel</option>';

            for (let hostelName in hostels) {
                let option = document.createElement("option");
                option.value = hostelName;
                option.text = hostelName;
                hostelDropdown1.appendChild(option);
            }

            hostelDropdown1.addEventListener("change", async function () {
                const hostelName = this.value;
                tbody.innerHTML = ""; // Clear existing rows
                if (hostelName) {
                    await fetchRoomDetails(hostelName);
                } else {
                    alert("Please select a valid hostel.");
                }
            });
        } else {
            console.log("No hostels found.");
        }
    } catch (error) {
        console.error("Error fetching hostels:", error);
    }
}
window.addEventListener("DOMContentLoaded", populateHostelDropdown1);

// Fetch room details for a selected hostel and render table
let rowsData = [];
let currentPage = 1;
const rowsPerPage = 7;

async function fetchRoomDetails(hostelName) {
    const roomsRef = ref(db, `Hostel details/${hostelName}/rooms/`);
    try {
        const snapshot = await get(roomsRef);
        let expenseId = 1;

        if (snapshot.exists()) {
            const rooms = snapshot.val();
            rowsData = [];
            for (let floor in rooms) {
                for (let type in rooms[floor]) {
                    for (let ac in rooms[floor][type].rooms) {
                        for (let singleRoom in rooms[floor][type].rooms[ac]) {
                            const roomData = rooms[floor][type].rooms[ac][singleRoom];
                            let bedCount = [];
                            let bedBooked = 0;
                            let bedNotBooked = 0;

                            for (let bed in roomData.beds) {
                                bedCount.push(bed);

                                const bedData = roomData.beds[bed].status;
                                if (bedData == 'booked') {
                                    bedBooked++;
                                } else if (bedData === "not booked") {
                                    bedNotBooked++;
                                }
                            }

                            rowsData.push({
                                id: expenseId++,
                                floor: roomData.floor,
                                roomNo: roomData.roomNumber,
                                roomType: `${roomData.roomType}, ${roomData.ac}, ${roomData.bathroom}, ${roomData.amenities}`,
                                roomPrice: roomData.price,
                                totalBeds: bedCount.length,
                                availableBedsCount: bedNotBooked,
                                bookedBedsCount: bedBooked,
                            });
                        }
                    }
                }
            }
            renderTable();
        } else {
            console.log("No rooms found for this hostel.");
        }
    } catch (error) {
        console.error("Error fetching room details:", error);
    }
}

// Render table rows and handle pagination
function renderTable() {
    tbody.innerHTML = "";
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, rowsData.length);

    for (let i = startIndex; i < endIndex; i++) {
        const row = rowsData[i];
        appendExpenseRow(
            row.id,
            row.floor,
            row.roomNo,
            row.roomType,
            row.roomPrice,
            row.totalBeds,
            row.availableBedsCount,
            row.bookedBedsCount
        );
    }

    updatePaginationControls();
}

function appendExpenseRow(
    id,
    floor,
    roomNo,
    roomType,
    roomPrice,
    totalBeds,
    availableBedsCount,
    bookedBedsCount
) {
    const trow = document.createElement("tr");

    trow.innerHTML = `
        <td>${id}</td>
        <td>${floor}</td>
        <td>${roomNo}</td>
        <td>${roomType}</td>
        <td>${roomPrice}</td>
        <td>${totalBeds}</td>
        <td>${availableBedsCount}</td>
        <td>${bookedBedsCount}</td>
        <td>
            <a data-bs-toggle="modal" data-bs-target="#viewRoomDetails" style="cursor:pointer; color:orange; text-decoration:underline">View beds</a>
        </td>
    `;

    trow.querySelector("a").addEventListener("click", (event) => {
        event.stopPropagation();
        loadBedView(floor, roomNo, roomType);
    });

    tbody.appendChild(trow);
}

function updatePaginationControls() {
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = "";
    const totalPages = Math.ceil(rowsData.length / rowsPerPage);

    // Previous Button
    const prevLink = document.createElement("a");
    prevLink.innerText = "Prev";
    prevLink.href = "#";
    prevLink.className = currentPage === 1 ? "disabled" : "";
    prevLink.addEventListener("click", (event) => {
        event.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });
    paginationContainer.appendChild(prevLink);

    // Page Numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.createElement("a");
        pageLink.innerText = i;
        pageLink.href = "#";
        pageLink.className = i === currentPage ? "active" : "";
        pageLink.addEventListener("click", (event) => {
            event.preventDefault();
            currentPage = i;
            renderTable();
        });
        paginationContainer.appendChild(pageLink);
    }

    // Next Button
    const nextLink = document.createElement("a");
    nextLink.innerText = "Next";
    nextLink.href = "#";
    nextLink.className = currentPage === totalPages ? "disabled" : "";
    nextLink.addEventListener("click", (event) => {
        event.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });
    paginationContainer.appendChild(nextLink);
}



/**
 * loading the bed view for that particular hostel's floor is clicked via details td in the table.
 * @param {*} floor 
 * @param {*} roomNo 
 */
async function loadBedView(floor, roomNo, roomType) {
    const hostelName = document.getElementById("hostelDropdown1").value;
    let details = roomType.split(', ')
    const dbref = ref(db, 'Hostel details/' + hostelName + '/rooms/' + "floor" + floor + '/' + details[0] + '/rooms/' + details[1] + '/room' + roomNo + '/beds');
    let hostelBedAvailability = []
    await onValue(dbref, (snapshot) => {
        console.log(snapshot)
        hostelBedAvailability = [];
        const parentContainer = document.getElementById('bedParent');
        parentContainer.innerHTML = '';//removing the previous loaded data and setting it up freshly in the below for loop.
        let beds = snapshot.val();
        // console.log(JSON.stringify(beds))
        for(let key in beds){
            let bed = beds[key];
            // console.log(JSON.stringify(bed))
            hostelBedAvailability.push(bed.status);
            const elem = document.createElement('div');
            elem.classList.add('card');
            //if room is already booked, then blocking the user not to select the room.
            if (bed.status == 'booked') {
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
            elem.innerHTML = `<div class="card-body">${key} - ${bed.status}</div>`;
            parentContainer.appendChild(elem);
        }
        // snapshot.forEach(iterator => {
        //     console.log(iterator.val().status)
            
        // })
    })
    console.log(hostelBedAvailability, 'Hostel details/' + hostelName + '/rooms/' + "floor" + floor + '/' + details[0] + '/rooms/' + details[1] + '/room' + roomNo + '/beds');


    // let bedId = 'bed ' + i;
    // elem.setAttribute("id", bedId);
    // elem.dataset.bedId = bedId;
    // elem.addEventListener('click', bedSelection);

}
// Call the function to fetch and display data on page load
// window.addEventListener("load", fetchAndDisplayExpenses);




// Fetch vacancy details for the selected hostel
async function populateHostelDropdown2() {
    const hostelDropdown2 = document.getElementById("hostelDropdown2");
    const hostelsRef = ref(db, "Hostel details/");

    try {
        console.log("Fetching hostels from Firebase...");
        const snapshot = await get(hostelsRef);
        console.log("Snapshot received:", snapshot.exists(), snapshot.val());

        if (snapshot.exists()) {
            const hostels = snapshot.val();
            console.log("Hostels data:", hostels);

            hostelDropdown2.innerHTML = '<option value="">Select Hostel</option>';
            for (let hostelName in hostels) {
                let option = document.createElement("option");
                option.value = hostelName;
                option.text = hostelName;
                hostelDropdown2.appendChild(option);
            }

            // Log the dropdown element to ensure it's correctly referenced
            console.log("Dropdown populated:", hostelDropdown2.innerHTML);

            // Attach the event listener here
            hostelDropdown2.addEventListener("change", async function () {
                console.log("Dropdown change event triggered"); // Check if this log shows up
                const hostelName = this.value; // Get the selected hostel name
                console.log("Selected Hostel:", hostelName); // Log the selected hostel name
                tbody2.innerHTML = '';//clearing table rows fully, when user/admin changes the hostel name
                if (hostelName) {
                    await fetchVacancyRoomDetails(hostelName); // Ensure this function is correctly defined and returns a promise
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
// Fetch bed details of the room based on selected hostel and calculate the vacancy
async function fetchVacancyRoomDetails(hostelName) {
    console.log("Fetching room details for:", hostelName); // Log to see if this function is called
    const roomsRef = ref(db, `Hostel details/${hostelName}/Rooms on Vacation/`);

    try {
        const snapshot = await get(roomsRef);
        console.log("Room details snapshot received:", snapshot.exists(), snapshot.val());
        let expenseId = 1
        if (snapshot.exists()) {
            const rooms = snapshot.val();
            console.log(JSON.stringify(rooms))
            for (let floor in rooms) {
                console.log(JSON.stringify(floor))
                for (let room in rooms[floor]) {
                    console.log(JSON.stringify(room))
                    const roomData = rooms[floor][room];
                    let bedCount = [];
                    let bedBooked = 0;
                    let bedNotbooked = 0;
                    let stringArray;
                    for (let bed in roomData.beds) {
                        bedCount.push(bed);
                        const bedData = roomData.beds[bed];
                        console.log(bedData);
                        stringArray = bedData.split('/');
                        let fromDateArray = new Date(stringArray[2]);
                        let toDateArray = new Date(stringArray[3]);
                        let Difference_In_Time = toDateArray.getTime() - fromDateArray.getTime();
                        let Difference_In_Days = Math.round(Difference_In_Time / (1000 * 3600 * 24));
                        console.log(JSON.stringify(roomData),stringArray[0])
                        if (stringArray[0] == 'yes vacation') {
                            bedBooked++;
                            console.log(roomData.floor,roomData.room)
                            // Append data to the table
                            appendExpenseRow2(
                                expenseId++,
                                stringArray[1],
                                floor,
                                room,
                                bed,
                                stringArray[2],
                                stringArray[3],
                                Difference_In_Days
                            );
                        }
                        // else if (bedData == 'not booked') {
                        //     bedNotbooked++;
                        // }
                    }
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
const appendExpenseRow2 = async (
    id,
    username,
    floor,
    roomNo,
    bedId,
    from,
    to,
    totaldays,

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

    const dbref = await ref(db, "User details/" + username);
    let userDbName = username;
    try {
        const h = await get(dbref);
        console.log(JSON.stringify(h))
        if(h){
            userDbName = h.val().userName
        }

    } catch (error) {
        console.error('Error fetching userDetails:', error);
    }

    td1.innerText = id;
    td2.innerText = userDbName;
    td3.innerText = floor;
    td4.innerText = roomNo;
    td5.innerText = bedId;
    td6.innerText = from;
    td7.innerText = to;
    td8.innerText = totaldays;

    var detailsButton = document.createElement('a');
    detailsButton.innerHTML = '<a data-bs-toggle="modal" data-bs-target="#viewUserDetails" style="cursor:pointer; color:orange; text-decoration: underline">User Details</a>';
    detailsButton.onclick = function (event) {
        event.stopPropagation(); // Prevent row click event
        loadUserView(username);
    };

    // Remove reference to the removed columns
    // Example: Append the remove button to the correct column
    td9.appendChild(detailsButton);

    trow.append(td1, td2, td3, td4, td5, td6, td7, td8, td9);
    tbody2.appendChild(trow);
};
window.addEventListener('DOMContentLoaded', populateHostelDropdown2);

async function loadUserView(userUid) {
    console.log(userUid);
    const dbref = await ref(db, "User details/" + userUid);
    try {
        const h = await get(dbref);
        document.getElementById('username').value = h.val().userName;
        document.getElementById('userphone').value = h.val().userPhone;
        document.getElementById('useremail').value = h.val().userEmail;

    } catch (error) {
        console.error('Error fetching floor:', error);
    }
}

//exporting table as CSV file.
//rooms table
// export_table_btn1.addEventListener("click", function () {
//     export_table_to_csv("rooms_table.csv", "table_id");
// });
//vacancy table
// export_table_btn2.addEventListener("click", function () {
//     export_table_to_csv("vacancy_table.csv", "table_id_2");
// });