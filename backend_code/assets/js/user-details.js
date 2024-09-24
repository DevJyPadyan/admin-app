import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, onValue, child, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase();

let userList = [];
let flag = 0;
let tbody = document.getElementById("tbody1");

/// Remove functionality code
const removeUser = (event, userName) => {
    event.stopPropagation(); // Prevent the row click event from triggering

    // Show confirmation alert box
    const userConfirmed = window.confirm(`Are you sure you want to delete the user: ${userName}?`);

    // If the user confirms deletion
    if (userConfirmed) {
        const rowRef = ref(db, `User details/${userName}`); // Firebase reference to the user

        remove(rowRef)
            .then(() => {
                alert(`${userName} removed successfully!`);
                SelectAlldataReal();  // Refresh data after removal
            })
            .catch((error) => {
                alert("Error removing user: " + error.message);
            });
    } else {
        console.log('Deletion cancelled by the user.');
    }
};

//Functionality for editing a data//
function view() {
    var table = document.getElementById('table_id');
    var cells = table.getElementsByTagName('td');

    for (var i = 0; i < cells.length; i++) {
        // Take each cell
        var cell = cells[i];
        // do something on onclick event for cell
        cell.onclick = function () {
            // Get the row id where the cell exists
            var rowId = this.parentNode.rowIndex;
            var table = document.getElementById('table_id');
            var rowsNotSelected = table.getElementsByTagName('tr');

            // Unselect previous rows
            for (var row = 0; row < rowsNotSelected.length; row++) {
                rowsNotSelected[row].style.backgroundColor = "";
                rowsNotSelected[row].classList.remove('selected');
            }

            // Select the clicked row
            var rowSelected = table.getElementsByTagName('tr')[rowId];
            rowSelected.style.backgroundColor = "orange";
            rowSelected.className += " selected";

            // Get total number of cells
            var totalCells = rowSelected.cells.length;

            // Safely access the paymentComplete field
            var paymentComplete = totalCells > 25 ? rowSelected.cells[25].innerHTML : 'N/A';

            // Fetch other fields (ensure indices match)
            var userName = rowSelected.cells[1].innerHTML;
            var userFullName = rowSelected.cells[2].innerHTML;
            var userGender = rowSelected.cells[3].innerHTML;
            var userPhone = rowSelected.cells[4].innerHTML;
            var userEmail = rowSelected.cells[5].innerHTML;
            var userAddress1 = rowSelected.cells[6].innerHTML;
            var userAddress2 = rowSelected.cells[7].innerHTML;
            var userCity = rowSelected.cells[8].innerHTML;
            var userState = rowSelected.cells[9].innerHTML;
            var userPin = rowSelected.cells[10].innerHTML;

            var guardName = rowSelected.cells[11].innerHTML;
            var guardRelation = rowSelected.cells[12].innerHTML;
            var guardPhone = rowSelected.cells[13].innerHTML;
            var guardEmail = rowSelected.cells[14].innerHTML;
            var guardAddress1 = rowSelected.cells[15].innerHTML;
            var guardAddress2 = rowSelected.cells[16].innerHTML;
            var guardCity = rowSelected.cells[17].innerHTML;
            var guardState = rowSelected.cells[18].innerHTML;
            var guardPin = rowSelected.cells[19].innerHTML;

            var roomType = rowSelected.cells[20].innerHTML;
            var floorNumber = rowSelected.cells[21].innerHTML;
            var AirConditioning = rowSelected.cells[22].innerHTML;
            var roomPrice = rowSelected.cells[23].innerHTML;
            var hostelName = rowSelected.cells[24].innerHTML;

            // Store data in localStorage
            var data = [];
            data.push(userName);
            data.push(userFullName);
            data.push(userGender);
            data.push(userPhone);
            data.push(userEmail);
            data.push(userAddress1);
            data.push(userAddress2);
            data.push(userCity);
            data.push(userState);
            data.push(userPin);
            data.push(guardName);
            data.push(guardRelation);
            data.push(guardPhone);
            data.push(guardEmail);
            data.push(guardAddress1);
            data.push(guardAddress2);
            data.push(guardCity);
            data.push(guardState);
            data.push(guardPin);
            data.push(roomType);
            data.push(floorNumber);
            data.push(AirConditioning);
            data.push(roomPrice);
            data.push(hostelName);
            data.push(paymentComplete);

            const dbRef = ref(db, `User details/${userName}/password1`);
            get(dbRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const password1 = snapshot.val();  // Password fetched from Firebase

                    // Add the password to localStorage
                    data.push(password1);
                    localStorage.setItem('userDetails', JSON.stringify(data));
                    window.location.href = "././edit-users.html";
                    console.log("User details with password:", data);
                } else {
                    console.log("No password found for user: " + userName);
                }
            }).catch((error) => {
                console.error("Error fetching password: ", error);
            });
        }
    }
}
//Function which is used to fetch details from firebase database
const SelectAlldataReal = () => {
    const dbref = ref(db, 'User details');
    onValue(dbref, (snapshot) => {
        userList = [];
        snapshot.forEach(u => {
            userList.push(u.val());
        })
        AddAllRecords();
    });
}

function loadOrderDetails(user) {
    const dbref = ref(db, `User details/${user.userName}/Bookings/`);
    onValue(dbref, (snapshot) => {
        let ordersList = [];
        snapshot.forEach(h => {
            ordersList.push(h.val());
        });

        const bookingDetails = ordersList.length > 0 ? ordersList[0].RoomDetails : null; // Get first booking details
        AddsingleRecord(user, bookingDetails);
    });
}

// Function to append data to table
const AddsingleRecord = (user, bookingDetails) => {
    var trow = document.createElement('tr');
    flag++;

    // User details
    var cells = [
        flag,
        user.userName || 'N/A',
        user.userFullName || 'N/A',
        user.userGender || 'N/A',
        user.userPhone || 'N/A',
        user.userEmail || 'N/A',
        user.userAddress1 || 'N/A',
        user.userAddress2 || 'N/A',
        user.userCity || 'N/A',
        user.userState || 'N/A',
        user.userPin || 'N/A',
        user.guardName || 'N/A',
        user.guardRelation || 'N/A',
        user.guardPhone || 'N/A',
        user.guardEmail || 'N/A',
        user.guardAddress1 || 'N/A',
        user.guardAddress2 || 'N/A',
        user.guardCity || 'N/A',
        user.guardState || 'N/A',
        user.guardPin || 'N/A'
    ];

    // Booking details
    if (bookingDetails) {
        cells.push(
            bookingDetails.roomType || 'N/A',
            bookingDetails.floor || 'N/A',
            bookingDetails.ac || 'N/A',
            bookingDetails.totalAmount || 'N/A',
            bookingDetails.paymentComplete || 'N/A'
        );
    } else {
        cells.push('N/A', 'N/A', 'N/A', 'N/A', 'N/A');
    }

    cells.forEach(data => {
        var td = document.createElement('td');
        td.innerHTML = data;
        trow.appendChild(td);
    });

    // Remove button - append before the paymentComplete cell
    var removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.innerHTML = '<i class="fas fa-trash"></i>';
    removeButton.onclick = function (event) {
        event.stopPropagation(); // Prevent row click event
        removeUser(event, user.userName);
    };

    var tdRemoveButton = document.createElement('td');
    tdRemoveButton.appendChild(removeButton);

    // Append the delete button at the end
    trow.appendChild(tdRemoveButton);

    tbody.append(trow);
};

// Function to add all records
const AddAllRecords = () => {
    flag = 0;
    tbody.innerHTML = "";
    userList.forEach(user => {
        loadOrderDetails(user); // Load order details for each user
    });
    view();
}

window.addEventListener('load', SelectAlldataReal);
