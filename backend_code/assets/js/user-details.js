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
            var userEmail = rowSelected.cells[4].innerHTML;
            var userAddress1 = rowSelected.cells[5].innerHTML;
            var userAddress2 = rowSelected.cells[6].innerHTML;
            var userCity = rowSelected.cells[7].innerHTML;
            var userState=rowSelected.cells[8].innerHTML;
            var userPin = rowSelected.cells[9].innerHTML;
            var password1 = rowSelected.cells[10].innerHTML;
            var password2 = rowSelected.cells[11].innerHTML;
            var roomType = rowSelected.cells[12].innerHTML;
            var floorNumber = rowSelected.cells[13].innerHTML;
            var AirConditioning = rowSelected.cells[14].innerHTML;
            var roomPrice = rowSelected.cells[15].innerHTML;
            var data = [];
            data.push(userName);
            data.push(userFullName);
            data.push(userGender);
            data.push(userEmail);
            data.push(userAddress1);
            data.push(userAddress2);
            data.push(userCity);
            data.push(userState);
            data.push(userPin);
            data.push(password1);
            data.push(password2);
            data.push(roomType);
            data.push(floorNumber);
            data.push(AirConditioning);
            data.push(roomPrice);
            localStorage.setItem('userDetails', JSON.stringify(data));
            console.log(data);
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
const AddsingleRecord = (userName,userFullName,userGender,userPhone,userEmail,userAddress1,userAddress2,userCity,userState,userPin,password1,roomType,floorNumber,
    AirConditioning,roomPrice
) => {

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
    td12.innerHTML = password1;
    td13.innerHTML = roomType;
    td14.innerHTML = floorNumber;
    td15.innerHTML = AirConditioning;
    td16.innerHTML = roomPrice;

    var removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.innerHTML = '<i class="fas fa-trash"></i>';
    removeButton.onclick = function (event) {
        event.stopPropagation(); // Prevent row click event
        removeHostel(event, userName);
    };
    td17.appendChild(removeButton);

    trow.append(td1, td2, td3, td4, td5, td6, td7, td8, td9, td10, td11, td12, td13, td14,td15,td16,td17);
    tbody.append(trow);

}

const AddAllRecords = () => {
    flag = 0;
    tbody.innerHTML = "";
    userList.forEach(u => {
        AddsingleRecord(u.userName,u.userFullName,u.userGender,u.userPhone,u.userEmail,u.userAddress1,u.userAddress2,u.userCity,u.userState,u.userPin,u.password1,u.roomType,u.floorNumber,
            u.AirConditioning,u.roomPrice)
    })
    view();
}

window.addEventListener('load', SelectAlldataReal);