import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, onValue, child, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"
import { firebaseConfig } from "./firebase-config.js";
import { export_table_to_csv } from "././export-table.js"


const app = initializeApp(firebaseConfig);
const db = getDatabase();

let userList = [];
let flag = 0;
let tbody = document.getElementById("tbody1");

/// Remove functionality code
const removeUser = async (event, userName) => {
    event.stopPropagation(); // Prevent the row click event from triggering

    // Show confirmation alert box
    const userConfirmed = window.confirm(`Are you sure you want to delete the user: ${userName}?`);

    // If the user confirms deletion
    if (userConfirmed) {
        try {
            // Reference to the 'User details' node in Firebase
            const usersRef = ref(db, 'User details');

            // Fetch all user data
            const userSnapshot = await get(usersRef);

            if (userSnapshot.exists()) {
                const usersData = userSnapshot.val();

                // Find the user UID based on userName
                let userUid = null;
                for (const [uid, userDetails] of Object.entries(usersData)) {
                    if (userDetails.userName === userName) {
                        userUid = uid;
                        break;
                    }
                }

                // If userUid is found, proceed with removal
                if (userUid) {
                    const userRef = ref(db, `User details/${userUid}`); // Reference to the user details

                    // Remove the user data
                    await remove(userRef);
                    alert(`${userName} removed successfully!`);

                    // Refresh the data after removal
                    SelectAlldataReal();
                } else {
                    alert(`User: ${userName} not found.`);
                }
            } else {
                alert("No users found in the database.");
            }
        } catch (error) {
            alert("Error removing user: " + error.message);
        }
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

            localStorage.setItem('userDetailsAmin', JSON.stringify(data));
            console.log(data);
            // Redirect to edit-users.html
            window.location.href = "././edit-users.html";

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
    const userUid = user.userUid; // Access the userUid ID of the user

    if (!userUid) {
        console.warn("Unique ID is not defined for the user object:", user);
        return;
    }

    // Fetch bookings under 'User details/{userUid}/Bookings/'
    const dbref = ref(db, `User details/${userUid}/Bookings/`);
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

//exporting table as CSV file.
// export_table_btn.addEventListener("click", function () {
//     export_table_to_csv("users_table.csv", "table_id");
// });