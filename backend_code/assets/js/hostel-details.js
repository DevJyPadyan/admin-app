import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, onValue, child, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase();

let hostelist = [];
let flag = 0;
let tbody = document.getElementById("tbody1");


/*const SelectAlldataonce = () => {
    const dbref = ref(db);
    get(child(dbref,'Hostel details')).then((snapshot)=> {

        hostelist = [];
        snapshot.forEach(h=> {
            hostelist.push(h.val());
        })
        AddAllRecords();

    })

}*/

const SelectAlldataReal = () => {
    const dbref = ref(db, 'Hostel details');
    onValue(dbref, (snapshot) => {

        hostelist = [];
        snapshot.forEach(h => {
            hostelist.push(h.val());
        })
        AddAllRecords();

    })

}

const AddsingleRecord = (Hostelname, Hosteltype, Hosteladd1, Hosteladd2, Hostelcity, Hostelstate, Hostelphone, Hostelemail, Hostelpin,
    Hostelrent, Hostelfood, Acprice, Nonacprice) => {

    var trow = document.createElement('tr');
    var td1 = document.createElement('td');
    var td2 = document.createElement('td');
    var td3 = document.createElement('td');
    var td4 = document.createElement('td');
    var td5 = document.createElement('td');
    var td6 = document.createElement('td');
    var td7 = document.createElement('td');
    var td8 = document.createElement('td');
    var td9 = document.createElement('td');
    var td10 = document.createElement('td');
    var td11 = document.createElement('td');
    var td12 = document.createElement('td');
    var td13 = document.createElement('td');
    var td14 = document.createElement('td');

    flag = flag + 1;
    td1.innerHTML = flag;
    td2.innerHTML = Hostelname;
    td3.innerHTML = Hosteltype;
    td4.innerHTML = Hosteladd1;
    td5.innerHTML = Hosteladd2;
    td6.innerHTML = Hostelcity;
    td7.innerHTML = Hostelstate;
    td8.innerHTML = Hostelphone;
    td9.innerHTML = Hostelemail;
    td10.innerHTML = Hostelpin;
    td11.innerHTML = Hostelrent;
    td12.innerHTML = Hostelfood;
    td13.innerHTML = Acprice;
    td14.innerHTML = Nonacprice;

    trow.append(td1, td2, td3, td4, td5, td6, td7, td8, td9, td10, td11, td12, td13, td14);
    tbody.append(trow);

}

const AddAllRecords = () => {
    flag = 0;
    tbody.innerHTML = "";
    hostelist.forEach(h => {
        AddsingleRecord(h.Hostelname, h.Hosteltype, h.Hosteladd1, h.Hosteladd2, h.Hostelcity, h.Hostelstate, h.Hostelphone,h.Hostelemail, h.Hostelpin,
            h.Hostelrent, h.Hostelfood, h.Acprice, h.Nonacprice)
    })
}

window.addEventListener('load', SelectAlldataReal);
