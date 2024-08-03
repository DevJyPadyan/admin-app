import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, child, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"
import { getStorage, ref as ref2, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js"
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase();
const storage = getStorage(app);

let hostelimg;
uploadImage.addEventListener('click', (e) => {

    upload();
});
async function upload() {
    console.log("hi");
    const fileInput = document.getElementById("files");
    const file = fileInput.files[0];

    if (file) {
        const storageRef = ref2(storage, `uploaded_images/${file.name}`);
        await uploadBytes(storageRef, file);

        const imageURL = await getDownloadURL(storageRef);
        const imagePreview = document.getElementById("imagePreview");
        imagePreview.src = imageURL;
        //console.log(imageURL);
        hostelimg = imageURL;
        sessionStorage.setItem('hostelurl', hostelimg);
        console.log(hostelimg);
        //image.append(imageURL);
    }
}

registerHostel.addEventListener('click', (e) => {

    var hname = document.getElementById("hostelname").value;
    var htype = document.getElementById("hosteltype").value;
    var hphone = document.getElementById("hostelphone").value;
    var hemail = document.getElementById("hostelemail").value;
    var hadd1 = document.getElementById("hosteladd1").value;
    var hadd2 = document.getElementById("hosteladd2").value;
    var hcity = document.getElementById("hostelcity").value;
    var hstate = document.getElementById("hostelstate").value;
    var hpin = document.getElementById("hostelpin").value;
    var hrent = document.getElementById("roomprice").value;
    var hfood = document.getElementById("foodprice").value;
    var ac = document.getElementById("acprice").value;
    var nonac = document.getElementById("nonprice").value;
    var imgurl = sessionStorage.getItem("hostelurl");

    if (hname == null) {

        alert("Please enter hostel name to proceed");

    }

    set(ref(db, "Hostel details/" + hname + '/'), {
        Hostelname: hname,
        Hosteltype: htype,
        Hostelphone: hphone,
        Hostelemail: hemail,
        Hosteladd1: hadd1,
        Hosteladd2: hadd2,
        Hostelcity: hcity,
        Hostelstate: hstate,
        Hostelpin: hpin,
        Hostelrent: hrent,
        Hostelfood: hfood,
        Acprice: ac,
        Nonacprice: nonac,
        Imagelink: imgurl
    })
        .then(() => {
            window.location.href = "././products.html";
        })
        .catch((error) => {
            alert(error);
        });

});

