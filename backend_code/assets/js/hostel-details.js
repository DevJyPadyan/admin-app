import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, onValue, child, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"
import { firebaseConfig } from "./firebase-config.js";
import { export_table_to_csv } from "././export-table.js"

const app = initializeApp(firebaseConfig);
const db = getDatabase();

let hostelist = [];
let flag = 0;
let tbody = document.getElementById("tbody1");
const itemsPerPage = 7; // Number of rows per page
let currentPage = 1; // Current page

// Remove functionality code
const removeHostel = (event, hostelName) => {
    event.stopPropagation(); // Prevent the row click event

    // Show confirmation alert box
    const userConfirmed = window.confirm(`Are you sure you want to delete the hostel: ${hostelName}?`);

    // If the user confirms deletion
    if (userConfirmed) {
        const rowRef = ref(db, `Hostel details/${hostelName}`);
        remove(rowRef)
            .then(() => {
                alert(`${hostelName} removed successfully!`);
                SelectAlldataReal(); // Refresh data after removal
            })
            .catch((error) => {
                alert("Error removing record: " + error.message);
            });
    } else {
        console.log("Deletion cancelled by the user.");
    }
};

// Functionality for editing a data
function view() {
    var table = document.getElementById("table_id");
    var cells = table.getElementsByTagName("td");

    for (var i = 0; i < cells.length; i++) {
        // Take each cell
        var cell = cells[i];
        // Do something on onclick event for cell
        cell.onclick = function () {
            // Get the row id where the cell exists
            var rowId = this.parentNode.rowIndex;

            var rowsNotSelected = table.getElementsByTagName("tr");
            for (var row = 0; row < rowsNotSelected.length; row++) {
                rowsNotSelected[row].style.backgroundColor = "";
                rowsNotSelected[row].classList.remove("selected");
            }
            var rowSelected = table.getElementsByTagName("tr")[rowId];
            rowSelected.style.backgroundColor = "orange";
            rowSelected.className += " selected";
            var hosname = rowSelected.cells[1].innerHTML;
            var hostype = rowSelected.cells[2].innerHTML;
            var hosadd1 = rowSelected.cells[3].innerHTML;
            var hosadd2 = rowSelected.cells[4].innerHTML;
            var hoscity = rowSelected.cells[5].innerHTML;
            var hosstate = rowSelected.cells[6].innerHTML;
            var hosphone = rowSelected.cells[7].innerHTML;
            var hosemail = rowSelected.cells[8].innerHTML;
            var hospin = rowSelected.cells[9].innerHTML;
            var hosfloors = rowSelected.cells[10].innerHTML;
            var data = [];
            data.push(hosname);
            data.push(hostype);
            data.push(hosadd1);
            data.push(hosadd2);
            data.push(hoscity);
            data.push(hosstate);
            data.push(hosphone);
            data.push(hosemail);
            data.push(hospin);
            data.push(hosfloors);
            localStorage.setItem("hosteldetailsAdmin", JSON.stringify(data));
            console.log(data);
            window.location.href = "edit-hostel.html";
        };
    }
}

// Function which is used to fetch details from Firebase database
const SelectAlldataReal = () => {
    const dbref = ref(db, "Hostel details");
    onValue(dbref, (snapshot) => {
        hostelist = [];
        snapshot.forEach((h) => {
            hostelist.push(h.val());
        });
        currentPage = 1; // Reset to the first page
        displayPage(currentPage); // Display first page
        updatePaginationControls(); // Update pagination
    });
};

// Function to display a specific page
const displayPage = (page) => {
    tbody.innerHTML = "";
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, hostelist.length);

    for (let i = startIndex; i < endIndex; i++) {
        const h = hostelist[i];
        AddsingleRecord(
            h.hostelName,
            h.hostelType,
            h.hostelAddress1,
            h.hostelAddress2,
            h.hostelCity,
            h.hostelState,
            h.hostelPhone,
            h.hostelEmail,
            h.hostelPin,
            h.hostelFloors
        );
    }
    view();
};

// Function to create pagination controls
const updatePaginationControls = () => {
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = ""; // Clear existing controls

    const totalPages = Math.ceil(hostelist.length / itemsPerPage);

    // Previous button
    const prevLink = document.createElement("a");
    prevLink.innerText = "Prev";
    prevLink.href = "#";
    prevLink.className = currentPage === 1 ? "disabled" : "";
    prevLink.addEventListener("click", (event) => {
        event.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            displayPage(currentPage);
            updatePaginationControls();
        }
    });
    paginationContainer.appendChild(prevLink);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.createElement("a");
        pageLink.innerText = i;
        pageLink.href = "#";
        pageLink.className = i === currentPage ? "active" : "";
        pageLink.addEventListener("click", (event) => {
            event.preventDefault();
            currentPage = i;
            displayPage(currentPage);
            updatePaginationControls();
        });
        paginationContainer.appendChild(pageLink);
    }

    // Next button
    const nextLink = document.createElement("a");
    nextLink.innerText = "Next";
    nextLink.href = "#";
    nextLink.className = currentPage === totalPages ? "disabled" : "";
    nextLink.addEventListener("click", (event) => {
        event.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            displayPage(currentPage);
            updatePaginationControls();
        }
    });
    paginationContainer.appendChild(nextLink);
};

// Function which is used to append the data from Firebase database to table
const AddsingleRecord = (hostelName, hostelType, hostelAddress1, hostelAddress2, hostelCity, hostelState, hostelPhone, hostelEmail, hostelPin, hostelFloors) => {
    var trow = document.createElement("tr");
    var td1 = document.createElement("td");
    var td2 = document.createElement("td");
    var td3 = document.createElement("td");
    var td4 = document.createElement("td");
    var td5 = document.createElement("td");
    var td6 = document.createElement("td");
    var td7 = document.createElement("td");
    var td8 = document.createElement("td");
    var td9 = document.createElement("td");
    var td10 = document.createElement("td");
    var td11 = document.createElement("td");

    // Update flag
    flag = flag + 1;
    td1.innerHTML = flag;
    td2.innerHTML = hostelName;
    td3.innerHTML = hostelType;
    td4.innerHTML = hostelAddress1;
    td5.innerHTML = hostelAddress2;
    td6.innerHTML = hostelCity;
    td7.innerHTML = hostelState;
    td8.innerHTML = hostelPhone;
    td9.innerHTML = hostelEmail;
    td10.innerHTML = hostelPin;
    td11.innerHTML = hostelFloors;

    var removeButton = document.createElement("a");
    removeButton.type = "button";
    removeButton.innerHTML = '<i class="ri-delete-bin-line"></i>';
    removeButton.onclick = function (event) {
        event.stopPropagation(); // Prevent row click event
        removeHostel(event, hostelName);
    };

    // Append the remove button
    var td12 = document.createElement("td");
    td12.appendChild(removeButton);

    trow.append(td1, td2, td3, td4, td5, td6, td7, td8, td9, td10, td11, td12);
    tbody.append(trow);
};

// Event listener to load data on page load
window.addEventListener("load", SelectAlldataReal);
