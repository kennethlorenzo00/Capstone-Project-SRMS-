// Sidebar Toggle
const sidebar = document.getElementById("sidebar");
const toggleSidebarBtn = document.getElementById("openSidebar"); // Reuse the burger button
const mainContent = document.getElementById("main");
const header = document.querySelector('.admin-header'); // Select the header
const logo = document.querySelector(".admin-logo");

toggleSidebarBtn.addEventListener("click", function() {
    if (sidebar.classList.contains("hidden")) {
        // Open Sidebar
        sidebar.classList.remove("hidden");  // Show the sidebar
        sidebar.classList.remove("sidebar-closed");  // Expand the sidebar
        mainContent.style.marginLeft = "250px";  // Shift main content right by the sidebar's width
        header.style.width = `calc(100% - 250px)`; // Adjust header width
        header.style.left = "250px"; // Adjust header position
    } else {
        // Close Sidebar
        sidebar.classList.add("sidebar-closed");  // Collapse the sidebar
        mainContent.style.marginLeft = "0";  // Reset main content to its original position
        header.style.width = "100%"; // Reset header width
        header.style.left = "0"; // Reset header position
        sidebar.classList.add("hidden");  // Hide the sidebar
    }
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

    // Request List functionality
    if (tabName === 'requestList') {
        // Show All Requests table by default
        document.getElementById('allRequests-table-container').style.display = "block";

        // Add event listeners to buttons for switching tables
        document.getElementById('allRequestsBtn').onclick = function() {
            tableContainers.forEach(container => container.style.display = "none");
            document.getElementById('allRequests-table-container').style.display = "block";
        };

        document.getElementById('serviceRequestsBtn').onclick = function() {
            tableContainers.forEach(container => container.style.display = "none");
            document.getElementById('serviceRequests-table-container').style.display = "block";
        };

        document.getElementById('followUpRequestsBtn').onclick = function() {
            tableContainers.forEach(container => container.style.display = "none");
            document.getElementById('followUpRequests-table-container').style.display = "block";
        };
    }
}

// Show the home tab by default on page load
document.addEventListener("DOMContentLoaded", function() {
    openTab(event, 'home'); // Show home tab initially
});
