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
    food: ["Groceries", "Cooking Supplies - Raw Materials", "Cooking Supplies - Vegetables or Fruits"],
    maintenance: ["Repairs", "Cleaning"],
    furniture: ["Purchase/Repair"],
    rent: [],
    salary: [],
    miscellaneous: []
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

function updateSubCategoryFields(formId, subCategoryId) {
    const category = document.getElementById(`category-${formId}`).value;
    const subCategory = document.getElementById(`subcategory-${subCategoryId}`)?.value;

    const roomFieldContainer = document.getElementById(`room-floor-${subCategoryId}`);
    const unitFieldContainer = document.getElementById(`units-${subCategoryId}`);
    const measurementFieldContainer = document.getElementById(`unit-${subCategoryId}`);

    // Reset visibility
    roomFieldContainer.style.display = "none";
    unitFieldContainer.style.display = "none";
    measurementFieldContainer.style.display = "none";

    // Conditional visibility for "Electricity"
    if (category === "utilities" && subCategory === "Electricity") {
        roomFieldContainer.style.display = "block";
        unitFieldContainer.style.display = "block";
        measurementFieldContainer.style.display = "block";
    } else if (category === "utilities") {
        unitFieldContainer.style.display = "block";
    }
}

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

// Function to add a new expense form
function addExpenseForm() {
    const container = document.getElementById("dynamic-expense-container");
    const formId = `expense-form-${Date.now()}`;
    categoryCounter++;

    const form = document.createElement("div");
    form.setAttribute("id", formId);
    form.classList.add("card-body", "expense-form", "mb-2");

    // Add padding to the card body for spacing between form elements and card borders
    form.style.padding = "20px"; // Adjust this value as needed
    form.style.border = "1px solid #ddd"; // Added border for visibility

    form.innerHTML = `
    <div class="card-header d-flex justify-content-between align-items-center">
        <h6>Category #${categoryCounter}</h6>
        <button id="remove-expense-form-${formId}" class="ri-delete-bin-line restaurant-button" 
        style="font-size: 12px; cursor: pointer; top: 10px; right: 10px;"></button>
    </div>
    <div class="card-body">
        <div class="row gy-3">
            <div class="col-12">
                <h6><label>Category:</label></h6>
                <select id="category-${formId}" name="category" class="form-select" required>
                    ${Object.keys(subCategoryMap)
            .map(category => `<option value="${category}">${category.charAt(0).toUpperCase() + category.slice(1)}</option>`)
            .join("")}
                </select>
            </div>
            <div class="col-12">
                <button id="add-sub-category-${formId}" class="ri-add-line btn restaurant-button"
                style="width: 100%; display: block; text-align: center;">Add Sub-Category</button>
            </div>
            <div class="col-12" id="sub-categories-${formId}"></div>
        </div>
    </div>
`;

    container.appendChild(form);

    document.getElementById(`category-${formId}`).addEventListener("change", () => updateSubCategoryFields(formId));
    document.getElementById(`add-sub-category-${formId}`).addEventListener("click", () => addSubCategory(formId));
    document.getElementById(`remove-expense-form-${formId}`).addEventListener("click", () => removeExpenseForm(formId));
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

    card.innerHTML = `
        <div class="card-header" d-flex justify-content-between align-items-center">
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
                       <h6><label>Bill Upload</label></h6>
                       <input type="file" id="bill-upload-${subCategoryId}" class="form-control" multiple>
                    </div>
                </div>
                <div class="col-xl-6" id="units-${subCategoryId}">
                    <div class="input-box">
                       <h6><label>Units Consumed:</label></h6>
                       <input type="number" id="units-${subCategoryId}" class="form-control" placeholder="Enter units">
                    </div>
                </div>
                <div class="col-xl-6" id="unit-${subCategoryId}">
                    <div class="input-box">
                       <h6><label>Measurement Unit:</label></h6>
                       <input type="text" id="unit-${subCategoryId}" class="form-control" placeholder="Enter unit (e.g., kWh, liters)">
                    </div>
                </div>
                <div class="col-xl-6" id="room-floor-${subCategoryId}" style="display: none;">
                <div class="input-box">
                     <h6><label>Room Number:</label></h6>
                    <input type="text" id="room-number-${subCategoryId}" class="form-control" placeholder="Enter room number">
                    <h6><label>Floor Number:</label></h6>
                    <input type="text" id="floor-number-${subCategoryId}" class="form-control" placeholder="Enter floor number">
                </div>
                </div>
            </div>
        </div>
    `;
    container.appendChild(card);

    document.getElementById(`subcategory-${subCategoryId}`).addEventListener("change", () => updateSubCategoryFields(formId, subCategoryId));
    document.getElementById(`remove-sub-category-${subCategoryId}`).addEventListener("click", () => removeSubCategory(subCategoryId));
}

// Function to remove a subcategory
function removeSubCategory(subCategoryId) {
    document.getElementById(subCategoryId).remove();
}

// Function to remove an expense form
function removeExpenseForm(formId) {
    document.getElementById(formId).remove();
}

// Attach event listener for adding new expense forms
document.getElementById("addExpenseButton").addEventListener("click", addExpenseForm);

// Save data to Firebase
document.getElementById("saveButton").addEventListener("click", async () => {
    const hostelName = document.getElementById("hostelDropdown").value;
    if (!hostelName) {
        alert("Please select a hostel!");
        return;
    }
    const frequency = document.getElementById("frequency").value;

    let dateValue;
    let dateKey;
    if (frequency === "daily") {
        dateValue = document.getElementById("date").value;
        if (!dateValue) {
            alert("Please select a date for daily frequency!");
            return;
        }
        dateKey = dateValue;  // Use the actual date as the key for daily
    } else {
        const fromDate = document.getElementById("fromdate")?.value;
        const toDate = document.getElementById("todate")?.value;
        if (!fromDate || !toDate) {
            alert("Please fill out both From and To dates!");
            return;
        }
        dateValue = { from: fromDate, to: toDate };
        dateKey = `${fromDate}-${toDate}`;  // Create a string key for the date range
    }

    const expensesData = {};  // Object to hold all the expense data for the hostel  

    const forms = document.querySelectorAll(".card-body.expense-form");

    for (const form of forms) {
        const categoryElement = form.querySelector(`[name="category"]`);
        const category = categoryElement?.value;
        if (!category) continue;  // Skip if category is not selected

        const subCategoryContainer = form.querySelectorAll(".card");

        for (const subCategory of subCategoryContainer) {
            const subCategoryName = subCategory.querySelector("select")?.value;
            const cost = subCategory.querySelector("input[type='number']")?.value;
            const description = subCategory.querySelector("textarea")?.value;
            const remarks = subCategory.querySelector("input[type='text']")?.value;

            const roomNumber = subCategory.querySelector("input[id^='room-number']")?.value;
            const floorNumber = subCategory.querySelector("input[id^='floor-number']")?.value;
            const units = subCategory.querySelector("input[id^='units']")?.value;
            const measurementUnit = subCategory.querySelector(`input[id^='unit']`)?.value;

            const billFiles = subCategory.querySelector("input[type='file']")?.files;
            const billImages = billFiles ? await uploadFiles(billFiles) : [];

            // Create an object for the subcategory data
            const subCategoryData = {
                category,  // Store the selected category as part of the subcategory data
                subCategory: subCategoryName,
                units,
                measurementUnit,
                cost,
                description,
                remarks,
                billImages,
                ...(subCategoryName === "Electricity" && { roomNumber, floorNumber }),  // Only store room and floor number if subCategory is "Electricity"
            };

            // Using category as the key and subcategory as the child key
            if (!expensesData[category]) {
                expensesData[category] = {};  // Initialize category if not already present
            }
            expensesData[category][subCategoryName] = subCategoryData;  // Set subcategory data under category
        }
    }

    // Prepare the full data object to save
    const data = {
        frequency,
        date: dateValue,  // Directly store date as value
        expenses: expensesData  // All categories and their subcategories
    };
    // Ensure data is not undefined
    if (!data.date) {
        alert("Date is required!");
        return;
    }
    try {
        const expensesRef = ref(db, `Hostel expenses/${hostelName}/${frequency}/${dateKey}`);  // Use dateKey as the path
        await set(expensesRef, data);  // Using set instead of push
        alert("Expenses saved successfully!");

        location.reload();  // This will reload the page
    } catch (error) {
        console.error("Error saving data to Firebase:", error);
        alert("An error occurred while saving the data.");
    }
});