import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getStorage, ref as ref2, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();
const storage = getStorage(app);

// Bill Multiple Images Upload
let files = [];
let imagelink = []; // Stores uploaded image URLs

document.getElementById("files").addEventListener("change", function (e) {
    files = e.target.files;
});

// Save Bill Images to Firebase Storage and get URLs
async function uploadBillImages(hostelLocation, hostelName, period) {
    imagelink = []; // Reset imagelink array for every upload
    if (files.length === 0) {
        alert("No files selected.");
        return;
    }
    for (let i = 0; i < files.length; i++) {
        const fileName = `${new Date().getTime()}_${files[i].name}`; // Unique file name
        const storageRef = ref2(storage, `Inventory/HostelExpenses/${hostelLocation}/${hostelName}/${period}/${fileName}`);
        
        // Upload file to Firebase Storage
        const uploadResult = await uploadBytes(storageRef, files[i]);
        
        // Get the file's public URL
        const imageUrl = await getDownloadURL(uploadResult.ref); 
        imagelink.push(imageUrl); // Store the image URL
    }
    console.log("Uploaded Image URLs:", imagelink);
}

// Handle Form Submission
document.getElementById("saveDetails").addEventListener("click", async function () {
    // Retrieve basic form inputs
    const hostelName = document.getElementById("hostelname").value;
    const hostelLocation = document.getElementById("hostellocation").value;
    const period = document.getElementById("period").value;
    const fromDate = document.getElementById("fromdate").value;
    const toDate = document.getElementById("todate").value;
    const description = document.getElementById("descript").value;
    const remarks = document.getElementById("remarks").value;
    const billAmount = document.getElementById("billAmount").value;

    // Retrieve selected Category
    const selectedCategoryElement = document.querySelector('input[name="category"]:checked');
    const category = selectedCategoryElement ? {
        id: selectedCategoryElement.id, // Unique ID of the category
        value: selectedCategoryElement.value // Display value of the category
    } : null;

    // Retrieve selected Subcategories
    const selectedSubcategories = Array.from(document.querySelectorAll('.custom-checkbox:checked')).map(subcat => ({
        id: subcat.id, // Unique ID of the subcategory
        value: subcat.value // Display value of the subcategory
    }));

    // Validate required fields
    if (!hostelName || !hostelLocation || !period || !category || !billAmount) {
        alert("Please fill in all required fields.");
        return;
    }

    // Upload Images
    await uploadBillImages(hostelLocation, hostelName, period);

    // Structure the data
    const data = {
        hostelName,
        hostelLocation,
        period,
        fromDate,
        toDate,
        category, // { id: "cat-1", value: "Utilities" }
        subcategories: selectedSubcategories, // Array of selected subcategories
        description,
        remarks,
        billAmount,
        billImages: imagelink // Add uploaded image URLs to data
    };

    // Save data to Firebase Database with image URLs
    const dbPath = `Inventory/HostelExpenses/${hostelLocation}/${hostelName}/${period}/${fromDate}-${toDate}`;
    const dbRef = ref(db, dbPath);

    set(dbRef, data)
        .then(() => {
            alert('Data saved successfully with images!');
        })
        .catch((error) => {
            console.error('Error saving data:', error);
            alert('Failed to save data. Please try again.');
        });
});

// Separate Upload Button for Testing Images
document.getElementById("uploadImage").addEventListener("click", async function () {
    const hostelName = document.getElementById("hostelname").value;
    const hostelLocation = document.getElementById("hostellocation").value;
    const period = document.getElementById("period").value;

    // Ensure required fields for upload
    if (!hostelName || !hostelLocation || !period) {
        alert("Please provide hostel name, location, and period before uploading images.");
        return;
    }

    // Upload Images
    await uploadBillImages(hostelLocation, hostelName, period);
    alert("Images uploaded successfully!");
});
