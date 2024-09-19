import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, onValue, child, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"
import { firebaseConfig } from "./firebase-config.js";


const app = initializeApp(firebaseConfig);
const db = getDatabase();

let userList = [];
let flag = 0;
let tbody = document.getElementById("tbody1");

//Remove functionality code 
const removeHostel = (event, userName) => {
    event.stopPropagation(); // Prevent the row click event (i.e this function will work when delete button is clicked)

    const rowRef = ref(db, `User details/${userName}`);
    remove(rowRef)
        .then(() => {
            alert(`${userName} removed successfully!`);
            SelectAlldataReal();  // Refresh data after removal
        })
        .catch((error) => {
            alert("Error removing record: " + error.message);
        });
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

            var rowsNotSelected = table.getElementsByTagName('tr');
            
            for (var row = 0; row < rowsNotSelected.length; row++) {
                rowsNotSelected[row].style.backgroundColor = "";
                rowsNotSelected[row].classList.remove('selected');
            }
            var rowSelected = table.getElementsByTagName('tr')[rowId];

            rowSelected.style.backgroundColor = "orange";
            rowSelected.className += " selected";
            var userName = rowSelected.cells[1].innerHTML;
            var userFullName = rowSelected.cells[2].innerHTML;
            var userGender = rowSelected.cells[3].innerHTML;
            var userPhone = rowSelected.cells[4].innerHTML;  // Corrected this to fetch phone
            var userEmail = rowSelected.cells[5].innerHTML;  // Corrected this to fetch email
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
            localStorage.setItem('userDetails', JSON.stringify(data));
            window.location.href = 'edit-users.html';

        }
    }
}

//Function which is used to fetch details from firebase database
const SelectAlldataReal = () => {
    const dbref = ref(db, 'User details');
    onValue(dbref, (snapshot) => {

        userList = [];
        snapshot.forEach(u=> {
            userList.push(u.val());
        })
        AddAllRecords();

    })

}

//Function which is used to append the data from firebase database to table
const AddsingleRecord = (userName,userFullName,userGender,userPhone,userEmail,userAddress1,userAddress2,userCity,userState,userPin,
    guardName,guardRelation,guardPhone,guardEmail,guardAddress1,guardAddress2,guardCity,guardState,guardPin,roomType,floorNumber,
    AirConditioning,roomPrice) => {

    var trow = document.createElement('tr');
    var td1 = document.createElement('td');
    var td2 = document.createElement('td');
    var td3 = document.createElement('td');
    var td4 = document.createElement('td');
    var td5 = document.createElement('td');
    var td6 = document.createElement('td');
    var td7 = document.createElement('td');
    var td8 = document.createElement('td');
    var td9 = document.createElement('td');
    var td10 = document.createElement('td');
    var td11 = document.createElement('td');
    var td12 = document.createElement('td');
    var td13 = document.createElement('td');
    var td14 = document.createElement('td');
    var td15 = document.createElement('td');
    var td16 = document.createElement('td');
    var td17 = document.createElement('td');
    var td18 = document.createElement('td');
    var td19 = document.createElement('td');
    var td20 = document.createElement('td');
    var td21 = document.createElement('td');
    var td22 = document.createElement('td');
    var td23 = document.createElement('td');
    var td24 = document.createElement('td');
    var td25 = document.createElement('td');



    flag = flag + 1;
    td1.innerHTML = flag;
    td2.innerHTML = userName;
    td3.innerHTML = userFullName;
    td4.innerHTML = userGender;
    td5.innerHTML = userPhone;
    td6.innerHTML = userEmail;
    td7.innerHTML = userAddress1;
    td8.innerHTML = userAddress2;
    td9.innerHTML = userCity;
    td10.innerHTML = userState;
    td11.innerHTML = userPin;
    td12.innerHTML = guardName;
    td13.innerHTML = guardRelation;
    td14.innerHTML = guardPhone;
    td15.innerHTML = guardEmail;
    td16.innerHTML = guardAddress1;
    td17.innerHTML = guardAddress2;
    td18.innerHTML = guardCity;
    td19.innerHTML = guardState;
    td20.innerHTML = guardPin;
    td21.innerHTML = roomType;
    td22.innerHTML = floorNumber;
    td23.innerHTML = AirConditioning;
    td24.innerHTML = roomPrice;

    var removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.innerHTML = '<i class="fas fa-trash"></i>';
    removeButton.onclick = function (event) {
        event.stopPropagation(); // Prevent row click event
        removeHostel(event, userName);
    };
    td25.appendChild(removeButton);

    trow.append(td1, td2, td3, td4, td5, td6, td7, td8, td9, td10, td11, td12, td13, td14,td15,td16,td17,td18,td19,td20,td21,td22,td23,td24,td25);
    tbody.append(trow);

}

// Updated function to retrieve both user and booking records
const AddAllRecords = () => {
    flag = 0;
    tbody.innerHTML = "";
    userList.forEach(u => {
        // Fetch bookings details separately
        const userRef = ref(db, "User details/" + u.userName + "/Bookings");
        get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                const bookings = snapshot.val();
                AddsingleRecord(
                    u.userName, u.userFullName, u.userGender, u.userPhone, u.userEmail,
                    u.userAddress1, u.userAddress2, u.userCity, u.userState, u.userPin,
                    u.guardName, u.guardRelation, u.guardPhone, u.guardEmail,
                    u.guardAddress1, u.guardAddress2, u.guardCity, u.guardState, u.guardPin,
                    bookings.roomType, bookings.floor, bookings.airConditioning, bookings.roomPrice
                );
            } else {
                // If no bookings exist, pass empty values for room details
                AddsingleRecord(
                    u.userName, u.userFullName, u.userGender, u.userPhone, u.userEmail,
                    u.userAddress1, u.userAddress2, u.userCity, u.userState, u.userPin,
                    u.guardName, u.guardRelation, u.guardPhone, u.guardEmail,
                    u.guardAddress1, u.guardAddress2, u.guardCity, u.guardState, u.guardPin,
                    "", "", "", "" // No booking details
                );
            }
        }).catch((error) => {
            console.error(error);
        });
    });
    view();
}

// Trigger data fetching when the window is loaded
window.addEventListener('load', SelectAlldataReal);
