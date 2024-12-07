import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, onValue, child, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"
import { getStorage, ref as ref2, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js"
import { firebaseConfig } from "./firebase-config.js";
//import { firebaseConfig } from "./hostel-register.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase();
const storage = getStorage(app);

document.addEventListener("DOMContentLoaded", () => {
    const tabs = ["daily", "monthly", "yearly"];

    tabs.forEach(tab => {
        const container = document.querySelector(`#${tab}-container`);
        const addButton = document.querySelector(`#add-${tab}`);

        // Event listener for adding food items
        addButton.addEventListener("click", () => {
            const uniqueId = `${tab}-${Date.now()}`; // Unique ID for each food item

            // Create a new container for the food item
            const foodItemContainer = document.createElement("div");
            foodItemContainer.className = "food-item-container mb-3";
            foodItemContainer.innerHTML = `
                <div class="row">
                    <div class="col-12 col-md-6 mb-2">
                        <label for="foodItem-${uniqueId}">Food Item</label>
                        <input type="text" id="foodItem-${uniqueId}" class="form-control" placeholder="Enter Food Item">
                    </div>
                    <div class="col-12 col-md-6 mb-2">
                        <label>Category</label>
                        <div>
                            <input type="checkbox" id="veg-${uniqueId}" class="form-check-input">
                            <label for="veg-${uniqueId}" class="form-check-label">Veg</label>
                            <input type="checkbox" id="nonVeg-${uniqueId}" class="form-check-input ms-3">
                            <label for="nonVeg-${uniqueId}" class="form-check-label">Non-Veg</label>
                        </div>
                    </div>
                    <div class="col-12 col-md-4 mb-2">
                        <label for="unitsPrepared-${uniqueId}">Units Prepared</label>
                        <input type="number" id="unitsPrepared-${uniqueId}" class="form-control">
                    </div>
                    <div class="col-12 col-md-4 mb-2">
                        <label for="unitsConsumed-${uniqueId}">Units Consumed</label>
                        <input type="number" id="unitsConsumed-${uniqueId}" class="form-control">
                    </div>
                    <div class="col-12 col-md-4 mb-2">
                        <label for="unitsLeft-${uniqueId}">Units Left Out</label>
                        <input type="number" id="unitsLeft-${uniqueId}" class="form-control">
                    </div>
                    <div class="col-12 col-md-6 mb-2">
                        <label for="peopleConsuming-${uniqueId}">People Consuming</label>
                        <input type="number" id="peopleConsuming-${uniqueId}" class="form-control">
                    </div>
                    ${tab === "daily"
                    ? `<div class="col-12 col-md-6 mb-2">
                                <label for="date-${uniqueId}">Date</label>
                                <input type="date" id="date-${uniqueId}" class="form-control">
                            </div>`
                    : ""
                }
                    ${tab === "monthly"
                    ? `<div class="col-12 col-md-6 mb-2">
                                <label for="month-${uniqueId}">Month</label>
                                <select id="month-${uniqueId}" class="form-control">
                                    <option>January</option><option>February</option><option>March</option>
                                    <option>April</option><option>May</option><option>June</option>
                                    <option>July</option><option>August</option><option>September</option>
                                    <option>October</option><option>November</option><option>December</option>
                                </select>
                                <label for="year-${uniqueId}">Year</label>
                                <input type="number" id="year-${uniqueId}" class="form-control">
                            </div>`
                    : ""
                }
                    ${tab === "yearly"
                    ? `<div class="col-12 col-md-6 mb-2">
                                <label for="year-${uniqueId}">Year</label>
                                <input type="number" id="year-${uniqueId}" class="form-control">
                            </div>`
                    : ""
                }
                </div>
            `;

            // Append the new food item container to the appropriate tab's container
            container.appendChild(foodItemContainer);
        });

        saveButton.addEventListener("click", () => {
            const hostelName = document.querySelector(`#hostelName-${tab}`).value;
            const foodItems = Array.from(container.querySelectorAll(".food-item-container"));
            const data = foodItems.map(item => {
                const id = item.querySelector("input").id.split("-").pop();
                return {
                    foodItem: document.querySelector(`#foodItem-${tab}-${id}`).value,
                    category: document.querySelector(`#veg-${tab}-${id}`).checked ? "Veg" : "Non-Veg",
                    unitsPrepared: Number(document.querySelector(`#unitsPrepared-${tab}-${id}`).value),
                    unitsConsumed: Number(document.querySelector(`#unitsConsumed-${tab}-${id}`).value),
                    unitsLeftOut: Number(document.querySelector(`#unitsLeft-${tab}-${id}`).value),
                    peopleConsuming: Number(document.querySelector(`#peopleConsuming-${tab}-${id}`).value),
                    ...(tab === "daily" && {
                        date: document.querySelector(`#date-${tab}-${id}`).value,
                    }),
                    ...(tab === "monthly" && {
                        month: document.querySelector(`#month-${tab}-${id}`).value,
                        year: document.querySelector(`#year-${tab}-${id}`).value,
                    }),
                    ...(tab === "yearly" && {
                        year: document.querySelector(`#year-${tab}-${id}`).value,
                    }),
                };
            });

            // Save data to Firebase
            saveToFirebase(tab, hostelName, data);
        });
    });

    function saveToFirebase(tab, hostelName, data) {
        const dbPath = `Inventory/Food Management/${hostelName}`;
        const updates = {};

        data.forEach(item => {
            if (tab === "daily") {
                const { date, ...details } = item;
                updates[`${dbPath}/${date}/${item.foodItem}`] = details;
            } else if (tab === "monthly") {
                const { month, year, ...details } = item;
                updates[`${dbPath}/${year}/${month}/${item.foodItem}`] = details;
            } else if (tab === "yearly") {
                const { year, ...details } = item;
                updates[`${dbPath}/${year}/${item.foodItem}`] = details;
            }
        });

        // Assuming `firebase.database()` is initialized
        firebase.database().ref().update(updates)
            .then(() => alert(`${tab.charAt(0).toUpperCase() + tab.slice(1)} data saved successfully!`))
            .catch(error => alert(`Error saving data: ${error.message}`));
    }
});
