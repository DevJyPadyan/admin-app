import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";
import { export_table_to_csv } from "././export-table.js"

const app = initializeApp(firebaseConfig);
const db = getDatabase();

const itemsPerPage = 7; // Number of rows per page
let currentPage = 1; // Current page
let totalPages = 0; // Total pages
let allExpenses = []; // To hold all expenses

const tbody = document.getElementById("tbody1");

// Function to fetch and display expenses with pagination
const fetchAndDisplayExpenses = () => {
    const dbref = ref(db, "Hostel expenses");
    onValue(dbref, (snapshot) => {
        tbody.innerHTML = ""; // Clear the table before appending data
        allExpenses = []; // Reset the allExpenses array

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
                        const expenseData = subCategorySnapshot.val();
        
                        // Handle array-based subcategories (e.g., "Groceries")
                        if (Array.isArray(expenseData)) {
                            expenseData.forEach((expenseDetails) => {
                                allExpenses.push({
                                    expenseId: expenseId++,
                                    hostelName,
                                    frequency,
                                    fromDate,
                                    toDate,
                                    categoryName,
                                    subCategoryName,
                                    details: expenseDetails, // Use expense details directly
                                });
                            });
                        } 
                        // Handle room-specific expenses (e.g., electricity in specific rooms)
                        else if (expenseData.roomData) {
                            for (const floor in expenseData.roomData) {
                                for (const room in expenseData.roomData[floor]) {
                                    const roomData = expenseData.roomData[floor][room];
                                    allExpenses.push({
                                        expenseId: expenseId++,
                                        hostelName,
                                        frequency,
                                        fromDate,
                                        toDate,
                                        categoryName,
                                        subCategoryName,
                                        details: roomData, // Use room-specific data
                                    });
                                }
                            }
                        } 
                        // Handle general object-based subcategories
                        else {
                            allExpenses.push({
                                expenseId: expenseId++,
                                hostelName,
                                frequency,
                                fromDate,
                                toDate,
                                categoryName,
                                subCategoryName,
                                details: expenseData, // Use the object as-is
                            });
                        }
                    });
                });
            });
        });        

        // Calculate total pages for pagination
        totalPages = Math.ceil(allExpenses.length / itemsPerPage);

        // Render the current page
        renderTable(currentPage);
        updatePaginationControls();
    });
};

// Function to render the current page data
const renderTable = (page) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = page * itemsPerPage;
    const pageData = allExpenses.slice(startIndex, endIndex);

    tbody.innerHTML = ""; // Clear existing rows

    // Append rows for the current page
    pageData.forEach(expense => {
        appendExpenseRow(
            expense.expenseId,
            expense.hostelName,
            expense.frequency,
            expense.fromDate,
            expense.toDate,
            expense.categoryName,
            expense.subCategoryName,
            expense.details
        );
    });
};

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

    // Use the values directly from the main category
    const units = details?.units || "N/A"; // Fetch units from the main category
    const measurementUnit = details?.measurementUnit || "N/A"; // Fetch measurementUnit from the main category

    // Units and Measurement Unit
    td8.innerText = units;
    td9.innerText = measurementUnit;
    // Cost
    td10.innerText = details?.cost || "N/A";

    // Description
    td11.innerText = details?.description || "N/A";

    // Room number (only applicable for "electricity" subCategory)
    td12.innerText = subCategory.toLowerCase() === "electricity" && details?.roomNumber
        ? details.roomNumber
        : "N/A";

    // Floor number (only applicable for "electricity" subCategory)
    td13.innerText = subCategory.toLowerCase() === "electricity" && details?.floorNumber
        ? details.floorNumber
        : "N/A";

    // Remarks
    td14.innerText = details?.remarks || "N/A";

    // Bills (only if available)
    if (details?.billImages && details.billImages.length > 0) {
        td15.innerHTML = details.billImages
            .map(
                (image, index) =>
                    `<a href="${image}" target="_blank">Bill ${index + 1}</a>`
            )
            .join(", ");
    } else {
        td15.innerText = "No Bills";
    }

    // Append each td element to the row
    trow.append(td1, td2, td3, td4, td5, td6, td7, td8, td9, td10, td11, td12, td13, td14, td15);

    // Append the row to the tbody (table body)
    tbody.appendChild(trow);
};


//Function to create pagination controls
const updatePaginationControls = () => {
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = ""; // Clear existing controls

    const totalPages = Math.ceil(allExpenses.length / itemsPerPage);

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
window.addEventListener("load", fetchAndDisplayExpenses);

//exporting table as CSV file.
// export_table_btn.addEventListener("click", function () {
//     export_table_to_csv("expenses_table.csv", "table_id");
// });