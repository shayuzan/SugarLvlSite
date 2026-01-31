/*console.log("Fetching data from Firebase Realtime Database...");*/

var d = {};

fetch("https://sugarleveltrackingapp-fad70-default-rtdb.firebaseio.com/.json")
    .then((response) => response.json())
    .then((data) => {
        d = data;
        console.log("Data fetched:", d);

        const entries = Object.entries(data).toSorted((a, b) => {
            const timeA = a[1].time;
            const timeB = b[1].time;
            return (
                timeB.year - timeA.year ||
                timeB.monthValue - timeA.monthValue ||
                timeB.dayOfMonth - timeA.dayOfMonth ||
                timeB.hour - timeA.hour ||
                timeB.minute - timeA.minute ||
                timeB.second - timeA.second
            );
        });
        console.log("Entries:", entries);

        const container = document.getElementById("list");

        container.innerHTML = entries
            .reverse()
            .map(
                ([id, entry]) => `
            <div class="card">
            <div><strong>Sugar level:</strong> ${entry.sugarLevel}</div>
            <div><strong>Note:</strong> ${entry.note || "—"}</div>
            <div><strong>Time:</strong>
                ${entry.time.dayOfMonth}/${entry.time.monthValue}/${entry.time.year}
                ${entry.time.hour}:${entry.time.minute}
            </div>
            <input type="text" id="txtAddNote" />
            <button id="updateBtn" onclick="updateEntry('${id}')">Update Note</button>
            <br />
            <button id="deleteBtn" onclick="deleteEntry('${id}')">Delete</button>
            </div>
            `,
            )
            .join("");

        createChart(entries);
    })
    .catch((error) => console.error("Error:", error));

function deleteEntry(id) {
    fetch(
        `https://sugarleveltrackingapp-fad70-default-rtdb.firebaseio.com/${id}.json`,
        {
            method: "DELETE",
        },
    )
        .then((response) => {
            if (response.ok) {
                console.log(`Entry with ID ${id} deleted successfully.`);
                location.reload();
            } else {
                console.error("Failed to delete entry.");
            }
        })
        .catch((error) => console.error("Error:", error));
}

function updateEntry(id) {
    const newNote = document.getElementById("txtAddNote").value;
    fetch(
        `https://sugarleveltrackingapp-fad70-default-rtdb.firebaseio.com/${id}/note.json`,
        {
            method: "PUT",
            body: JSON.stringify(newNote),
        },
    )
        .then((response) => {
            if (response.ok) {
                console.log(`Entry with ID ${id} updated successfully.`);
                location.reload();
            } else {
                console.error("Failed to update entry.");
            }
        })
        .catch((error) => console.error("Error:", error));
}

function createChart(entries) {
    const ctx = document.getElementById("sugarChart").getContext("2d");
    const labels = entries.map(
        ([, entry]) =>
            `${entry.time.dayOfMonth}/${entry.time.monthValue} ${entry.time.hour}:${entry.time.minute}`,
    );
    const data = entries.map(([, entry]) => entry.sugarLevel);
    new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Sugar Level Over Time",
                    data: data,
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    fill: true,
                    tension: 0.1,
                },
            ],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
}
