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

/*Functionality for editing a data*
function view(){
    var table = document.getElementById('table_id');
    var cells = table.getElementsByTagName('td');
  
    for (var i = 0; i < cells.length; i++) {
        // Take each cell
        var cell = cells[i];
        // do something on onclick event for cell
        cell.onclick = function () {
            // Get the row id where the cell exists
            var rowId = this.parentNode.rowIndex;
  
            var rowsNotSelected = table.getElementsByTagName('tr');
            for (var row = 0; row < rowsNotSelected.length; row++) {
                rowsNotSelected[row].style.backgroundColor = "";
                rowsNotSelected[row].classList.remove('selected');
            }
            var rowSelected = table.getElementsByTagName('tr')[rowId];
            rowSelected.style.backgroundColor = "yellow";
            rowSelected.className += " selected";
            // msg = 'The ID of the company is: ' + rowSelected.cells[0].innerHTML;
            var hosname = rowSelected.cells[1].innerHTML;
            var hostype = rowSelected.cells[2].innerHTML;
            var hosadd1 = rowSelected.cells[3].innerHTML;
            var hosadd2 = rowSelected.cells[4].innerHTML;
            var hoscity = rowSelected.cells[5].innerHTML;
            var hosstate = rowSelected.cells[6].innerHTML;
            var hosphone = rowSelected.cells[7].innerHTML;
            var hosemail = rowSelected.cells[8].innerHTML;
            var hospin = rowSelected.cells[9].innerHTML;
            var hosrent = rowSelected.cells[10].innerHTML;
            var hosfood = rowSelected.cells[11].innerHTML;
            var hosac = rowSelected.cells[12].innerHTML;
            var hosnonac = rowSelected.cells[13].innerHTML;
            var data = [];
            data.push(hosname);
            data.push(hostype);
            data.push(hosadd1);
            data.push(hosadd2);
            data.push(hoscity);
            data.push(hosstate);
            data.push(hosphone);
            data.push(hosemail);
            data.push(hospin);
            data.push(hosrent);
            data.push(hosfood);
            data.push(hosac);
            data.push(hosnonac);
            sessionStorage.setItem('hosteldetails', data);
            window.location.href = "././edit-hostel.html";
            //window.open('edit-hostel.html', '_self');
        }
    }
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
    Hostelvegp, Hostelnvegp, Hostelbothp) => {

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
    var td15 = document.createElement('td');
    

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
    td11.innerHTML = Hostelvegp;
    td12.innerHTML = Hostelnvegp;
    td13.innerHTML = Hostelbothp;
    td14.innerHTML='<button type="button" onclick="view()"><i class="fas fa-edit"></i></button>';
    td15.innerHTML='<button type="button" onclick="remove()"><i class="fas fa-trash"></i></button>';

    trow.append(td1, td2, td3, td4, td5, td6, td7, td8, td9, td10, td11, td12, td13, td14,td15);
    tbody.append(trow);

}

const AddAllRecords = () => {
    flag = 0;
    tbody.innerHTML = "";
    hostelist.forEach(h => {
        AddsingleRecord(h.Hostelname, h.Hosteltype, h.Hosteladd1, h.Hosteladd2, h.Hostelcity, h.Hostelstate, h.Hostelphone,h.Hostelemail, h.Hostelpin,
            h.Hostelvegp, h.Hostelnvegp, h.Hostelbothp)
    })
}

window.addEventListener('load', SelectAlldataReal);
