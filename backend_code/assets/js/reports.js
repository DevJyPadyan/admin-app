import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";
import { export_table_to_csv } from "././export-table.js"

const app = initializeApp(firebaseConfig);
const db = getDatabase();


const tbody = document.getElementById("tbody1");
const fetchAndDisplayExpenses = () => {
    const dbref = ref(db, "Hostel expenses");
    onValue(dbref, (snapshot) => {
        tbody.innerHTML = ""; // Clear the table before appending data
        let expenseId = 1; // Counter for displaying row numbers

        snapshot.forEach((hostelSnapshot) => {
            const hostelName = hostelSnapshot.key;

            // Iterate over date ranges (e.g., daily, monthly, etc.)
            hostelSnapshot.forEach((dateRangeSnapshot) => {
                const dateRangeKey = dateRangeSnapshot.key; // e.g., "2024-10-01-2024-12-15"
                const frequency = dateRangeSnapshot.child("frequency").val() || "N/A";

                // Parse from and to dates
                const dateData = dateRangeSnapshot.child("date").val();
                const fromDate = dateData?.from || dateRangeKey.split("-")[0] || "N/A";
                const toDate = dateData?.to || dateRangeKey.split("-")[1] || "N/A";

                // Access the 'expenses' node
                const expensesSnapshot = dateRangeSnapshot.child("expenses");

                expensesSnapshot.forEach((categorySnapshot) => {
                    const categoryName = categorySnapshot.key;

                    categorySnapshot.forEach((subCategorySnapshot) => {
                        const subCategoryName = subCategorySnapshot.key;
                        const expenseDetails = subCategorySnapshot.val();

                        // Iterate through the roomData if available (for room-specific expenses)
                        if (expenseDetails.roomData) {
                            for (const floor in expenseDetails.roomData) {
                                for (const room in expenseDetails.roomData[floor]) {
                                    const roomData = expenseDetails.roomData[floor][room];
                                    // Append room-specific data
                                    appendExpenseRow(
                                        expenseId++,
                                        hostelName,
                                        frequency,
                                        fromDate,
                                        toDate,
                                        categoryName,
                                        subCategoryName,
                                        roomData
                                    );
                                }
                            }
                        } else {
                            // Append general category data (without roomData)
                            appendExpenseRow(
                                expenseId++,
                                hostelName,
                                frequency,
                                fromDate,
                                toDate,
                                categoryName,
                                subCategoryName,
                                expenseDetails
                            );
                        }
                    });
                });
            });
        });
    });
};

// Function to append a single expense record to the table
const appendExpenseRow = (
    id,
    hostelName,
    frequency,
    fromDate,
    toDate,
    category,
    subCategory,
    details
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
    const td15 = document.createElement("td");

    td1.innerText = id;
    td2.innerText = hostelName;
    td3.innerText = frequency;
    td4.innerText = fromDate;
    td5.innerText = toDate;
    td6.innerText = category;
    td7.innerText = subCategory;
    td8.innerText = details.units || "N/A";
    td9.innerText = details.measurementUnit || "N/A";
    td10.innerText = details.cost || "N/A";

    // Description
    td11.innerText = details.description || "N/A";

    // Room number
    td12.innerText =
        subCategory.toLowerCase() === "electricity" && details.roomNumber
            ? details.roomNumber
            : "N/A";

    // Floor number
    td13.innerText =
        subCategory.toLowerCase() === "electricity" && details.floorNumber
            ? details.floorNumber
            : "N/A";


    // Remarks
    td14.innerText = details.remarks || "N/A";

    // Bills
    if (details.billImages && details.billImages.length > 0) {
        td15.innerHTML = details.billImages
            .map(
                (image, index) =>
                    `<a href="${image}" target="_blank">Bill ${index + 1}</a>`
            )
            .join(", ");
    } else {
        td15.innerText = "No Bills";
    }

    trow.append(td1, td2, td3, td4, td5, td6, td7, td8, td9, td10, td11, td12, td13, td14, td15);
    tbody.appendChild(trow);
};

// Call the function to fetch and display data on page load
window.addEventListener("load", fetchAndDisplayExpenses);

//exporting table as CSV file.
// export_table_btn.addEventListener("click", function () {
//     export_table_to_csv("expenses_table.csv", "table_id");
// });