let BARANGAYS = [];

/* ===============================
   FETCH BARANGAY DATA
================================= */
async function getBarangayList() {

    try {

        const response = await fetch("api/barangay_list.php");

        if (!response.ok) {
            throw new Error("Failed to fetch barangay data");
        }

        BARANGAYS = await response.json();

        console.log(BARANGAYS); // debug

        renderTable(BARANGAYS);

    } catch (error) {
        console.error("Error:", error);
    }

}


/* ===============================
   RENDER TABLE
================================= */


function renderTable(data){

const tableBody = document.getElementById("barangayBody");
tableBody.innerHTML = "";

data.forEach(barangay => {

    const locationType = barangay.low_land == "1" ? "LOWLAND" : "HIGHLAND";

    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${barangay.name}</td>
        <td>${barangay.lat}</td>
        <td>${barangay.lon}</td>
        <td>${barangay.elev}</td>
        <td>${locationType}</td>
        <td>
    <div class="action-btns">
        <button class="btn-edit" onclick="editBarangay('${barangay.id}')" title="Edit">
            <i class="fa-solid fa-pen-to-square"></i> Edit
        </button>
        <button class="btn-delete" onclick="deleteBarangay('${barangay.id}')" title="Delete">
            <i class="fa-solid fa-trash"></i> Delete
        </button>
    </div>
</td>
    `;

    tableBody.appendChild(row);

});

}


/* ===============================
   SEARCH FUNCTION
================================= */
function setupSearch() {

    const searchInput = document.getElementById("searchInput");

    searchInput.addEventListener("input", function () {

        const keyword = this.value.toLowerCase();

        const filtered = BARANGAYS.filter(barangay =>
            barangay.name.toLowerCase().includes(keyword)
        );

        renderTable(filtered);

    });

}

function editBarangay(id){

const barangay = BARANGAYS.find(b => String(b.id) === String(id));

if(!barangay){
    console.error("Barangay not found:", id);
    return;
}

document.getElementById("formTitle").innerText = "Edit Barangay";

document.getElementById("barangayId").value = barangay.id;
document.getElementById("name").value = barangay.name;
document.getElementById("lat").value = barangay.lat;
document.getElementById("lon").value = barangay.lon;
document.getElementById("elev").value = barangay.elev;
document.getElementById("low_land").value = barangay.low_land;

document.getElementById("modalOverlay").style.display = "flex";

}

async function deleteBarangay(id){
    if(!confirm("Delete this barangay?")) return;

    try {
        const response = await fetch(`api/delete_barangay.php?id=${encodeURIComponent(id)}`);
        const text = await response.text(); // read raw text
        console.log("Raw response:", text);

        let result;
        try {
            result = JSON.parse(text);
        } catch(e) {
            console.error("Failed to parse JSON:", e, text);
            alert("Delete failed: Invalid server response");
            return;
        }

        if(result.success){
            getBarangayList();
        } else {
            alert("Delete failed: " + (result.message || result.error));
        }

    } catch(error){
        console.error("Delete request failed:", error);
        alert("Delete request failed. Check console.");
    }
}


async function saveBarangay(){

const id = document.getElementById("barangayId").value.trim();

const data = {
id: id,
name: document.getElementById("name").value.trim(),
lat: document.getElementById("lat").value.trim(),
lon: document.getElementById("lon").value.trim(),
elev: document.getElementById("elev").value.trim(),
low_land: parseInt(document.getElementById("low_land").value)
};

let url = "";

/* =========================
   ADD MODE
========================= */
if(id === ""){

    // generate ID from name
    data.id = data.name.toLowerCase().replace(/\s+/g,"_");

    // check duplicate ID
    if(BARANGAYS.some(b => b.id === data.id)){
        alert("Barangay already exists!");
        return;
    }

    url = "api/add_barangay.php";

}

/* =========================
   EDIT MODE
========================= */
else{
    url = "api/update_barangay.php";
}

await fetch(url,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(data)
});

closeForm();
getBarangayList();

}



/* ===============================
   INITIALIZE PAGE
================================= */
document.addEventListener("DOMContentLoaded", () => {

    getBarangayList();
    setupSearch();
    
    // Attach listener to elevation input for auto-filling
    const elevInput = document.getElementById("elev");
    if (elevInput) {
        elevInput.addEventListener("input", updateLocationType);
    }

});

function openAddForm() {
    // Reset form for a fresh entry
    document.getElementById("formTitle").innerText = "Add New Barangay";
    document.getElementById("barangayId").value = "";
    document.getElementById("name").value = "";
    document.getElementById("lat").value = "";
    document.getElementById("lon").value = "";
    document.getElementById("elev").value = "";
    document.getElementById("low_land").value = "1";

    // Show the modal overlay
    document.getElementById("modalOverlay").style.display = "flex";
}

function closeForm() {
    // Hide the modal overlay
    document.getElementById("modalOverlay").style.display = "none";
}

/* ===============================
   AUTO-CALCULATE LOWLAND/HIGHLAND
================================= */
function updateLocationType() {
    const elevInput = document.getElementById("elev");
    const lowLandSelect = document.getElementById("low_land");
    
    const elevation = parseFloat(elevInput.value);

    if (!isNaN(elevation)) {
        // Logic: > 10 is Highland (0), <= 10 is Lowland (1)
        if (elevation > 10) {
            lowLandSelect.value = "0"; // Highland
        } else {
            lowLandSelect.value = "1"; // Lowland
        }
    }
}

// Optional: Close modal if user clicks outside the form card
window.onclick = function(event) {
    let modal = document.getElementById("modalOverlay");
    if (event.target == modal) {
        closeForm();
    }
}
