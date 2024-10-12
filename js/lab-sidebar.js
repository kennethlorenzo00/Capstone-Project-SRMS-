// Sidebar Toggle
const sidebar = document.getElementById("sidebar");
const toggleSidebarBtn = document.getElementById("openSidebar"); // Reuse the burger button
const mainContent = document.getElementById("main"); // Reference to the main content div
const taskCountContainer = document.querySelector('.task-count'); // Reference to the task count container

// Initialize the sidebar as closed by default
sidebar.classList.add("minimized"); // This indicates the sidebar is initially closed
mainContent.style.marginLeft = "60px"; // Set margin for minimized state

toggleSidebarBtn.addEventListener("click", function() {
    if (sidebar.classList.contains("minimized")) {
        // Open Sidebar
        sidebar.classList.remove("minimized");  // Show the sidebar
        sidebar.classList.remove("sidebar-closed");  // Expand the sidebar
        mainContent.style.marginLeft = "200px";  // Shift main content right by the sidebar's width
        
        // Adjust task count layout
        taskCountContainer.style.justifyContent = 'flex-start'; // Ensure boxes align to the left
    } else {
        // Close Sidebar
        sidebar.classList.add("minimized");  // Collapse the sidebar
        mainContent.style.marginLeft = "60px"; // Adjust margin for minimized sidebar

        // Adjust task count layout
        taskCountContainer.style.justifyContent = 'flex-start'; // Align boxes to the left
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
