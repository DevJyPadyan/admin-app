import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";
import { export_table_to_csv } from "././export-table.js"

const app = initializeApp(firebaseConfig);
const db = getDatabase();

let flag = 0; // Initialize flag as a counter for row numbers

// Target tbody in the table
const tbody = document.getElementById("tbody1");

// Function to fetch and display data
const fetchAndDisplayData = () => {
    const dbRef = ref(db, "Perikitis");

    flag = 0; // Reset flag counter before fetching data

    onValue(dbRef, (snapshot) => {
        tbody.innerHTML = ""; // Clear existing rows

        snapshot.forEach((sessionSnapshot) => {
            const sessionType = sessionSnapshot.key; // Breakfast, Lunch, etc.

            sessionSnapshot.forEach((dateSnapshot) => {
                const date = dateSnapshot.key; // Date under session type

                dateSnapshot.forEach((categorySnapshot) => {
                    const category = categorySnapshot.key; // Veg or Non-Veg

                    categorySnapshot.forEach((foodSnapshot) => {
                        const foodDetails = foodSnapshot.val(); // Food data

                        // Increment flag as row counter
                        flag++;

                        // Append row for each food item
                        appendTableRow(
                            flag, // Pass flag as row number
                            sessionType,
                            date,
                            category,
                            foodDetails.foodName,
                            foodDetails.unitsPrepared,
                            foodDetails.unitsConsumed,
                            foodDetails.leftover,
                            foodDetails.enteredBy,
                            foodDetails.peopleConsumed
                        );
                    });
                });
            });
        });
    });
};

// Function to append a row to the table
const appendTableRow = (
    rowNumber, // Include rowNumber as a parameter
    sessionType,
    date,
    category,
    foodName,
    unitsPrepared,
    unitsConsumed,
    leftover,
    enteredBy,
    peopleConsumed
) => {
    const row = document.createElement("tr");

    // Create table cells
    const rowNumberCell = document.createElement("td"); // Cell for the row number
    const sessionCell = document.createElement("td");
    const dateCell = document.createElement("td");
    const categoryCell = document.createElement("td");
    const foodNameCell = document.createElement("td");
    const unitsPreparedCell = document.createElement("td");
    const unitsConsumedCell = document.createElement("td");
    const peopleConsumedCell = document.createElement("td");
    const leftoverCell = document.createElement("td");
    const enteredByCell = document.createElement("td");

    // Fill cell data
    rowNumberCell.innerText = rowNumber; // Assign row number from flag
    sessionCell.innerText = sessionType;
    dateCell.innerText = date;
    categoryCell.innerText = category;
    foodNameCell.innerText = foodName || "N/A";
    unitsPreparedCell.innerText = unitsPrepared || 0;
    unitsConsumedCell.innerText = unitsConsumed || 0;
    peopleConsumedCell.innerText = peopleConsumed || 0;
    leftoverCell.innerText = leftover || 0;
    enteredByCell.innerText = enteredBy || "N/A";

    // Append cells to the row
    row.append(
        rowNumberCell, // Add row number cell to the row
        sessionCell,
        dateCell,
        categoryCell,
        foodNameCell,
        unitsPreparedCell,
        unitsConsumedCell,
        peopleConsumedCell,
        leftoverCell,
        enteredByCell
    );

    // Add row to the table body
    tbody.appendChild(row);
};

// Call the function to fetch and display data on page load
window.addEventListener("load", fetchAndDisplayData);

//exporting table as CSV file.
// export_table_btn.addEventListener("click", function () {
//     export_table_to_csv("food_table.csv", "table_id");
// });
