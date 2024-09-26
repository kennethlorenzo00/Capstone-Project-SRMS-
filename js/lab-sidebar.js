// Sidebar Toggle
const sidebar = document.getElementById("mySidebar");
const openSidebarBtn = document.querySelector(".openbtn");
const closeSidebarBtn = document.querySelector(".closebtn");

openSidebarBtn.addEventListener("click", function() {
    sidebar.style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
});

closeSidebarBtn.addEventListener("click", function() {
    sidebar.style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
});

// Tab functionality
function openTab(evt, tabName) {
    const tabcontents = document.querySelectorAll(".tabcontent");
    const taskListContainer = document.getElementById('taskListContainer');
    
    // Hide all tab contents
    tabcontents.forEach(tab => {
        tab.style.display = "none";
    });

    // Show the selected tab content
    const selectedTab = document.getElementById(tabName);
    selectedTab.style.display = "block";

    // Show or hide the task list based on the selected tab
    if (tabName === 'taskList') {
        taskListContainer.style.display = 'block';
    } else {
        taskListContainer.style.display = 'none';
    }
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
    openTab(event, 'home'); // Show home tab initially
});
