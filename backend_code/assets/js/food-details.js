import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";
import { export_table_to_csv } from "././export-table.js"

const app = initializeApp(firebaseConfig);
const db = getDatabase();

let flag = 0; // Initialize flag as a counter for row numbers

// Target tbody in the table
const tbody = document.getElementById("tbody1");
const itemsPerPage = 7; // Number of rows per page
let currentPage = 1; // Current page number
let allData = []; // Array to hold all fetched data

// Function to fetch data from Firebase
const fetchAndDisplayData = () => {
    const dbRef = ref(db, "Perikitis");

    onValue(dbRef, (snapshot) => {
        allData = []; // Clear existing data
        currentPage = 1; // Reset to first page

        snapshot.forEach((sessionSnapshot) => {
            const sessionType = sessionSnapshot.key;

            sessionSnapshot.forEach((dateSnapshot) => {
                const date = dateSnapshot.key;

                dateSnapshot.forEach((mealTypeSnapshot) => {
                    const mealType = mealTypeSnapshot.key;

                    mealTypeSnapshot.forEach((foodSnapshot) => {
                        const foodDetails = foodSnapshot.val();

                        // Collect data as objects for pagination
                        allData.push({
                            sessionType,
                            date,
                            category: mealType,
                            foodName: foodDetails.foodName || "N/A",
                            unitsPrepared: foodDetails.unitsPrepared || 0,
                            unitsConsumed: foodDetails.unitsConsumed || 0,
                            leftover: foodDetails.leftover || 0,
                            enteredBy: foodDetails.enteredBy || "N/A",
                            peopleConsumed: foodDetails.peopleConsumed || 0,
                        });
                    });
                });
            });
        });

        // Display the first page
        displayPage(currentPage);
        updatePaginationControls();
    });
};

// Function to display a specific page
const displayPage = (page) => {
    tbody.innerHTML = ""; // Clear existing rows
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, allData.length);

    for (let i = startIndex; i < endIndex; i++) {
        const rowData = allData[i];
        appendTableRow(i + 1, rowData);
    }
};

// Function to append a row to the table
const appendTableRow = (rowNumber, data) => {
    const row = document.createElement("tr");

    // Create and populate table cells
    const cells = [
        rowNumber, // Row number
        data.sessionType,
        data.date,
        data.category,
        data.foodName,
        data.unitsPrepared,
        data.unitsConsumed,
        data.peopleConsumed,
        data.leftover,
        data.enteredBy,
    ];

    cells.forEach((cellData) => {
        const cell = document.createElement("td");
        cell.innerText = cellData;
        row.appendChild(cell);
    });

    tbody.appendChild(row);
};

// Function to create and update pagination controls
const updatePaginationControls = () => {
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = ""; // Clear existing controls

    const totalPages = Math.ceil(allData.length / itemsPerPage);

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


// Call the function to fetch and display data on page load
window.addEventListener("load", fetchAndDisplayData);
