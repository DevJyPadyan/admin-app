import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getStorage, ref as ref2, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase();
const storage = getStorage(app);

const sessionData = { Breakfast: { dishes: [] }, Lunch: { dishes: [] }, Snacks: { dishes: [] }, Dinner: { dishes: [] } };

// Function to fetch the food menu data from Firebase
async function fetchFoodMenu() {
    const foodMenuRef = ref(db, 'Food Menu/');
    const snapshot = await get(foodMenuRef);

    const data = snapshot.val();
    if (data) {
        Object.keys(data).forEach(session => {
            const sessionDataFromDb = data[session];
            const sessionDiv = document.getElementById(session.toLowerCase());
            if (sessionDiv && sessionDataFromDb.dishes) {
                sessionData[session] = sessionDataFromDb;
                sessionDataFromDb.dishes.forEach(dish => {
                    addSubForm(session, dish);
                });
            }
        });
    }
}

// Call the fetchFoodMenu function when the page loads
window.onload = fetchFoodMenu;

// Function to toggle session visibility
function toggleSession(header) {
    const content = header.nextElementSibling;
    const arrow = header.querySelector('span');
    if (content.style.display === 'block') {
        content.style.display = 'none';
        arrow.textContent = '▶';
    } else {
        content.style.display = 'block';
        arrow.textContent = '▼';
    }
}

// Function to add a subform for a dish in a session
function addSubForm(session, dish = null) {
    const sessionDiv = document.getElementById(session.toLowerCase());
    const subformContainer = sessionDiv.querySelector('.subforms');
    const index = subformContainer.children.length;

    const subformDiv = document.createElement('div');
    subformDiv.className = 'form-group';
    subformDiv.id = `subform-${session}-${index}`; // Assign a unique ID
    subformDiv.innerHTML = `
        <input type="text" class="main-dish" placeholder="Main Dish" value="${dish?.mainDish || ''}" />
        <input type="text" class="side-dish" placeholder="Side Dishes (comma separated)" value="${dish?.sideDish || ''}" />
        <input type="text" class="special-dish" placeholder="Special Dish" value="${dish?.specialDish || ''}" />
        <input type="text" class="beverages" placeholder="Beverages (comma separated)" value="${dish?.beverages || ''}" />
        <select class="meal-type">
            <option value="Veg" ${dish?.mealType === 'Veg' ? 'selected' : ''}>Veg</option>
            <option value="Non-Veg" ${dish?.mealType === 'Non-Veg' ? 'selected' : ''}>Non-Veg</option>
        </select>
        <a class="download-link" href="${dish?.image || '#'}" target="_blank">${dish?.image ? 'Download Image' : 'No Image Uploaded'}</a>
        <button class="image-upload" id="upload-${session}-${index}"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#4D80E4"><path d="M440-200h80v-167l64 64 56-57-160-160-160 160 57 56 63-63v167ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z"/></svg></button>
        <button class="delete" id="delete-${session}-${index}"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#EA3323"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg></button>
    `;

    subformContainer.appendChild(subformDiv);

    if (!dish) {
        const newDish = {
            id: `${session[0]}D${index + 1}`,
            mainDish: '',
            sideDish: '',
            specialDish: '',
            beverages: '',
            mealType: 'Veg',
            image: ''
        };
        sessionData[session].dishes.push(newDish);
    }

    document.getElementById(`upload-${session}-${index}`).addEventListener('click', () => uploadImage(session, index));
    document.getElementById(`delete-${session}-${index}`).addEventListener('click', () => deleteSubForm(session, index));
}

// Function to upload an image for a dish
function uploadImage(session, index) {
    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*';
    imageInput.style.display = 'none';
    document.body.appendChild(imageInput);
    imageInput.click();

    imageInput.addEventListener('change', async () => {
        const file = imageInput.files[0];

        // Ask for confirmation before proceeding
        const confirmUpload = window.confirm('Are you sure you want to upload this image?');
        if (!confirmUpload) {
            document.body.removeChild(imageInput);
            return; // Exit if the user cancels the upload
        }

        // Show image preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewImage = document.createElement('img');
            previewImage.src = e.target.result;
            previewImage.style.height = '50px';
            previewImage.style.width = '50px';
            previewImage.classList.add('image-preview');

            // Add preview to the subform
            const subformDiv = document.querySelector(`#subform-${session}-${index}`);
            if (subformDiv) {
                const existingPreview = subformDiv.querySelector('.image-preview');
                if (existingPreview) {
                    existingPreview.remove(); // Remove old preview if any
                }
                subformDiv.appendChild(previewImage);
            }
        };
        reader.readAsDataURL(file);

        // Upload image to Firebase
        const storageRef = ref2(storage, `images/${session}-${index}-${file.name}`);
        try {
            const uploadTask = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(uploadTask.ref);

            // Update the image URL in sessionData
            sessionData[session].dishes[index].image = downloadURL;

            // Update the download link in the subform
            const subformDiv = document.querySelector(`#subform-${session}-${index}`);
            if (subformDiv) {
                const downloadLink = subformDiv.querySelector('.download-link');
                downloadLink.href = downloadURL;
                downloadLink.textContent = 'Download Image';
            }

            alert('Image uploaded successfully!');
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Image upload failed!');
        }

        // Clean up
        document.body.removeChild(imageInput);
    });
}

// Function to delete a subform (dish)
function deleteSubForm(session, index) {
    const sessionDiv = document.getElementById(session.toLowerCase());
    const subformContainer = sessionDiv.querySelector('.subforms');
    const subformDiv = document.querySelector(`#subform-${session}-${index}`);
    if (subformDiv) {
        subformDiv.remove();
        sessionData[session].dishes.splice(index, 1);
    }
}

// Submit button logic to update only modified session data in Firebase
document.getElementById('submit-food').addEventListener('click', async (event) => {
    event.preventDefault();

    const updates = {};

    Object.keys(sessionData).forEach(session => {
        const sessionDiv = document.getElementById(session.toLowerCase());
        const subforms = sessionDiv.querySelectorAll('.subforms .form-group');
        subforms.forEach((form, index) => {
            const mainDish = form.querySelector('.main-dish').value;
            const sideDish = form.querySelector('.side-dish').value;
            const specialDish = form.querySelector('.special-dish').value;
            const beverages = form.querySelector('.beverages').value;
            const mealType = form.querySelector('.meal-type').value;

            const currentDish = sessionData[session].dishes[index];
            const updatedDish = {
                ...currentDish,
                mainDish,
                sideDish,
                specialDish,
                beverages,
                mealType,
            };

            if (JSON.stringify(updatedDish) !== JSON.stringify(currentDish)) {
                updates[`Food Menu/${session}/dishes/${index}`] = updatedDish;
            }
        });
    });

    const foodMenuRef = ref(db);
    await update(foodMenuRef, updates);
    alert('Updated food menu data successfully!');
    window.location.href = "././food-menu-list.html";
});

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
