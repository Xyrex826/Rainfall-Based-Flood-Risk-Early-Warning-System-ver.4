const barangays = [
    { name: "Carmen", level: "safe" },
    { name: "Bulua", level: "safe" },
    { name: "Macasandig", level: "safe" },

    { name: "Lapasan", level: "monitor" },
    { name: "Kauswagan", level: "monitor" },

    { name: "Iponan", level: "alert" },
    { name: "Balulang", level: "alert" },
    { name: "Nazareth", level: "alert" },

    { name: "Macabalan", level: "critical" }
];

function openRiskModal(level) {
    const modal = document.getElementById("riskModal");
    const title = document.getElementById("modalTitle");
    const list = document.getElementById("riskBarangayList");

    list.innerHTML = "";

    title.innerText = level.toUpperCase() + " LEVEL BARANGAYS";

    const filtered = barangays.filter(b => b.level === level);

    filtered.forEach(b => {
        const row = document.createElement("tr");

        // Determine badge color and text
        let badgeClass;
        switch (b.level) {
            case "safe":
                badgeClass = "badge-safe";    // green
                break;
            case "monitor":
                badgeClass = "badge-monitor"; // yellow
                break;
            case "alert":
                badgeClass = "badge-alert";   // orange
                break;
            case "critical":
                badgeClass = "badge-critical";// red
                break;
            default:
                badgeClass = "badge-default"; // gray
        }

        row.innerHTML = `
            <td>${b.name}</td>
            <td><span class="badge ${badgeClass}">${b.level.toUpperCase()}</span></td>
        `;

        list.appendChild(row);
    });

    modal.style.display = "flex";
}

function closeRiskModal() {
    document.getElementById("riskModal").style.display = "none";
}