import { firestore } from './firebase.js';
import { onAuthStateChanged, getAuth } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

let userFullName = '';

// Function to show task details when a row is clicked
async function showTaskDetails(requestId) {
    try {
        // Fetch appointment details using requestId
        const appointmentsSnapshot = await getDocs(query(collection(firestore, 'appointments'), where('requestId', '==', requestId)));
        const appointmentData = appointmentsSnapshot.empty ? null : appointmentsSnapshot.docs[0].data();

        // Fetch request details using requestId
        const requestsSnapshot = await getDocs(query(collection(firestore, 'requests'), where('requestId', '==', requestId)));
        const requestData = requestsSnapshot.empty ? null : requestsSnapshot.docs[0].data();

        // If no appointment or request data is found, show an error message
        if (!appointmentData || !requestData) {
            alert('No details found for this request ID.');
            return;
        }

        // Hide the ongoing tasks and show the task details section
        document.getElementById('ongoing').style.display = 'none';
        document.getElementById('taskDetailsSection').style.display = 'block';

        // Fill in the task details header
        document.getElementById('taskHeader').innerHTML = `
            Requester Name: ${appointmentData.requesterName || 'N/A'} <br>
            Request ID: ${requestId} <br>
            Created At: ${appointmentData.createdAt ? new Date(appointmentData.createdAt).toLocaleDateString() : 'N/A'} <br>
            Priority Level: ${appointmentData.priorityLevel || 'N/A'}
        `;

        // Populate the samples table
        const sampleTableBody = document.getElementById('sampleTableBody');
        sampleTableBody.innerHTML = ''; // Clear previous content

        if (requestData.samples && requestData.samples.length > 0) {
            requestData.samples.forEach((sample, index) => {
                const row = `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${sample.microbeName || 'N/A'}</td>
                        <td>${sample.status || 'In Progress'}</td>
                        <td>
                            <button class="btn-report">Report</button>
                            ${['plateCount', 'microbialWaterAnalysis'].includes(requestData.requestOption) ? '<button class="btn-count-colonies">Count Colonies</button>' : ''}
                        </td>
                    </tr>
                `;
                sampleTableBody.innerHTML += row;
            });
        } else {
            sampleTableBody.innerHTML = '<tr><td colspan="4">No samples available.</td></tr>';
        }

        // Attach event listeners to the report and count colonies buttons
        document.querySelectorAll('.btn-report').forEach(button => {
            button.addEventListener('click', () => {
                alert('Report action clicked');
            });
        });

        document.querySelectorAll('.btn-count-colonies').forEach(button => {
            button.addEventListener('click', () => {
                alert('Count colonies action clicked');
            });
        });
    } catch (error) {
        console.error('Error fetching task details:', error);
        alert('An error occurred while fetching task details. Please try again later.');
    }
}

// Initialize the task list on page load
onAuthStateChanged(getAuth(), async (user) => {
    if (user) {
        const userId = user.uid;
        const userRef = collection(firestore, `laboratory_staff/${userId}`);
        const userSnapshot = await getDocs(userRef);
        const userData = userSnapshot.docs[0].data();
        userFullName = `${userData.firstName} ${userData.middleName} ${userData.lastName}`;

        // Populate ongoing task table based on the user's full name
        const ongoingTaskTableBody = document.getElementById('ongoingTaskTableBody');
        ongoingTaskTableBody.innerHTML = ''; // Clear previous content

        const appointmentsRef = collection(firestore, 'appointments');
        const appointmentsQuery = query(appointmentsRef, where('assignedStaff', '==', userFullName));
        const appointmentsSnapshot = await getDocs(appointmentsQuery);

        if (appointmentsSnapshot.empty) {
            ongoingTaskTableBody.innerHTML = '<tr><td colspan="8">No ongoing tasks available.</td></tr>';
        } else {
            for (const appointmentDoc of appointmentsSnapshot.docs) {
                const appointmentData = appointmentDoc.data();
                const requestId = appointmentData.requestId;

                const row = `
                    <tr data-request-id="${requestId}" class="ongoing-task-row">
                        <td>${appointmentData.endDate ? new Date(appointmentData.endDate).toLocaleDateString() : 'N/A'}</td>
                        <td>${requestId}</td>
                        <td>${appointmentData.requestOption || 'N/A'}</td>
                        <td>${appointmentData.clientType || 'N/A'}</td>
                        <td>${appointmentData.requesterName || 'N/A'}</td>
                        <td>${appointmentData.samples ? appointmentData.samples.length : 0}</td>
                        <td>${appointmentData.priorityLevel || 'N/A'}</td>
                        <td>${appointmentData.requestStatus || 'N/A'}</td>
                    </tr>
                `;
                ongoingTaskTableBody.innerHTML += row;
            }

            // Attach event listener for each task row to show details
            document.querySelectorAll('.ongoing-task-row').forEach(row => {
                row.addEventListener('click', function () {
                    const requestId = this.getAttribute('data-request-id');
                    showTaskDetails(requestId);
                });
            });
        }
    }
});

// Back to Tasks button functionality
document.getElementById('backToTasksButton').addEventListener('click', () => {
    document.getElementById('taskDetailsSection').style.display = 'none';
    document.getElementById('ongoing').style.display = 'block';
});
