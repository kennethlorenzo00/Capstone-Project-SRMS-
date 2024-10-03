import { auth } from './firebase.js'; // Assuming auth is already initialized in your firebase.js
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { firestore, database } from './firebase.js';
import { collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { ref, get } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js';

async function fetchDashboardData() {
    const pendingRequestsCountEl = document.getElementById('pendingRequestsCount');
    const ongoingRequestsCountEl = document.getElementById('ongoingRequestsCount');
    const overallRequestsCountEl = document.getElementById('overallRequestsCount');
    const pendingFollowUpCountEl = document.getElementById('pendingFollowUpCount');
    const pendingAnalysisReportCountEl = document.getElementById('pendingAnalysisReportCount');
    const pendingUserRegistrationCountEl = document.getElementById('pendingUserRegistrationCount');

    // Pending Requests
    const pendingQuery = query(collection(firestore, 'requests'), where('request_status', '==', 'pending'));
    const pendingSnapshot = await getDocs(pendingQuery);
    pendingRequestsCountEl.innerText = pendingSnapshot.size;

    // Ongoing Requests
    const ongoingStatuses = ['analysing', 'verifying', 'preparing', 'inspecting', 'reporting'];
    const ongoingQuery = query(collection(firestore, 'requests'), where('request_status', 'in', ongoingStatuses));
    const ongoingSnapshot = await getDocs(ongoingQuery);
    ongoingRequestsCountEl.innerText = ongoingSnapshot.size;

    // Overall Requests (This Month)
    const currentMonth = new Date().getMonth() + 1; // Months are 0-indexed in JS
    const currentYear = new Date().getFullYear();
    const overallSnapshot = await getDocs(collection(firestore, 'requests'));
    let monthlyRequestCount = 0;
    overallSnapshot.forEach((doc) => {
        const requestData = doc.data();
        const requestDate = new Date(requestData.timeStamp);
        if (requestDate.getMonth() + 1 === currentMonth && requestDate.getFullYear() === currentYear) {
            monthlyRequestCount++;
        }
    });
    overallRequestsCountEl.innerText = monthlyRequestCount;

    // Pending Follow-Up Requests
    const followUpQuery = query(collection(firestore, 'requests'), where('typeOfRequest', '==', 'followUpRequest'));
    const followUpSnapshot = await getDocs(followUpQuery);
    pendingFollowUpCountEl.innerText = followUpSnapshot.size;

    // Pending Analysis Report Requests
    const analysisReportStatuses = ['checking', 'reporting'];
    const analysisReportQuery = query(collection(firestore, 'requests'), where('request_status', 'in', analysisReportStatuses));
    const analysisReportSnapshot = await getDocs(analysisReportQuery);
    pendingAnalysisReportCountEl.innerText = analysisReportSnapshot.size;

    // Pending User Registrations
    const userRequestsRef = ref(database, 'new_user_requests/');
    const userRequestsSnapshot = await get(userRequestsRef);
    if (userRequestsSnapshot.exists()) {
        const pendingUsers = userRequestsSnapshot.val();
        const pendingUserCount = Object.keys(pendingUsers).length;
        pendingUserRegistrationCountEl.innerText = pendingUserCount;
    } else {
        pendingUserRegistrationCountEl.innerText = 0;
    }
}

// Monitor auth state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, fetch the dashboard data
        fetchDashboardData();
    } else {
        // User is signed out, optionally clear the dashboard or prompt sign-in
        console.log("User is not signed in");
    }
});

// Optionally, add an event listener for interaction on the page
document.addEventListener('click', () => {
    // Re-fetch the dashboard data when the user clicks something
    fetchDashboardData();
});
