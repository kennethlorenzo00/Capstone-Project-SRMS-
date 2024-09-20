// Sidebar Toggle
const sidebar = document.getElementById("sidebar");
const openSidebarBtn = document.getElementById("openSidebar");
const closeSidebarBtn = document.getElementById("closeSidebar");

openSidebarBtn.addEventListener("click", function() {
    sidebar.classList.remove("hidden");
});

closeSidebarBtn.addEventListener("click", function() {
    sidebar.classList.add("hidden");
});

// Tab functionality
function openTab(evt, tabName) {
    const tabcontents = document.querySelectorAll(".tabcontent");
    const tableContainers = document.querySelectorAll("#table-container > div");

    // Hide all tab contents
    tabcontents.forEach(tab => {
        tab.style.display = "none";
    });

    // Hide all table containers
    tableContainers.forEach(container => {
        container.style.display = "none";
    });

    // Show the selected tab content
    const selectedTab = document.getElementById(tabName);
    selectedTab.style.display = "block";

    // Manage Users functionality
    if (tabName === 'manageUsers') {
        // Show Clients table by default
        document.getElementById('clients-table-container').style.display = 'block';
        
        // Add event listeners to buttons for switching tables
        document.getElementById('clientsBtn').onclick = function() {
            tableContainers.forEach(container => container.style.display = "none");
            document.getElementById('clients-table-container').style.display = "block";
        };

        document.getElementById('staffBtn').onclick = function() {
            tableContainers.forEach(container => container.style.display = "none");
            document.getElementById('staff-table-container').style.display = "block";
        };

        document.getElementById('newRequestsBtn').onclick = function() {
            tableContainers.forEach(container => container.style.display = "none");
            document.getElementById('newRequests-table-container').style.display = "block";
        };
    }
}

// Show the home tab by default on page load
document.addEventListener("DOMContentLoaded", function() {
    openTab(event, 'home'); // Show home tab initially
});
