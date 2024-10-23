// Sidebar Toggle
const sidebar = document.getElementById("sidebar");
const toggleSidebarBtn = document.getElementById("openSidebar"); // Reuse the burger button
const mainContent = document.getElementById("main"); // Reference to the main content div
const logoutBtn = document.getElementById("logoutBtn"); // Reference to the logout button

// Initialize the sidebar as closed by default
sidebar.classList.add("minimized"); // This indicates the sidebar is initially closed
mainContent.style.marginLeft = "60px"; // Set margin for minimized state

toggleSidebarBtn.addEventListener("click", function() {
    if (sidebar.classList.contains("minimized")) {
        // Open Sidebar
        sidebar.classList.remove("minimized");  // Show the sidebar
        sidebar.classList.remove("sidebar-closed");  // Expand the sidebar
        mainContent.style.marginLeft = "200px";  // Shift main content right by the sidebar's width
        logoutBtn.classList.remove("minimized"); // Ensure logout button margin is reset
    } else {
        // Close Sidebar
        sidebar.classList.add("minimized");  // Collapse the sidebar
        mainContent.style.marginLeft = "60px"; // Adjust margin for minimized sidebar
        logoutBtn.classList.add("minimized"); // Apply minimized class to logout button
    }
});

// Define the sections that should disable the sidebar
const sections = [
    document.getElementById("requestHistoryContainer"),
    document.getElementById("forecastSection"),
    document.getElementById("adminRequestDetailsSection"),
    document.getElementById("eventDetailsModal"),
    document.getElementById("addEventForm")
];

// Function to check if any section is visible
function isAnySectionVisible() {
    return sections.some(section => section.style.display !== "none" && !section.classList.contains("hidden"));
}

// Function to toggle sidebar disabled state
function toggleSidebarDisabled() {
    if (isAnySectionVisible()) {
        sidebar.classList.add("disabled-sidebar"); // Add the disabled class
    } else {
        sidebar.classList.remove("disabled-sidebar"); // Remove the disabled class
    }
}

// Tab functionality
function openTab(evt, tabName) {
    // Check if any of the specified sections are visible
    if (isAnySectionVisible()) {
        return; // Do nothing if any section is visible
    }

    const tabcontents = document.querySelectorAll(".tabcontent");
    const tableContainers = document.querySelectorAll("#table-container > div");
    const adminSettingsSection = document.getElementById('adminSettingsSection'); // Add this line

    // Hide all tab contents
    tabcontents.forEach(tab => {
        tab.style.display = "none";
    });

    // Hide all table containers
    tableContainers.forEach(container => {
        container.style.display = "none";
    });

    adminSettingsSection.classList.add('hidden'); 
    
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
        document.getElementById ('allRequestsBtn').onclick = function() {
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

    // Toggle sidebar disabled state immediately after opening a tab
    toggleSidebarDisabled();
}

// Show the home tab by default on page load
document.addEventListener("DOMContentLoaded", function() {
    openTab(event, 'home'); // Show home tab initially
});

// Add event listeners to sections that should disable the sidebar
sections.forEach(section => {
    section.addEventListener("DOMSubtreeModified", function() {
        toggleSidebarDisabled();
    });
});