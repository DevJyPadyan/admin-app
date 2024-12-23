import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, onValue, child, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app); 

let flag = 0;

// Function to save menu data to localStorage before redirecting to edit page
function saveMenuDataToLocalStorage() {
    const tableRows = document.querySelectorAll('#tbody1 tr');
    const menuData = [];

    tableRows.forEach(row => {
        const cells = row.getElementsByTagName('td');
        menuData.push({
            session: cells[1].textContent,
            mainDish: cells[2].textContent,
            sideDish: cells[3].textContent,
            specialDish: cells[4].textContent,
            beverages: cells[5].textContent,
            image: cells[6].querySelector('a')?.href || ''
        });
    });

    // Store the data in localStorage
    localStorage.setItem('foodMenu', JSON.stringify(menuData));
}

// Add event listener for "Edit Menu" button
document.querySelector('.btn.btn-dashed').addEventListener('click', saveMenuDataToLocalStorage);

// Function to fetch all data from Firebase
const SelectAlldataReal = () => {
    const dbref = ref(db, 'Food Menu');
    
    onValue(dbref, (snapshot) => {

        console.log('Data retrieved from Firebase:', snapshot.val());  // Log the entire snapshot

        // Empty array to hold all dishes data
        const menuData = [];

        snapshot.forEach(sessionSnapshot => {
            const session = sessionSnapshot.key; 
            const dishes = sessionSnapshot.val().dishes;


            // Loop through each dish and push it to menuData array
            dishes.forEach(dish => {
                console.log(`Dish ID: ${dish.id} - Main Dish: ${dish.mainDish}`);  // Log each dish's details
                menuData.push({
                    session,
                    ...dish
                });
            });
        });

        // Call function to populate the table with the fetched data
        AddAllRecords(menuData);
    });
}

// Function to populate the table with data from Firebase
const AddAllRecords = (menuData) => {
    const tbody = document.getElementById('tbody1');
    tbody.innerHTML = ''; // Clear any existing data in the table

    menuData.forEach(dish => {
        const trow = document.createElement('tr');

        const td1 = document.createElement('td');
        const td2 = document.createElement('td');
        const td3 = document.createElement('td');
        const td4 = document.createElement('td');
        const td5 = document.createElement('td');
        const td6 = document.createElement('td');
        const td7 = document.createElement('td');

        
        flag = flag + 1;
        td1.innerHTML = flag;
        td2.innerHTML = dish.session;
        td3.innerHTML = dish.mainDish;
        td4.innerHTML = dish.sideDish;
        td5.innerHTML = dish.specialDish;
        td6.innerHTML = dish.beverages;

        // Create a link to download the image
        td7.innerHTML = `<a href="${dish.image}" target="_blank" download>Download Image</a>`;

   
        trow.append(td1, td2, td3, td4, td5, td6, td7);
        tbody.appendChild(trow);
    });
}

// Add event listener for the load event
window.addEventListener('load', () => {
    SelectAlldataReal();  // Call the function after the page has loaded
});
