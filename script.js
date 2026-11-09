// DATABASE

let contents = JSON.parse(
    localStorage.getItem("growthContents") || "[]"
);

let campaigns = JSON.parse(
    localStorage.getItem("growthCampaigns") || "[]"
);

// SAVE DATA

function saveData() {

    localStorage.setItem(
        "growthContents",
        JSON.stringify(contents)
    );

    localStorage.setItem(
        "growthCampaigns",
        JSON.stringify(campaigns)
    );

}

// ESCAPE USER INPUT

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);

}

// NAVIGATION

function showSection(sectionId, button) {

    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active");
    });

    document.getElementById(sectionId).classList.add("active");

    document.querySelectorAll(".sidebar button").forEach(btn => {
        btn.classList.remove("active");
    });

    button.classList.add("active");

    updateDashboard();
    displayContent();
    displayCampaigns();

}

// DASHBOARD

function updateDashboard() {

    document.getElementById("totalContent").textContent =
        contents.length;

    document.getElementById("draftCount").textContent =
        contents.filter(c => c.status === "Draft").length;

    document.getElementById("publishedCount").textContent =
        contents.filter(c => c.status === "Published").length;

    document.getElementById("campaignCount").textContent =
        campaigns.length;

    const recent = document.getElementById("recentContent");

    if (contents.length === 0) {

        recent.innerHTML = `
            <tr>
                <td colspan="4" class="empty">
                    No content available
                </td>
            </tr>
        `;

        return;
    }

    recent.innerHTML = [...contents].reverse().slice(0, 5)
        .map(c => `
            <tr>
                <td>${escapeHTML(c.title)}</td>
                <td>${escapeHTML(c.category)}</td>
                <td>${escapeHTML(c.platform)}</td>
                <td>
                    <span class="status">
                        ${escapeHTML(c.status)}
                    </span>
                </td>
            </tr>
        `).join("");

}

// ADD OR EDIT CONTENT

document.getElementById("contentForm")
.addEventListener("submit", function(e) {

    e.preventDefault();

    const editId =
        document.getElementById("editContentId").value;

    const content = {

        id: editId || Date.now(),

        title: document.getElementById("title").value.trim(),

        category: document.getElementById("category").value,

        platform: document.getElementById("platform").value,

        keywords: document.getElementById("keywords").value.trim(),

        status: document.getElementById("status").value,

        description: document.getElementById("description").value.trim()

    };

    if (editId) {

        const index = contents.findIndex(
            c => String(c.id) === editId
        );

        if (index !== -1) {
            contents[index] = content;
        }

    } else {

        contents.push(content);

    }

    saveData();

    this.reset();

    document.getElementById("editContentId").value = "";

    alert(editId
        ? "Content updated successfully!"
        : "Content saved successfully!"
    );

    displayContent();
    updateDashboard();

});

// DISPLAY CONTENT

function displayContent() {

    const search = document
        .getElementById("contentSearch")
        .value.toLowerCase();

    const filtered = contents.filter(c =>
        c.title.toLowerCase().includes(search) ||
        c.category.toLowerCase().includes(search) ||
        c.platform.toLowerCase().includes(search)
    );

    const table = document.getElementById("contentTable");

    if (filtered.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="6" class="empty">
                    No content found
                </td>
            </tr>
        `;

        return;
    }

    table.innerHTML = filtered.map(c => `
        <tr>

            <td>${escapeHTML(c.id)}</td>

            <td>${escapeHTML(c.title)}</td>

            <td>${escapeHTML(c.category)}</td>

            <td>${escapeHTML(c.platform)}</td>

            <td>
                <span class="status">
                    ${escapeHTML(c.status)}
                </span>
            </td>

            <td>

                <button class="edit-btn"
                onclick="editContent('${c.id}')">
                    Edit
                </button>

                <button class="delete-btn"
                onclick="deleteContent('${c.id}')">
                    Delete
                </button>

            </td>

        </tr>
    `).join("");

}

// EDIT CONTENT

function editContent(id) {

    const c = contents.find(
        c => String(c.id) === String(id)
    );

    if (!c) return;

    document.getElementById("editContentId").value = c.id;

    document.getElementById("title").value = c.title;

    document.getElementById("category").value = c.category;

    document.getElementById("platform").value = c.platform;

    document.getElementById("keywords").value = c.keywords;

    document.getElementById("status").value = c.status;

    document.getElementById("description").value = c.description;

    const button = [...document.querySelectorAll(".sidebar button")]
        .find(btn => btn.textContent.trim() === "Create Content");

    showSection("addContent", button);

}

// DELETE CONTENT

function deleteContent(id) {

    if (confirm("Are you sure you want to delete this content?")) {

        contents = contents.filter(
            c => String(c.id) !== String(id)
        );

        saveData();

        displayContent();
        updateDashboard();

    }

}

// ADD CAMPAIGN

document.getElementById("campaignForm")
.addEventListener("submit", function(e) {

    e.preventDefault();

    const campaign = {

        id: "CAM" + Date.now().toString().slice(-7),

        name: document.getElementById("campaignName").value.trim(),

        description: document.getElementById("campaignDescription").value.trim(),

        status: document.getElementById("campaignStatus").value

    };

    campaigns.push(campaign);

    saveData();

    this.reset();

    alert("Campaign added successfully!");

    displayCampaigns();
    updateDashboard();

});

// DISPLAY CAMPAIGNS

function displayCampaigns() {

    const table = document.getElementById("campaignTable");

    if (campaigns.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="5" class="empty">
                    No campaigns available
                </td>
            </tr>
        `;

        return;
    }

    table.innerHTML = campaigns.map(c => `
        <tr>

            <td>${escapeHTML(c.id)}</td>

            <td>${escapeHTML(c.name)}</td>

            <td>${escapeHTML(c.description)}</td>

            <td>
                <select onchange="changeCampaignStatus('${c.id}',this.value)">
                    ${["Planning","Ongoing","Completed"].map(s =>
                        `<option value="${s}"
                        ${c.status === s ? "selected" : ""}>
                            ${s}
                        </option>`
                    ).join("")}
                </select>
            </td>

            <td>
                <button class="delete-btn"
                onclick="deleteCampaign('${c.id}')">
                    Delete
                </button>
            </td>

        </tr>
    `).join("");

}

// CHANGE CAMPAIGN STATUS

function changeCampaignStatus(id, status) {

    const campaign = campaigns.find(c => c.id === id);

    if (campaign) {

        campaign.status = status;

        saveData();
        displayCampaigns();

    }

}

// DELETE CAMPAIGN

function deleteCampaign(id) {

    if (confirm("Delete this campaign?")) {

        campaigns = campaigns.filter(
            c => c.id !== id
        );

        saveData();

        displayCampaigns();
        updateDashboard();

    }

}

// INITIALIZE WEBSITE

updateDashboard();
displayContent();
displayCampaigns();