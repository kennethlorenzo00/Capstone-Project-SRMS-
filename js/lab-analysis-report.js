// Import necessary Firebase functionalities from your existing firebase.js file
import { firestore, database } from './firebase.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged  } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

// Function to get the current user
export function getCurrentUser () {
    const auth = getAuth();
    return auth.currentUser;
}

// Function to get the user's full name
async function getUserFullName(userId) {
    const userRef = ref(database, `laboratory_staff/${userId}`);
    const userSnapshot = await get(userRef);
    if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        return `${userData.firstName} ${userData.middleName} ${userData.lastName}`; // Combine names
    } else {
        throw new Error("User  data not found in laboratory_staff.");
    }
}

// Function to fetch and display all analysis reports
async function fetchAllAnalysisReports(userFullName) {
    const analysisReportTableBody = document.getElementById('analysisReportTableBody');
    analysisReportTableBody.innerHTML = ''; // Clear previous content

    const appointmentsRef = collection(firestore, 'appointments');
    const appointmentsQuery = query(appointmentsRef, where('assignedStaff', '==', userFullName));
    const appointmentsSnapshot = await getDocs(appointmentsQuery);

    // Check if there are appointments for the user
    if (appointmentsSnapshot.empty) {
        analysisReportTableBody.innerHTML = '<tr><td colspan="8">No analysis reports available.</td></tr>';
        return;
    }

    for (const appointmentDoc of appointmentsSnapshot.docs) {
        const appointmentData = appointmentDoc.data();
        const requestId = appointmentData.requestId;

        // Fetch the corresponding request document
        const requestSnapshot = await getDocs(query(collection(firestore, 'requests'), where('requestId', '==', requestId)));
        const requestData = requestSnapshot.empty ? {} : requestSnapshot.docs[0].data();

        if (!['releasing', 'checking', 'reporting'].includes(requestData.request_status)) {
            continue; // Only include tasks with 'releasing', 'checking', or 'reporting' status
        }

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
        analysisReportTableBody.innerHTML += row; // Append new row to the analysis report table
    }

    if (analysisReportTableBody.innerHTML === '') {
        analysisReportTableBody.innerHTML = '<tr><td colspan="8">No matching analysis reports found.</td></tr>';
    }
}

// Function to filter the displayed analysis reports based on search input
function filterAnalysisReports() {
    const searchBarValue = document.getElementById('searchBar').value.toLowerCase();
    const analysisReportTableBody = document.getElementById('analysisReportTableBody');
    const rows = analysisReportTableBody.getElementsByTagName('tr');

    for (const row of rows) {
        const requestIdCell = row.cells[1].textContent.toLowerCase(); // Assuming Request ID is in the second column
        const clientNameCell = row.cells[4].textContent.toLowerCase(); // Assuming Client Name is in the fifth column

        // Show or hide rows based on search criteria
        if (requestIdCell.includes(searchBarValue) || clientNameCell.includes(searchBarValue)) {
            row.style.display = ''; // Show row
        } else {
            row.style.display = 'none'; // Hide row
        }
    }
}

// Attach event listener to the search bar for filtering
document.getElementById('searchBar').addEventListener('input', filterAnalysisReports);

onAuthStateChanged(getAuth(), async (user) => {
    if (user) {
        const userFullName = await getUserFullName(user.uid); 
        fetchAllAnalysisReports(userFullName);
    }
});