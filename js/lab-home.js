import { auth, database, firestore } from './firebase.js';
import { collection, query, where, getDocs, limit } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

// Function to display welcome message and current date
function displayWelcomeMessage(user) {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const currentDate = document.getElementById('currentDate');
    
    // Set welcome message
    const userFullName = `${user.firstName} ${user.middleName} ${user.lastName}`;
    welcomeMessage.textContent = `Hello, ${userFullName}!`;

    // Set current date
    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    currentDate.textContent = `Today is ${formattedDate}`;
}

// Fetch assigned tasks
// Fetch assigned tasks (only 'validating' and 'scheduling')
async function fetchAssignedTasksCount(userFullName) {
    const appointmentsRef = collection(firestore, 'appointments');
    const appointmentsQuery = query(appointmentsRef, where('assignedStaff', '==', userFullName));
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    let assignedCount = 0;

    for (const appointmentDoc of appointmentsSnapshot.docs) {
        const appointmentData = appointmentDoc.data();
        const requestId = appointmentData.requestId;
        const requestSnapshot = await getDocs(query(collection(firestore, 'requests'), where('requestId', '==', requestId)));
        const requestData = requestSnapshot.empty ? {} : requestSnapshot.docs[0].data();
        
        // Count only tasks where request_status is 'validating' or 'scheduling'
        if (['analysing', 'preparing'].includes(requestData.request_status)) {
            assignedCount++;
        }
    }
    console.log(`Assigned Count: ${assignedCount}`); 
    return assignedCount;
}

// Fetch ongoing tasks (exclude 'releasing', 'rejected', 'validating', 'scheduling')
async function fetchOngoingTasksCount(userFullName) {
    const appointmentsRef = collection(firestore, 'appointments');
    const appointmentsQuery = query(appointmentsRef, where('assignedStaff', '==', userFullName));
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    let ongoingCount = 0;

    for (const appointmentDoc of appointmentsSnapshot.docs) {
        const appointmentData = appointmentDoc.data();
        const requestId = appointmentData.requestId;
        const requestSnapshot = await getDocs(query(collection(firestore, 'requests'), where('requestId', '==', requestId)));
        const requestData = requestSnapshot.empty ? {} : requestSnapshot.docs[0].data();
        
        // Count tasks where request_status is not 'releasing', 'rejected', 'validating', or 'scheduling'
        if (!['releasing', 'rejected', 'analysing', 'scheduling', 'preparing', 'checking', 'reporting'].includes(requestData.request_status)) {
            ongoingCount++;
        }
    }
    console.log(`Ongoing Count: ${ongoingCount}`);
    return ongoingCount;
}

// Fetch processed tasks
async function fetchProcessedTasksCount(userFullName) {
    const appointmentsRef = collection(firestore, 'appointments');
    const appointmentsQuery = query(appointmentsRef, where('assignedStaff', '==', userFullName));
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    let processedCount = 0;

    for (const appointmentDoc of appointmentsSnapshot.docs) {
        const appointmentData = appointmentDoc.data();
        const requestId = appointmentData.requestId;
        const requestSnapshot = await getDocs(query(collection(firestore, 'requests'), where('requestId', '==', requestId)));
        const requestData = requestSnapshot.empty ? {} : requestSnapshot.docs[0].data();
        
        if (['releasing', 'checking', 'reporting'].includes(requestData.request_status)) {
            processedCount++;
        }
    }
    console.log(`Processed Count: ${processedCount}`);
    return processedCount;
}

// Fetch rejected tasks
async function fetchRejectedTasksCount(userFullName) {
    const appointmentsRef = collection(firestore, 'appointments');
    const appointmentsQuery = query(appointmentsRef, where('assignedStaff', '==', userFullName));
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    let rejectedCount = 0;

    for (const appointmentDoc of appointmentsSnapshot.docs) {
        const appointmentData = appointmentDoc.data();
        const requestId = appointmentData.requestId;
        const requestSnapshot = await getDocs(query(collection(firestore, 'requests'), where('requestId', '==', requestId)));
        const requestData = requestSnapshot.empty ? {} : requestSnapshot.docs[0].data();
        
        if (requestData.request_status === 'rejected') {
            rejectedCount++;
        }
    }
    return rejectedCount;
}

// Fetch recent tasks (last 3 tasks)
async function fetchRecentTasks(userFullName) {
    const recentTaskTableBody = document.getElementById('recentTaskTableBody');
    recentTaskTableBody.innerHTML = ''; // Clear previous content
    const appointmentsRef = collection(firestore, 'appointments');
    const appointmentsQuery = query(appointmentsRef, where('assignedStaff', '==', userFullName), limit(3));
    const appointmentsSnapshot = await getDocs(appointmentsQuery);

    for (const appointmentDoc of appointmentsSnapshot.docs) {
        const appointmentData = appointmentDoc.data();
        const requestId = appointmentData.requestId;
        const requestSnapshot = await getDocs(query(collection(firestore, 'requests'), where('requestId', '==', requestId)));
        const requestData = requestSnapshot.empty ? {} : requestSnapshot.docs[0].data();

        // Determine the display status and apply the correct class
        let displayStatus;
        let statusClass = ''; // Class for status color

        if (requestData.request_status === 'rejected') {
            displayStatus = 'Rejected';
            statusClass = 'status-rejected'; // Red color for rejected
        } else if (requestData.request_status === 'releasing') {
            displayStatus = 'Released';
            statusClass = 'status-released'; // Green color for released
        } else {
            displayStatus = 'Preparing';
            statusClass = 'status-preparing'; // Blue color for preparing
        }

        let priorityLevel = appointmentData.priorityLevel || 'N/A';
        let priorityClass = '';
        if (priorityLevel.toLowerCase() === 'low') {
            priorityClass = 'priority-low'; // Green
        } else if (priorityLevel.toLowerCase() === 'medium') {
            priorityClass = 'priority-medium'; // Yellow
        } else if (priorityLevel.toLowerCase() === 'high') {
            priorityClass = 'priority-high'; // Red
        }


        // Create the table row
        const row = `
            <tr>
                <td>${appointmentData.endDate ? new Date(appointmentData.endDate).toLocaleDateString() : 'N/A'}</td>
                <td>${requestId}</td>
                <td>${requestData.requestOption || 'N/A'}</td>
                <td>${appointmentData.requesterName || 'N/A'}</td>
                <td>${requestData.samples ? requestData.samples.length : 0}</td>
                <td><span class="${priorityClass}">${priorityLevel.charAt(0).toUpperCase() + priorityLevel.slice(1).toLowerCase()}</span></td>
                <td><span class="${statusClass}">${displayStatus}</span></td> <!-- Display status with the proper class -->
            </tr>
        `;
        recentTaskTableBody.innerHTML += row;
    }
}


// Fetch approaching deadlines
async function fetchApproachingDeadlines(userFullName) {
    const approachingDeadlinesContainer = document.querySelector('.approaching-deadlines-container');
    approachingDeadlinesContainer.innerHTML = ''; // Clear previous content
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);

    const appointmentsRef = collection(firestore, 'appointments');
    const appointmentsQuery = query(appointmentsRef, where('assignedStaff', '==', userFullName));
    const appointmentsSnapshot = await getDocs(appointmentsQuery);

    for (const appointmentDoc of appointmentsSnapshot.docs) {
        const appointmentData = appointmentDoc.data();
        const endDate = new Date(appointmentData.endDate);

        if (endDate >= now && endDate <= nextWeek) {
            const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)); // Calculate days left
            const day = endDate.getDate();
            const month = endDate.toLocaleString('default', { month: 'short' });

            const card = `
                <div class="deadline-card">
                    <div class="date-box">
                        <span class="day">${day}</span>
                        <span class="month">${month.toUpperCase()}</span>
                    </div>
                    <div class="deadline-info">
                        <h4>${appointmentData.requesterName || 'N/A'}</h4>
                        <p>Request No. ${appointmentData.requestId || 'N/A'}</p>
                        <p class="days-left">${daysLeft} days left</p>
                    </div>
                </div>
            `;
            approachingDeadlinesContainer.innerHTML += card;
        }
    }
}


// Fetch upcoming events
async function fetchUpcomingEvents() {
    const upcomingEventsList = document.querySelector('.upcoming-events-list');
    upcomingEventsList.innerHTML = ''; // Clear previous content
    const now = new Date();

    const eventsRef = collection(firestore, 'events');
    const eventsSnapshot = await getDocs(eventsRef);

    for (const eventDoc of eventsSnapshot.docs) {
        const eventData = eventDoc.data();
        const startDate = new Date(eventData.startDate);
        const daysLeft = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24)); // Calculate days left

        const day = startDate.getDate();
        const month = startDate.toLocaleString('default', { month: 'short' });

        // Create event item
        const eventItem = `
            <div class="upcomingEvents">
                <span class="event-date">${day} ${month.toUpperCase()}</span>
                <span class="event-title">${eventData.title || 'N/A'}</span>
                <span class="event-days-left">${daysLeft} days left</span>
            </div>
        `;
        upcomingEventsList.innerHTML += eventItem;
    }
}

async function updateProgressBar(userFullName) {
    const assignedCount = await fetchAssignedTasksCount(userFullName);
    const ongoingCount = await fetchOngoingTasksCount(userFullName);
    const processedCount = await fetchProcessedTasksCount(userFullName);

    const totalTasks = assignedCount + ongoingCount + processedCount;
    
    // Calculate the percentage of tasks processed
    const percentage = totalTasks > 0 ? Math.round((processedCount / totalTasks) * 100) : 0;

    // Update the progress text
    document.getElementById('progressText').textContent = `${percentage}% Total Finished`;

    // Update the circular progress
    const radius = 45; // Radius of the circle
    const circumference = 2 * Math.PI * radius; // Circumference of the circle

    const progressForeground = document.querySelector('.progress-foreground');
    const offset = circumference - (percentage / 100 * circumference); // Calculate the offset based on the percentage

    // Update the circle's stroke-dasharray and stroke-dashoffset for animation
    progressForeground.style.strokeDasharray = `${circumference} ${circumference}`;
    progressForeground.style.strokeDashoffset = offset;

    // Optional: Add animation for a smooth transition (CSS alternative)
    progressForeground.style.transition = 'stroke-dashoffset 0.5s ease';
}

// Initialize the dashboard data
async function initializeDashboard(user) {
    const userFullName = `${user.firstName} ${user.middleName} ${user.lastName}`;
    
    // Set welcome message and date
    displayWelcomeMessage(user);

    // Fetch task counts and update UI
    document.getElementById('assignedTasksCount').textContent = await fetchAssignedTasksCount(userFullName);
    document.getElementById('ongoingTasksCount').textContent = await fetchOngoingTasksCount(userFullName);
    document.getElementById('processedTasksCount').textContent = await fetchProcessedTasksCount(userFullName);
    document.getElementById('rejectedTasksCount').textContent = await fetchRejectedTasksCount(userFullName);

    await fetchRecentTasks(userFullName);

    await fetchApproachingDeadlines(userFullName);

    await fetchUpcomingEvents();

    await updateProgressBar(userFullName);
}

// Once the user is logged in, retrieve the user information from the database and initialize the dashboard
auth.onAuthStateChanged(async (user) => {
    if (user) {
        const userSnapshot = await get(ref(database, `laboratory_staff/${user.uid}`));
        const userData = userSnapshot.val();
        initializeDashboard(userData);
    }
});
