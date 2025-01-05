import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, onValue, child, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const itemsPerPage = 7; // Number of rows per page
let currentPage = 1; // Current page
let totalPages = 0; // Total pages
let menuData = [];

// Function to fetch all data from Firebase
const SelectAlldataReal = () => {
    const dbref = ref(db, 'Food Menu');

    onValue(dbref, (snapshot) => {
        console.log('Data retrieved from Firebase:', snapshot.val()); // Log the entire snapshot

        menuData=[];
        snapshot.forEach(sessionSnapshot => {
            const session = sessionSnapshot.key;
            const dishes = sessionSnapshot.val().dishes;

            // Loop through each dish and push it to menuData array
            dishes.forEach(dish => {
                console.log(`Dish ID: ${dish.id} - Main Dish: ${dish.mainDish}`); // Log each dish's details
                menuData.push({
                    session,
                    ...dish
                });
            });
        });

        // Calculate total pages for pagination
        totalPages = Math.ceil(menuData.length / itemsPerPage);

        // Render paginated data and create pagination controls
        renderPaginatedData(menuData);
        updatePaginationControls(menuData);
    });
};

// Function to render data based on the current page
const renderPaginatedData = (menuData) => {
    const tbody = document.getElementById('tbody1');
    tbody.innerHTML = ''; // Clear any existing data in the table

    // Calculate start and end indices for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, menuData.length);

    // Loop through the sliced data for the current page
    for (let i = startIndex; i < endIndex; i++) {
        const dish = menuData[i];
        const trow = document.createElement('tr');

        const td1 = document.createElement('td');
        const td2 = document.createElement('td');
        const td3 = document.createElement('td');
        const td4 = document.createElement('td');
        const td5 = document.createElement('td');
        const td6 = document.createElement('td');
        const td7 = document.createElement('td');

        td1.innerHTML = i + 1;
        td2.innerHTML = dish.session;
        td3.innerHTML = dish.mainDish;
        td4.innerHTML = dish.sideDish;
        td5.innerHTML = dish.specialDish;
        td6.innerHTML = dish.beverages;

        // Create a link to download the image
        td7.innerHTML = `<a href="${dish.image}" target="_blank" download>Download Image</a>`;

        trow.append(td1, td2, td3, td4, td5, td6, td7);
        tbody.appendChild(trow);
    }
};

// Function to create pagination controls
const updatePaginationControls = () => {
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = ""; // Clear existing controls

    const totalPages = Math.ceil(menuData.length / itemsPerPage);

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

// Add event listener for the load event
window.addEventListener('load', () => {
    SelectAlldataReal(); // Call the function after the page has loaded
});
