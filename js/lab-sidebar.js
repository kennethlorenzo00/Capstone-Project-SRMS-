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

    toggleSidebarDisabled();
});

const sectionsToCheck = [
    "sampleDurationSection",
    "colonyCountSection",
    "reportFormContainer",
    "reportContainer",
    "taskDetailsSection"
];

function isAnySectionVisible() {
    return sectionsToCheck.some(sectionId => {
        const section = document.getElementById(sectionId);
        return section && 
               section.style.display !== "none" && 
               !section.classList.contains("hidden");
    });
}

// Function to toggle sidebar disabled state
function toggleSidebarDisabled() {
    if (isAnySectionVisible()) {
        sidebar.style.pointerEvents = 'none'; // Disable sidebar interactions
        sidebar.classList.add("disabled-sidebar");
        settingsBtn.disabled = true;
    } else {
        sidebar.style.pointerEvents = 'auto'; // Enable sidebar interactions
        sidebar.classList.remove("disabled-sidebar");
        settingsBtn.disabled = false; 
    }
}

function openTab(evt, tabName) {
    const tabcontents = document.querySelectorAll(".tabcontent");
    const taskListContainer = document.getElementById('taskListContainer');
    const labSettingsSection = document.getElementById('labSettingsSection');
    
    // Hide all tab contents
    tabcontents.forEach(tab => {
        tab.style.display = "none";
    });

    labSettingsSection.classList.add('hidden'); 

    // Show the selected tab content
    const selectedTab = document.getElementById(tabName);
    selectedTab.style.display = "block";

    // Show or hide the task list based on the selected tab
    if (tabName === 'taskList') {
        taskListContainer.style.display = 'block';
    } else {
        taskListContainer.style.display = 'none';
    }

    toggleSidebarDisabled();
}

// Show tasks based on the selected type
function showTasks(taskType) {
    const taskListContainer = document.getElementById('taskListContainer');

    // Hide all task placeholders initially
    const taskPlaceholders = document.querySelectorAll('.task-placeholder');
    taskPlaceholders.forEach(task => {
        task.classList.add('hidden');
    });

    // Show the relevant task placeholder based on task type
    switch (taskType) {
        case 'allAssigned':
            document.getElementById('allAssigned').classList.remove('hidden');
            break;
        case 'ongoing':
            document.getElementById('ongoing').classList.remove('hidden');
            break;
        case 'processed':
            document.getElementById('processed').classList.remove('hidden');
            break;
        case 'rejected':
            document.getElementById('rejected').classList.remove('hidden');
            break;
        default:
            taskListContainer.innerHTML = '<p>No tasks to display.</p>';
    }
}

function showSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = "block";
        toggleSidebarDisabled();  // Ensure sidebar is disabled as soon as the section is shown
    }
}

function hideSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = "none";
        toggleSidebarDisabled();  // Ensure sidebar is enabled/disabled based on current visibility
    }
}

// Function to handle task count clicks
function handleTaskCountClick(taskType) {
    openTab(event, 'taskList'); // Open the taskList tab
    showTasks(taskType); // Show tasks based on the task type
}

// Add event listeners to task count elements
document.getElementById('assignedTasksCount').addEventListener('click', function() {
    handleTaskCountClick('allAssigned');
});

document.getElementById('ongoingTasksCount').addEventListener('click', function() {
    handleTaskCountClick('ongoing');
});

document.getElementById('processedTasksCount').addEventListener('click', function() {
    handleTaskCountClick('processed');
});

document.getElementById('rejectedTasksCount').addEventListener('click', function() {
    handleTaskCountClick('rejected');
});


// Add event listeners to task buttons
document.getElementById('allAssignedBtn').addEventListener('click', function() {
    showTasks('allAssigned');
});
document.getElementById('ongoingTasksBtn').addEventListener('click', function() {
    showTasks('ongoing');
});
document.getElementById('processedTasksBtn').addEventListener('click', function() {
    showTasks('processed');
});
document.getElementById('rejectedTasksBtn').addEventListener('click', function() {
    showTasks('rejected');
});

// Show the home tab by default on page load
document.addEventListener("DOMContentLoaded", function() {
    openTab(event, 'home');
    
    // Check if any section that disables the sidebar is visible on load
    toggleSidebarDisabled();  // Ensure the correct sidebar state on page load
});

sectionsToCheck.forEach(sectionId => {
    const section = document.getElementById(sectionId);
    if (section) {
        // Add an observer to monitor visibility changes in the section
        const observer = new MutationObserver(() => {
            toggleSidebarDisabled();  // Update the sidebar state when the section is modified
        });

        observer.observe(section, { attributes: true, childList: true, subtree: true });
    }
});
