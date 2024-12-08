import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, push,set, onValue, child, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"
import { getStorage, ref as ref2, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js"
import { firebaseConfig } from "./firebase-config.js";
//import { firebaseConfig } from "./hostel-register.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed.");

    // Initialize Select2 for session dropdown
    $('#sessiontype').select2();

    // Add event listener for session dropdown change event
    const sessionDropdown = $("#sessiontype");

    if (!sessionDropdown.length) {
        console.error("Session dropdown not found! Check the HTML.");
        return;
    }

    console.log("Session dropdown initialized with Select2.");

    // Attach Select2's change event
    sessionDropdown.on("change", async function () {
        const sessionType = $(this).val(); // Get the selected value via jQuery

        if (!sessionType || sessionType === "Select session") {
            console.log("No session selected."); // Log if no session is selected
            return;
        }

        console.log("Selected Session:", sessionType); // Log the selected session

        try {
            // Path in Firebase where food names for sessions are stored
            const path = `Food info/${sessionType}`;
            console.log(`Fetching data from path: ${path}`); // Log path

            const foodRef = ref(db, path);
            const snapshot = await get(foodRef);

            if (snapshot.exists()) {
                const foodItems = snapshot.val(); // This is an object with food items as children
                console.log(`Fetched Food Items for ${sessionType}:`, foodItems); // Log fetched data

                // Initialize an array to hold the combined food items (mainDish + sideDish)
                const foodList = [];

                // Iterate through each food item
                if (typeof foodItems === "object" && !Array.isArray(foodItems)) {
                    for (const [key, food] of Object.entries(foodItems)) {
                        console.log("Processing food item for key:", key); // Log the key (e.g., "Chapathi, Egg masala")
                        console.log("Food item data:", food); // Log the actual food data

                        // Ensure that the food data is an object with 'mainDish' and 'sideDish' properties
                        if (food && food.mainDish && food.sideDish) {
                            // Combine mainDish and sideDish into a single string
                            const combinedFood = `${food.mainDish.trim()}, ${food.sideDish.trim()}`;
                            foodList.push(combinedFood); // Push the combined food name
                        } else {
                            console.warn(`Unexpected food item format for ${key}:`, food);
                        }
                    }
                } else {
                    console.error("Food items are not in the expected format.");
                    return;
                }

                // Populate the food dropdowns
                const dropdowns = [
                    document.getElementById("FoodDropdown1"),
                    document.getElementById("FoodDropdown2")
                ];

                dropdowns.forEach((dropdown) => {
                    if (!dropdown) {
                        console.log(`Dropdown not found! Check ID.`);
                        return;
                    }
                    console.log(`Updating dropdown: ${dropdown.id}`);

                    dropdown.innerHTML = ""; // Clear existing options
                    dropdown.innerHTML += `<option value="">Select Food</option>`;
                    foodList.forEach((food) => {
                        dropdown.innerHTML += `<option value="${food}">${food}</option>`;
                    });

                    console.log(`Dropdown ${dropdown.id} updated successfully.`);
                });
            } else {
                console.log(`No food items found for session: ${sessionType}`);
                const dropdowns = [
                    document.getElementById("FoodDropdown1"),
                    document.getElementById("FoodDropdown2"),
                ];
                dropdowns.forEach((dropdown) => {
                    dropdown.innerHTML = `<option value="">No Food Available</option>`;
                });
            }
        } catch (error) {
            console.error("Error retrieving food items:", error);
        }
    });
});

document.getElementById("saveFoodData").addEventListener("click", (event) => {
    event.preventDefault();

    // Collect data from Sub Form 1
    const food1 = document.getElementById("FoodDropdown1").value;
    const category1 = document.getElementById("category1").value; // Veg or Non-Veg for subform1
    const unitsPrepared1 = parseInt(document.getElementById("unitsPrep1").value, 10);
    const unitsConsumed1 = parseInt(document.getElementById("unitsCons1").value, 10);
    const peopleConsumed1 = document.getElementById("peopleCons1").value;
    const leftover1 = unitsPrepared1 - unitsConsumed1;

    // Collect data from Sub Form 2
    const food2 = document.getElementById("FoodDropdown2").value;
    const category2 = document.getElementById("category2").value; // Veg or Non-Veg for subform2
    const unitsPrepared2 = parseInt(document.getElementById("unitsPrep2").value, 10);
    const unitsConsumed2 = parseInt(document.getElementById("unitsCons2").value, 10);
    const peopleConsumed2 = document.getElementById("peopleCons2").value;
    const leftover2 = unitsPrepared2 - unitsConsumed2;

    // Collect "entered by" information
    const enteredBy = document.getElementById("enteredBy").value;

    // Ensure "enteredBy" is provided
    if (!enteredBy) {
        alert("Please enter your name.");
        return;
    }

    // Show leftover values in modal
    const modalBody = document.querySelector(".modal-body");
    modalBody.innerHTML = `
        <p><strong>Food 1: ${food1} (${category1}):</strong> ${leftover1} units left</p>
        <p><strong>Food 2: ${food2} (${category2}):</strong> ${leftover2} units left</p>
    `;

    // Display modal
    const modal = new bootstrap.Modal(document.getElementById('room'));
    modal.show();

    // Save the data when Save button in modal is clicked
    document.getElementById("submit").addEventListener("click", async () => {
        const sessionType = document.getElementById("sessiontype").value; // Get session type (Breakfast, Lunch, etc.)
        const date = document.getElementById("date").value; // Get the date selected by the user
    
        if (!sessionType || !date) {
            alert("Please ensure session type and date are selected.");
            return;
        }
    
        const path = `Perikitis/${sessionType}/${date}`;
        console.log("Firebase path:", path);
    
        const dbRef = ref(db, path);
    
        const subForm1Data = {
            foodName: food1,
            category: category1,
            unitsPrepared: unitsPrepared1,
            unitsConsumed: unitsConsumed1,
            peopleConsumed: peopleConsumed1,
            leftover: leftover1,
            enteredBy: enteredBy
        };
    
        const subForm2Data = {
            foodName: food2,
            category: category2,
            unitsPrepared: unitsPrepared2,
            unitsConsumed: unitsConsumed2,
            peopleConsumed: peopleConsumed2,
            leftover: leftover2,
            enteredBy: enteredBy
        };
    
        try {
            const category1Ref = child(dbRef, category1);
            const category2Ref = child(dbRef, category2);
    
            await push(category1Ref, subForm1Data);
            await push(category2Ref, subForm2Data);
    
            console.log(`Data saved successfully under ${path}`);
            alert("Data saved successfully!");
            location.reload();
        } catch (error) {
            console.error("Error saving data:", error);
            alert("Failed to save data.");
        }
    });
});