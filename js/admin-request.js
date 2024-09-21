// Import the necessary Firebase modules
import { database, firestore } from './firebase.js'; // Adjust the path as needed
import { ref, get } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";
import { collection, getDocs, query, where, startAfter, limit, orderBy } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// Function to format Firestore timestamps
function formatTimestamp(timestamp) {
    if (timestamp) {
        const date = new Date(timestamp);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
    return 'Invalid Date';
}

// Get the pagination controls
const prevPageButton = document.getElementById('prevPage');
const nextPageButton = document.getElementById('nextPage');
const pageInfoSpan = document.getElementById('pageInfo');

// Initialize pagination variables
let currentPage = 1;
let lastVisible = null; // Track the last visible document
const pageSize = 5; // Number of requests per page

// Update pagination controls
function updatePaginationControls() {
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = lastVisible === null; // Disable if there's no last visible document
    pageInfoSpan.textContent = `Page ${currentPage}`;
}

// Event listener for previous page button
prevPageButton.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        populateRequestTables();
    }
    updatePaginationControls(); // Move this here to ensure it updates after changing the page
});

// Event listener for next page button
nextPageButton.addEventListener('click', () => {
    currentPage++;
    populateRequestTables();
    updatePaginationControls(); // Ensure pagination controls are updated
});

const clientRefs = {}; 

async function populateRequestTables() {
    const requestsRef = collection(firestore, 'requests');
    let requestQuery;

    // Construct the query based on pagination
    if (currentPage === 1) {
        requestQuery = query(requestsRef, orderBy('timeStamp'), limit(pageSize));
    } else {
        requestQuery = query(requestsRef, orderBy('timeStamp'), startAfter(lastVisible), limit(pageSize));
    }

    const requestsSnapshot = await getDocs(requestQuery);

    // Clear previous table data
    document.querySelector('#allRequestsTable tbody').innerHTML = "";
    document.querySelector('#serviceRequestsTable tbody').innerHTML = "";
    document.querySelector('#followUpRequestsTable tbody').innerHTML = "";

    // Loop through each request document
    for (const doc of requestsSnapshot.docs) {
        const requestData = doc.data();
        const userId = requestData.userId; // Assuming this field exists in the request document
        const requestId = requestData.requestId;
        const timestamp = requestData.timeStamp; // Firestore timestamp
        const date = formatTimestamp(timestamp); // Format date using the new function
        const typeOfRequest = requestData.typeOfRequest;

        // Fetch client details from Realtime Database if not already fetched
        if (!clientRefs[userId]) {
            const clientRef = ref(database, `clients/${userId}`);
            const clientSnapshot = await get(clientRef);
            clientRefs[userId] = clientSnapshot.val(); // Store client data in object
        }

        const clientType = clientRefs[userId].clientType || "--"; // Assuming this field exists
        const clientName = `${clientRefs[userId].firstName || ''} ${clientRefs[userId].middleName || ''} ${clientRefs[userId].lastName || ''}`.trim() || "--";

        // Calculate number of samples for the user
        const samplesCount = requestData.samples ? requestData.samples.length : 0;

        // Append data to the all requests table
        appendRowToTable('allRequestsTable', date, requestId, clientType, clientName, samplesCount, requestData.typeOfRequest || '--');

        // Append data to specific tables based on typeOfRequest
        if (requestData.typeOfRequest === 'serviceRequest') {
            appendRowToTable('serviceRequestsTable', date, requestId, clientType, clientName, samplesCount, requestData.typeOfRequest);
        } else if (requestData.typeOfRequest === 'followUpRequest') {
            appendRowToTable('followUpRequestsTable', date, requestId, clientType, clientName, samplesCount, requestData.typeOfRequest);
        }
    }

    // Update lastVisible only if there are results
    lastVisible = requestsSnapshot.docs.length > 0 ? requestsSnapshot.docs[requestsSnapshot.docs.length - 1] : null;

    // Update pagination controls
    updatePaginationControls();
}

// Function to calculate the total number of samples for a given user
async function calculateSamplesCount(userId) {
    const requestsQuery = query(collection(firestore, 'requests'), where('userId', '==', userId));
    const requestsSnapshot = await getDocs(requestsQuery);
    let totalSamples = 0;

    requestsSnapshot.forEach(doc => {
        const requestData = doc.data();
        totalSamples += (requestData.samples && Array.isArray(requestData.samples)) ? requestData.samples.length : 0;
    });

    return totalSamples;
}

// Function to append a row to a specific table
function appendRowToTable(tableId, date, requestId, clientType, clientName, samplesCount, typeOfRequest) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${date}</td>
        <td>${requestId}</td>
        <td>${clientType}</td>
        <td>${clientName}</td>
        <td>${samplesCount}</td>
        <td>${typeOfRequest}</td>
        <td style="text-align: center;">
            <button class="action-button">Action</button> <!-- Add action as needed -->
        </td>
    `;
    tableBody.appendChild(newRow);
}

// Search Functionality for All Requests
const searchInput = document.getElementById('allRequestsSearch');
searchInput.addEventListener('input', async () => {
    const searchTerm = searchInput.value.toLowerCase();

    // Fetch all requests for the current user
    const requestsRef = collection(firestore, 'requests');
    const userRequestsQuery = query(requestsRef); // Adjust as needed to filter by user
    const requestsSnapshot = await getDocs(userRequestsQuery);

    const requestListTableBody = document.querySelector('#allRequestsTable tbody');
    requestListTableBody.innerHTML = ""; // Clear the table body

    for (const doc of requestsSnapshot.docs) {
        const requestData = doc.data();
        const requestId = requestData.requestId;

        // Fetch client details from Realtime Database if not already fetched
        const userId = requestData.userId;
        if (!clientRefs[userId]) {
            const clientRef = ref(database, `clients/${userId}`);
            const clientSnapshot = await get(clientRef);
            clientRefs[userId] = clientSnapshot.val(); // Store client data in object
        }
        const clientType = clientRefs[userId].clientType || "--";
        const clientName = `${clientRefs[userId].firstName || ''} ${clientRefs[userId].middleName || ''} ${clientRefs[userId].lastName || ''}`.trim() || "--";
        const date = formatTimestamp(requestData.timeStamp);
        const typeOfRequest = requestData.typeOfRequest;
        const samplesCount = requestData.samples ? requestData.samples.length : 0;

        // Check if the requestId or client name contains the search term
        if (requestId.toLowerCase().includes(searchTerm) || clientName.toLowerCase().includes(searchTerm)) {
            const tableRow = document.createElement('tr');
            tableRow.innerHTML = `
                <td>${date}</td>
                <td>${requestId}</td>
                <td>${clientType}</td>
                <td>${clientName}</td>
                <td>${samplesCount}</td>
                <td>${typeOfRequest}</td>
                <td><button class="view-button" data-request-id="${requestId}">View</button></td>
            `;
            requestListTableBody.appendChild(tableRow);
        }
    }
});

// Search Functionality for Service Requests
const serviceSearchInput = document.getElementById('serviceRequestsSearch');
serviceSearchInput.addEventListener('input', async () => {
    const searchTerm = serviceSearchInput.value.toLowerCase();

    // Fetch all service requests for the current user
    const requestsRef = collection(firestore, 'requests');
    const serviceRequestsQuery = query(requestsRef, where('typeOfRequest', '==', 'serviceRequest')); // Filter for service requests
    const requestsSnapshot = await getDocs(serviceRequestsQuery);
    const serviceRequestsTableBody = document.querySelector('#serviceRequestsTable tbody');
    serviceRequestsTableBody.innerHTML = ""; // Clear the table body

    for (const doc of requestsSnapshot.docs) {
        const requestData = doc.data();
        const requestId = requestData.requestId;

        // Fetch client details from Realtime Database if not already fetched
        const userId = requestData.userId;
        if (!clientRefs[userId]) {
            const clientRef = ref(database, `clients/${userId}`);
            const clientSnapshot = await get(clientRef);
            clientRefs[userId] = clientSnapshot.val(); // Store client data in object
        }
        const clientType = clientRefs[userId].clientType || "--";
        const clientName = `${clientRefs[userId].firstName || ''} ${clientRefs[userId].middleName || ''} ${clientRefs[userId].lastName || ''}`.trim() || "--";
        const date = formatTimestamp(requestData.timeStamp);
        const typeOfRequest = requestData.typeOfRequest;
        const samplesCount = requestData.samples ? requestData.samples.length : 0;

        // Check if the requestId or client name contains the search term
        if (requestId.toLowerCase().includes(searchTerm) || clientName.toLowerCase().includes(searchTerm)) {
            const tableRow = document.createElement('tr');
            tableRow.innerHTML = `
                <td>${date}</td>
                <td>${requestId}</td>
                <td>${clientType}</td>
                <td>${clientName}</td>
                <td>${samplesCount}</td>
                <td>${typeOfRequest}</td>
                <td><button class="view-button" data-request-id="${requestId}">View</button></td>
            `;
            serviceRequestsTableBody.appendChild(tableRow);
        }
    }
});

// Search Functionality for Follow-Up Requests
const followUpSearchInput = document.getElementById('followUpRequestsSearch');
followUpSearchInput.addEventListener('input', async () => {
    const searchTerm = followUpSearchInput.value.toLowerCase();

    // Fetch all follow-up requests for the current user
    const requestsRef = collection(firestore, 'requests');
    const followUpRequestsQuery = query(requestsRef, where('typeOfRequest', '==', 'followUpRequest')); // Filter for follow-up requests
    const requestsSnapshot = await getDocs(followUpRequestsQuery);

    const followUpRequestsTableBody = document.querySelector('#followUpRequestsTable tbody');
    followUpRequestsTableBody.innerHTML = ""; // Clear the table body

    for (const doc of requestsSnapshot.docs) {
        const requestData = doc.data();
        const requestId = requestData.requestId;

        // Fetch client details from Realtime Database if not already fetched
        const userId = requestData.userId;
        if (!clientRefs[userId]) {
            const clientRef = ref(database, `clients/${userId}`);
            const clientSnapshot = await get(clientRef);
            clientRefs[userId] = clientSnapshot.val(); // Store client data in object
        }
        const clientType = clientRefs[userId].clientType || "--";
        const clientName = `${clientRefs[userId].firstName || ''} ${clientRefs[userId].middleName || ''} ${clientRefs[userId].lastName || ''}`.trim() || "--";
        const date = formatTimestamp(requestData.timeStamp);
        const typeOfRequest = requestData.typeOfRequest;
        const samplesCount = requestData.samples ? requestData.samples.length : 0;

        // Check if the requestId or client name contains the search term
        if (requestId.toLowerCase().includes(searchTerm) || clientName.toLowerCase().includes(searchTerm)) {
            const tableRow = document.createElement('tr');
            tableRow.innerHTML = `
                <td>${date}</td>
                <td>${requestId}</td>
                <td>${clientType}</td>
                <td>${clientName}</td>
                <td>${samplesCount}</td>
                <td>${typeOfRequest}</td>
                <td><button class="view-button" data-request-id="${requestId}">View</button></td>
            `;
            followUpRequestsTableBody.appendChild(tableRow);
        }
    }
});

// Call the function to populate the tables when the document is ready
document.addEventListener("DOMContentLoaded", function() {
    populateRequestTables();
});
