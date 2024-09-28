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
        if (['validating', 'scheduling'].includes(requestData.request_status)) {
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
        if (!['releasing', 'rejected', 'validating', 'scheduling'].includes(requestData.request_status)) {
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
        
        if (['releasing'].includes(requestData.request_status)) {
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

        const row = `
            <tr>
                <td>${appointmentData.endDate ? new Date(appointmentData.endDate).toLocaleDateString() : 'N/A'}</td>
                <td>${requestId}</td>
                <td>${requestData.requestOption || 'N/A'}</td>
                <td>${appointmentData.clientType || 'N/A'}</td>
                <td>${appointmentData.requesterName || 'N/A'}</td>
                <td>${requestData.samples ? requestData.samples.length : 0}</td>
                <td>${appointmentData.priorityLevel || 'N/A'}</td>
                <td>${requestData.request_status || 'N/A'}</td>
            </tr>
        `;
        recentTaskTableBody.innerHTML += row;
    }
}

// Fetch approaching deadlines
async function fetchApproachingDeadlines(userFullName) {
    const approachingDeadlinesTableBody = document.getElementById('approachingDeadlinesTableBody');
    approachingDeadlinesTableBody.innerHTML = ''; // Clear previous content
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
            const row = `
                <tr>
                    <td>${endDate.toLocaleDateString()}</td>
                    <td>${appointmentData.requesterName || 'N/A'}</td>
                    <td>${appointmentData.requestId || 'N/A'}</td>
                    <td>${daysLeft} days left</td>
                </tr>
            `;
            approachingDeadlinesTableBody.innerHTML += row;
        }
    }
}

// Fetch upcoming events
async function fetchUpcomingEvents() {
    const upcomingEventsTableBody = document.getElementById('upcomingEventsTableBody');
    upcomingEventsTableBody.innerHTML = ''; // Clear previous content
    const now = new Date();

    const eventsRef = collection(firestore, 'events');
    const eventsSnapshot = await getDocs(eventsRef);

    for (const eventDoc of eventsSnapshot.docs) {
        const eventData = eventDoc.data();
        const startDate = new Date(eventData.startDate);
        const daysLeft = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24)); // Calculate days left

        const row = `
            <tr>
                <td>${startDate.toLocaleDateString()}</td>
                <td>${eventData.title || 'N/A'}</td>
                <td>${daysLeft} days left</td>
            </tr>
        `;
        upcomingEventsTableBody.innerHTML += row;
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
    const radius = 45; // radius of the circle
    const circumference = 2 * Math.PI * radius;

    // Set the stroke-dasharray and stroke-dashoffset for the foreground circle
    const progressForeground = document.querySelector('.progress-foreground');
    const offset = circumference - (percentage / 100 * circumference);
    progressForeground.style.strokeDasharray = `${circumference} ${circumference}`;
    progressForeground.style.strokeDashoffset = offset;
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
