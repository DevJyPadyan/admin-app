import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, onValue, child, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"
import { firebaseConfig } from "./firebase-config.js";
import { export_table_to_csv } from "././export-table.js"

const app = initializeApp(firebaseConfig);
const db = getDatabase();

let userDetails = [];
let flag = 0;
let tbody = document.getElementById("tbody1");

const SelectAlldataReal = () => {
    const dbref = ref(db, 'User details');
    onValue(dbref, (snapshot) => {
        userDetails = [];
        snapshot.forEach(userSnapshot => {
            const userId = userSnapshot.key;
            const userData = userSnapshot.val();

            if (userData.Bookings) {
                Object.values(userData.Bookings).forEach(booking => {
                    if (booking.RoomDetails) {
                        const roomDetails = booking.RoomDetails;
                        const paymentDetails = Object.values(roomDetails.PaymentDetails || {})[0] || {};

                        userDetails.push({
                            userFullName: userData.userFullName || "N/A",
                            userPhone: userData.userPhone || "N/A",
                            paymentAmount: paymentDetails.paymentAmount || "N/A",
                            paymentDate: paymentDetails.paymentDate
                                ? new Date(paymentDetails.paymentDate).toLocaleString()
                                : "N/A",
                            paymentMode: paymentDetails.paymentMode || "N/A",
                            paymentComplete: roomDetails.paymentComplete || "N/A",
                            room: roomDetails.room || "N/A",
                            roomType: roomDetails.roomType || "N/A"
                        });
                    }
                });
            }
        });

        // Populate table with fetched data
        AddAllRecords();
    });
};


const AddSingleRecord = (userFullName, userPhone, paymentDate, paymentAmount, paymentMode, roomType, room, paymentComplete) => {
    const trow = document.createElement("tr");

    const td1 = document.createElement("td");
    const td2 = document.createElement("td");
    const td3 = document.createElement("td");
    const td4 = document.createElement("td");
    const td5 = document.createElement("td");
    const td6 = document.createElement("td");
    const td7 = document.createElement("td");
    const td8 = document.createElement("td");
    const td9 = document.createElement("td");

    flag = flag + 1;
    td1.innerHTML = flag;
    td2.innerHTML = userFullName;
    td3.innerHTML = userPhone;
    td4.innerHTML = paymentAmount;
    td5.innerHTML = paymentDate;
    td6.innerHTML = paymentMode;
    td7.innerHTML = paymentComplete;
    td8.innerHTML = room;
    td9.innerHTML = roomType;

    trow.append(td1, td2, td3, td4, td5, td6, td7, td8, td9);
    tbody.appendChild(trow);
};

// Function to add all records to the table
const AddAllRecords = () => {
    flag = 0;
    tbody.innerHTML = "";
    userDetails.forEach(user => {
        AddSingleRecord(
            user.userFullName,
            user.userPhone,
            user.paymentAmount,
            user.paymentDate,
            user.paymentMode,
            user.paymentComplete,
            user.room,
            user.roomType
        );
    });
};

window.addEventListener("load", SelectAlldataReal);
