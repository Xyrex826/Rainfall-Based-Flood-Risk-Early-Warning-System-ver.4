let BARANGAYS = [];

/* ===============================
   INITIAL PAGE LOAD
================================= */
document.addEventListener("DOMContentLoaded", initPage);

async function initPage() {
    try {
        await getBarangayList();
        await loadAllBarangayForecasts();
        initSearch(); // Initialize search after loading
    } catch (error) {
        console.error("Initialization error:", error);
    }
}

/* ===============================
   FETCH BARANGAY DATA
================================= */
async function getBarangayList() {

    const response = await fetch("api/barangay_list.php");

    if (!response.ok) {
        throw new Error("Failed to fetch barangay list");
    }

    BARANGAYS = await response.json();

    console.log("Fetched barangays:", BARANGAYS);
}

/* ===============================
   LOAD FORECAST FOR ALL BARANGAYS
================================= */
async function loadAllBarangayForecasts() {

    const container = document.getElementById("allBarangaysContainer");

    if (!container) {
        console.error("Missing #allBarangaysContainer in HTML");
        return;
    }

    container.innerHTML =
        "<p style='text-align:center;'>Fetching forecast data...</p>";

    try {

        const forecastPromises = BARANGAYS.map(async (b) => {

            try {

                const response = await fetch(
                    `api/fetch_five_day_forecast.php?lat=${b.lat}&lon=${b.lon}`
                );

                if (!response.ok) {
                    throw new Error(`API error for ${b.name}`);
                }

                const list = await response.json();

                if (!Array.isArray(list)) {
                    console.warn(`Invalid forecast data for ${b.name}`);
                    return "";
                }

                const dailyData = aggregateForecastByDay(list);

                /* PASS FULL BARANGAY OBJECT */
                return buildBarangayTable(b, dailyData);

            } catch (error) {

                console.error(`Forecast error for ${b.name}:`, error);

                return `
                    <div class="barangay-section">
                        <h2>Barangay ${b.name}</h2>
                        <p style="color:red">Failed to load forecast</p>
                    </div>
                `;
            }
        });

        const results = await Promise.all(forecastPromises);

        container.innerHTML = results.join("");

    } catch (error) {

        console.error("Forecast loading failed:", error);

        container.innerHTML =
            "<p style='color:red;text-align:center;'>Failed to load forecast data</p>";
    }
}

/* ===============================
   AGGREGATE FORECAST DATA
================================= */
function aggregateForecastByDay(list) {

    const dailyData = {};

    list.forEach(item => {

        const dateKey = item.dt_txt.split(" ")[0];

        if (!dailyData[dateKey]) {

            const dateObj = new Date(item.dt_txt);

            dailyData[dateKey] = {
                rain: 0,
                rainSlots: 0,
                dayName: dateObj.toLocaleDateString("en-US", { weekday: "long" })
            };
        }

        const rainAmount = item.rain?.["3h"] || 0;

        dailyData[dateKey].rain += rainAmount;

        if (rainAmount > 0) {
            dailyData[dateKey].rainSlots++;
        }

    });

    return dailyData;
}

/* ===============================
   ELEVATION FACTOR
================================= */
function getElevationFactor(elevation, elevationType) {

    if (elevationType === "lowland") {
        return 1.5;
    }

    if (elevationType === "highland") {
        return 0.7;
    }

    if (elevation < 50) return 1.5;
    if (elevation < 150) return 1.2;
    if (elevation < 300) return 1.0;

    return 0.8;
}

/* ===============================
   RISK CALCULATION
================================= */
function calculateRisk(totalRain, intensity, elevationFactor) {

    const floodScore = (totalRain * 0.6) + (intensity * 8);

    const adjustedScore = floodScore * elevationFactor;

    if (adjustedScore > 120) {
        return { level: "danger", class: "risk-danger" };
    }

    if (adjustedScore > 60) {
        return { level: "warning", class: "risk-warning" };
    }

    return { level: "safe", class: "risk-safe" };
}

/* ===============================
   BUILD HTML TABLE
================================= */
function buildBarangayTable(barangay, dailyData) {

    const elevation = barangay.elev ?? barangay.elevation ?? 0;
    const elevationType = barangay.low_land == "1" ? "Lowland" : "Upland";

    let tableHTML = `
        <div class="barangay-section">

            <h2 class="barangay-section-title">
                ${barangay.name}
            </h2>

            <table class="forecast-table">

                <thead>
                    <tr>
                        <th>Day</th>
                        <th>Rain (mm)</th>
                        <th>Intensity (mm/h)</th>
                        <th>Periods</th>
                        <th>Elevation Factor</th>
                        <th>Risk Level</th>
                    </tr>
                </thead>

                <tbody>
    `;

   Object.keys(dailyData).slice(0, 5).forEach(dateKey => {
    const data = dailyData[dateKey];

    const totalRain = data.rain;
    const periods = data.rainSlots; // number of 3-hour periods
    const intensity = periods > 0 ? totalRain / (periods * 3) : 0;

    const elevationFactor = getElevationFactor(elevation, elevationType);
    const risk = calculateRisk(totalRain, intensity, elevationFactor);

    tableHTML += `
        <tr>
            <td>${data.dayName}</td>
            <td>${totalRain.toFixed(2)}</td>
            <td>${intensity.toFixed(2)}</td>
            <td>${periods}</td> <!-- now shows periods -->
            <td>${elevation} (${elevationType})</td>
            <td>
                <span class="risk-badge ${risk.class}">
                    ${risk.level}
                </span>
            </td>
        </tr>
    `;
});

    tableHTML += `
                </tbody>
            </table>

        </div>
    `;

    return tableHTML;
}

/* ===============================
   SEARCH BARANGAYS
================================= */
function initSearch() {
    const input = document.getElementById("searchInput");

    if (!input) return;

    input.addEventListener("input", () => {

        const filter = input.value.toLowerCase();

        const sections = document.querySelectorAll(".barangay-section");

        sections.forEach(section => {
            const title = section.querySelector(".barangay-section-title")?.textContent.toLowerCase() || "";
            section.style.display = title.includes(filter) ? "" : "none";
        });

    });
}