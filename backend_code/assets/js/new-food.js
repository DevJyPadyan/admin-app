import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, onValue, child, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getStorage, ref as ref2, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase();
const storage = getStorage(app);

const sessionData = { Breakfast: { dishes: [] }, Lunch: { dishes: [] }, Snacks: { dishes: [] }, Dinner: { dishes: [] } };

function toggleSession(header) {
    const content = header.nextElementSibling;
    const arrow = header.querySelector('span');
    content.style.display = content.style.display === 'block' ? 'none' : 'block';
    arrow.textContent = content.style.display === 'block' ? '▼' : '▶';
}

// Function to add a new subform (dish) for each session type (Breakfast, Lunch, Snacks, Dinner)
function addSubForm(type) {
    const sessionDiv = document.getElementById(type.toLowerCase());
    const subformContainer = sessionDiv.querySelector('.subforms');
    const index = sessionData[type].dishes.length;
    const id = `${type[0]}D${index + 1}`; // Generate a unique ID for each dish

    const subformDiv = document.createElement('div');
    subformDiv.className = 'form-group';
    subformDiv.id = id;
    subformDiv.innerHTML = `
        <input type="text" class="main-dish" placeholder="Main Dish" />
        <input type="text" class="side-dish" placeholder="Side Dishes (comma separated)" />
        <input type="text" class="special-dish" placeholder="Special Dish" />
        <input type="text" class="beverages" placeholder="Beverages (comma separated)" />
        <select class="meal-type">
            <option value="Veg">Veg</option>
            <option value="Non-Veg">Non-Veg</option>
        </select>
        <button class="image-upload" id="upload-${id}"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#4D80E4"><path d="M440-200h80v-167l64 64 56-57-160-160-160 160 57 56 63-63v167ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z"/></svg></button>
        <button class="delete" id="delete-${id}"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#EA3323"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg></button>
    `;

    subformContainer.appendChild(subformDiv);

    sessionData[type].dishes.push({ 
        id, 
        session: type, 
        mainDish: '', 
        sideDish: '', 
        specialDish: '', 
        beverages: '', 
        mealType: 'Veg', 
        image: '' 
    });

    // Add event listeners for the upload and delete buttons
    document.getElementById(`upload-${id}`).addEventListener('click', () => uploadImage(type, id));
    document.getElementById(`delete-${id}`).addEventListener('click', () => deleteSubForm(id, type));
}

// Event listeners for session headers to toggle visibility
document.getElementById('breakfast-header').addEventListener('click', function () {
    toggleSession(this);
});
document.getElementById('lunch-header').addEventListener('click', function () {
    toggleSession(this);
});
document.getElementById('snacks-header').addEventListener('click', function () {
    toggleSession(this);
});
document.getElementById('dinner-header').addEventListener('click', function () {
    toggleSession(this);
});

// Event listeners for the "Add Menu" buttons
document.getElementById('add-breakfast').addEventListener('click', () => addSubForm('Breakfast'));
document.getElementById('add-lunch').addEventListener('click', () => addSubForm('Lunch'));
document.getElementById('add-snacks').addEventListener('click', () => addSubForm('Snacks'));
document.getElementById('add-dinner').addEventListener('click', () => addSubForm('Dinner'));

// Function to upload an image to Firebase Storage and store the link in sessionData
async function uploadImage(type, id) {
    // Create a hidden file input for selecting images
    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*'; // Accept only image files
    imageInput.style.display = 'none';
    document.body.appendChild(imageInput);
    imageInput.click();

    // When the user selects a file
    imageInput.addEventListener('change', async () => {
        const file = imageInput.files[0]; // Get the selected file
        if (file) {
            // Ask the user for confirmation before proceeding with the upload
            const isConfirmed = confirm('Do you want to upload this image?');
            
            if (isConfirmed) {
                const storageRef = ref2(storage, `images/${id}-${file.name}`); // Set the file reference in Firebase Storage

                try {
                    // Upload the file to Firebase Storage
                    const uploadTaskSnapshot = await uploadBytes(storageRef, file);
                    console.log('Image uploaded:', uploadTaskSnapshot);

                    // Get the download URL of the uploaded image
                    const downloadURL = await getDownloadURL(storageRef);
                    console.log('Download URL:', downloadURL); // Log the download URL

                    // Find the corresponding dish in sessionData
                    const dish = sessionData[type].dishes.find(d => d.id === id);
                    dish.image = downloadURL; // Save image URL in sessionData

                    // Update the image preview (optional)
                    const previewContainer = document.getElementById(id);
                    const existingPreview = previewContainer.querySelector('img');
                    if (existingPreview) {
                        existingPreview.src = downloadURL; // Update existing preview
                    } else {
                        const imagePreview = document.createElement('img');
                        imagePreview.src = downloadURL;
                        imagePreview.alt = 'Uploaded Image Preview';
                        imagePreview.style.height = '50px';
                        imagePreview.style.width = '50px';
                        previewContainer.appendChild(imagePreview);
                    }

                    alert('Image uploaded successfully!');
                } catch (error) {
                    console.error('Error uploading image:', error);
                    alert('Failed to upload image. Please try again.');
                }
            } else {
                // If user cancels, do nothing
                console.log('Image upload canceled by the user');
            }
        }

        // Remove the temporary file input element
        document.body.removeChild(imageInput);
    });
}

// Function to delete a subform (dish)
function deleteSubForm(id, type) {
    const subformDiv = document.getElementById(id);
    subformDiv.remove();
    sessionData[type].dishes = sessionData[type].dishes.filter(item => item.id !== id);
}

// Submit the food data and show it in a popup
document.getElementById('submit-food').addEventListener('click', (event) => {
    event.preventDefault();

    const popupTableBody = document.querySelector('#popup-table tbody');
    popupTableBody.innerHTML = ''; // Clear previous data

    Object.keys(sessionData).forEach(type => {
        const sessionDiv = document.getElementById(type.toLowerCase());
        const subforms = sessionDiv.querySelectorAll('.subforms .form-group');
        subforms.forEach((form, index) => {
            const mainDish = form.querySelector('.main-dish').value;
            const sideDish = form.querySelector('.side-dish').value;
            const specialDish = form.querySelector('.special-dish').value;
            const beverages = form.querySelector('.beverages').value;
            const mealType = form.querySelector('.meal-type').value;

            sessionData[type].dishes[index] = {
                ...sessionData[type].dishes[index],
                mainDish,
                sideDish,
                specialDish,
                beverages,
                mealType
            };

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${type}</td>
                <td>${mainDish}</td>
                <td>${sideDish}</td>
                <td>${specialDish}</td>
                <td>${beverages}</td>
                <td>${mealType}</td>
                <td><img src="${sessionData[type].dishes[index].image}" alt="Dish Image" style="height: 50px; width: 50px;"></td>
            `;
            popupTableBody.appendChild(row);
        });
    });

    const myModal = new bootstrap.Modal(document.getElementById('foodTableModal'), {
        keyboard: false
    });
    myModal.show();
});

// Save the food data to Firebase
document.getElementById('save-food').addEventListener('click', async () => {
    const foodMenuRef = ref(db, 'Food Menu/');
    try {
        await set(foodMenuRef, sessionData); // Store sessionData in Firebase
        alert('Food menu saved successfully to Firebase!');
        window.location.href = "././food-menu-list.html";
    } catch (error) {
        console.error('Error saving data to Firebase:', error);
        alert('Failed to save food menu. Please try again.');
    }
});