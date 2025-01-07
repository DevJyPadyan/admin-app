import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, push, set, onValue, child, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"
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

    let foodList = {};  // Store dishes for each session type
    let foodListCache = {};  // Cache food list to avoid refetching

    // Attach Select2's change event for session type
    sessionDropdown.on("change", async function () {
        const sessionType = $(this).val(); // Get the selected value via jQuery

        if (!sessionType || sessionType === "Select session") {
            console.log("No session selected.");
            return;
        }

        console.log("Selected Session:", sessionType);

        if (foodListCache[sessionType]) {
            // If the dishes for this session are already cached, use them
            console.log("Using cached food list for", sessionType);
            foodList[sessionType] = foodListCache[sessionType];
            updateFoodDropdown(foodList[sessionType]);
            return;
        }

        try {
            // Path in Firebase where food names for sessions are stored
            const path = `Food Menu/${sessionType}/dishes`;
            console.log(`Fetching data from path: ${path}`);

            const foodRef = ref(db, path);
            const snapshot = await get(foodRef);

            if (snapshot.exists()) {
                const foodItems = snapshot.val(); // This is an array of food items
                console.log(`Fetched Food Items for ${sessionType}:`, foodItems);

                // Initialize an array to hold the combined food items (mainDish + sideDish + specialDish + beverages)
                const foodListForSession = [];

                // Iterate through each food item and combine details into a single string
                foodItems.forEach(food => {
                    if (food) {
                        const components = [];

                        // Add each component only if it exists and is not empty
                        if (food.mainDish?.trim()) {
                            components.push(food.mainDish.trim());
                        }
                        if (food.sideDish?.trim()) {
                            components.push(food.sideDish.trim());
                        }
                        if (food.specialDish?.trim()) {
                            components.push(food.specialDish.trim());
                        }
                        if (food.beverages?.trim()) {
                            components.push(food.beverages.trim());
                        }

                        // Combine the components into a single string
                        const combinedFood = components.join(", ");
                        const combinedFoodWithMealType = `${combinedFood} [${food.mealType || "Unknown"}]`;

                        foodListForSession.push({ id: food.id, text: combinedFoodWithMealType });
                    }
                });

                // Cache the fetched food list
                foodListCache[sessionType] = foodListForSession;
                foodList[sessionType] = foodListForSession;

                // Update the food dropdown
                updateFoodDropdown(foodListForSession);
            } else {
                console.log(`No food items found for session: ${sessionType}`);
                foodList[sessionType] = [];
                updateFoodDropdown([]);
            }
        } catch (error) {
            console.error("Error retrieving food items:", error);
        }
    });

    // Function to update the food dropdown
    function updateFoodDropdown(foodItems) {
        const foodDropdown = document.getElementById("FoodDropdown1");
        if (!foodDropdown) {
            console.log("Food dropdown not found! Check the ID.");
            return;
        }

        console.log("Updating FoodDropdown1");

        foodDropdown.innerHTML = ""; // Clear existing options
        foodDropdown.innerHTML += `<option value="">Select Food</option>`;
        foodItems.forEach(food => {
            foodDropdown.innerHTML += `<option value="${food.id}" data-text="${food.text}">${food.text}</option>`;
        });

        console.log("FoodDropdown1 updated successfully.");
    }

   // Handle the "Add Food" button click event
   const addFoodBtn = document.getElementById("addFoodBtn");
   const foodEntriesContainer = document.getElementById("foodEntriesContainer");

   if (addFoodBtn && foodEntriesContainer) {
       addFoodBtn.addEventListener("click", () => {
           const selectedSession = sessionDropdown.val();
           if (!selectedSession || selectedSession === "Select session") {
               alert("Please select a session first.");
               return;
           }

           if (!foodList[selectedSession] || foodList[selectedSession].length === 0) {
               alert("No food items available for the selected session.");
               return;
           }

           // Create a new container for a new food entry
           const newFoodEntry = document.createElement("div");
           newFoodEntry.classList.add("input-items", "food-entry");

           // HTML structure for the new food entry
           newFoodEntry.innerHTML = `
           <div class="row gy-3">
               <div class="col-xl-6">
                   <div class="input-box">
                       <h6>Food Name<span class="required">*</span></h6>
                       <select class="js-example-basic-single w-100 food-dropdown" required>
                           <option value="">Select Food</option>
                           ${foodList[selectedSession]
                   .map(food => `<option value="${food.id}" data-text="${food.text}">${food.text}</option>`)
                   .join('')}
                       </select>
                   </div>
               </div>
               <div class="col-xl-6">
                   <div class="input-box">
                       <h6>Units prepared</h6>
                       <input type="number" class="food-unit unitsPrepared" placeholder="Units prepared">
                   </div>
               </div>
               <div class="col-xl-6">
                   <div class="input-box">
                       <h6>Units consumed</h6>
                       <input type="number" class="food-unit unitsConsumed" placeholder="Units consumed">
                   </div>
               </div>
               <div class="col-xl-6">
                   <div class="input-box">
                       <h6>No. of people consumed</h6>
                       <input type="number" class="food-unit peopleConsumed" placeholder="No. of people consumed">
                   </div>
               </div>
           </div>
       `;

           // Append the new food entry container to the food entries container
           foodEntriesContainer.appendChild(newFoodEntry);

           // Reinitialize Select2 for the new food dropdown
           const newFoodDropdown = newFoodEntry.querySelector(".food-dropdown");
           $(newFoodDropdown).select2();
       });
   }
});

document.getElementById("saveFoodData").addEventListener("click", (event) => {
   event.preventDefault();

   // Array to store all food entry data
   const foodEntries = [];  // Array to hold food data

   const sessionType = document.getElementById("sessiontype").value;  // Get session type (Breakfast, Lunch, etc.)
   const date = document.getElementById("date").value;  // Get the date selected by the user
   const Enterby = document.getElementById("enteredBy").value;  // Get the enteredBy value

   // Process the first food entry
   const foodDropdown = document.getElementById("FoodDropdown1");
   const selectedOption = foodDropdown.options[foodDropdown.selectedIndex];
   const selectedFoodNameWithMealType = selectedOption.getAttribute("data-text");  // This has combined food and mealType
   const selectedFoodName = selectedFoodNameWithMealType.split(" [")[0];  // Extract food name
   const mealType = selectedFoodNameWithMealType.split(" [")[1]?.replace("]", "") || "Unknown";  // Extract mealType
   const unitsPrepared1 = parseInt(document.getElementById("unitsPrep1").value, 10) || 0;
   const unitsConsumed1 = parseInt(document.getElementById("unitsCons1").value, 10) || 0;
   const noOfpeople = parseInt(document.getElementById("peopleCons1").value, 10) || 0;
   const leftover1 = unitsPrepared1 - unitsConsumed1;

   if (selectedFoodName && mealType) {
       foodEntries.push({
           foodName: selectedFoodName,  // Store only the food name
           mealType: mealType,  // Store mealType separately
           unitsPrepared: unitsPrepared1,
           unitsConsumed: unitsConsumed1,
           leftover: leftover1,
           enteredBy: Enterby,
           peopleConsumed: noOfpeople
       });
   }

   // Process additional food entries
   const additionalFoodEntries = document.querySelectorAll("#foodEntriesContainer .food-entry");

   additionalFoodEntries.forEach((entry, idx) => {
       const foodDropdown = entry.querySelector(".food-dropdown");
       const foodNameWithMealType = foodDropdown ? foodDropdown.options[foodDropdown.selectedIndex].getAttribute("data-text") : "";
       const foodName = foodNameWithMealType.split(" [")[0];  // Extract food name
       const mealType = foodNameWithMealType.split(" [")[1]?.replace("]", "") || "Unknown"; // Extract mealType

       const unitsPrepared = parseInt(entry.querySelector(".unitsPrepared").value, 10) || 0;
       const peopleConsumed = parseInt(entry.querySelector(".peopleConsumed").value, 10) || 0;
       const unitsConsumed = parseInt(entry.querySelector(".unitsConsumed").value, 10) || 0;
       const leftover = unitsPrepared - unitsConsumed;

       if (foodName && mealType) {
           foodEntries.push({
               foodName: foodName,  // Store only the food name
               mealType: mealType,  // Store mealType separately for each entry
               unitsPrepared: unitsPrepared,
               unitsConsumed: unitsConsumed,
               leftover: leftover,
               peopleConsumed: peopleConsumed,
               enteredBy: Enterby
           });
       }
   });

   // Show leftover values in the modal
   const modalBody = document.querySelector(".modal-body");
   modalBody.innerHTML = foodEntries
       .map((entry, idx) => {
           // Construct the food display text with food name and meal type
           return `<p><strong>Food ${idx + 1}:</strong> ${entry.foodName} [${entry.mealType || "Unknown"}] - Leftover: ${entry.leftover} units</p>`;
       })
       .join("");

   // Display the modal
   const modal = new bootstrap.Modal(document.getElementById("room"));
   modal.show();

   // Save the data to Firebase when the Save button in the modal is clicked
   document.getElementById("submit").addEventListener("click", async () => {
       if (!sessionType || !date) {
           alert("Please ensure session type and date are selected.");
           return;
       }

       const path = `Perikitis/${sessionType}/${date}`;
       console.log("Firebase path:", path);

       // Reference to the Firebase database
       const dbRef = ref(db, path);

       try {
           // Save the individual food entries under the correct mealType node
           for (const entry of foodEntries) {
               // Save food entries under specific mealType node (e.g., "Veg", "Non-Veg")
               const mealTypeRef = ref(db, `${path}/${entry.mealType}`);  // Use mealType as a node name
               const newFoodRef = push(mealTypeRef);  // Create a unique ID for each food entry
               await set(newFoodRef, {
                   foodName: entry.foodName,
                   enteredBy: entry.enteredBy,
                   leftover: entry.leftover,
                   peopleConsumed: entry.peopleConsumed,
                   unitsConsumed: entry.unitsConsumed,
                   unitsPrepared: entry.unitsPrepared,
                   mealType: entry.mealType
               });
           }

           console.log(`Data saved successfully under ${path}`);
           alert("Data saved successfully!");
           location.reload();
       } catch (error) {
           console.error("Error saving data:", error);
           alert("Failed to save data.");
       }
   });
});
