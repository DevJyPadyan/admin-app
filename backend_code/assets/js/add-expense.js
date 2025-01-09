import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set, get, push } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getStorage, ref as ref2, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase();
const storage = getStorage(app);

//Populate hostel dropdown for room booking
async function populateHostelDropdown(prefilledHostel = "") {
    const hostelDropdown = document.getElementById("hostelDropdown");
    const hostelsRef = ref(db, "Hostel details/");
    console.log(hostelsRef);

    try {
        const snapshot = await get(hostelsRef);
        if (snapshot.exists()) {
            const hostels = snapshot.val();
            hostelDropdown.innerHTML = '<option value="">Select Hostel</option>';
            for (let hostelName in hostels) {
                let option = document.createElement("option");
                option.value = hostelName;
                option.text = hostelName;
                hostelDropdown.appendChild(option);
            }

            // Prefill the dropdown with the user's hostel if available
            if (prefilledHostel) {
                hostelDropdown.value = prefilledHostel;
            }
        } else {
            console.log("No hostels found.");
        }
    } catch (error) {
        console.error("Error fetching hostels:", error);
    }
}
window.addEventListener('DOMContentLoaded', populateHostelDropdown);

let categoryCounter = 0;

// Subcategory mapping
const subCategoryMap = {
    utilities: ["Water", "Electricity", "Gas", "Internet", "Water Supplies"],
    food: ["Cooking Supplies - Vegetables or Fruits", "Groceries", "Cooking Supplies - Raw Materials"],
    maintenance: ["Repairs", "Cleaning"],
    furniture: ["Purchase/Repair"],
    /*rent: [],
    salary: [],
    miscellaneous: []*/
};

// Function to toggle date fields based on frequency
function toggleFrequencyFields() {
    const frequency = document.getElementById("frequency").value;
    document.getElementById("daily-date").style.display = frequency === "daily" ? "block" : "none";
    document.getElementById("date-range").style.display = frequency !== "daily" && frequency !== "" ? "block" : "none";
}

// Initialize Select2 and event listeners on page load
$(document).ready(function () {
    $('.js-example-basic-single').select2();
    $('#frequency').on('change', toggleFrequencyFields);
    toggleFrequencyFields();
});

// Function to upload files to Firebase Storage
async function uploadFiles(files) {
    const uploadedURLs = [];
    for (const file of files) {
        const fileRef = ref2(storage, `bills/${Date.now()}-${file.name}`);
        await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(fileRef);
        uploadedURLs.push(downloadURL);
    }
    return uploadedURLs;
}
// Object to store the state of each form
const formStates = {};

// Function to store form data in the state
function saveFormState(formId) {
    const formElements = document.querySelectorAll(`#${formId} [id^="subcategory-"], #${formId} input, #${formId} textarea, #${formId} select`);
    const formData = {};

    formElements.forEach(element => {
        formData[element.id] = {
            value: element.value,
            display: element.style.display,
        };
    });

    formStates[formId] = formData;
}

// Function to restore form data from the state
function restoreFormState(formId) {
    if (!formStates[formId]) return;

    const formData = formStates[formId];

    for (const [id, { value, display }] of Object.entries(formData)) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value || '';
            element.style.display = display || '';
        }
    }
}

// Update the visibility of fields based on category and subcategory
function updateSubCategoryFields(formId, subCategoryId) {
    saveFormState(formId); // Save current state before making changes

    const category = document.getElementById(`category-${formId}`).value;
    const subCategory = document.getElementById(`subcategory-${subCategoryId}`)?.value;

    const roomFieldContainer = document.getElementById(`room-floor-${subCategoryId}`);
    const unitFieldContainer = document.getElementById(`units-${subCategoryId}`);
    const measurementFieldContainer = document.getElementById(`measurementUnit-${subCategoryId}`);
    const noOfOccupantsContainer = document.getElementById(`occupants-${subCategoryId}`);

    // Reset visibility
    roomFieldContainer.style.display = "none";
    unitFieldContainer.style.display = "none";
    measurementFieldContainer.style.display = "none";
    noOfOccupantsContainer.style.display = "none";

    // Conditional visibility for "Electricity"
    if (category === "utilities" && subCategory === "Electricity") {
        roomFieldContainer.style.display = "block";
        unitFieldContainer.style.display = "block";
        measurementFieldContainer.style.display = "block";
        noOfOccupantsContainer.style.display = "block"; // Show occupants field for Electricity
    } else if (category === "utilities") {
        unitFieldContainer.style.display = "block";
    }

    restoreFormState(formId); // Restore previous state after updating visibility
}

// Function to add a subcategory container
function addSubCategory(formId) {
    const container = document.getElementById(`sub-categories-${formId}`);
    const subCategoryId = `sub-category-${Date.now()}`;

    const category = document.getElementById(`category-${formId}`).value;
    if (!category) return alert("Please select a category first!");

    const card = document.createElement("div");
    card.setAttribute("id", subCategoryId);
    card.classList.add("card", "mb-2");
    card.style.border = "1px solid #ddd"; // Added border for the card to be visible
    card.style.margin = "15px";

    // Dynamically include the Food Name and Veg/Non-Veg fields if category is "Food"

    card.innerHTML = `
        <div class="card-header d-flex justify-content-between align-items-center">
            <button id="remove-sub-category-${subCategoryId}" 
                class="ri-delete-bin-line restaurant-button mt-3" 
                style="font-size: 12px; cursor: pointer; top: 10px; right: 10px;">
            </button>
        </div>
        <div class="card-body">
            <div class="row gy-3">
                <div class="col-xl-6">
                    <label>Sub-Category:</label>
                    <select id="subcategory-${subCategoryId}" class="form-select" required>
                        ${subCategoryMap[category]
            .map(sub => `<option value="${sub}">${sub}</option>`)
            .join("")}
                    </select>
                </div>
                
                <div class="col-xl-6">
                    <div class="input-box">
                       <h6><label>Cost:</label></h6>
                       <input type="number" id="cost-${subCategoryId}" class="form-control" placeholder="Enter cost" required>
                    </div>
                </div>
                <div class="col-xl-6">
                    <div class="input-box">
                       <h6><label>Description:</label></h6>
                       <textarea id="description-${subCategoryId}" class="form-control" placeholder="Enter description"></textarea>
                    </div>
                </div>
                <div class="col-xl-6">
                    <div class="input-box">
                       <h6><label>Remarks:</label></h6>
                       <input type="text" id="remarks-${subCategoryId}" class="form-control" placeholder="Enter remarks">
                    </div>
                </div>
                <div class="col-xl-6">
                    <div class="input-box">
                       <h6><label>Bill Upload:</label></h6>
                       <input type="file" id="bill-upload-${subCategoryId}" class="form-control" multiple>
                    </div>
                </div>
                <div class="col-xl-6" id="units-${subCategoryId}">
                    <div class="input-box">
                       <h6><label>Units Consumed:</label></h6>
                       <input type="number" id="units-${subCategoryId}" class="form-control" placeholder="Enter units">
                    </div>
                </div>
                <div class="col-xl-6" id="measurementunit-${subCategoryId}">
                    <div class="input-box">
                       <h6><label>Measurement Unit:</label></h6>
                       <input type="text" id="measurementUnit-${subCategoryId}" class="form-control" placeholder="Enter unit (e.g., kWh, liters)">
                    </div>
                </div>
                <div class="col-xl-6" id="occupants-${subCategoryId}" style="display: none;">
                    <div class="input-box">
                       <h6><label>Number of Occupants:</label></h6>
                       <input type="number" id="occupants-number-${subCategoryId}" class="form-control" placeholder="Enter number of occupants">
                    </div>
                </div>
                <div class="col-xl-6" id="room-floor-${subCategoryId}" style="display: none;">
                    <div class="d-flex justify-content-between align-items-center gap-3">
                        <div class="input-box flex-grow-1">
                            <h6><label for="room-number-${subCategoryId}">Room Number:</label></h6>
                            <input type="text" id="room-number-${subCategoryId}" class="form-control" placeholder="Enter room number">
                        </div>
                        <div class="input-box flex-grow-1">
                            <h6><label for="floor-number-${subCategoryId}">Floor Number:</label></h6>
                            <input type="text" id="floor-number-${subCategoryId}" class="form-control" placeholder="Enter floor number">
                        </div>
                    </div>
                </div>
            </div> 
        </div>
    `;
    container.appendChild(card);

    document.getElementById(`subcategory-${subCategoryId}`).addEventListener("change", () => updateSubCategoryFields(formId, subCategoryId));
    document.getElementById(`remove-sub-category-${subCategoryId}`).addEventListener("click", () => removeSubCategory(subCategoryId));
}

// Function to add a new expense form
function addExpenseForm() {
    const container = document.getElementById("dynamic-expense-container");
    const formId = `expense-form-${Date.now()}`;
    categoryCounter++;

    const form = document.createElement("div");
    form.setAttribute("id", formId);
    form.classList.add("card-body", "expense-form", "mb-2");

    form.innerHTML = `
        <div class="card-header d-flex justify-content-between align-items-center">
            <h6>Category #${categoryCounter}</h6>
            <button id="remove-expense-form-${formId}" class="ri-delete-bin-line restaurant-button" style="font-size: 12px; cursor: pointer;"></button>
        </div>
        <div class="card-body">
            <div class="row gy-3">
                <div class="col-12">
                    <label>Category:</label>
                    <select id="category-${formId}" name="category" class="form-select" required>
                        ${Object.keys(subCategoryMap)
            .map(category => `<option value="${category}">${category.charAt(0).toUpperCase() + category.slice(1)}</option>`)
            .join("")}
                    </select>
                </div>
                <div class="col-12">
                    <button id="add-sub-category-${formId}" class="ri-add-line btn restaurant-button" style="width: 100%; display: block;">Add Sub-Category</button>
                </div>
                <div class="col-12" id="sub-categories-${formId}"></div>
            </div>
        </div>
    `;
    container.appendChild(form);

    document.getElementById(`category-${formId}`).addEventListener("change", () => saveFormState(formId));
    document.getElementById(`add-sub-category-${formId}`).addEventListener("click", () => addSubCategory(formId));
    document.getElementById(`remove-expense-form-${formId}`).addEventListener("click", () => removeExpenseForm(formId));
}

// Function to remove an expense form
function removeExpenseForm(formId) {
    delete formStates[formId]; // Remove the state for the deleted form
    document.getElementById(formId).remove();
}

// Function to remove a subcategory
function removeSubCategory(subCategoryId) {
    document.getElementById(subCategoryId).remove();
}

document.getElementById("addExpenseButton").addEventListener("click", addExpenseForm);

document.getElementById("saveButton").addEventListener("click", async () => { 
const hostelName = document.getElementById("hostelDropdown").value;
    if (!hostelName) {
        alert("Please select a hostel!");
        return;
    }

    const frequency = document.getElementById("frequency").value;

    // Handle "daily" or "date range" inputs
    let dateValue, dateKey;
    if (frequency === "daily") {
        const selectedDate = document.getElementById("date").value;
        if (!selectedDate) {
            alert("Please select a date for daily frequency!");
            return;
        }
        dateValue = { from: selectedDate, to: selectedDate };
        dateKey = `${selectedDate}-${selectedDate}`;
    } else {
        const fromDate = document.getElementById("fromdate")?.value;
        const toDate = document.getElementById("todate")?.value;
        if (!fromDate || !toDate) {
            alert("Please fill out both 'From' and 'To' dates!");
            return;
        }
        dateValue = { from: fromDate, to: toDate };
        dateKey = `${fromDate}-${toDate}`;
    }

    const expensesData = {}; // Object to store all expense data

    const forms = document.querySelectorAll(".card-body.expense-form");

    // Utility function to sanitize keys for Firebase
    function sanitizeKey(key) {
        return key.replace(/[.#$/\[\]]/g, "_"); // Replace invalid characters with an underscore
    }

    for (const form of forms) {
        const categoryElement = form.querySelector(`[name="category"]`);
        const category = sanitizeKey(categoryElement?.value || "");
        if (!category) continue; // Skip if category is not selected

        const subCategoryContainer = form.querySelectorAll(".card");

        for (const subCategory of subCategoryContainer) {
            const subCategoryName = sanitizeKey(subCategory.querySelector("select")?.value || "");
            const cost = subCategory.querySelector("input[type='number']")?.value || null;
            const description = subCategory.querySelector("textarea")?.value || null;
            const remarks = subCategory.querySelector("input[type='text']")?.value || null;

            const roomNumbers = subCategory
                .querySelector("input[id^='room-number']")
                ?.value.split(",")
                .map(room => room.trim())
                .filter(Boolean); // Ensure non-empty room numbers
            const floorNumber = subCategory.querySelector("input[id^='floor-number']")?.value || null;
            const units = subCategory.querySelector("input[id^='units']")?.value || null;
            const measurementUnit = subCategory.querySelector("input[id^='measurementUnit']")?.value || null;
            const noOfOccupants = subCategory.querySelector("input[id^='occupants-number']")?.value || null;

            const billFiles = subCategory.querySelector("input[type='file']")?.files;
            const billImages = billFiles ? await uploadFiles(billFiles) : [];

            // Create a unified object for all categories
            const subCategoryData = {
                category,
                subCategory: subCategoryName,
                units,
                measurementUnit,
                cost,
                description,
                remarks,
                billImages,
            };

            // Skip if all fields are empty
            if (!cost && !description && !remarks && !units && !measurementUnit) {
                continue;
            }

            // If subCategory is "Electricity", add roomNumber, floorNumber, and noOfOccupants
            if (subCategoryName === "Electricity") {
                subCategoryData.noOfOccupants = noOfOccupants;
                subCategoryData.roomNumbers = roomNumbers;
                subCategoryData.floorNumber = floorNumber;
            }

            // Add data to the expenses object under the appropriate category and subcategory
            if (!expensesData[category]) {
                expensesData[category] = {};
            }
            if (!expensesData[category][subCategoryName]) {
                expensesData[category][subCategoryName] = [];
            }
            expensesData[category][subCategoryName].push(subCategoryData);

            // Special handling for room and floor data in categories like Electricity
            if (category === "utilities" && subCategoryName === "Electricity" && roomNumbers?.length && floorNumber) {
                roomNumbers.forEach((room) => {
                    if (!expensesData[category][subCategoryName].roomData) {
                        expensesData[category][subCategoryName].roomData = {};
                    }
                    const floorKey = `floor${floorNumber}`;
                    if (!expensesData[category][subCategoryName].roomData[floorKey]) {
                        expensesData[category][subCategoryName].roomData[floorKey] = {};
                    }
                    expensesData[category][subCategoryName].roomData[floorKey][`room${room}`] = {
                        cost,
                        description,
                        remarks,
                        billImages,
                        roomNumber: room,
                        units:units,
                        measurementUnit:measurementUnit,
                        floorNumber,
                        noOfOccupants, // Include noOfOccupants for room-specific data
                    };
                });
            }
        }
    }

    // Prepare the data object to save
    const data = {
        entry_type: frequency === "daily" ? "daily" : "date_range",
        frequency,
        date: dateValue,
        expenses: expensesData,
    };

    // Validate the data before saving
    function validateData(data) {
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const value = data[key];
                if (typeof key !== "string" || /[.#$/\[\]]/.test(key)) {
                    throw new Error(`Invalid key: ${key}`);
                }
                if (typeof value === "object" && value !== null) {
                    validateData(value); // Recursive validation for nested objects
                }
            }
        }
    }

    try {
        validateData(expensesData); // Validate the expenses data

        // Save to Firebase
        const expensesRef = ref(db, `Hostel expenses/${hostelName}/${dateKey}`);
        await set(expensesRef, data);
        alert("Expenses saved successfully!");

        location.reload(); // Reload the page
    } catch (error) {
        console.error("Error saving data to Firebase:", error);
        alert("An error occurred while saving the data.");
    }
});