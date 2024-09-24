// Import the necessary Firebase modules
import { database, firestore } from './firebase.js'; // Adjust the path as needed
import { ref, get, } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";
import { collection, getDocs, query, where, startAfter, limit, orderBy,updateDoc, addDoc, serverTimestamp, doc, getDoc} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// Function to format Firestore timestamps
function formatTimestamp(timestamp) {
    if (timestamp) {
        const date = new Date(timestamp);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
    return 'Invalid Date';
}

const sampleFieldMapping = {
    microbialTesting: {
        plateCount: ['sampleId', 'sampleName', 'agarType', 'sampleType'],
        agarDiscDiffusion: ['sampleId', 'sampleName', 'microbeName', 'sampleType'],
        agarWellDiffusion: ['sampleId', 'sampleName', 'microbeName', 'sampleType'],
        micTesting: ['sampleId', 'sampleName', 'sampleIdentification', 'microbeName'],
        mbcTesting: ['sampleId', 'sampleName', 'sampleIdentification', 'microbeSource'],
    },
    microbialAnalysis: {
        microbialWaterAnalysis: ['sampleId', 'sampleName', 'waterSource', 'microbeName'],
        microbialCharacterization: ['sampleId', 'sampleName', 'morphologicalCharacteristics', 'microbeSource'],
        microbialCultureCollections: ['sampleId', 'sampleName', 'microbeName', 'sampleType'],
        microscopy: ['sampleId', 'sampleName', 'specialHandling', 'sampleType'],
    },
    labResearchProcesses: {
        plantSpeciesIdentification: ['sampleId', 'plantSpecimen', 'accessionNumber', 'sampleCondition'],
    },
};

function createProgressBar(status, stages) {
    // Generate progress steps
    return `
        <div class="progress-bar">
            ${stages.map((stage, index) => `
                <div class="progress-step ${index <= stages.indexOf(status) ? 'completed' : ''}">
                    <div class="step-circle">${index + 1}</div>
                    <div class="step-label">${stage}</div>
                </div>
            `).join('')}
        </div>
    `;
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

// Get the pagination controls for request history
const prevHistoryPageButton = document.getElementById('prevHistoryPage');
const nextHistoryPageButton = document.getElementById('nextHistoryPage');
const historyPageInfoSpan = document.getElementById('historyPageInfo');

// Initialize pagination variables for request history
let currentHistoryPage = 1;
let lastVisibleReleased = null; // Track the last visible document for released requests
let lastVisibleRejected = null; // Track the last visible document for rejected requests
const historyPageSize = 5; // Number of requests per page

// Update pagination controls for request history
function updateRequestHistoryPaginationControls() {
    prevHistoryPageButton.disabled = currentHistoryPage === 1;
    nextHistoryPageButton.disabled = !lastVisibleReleased && !lastVisibleRejected; // Disable if there's no last visible document
    historyPageInfoSpan.textContent = `Page ${currentHistoryPage}`;
}

// Event listener for previous page button in request history
prevHistoryPageButton.addEventListener('click', () => {
    if (currentHistoryPage > 1) {
        currentHistoryPage--;
        populateRequestHistory();
    }
    updateRequestHistoryPaginationControls(); // Ensure pagination controls are updated
});

// Event listener for next page button in request history
nextHistoryPageButton.addEventListener('click', () => {
    currentHistoryPage++;
    populateRequestHistory();
    updateRequestHistoryPaginationControls(); // Ensure pagination controls are updated
});

function attachViewButtonListeners() {
    const viewButtons = document.querySelectorAll('.view-button');
    viewButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const requestId = event.target.dataset.requestId;
            await showRequestDetails(requestId);
            adminRequestDetailsSection.classList.remove('hidden');
            requestListContainer.classList.add('hidden'); // Add this line
            requestList.classList.add('hidden');
        });
    });
}

// Get the buttons
const requestHistoryBtn = document.getElementById('requestHistoryBtn');
const releasedRequestsBtn = document.getElementById('releasedRequestsBtn');
const rejectedRequestsBtn = document.getElementById('rejectedRequestsBtn');

// Attach event listeners to the buttons
requestHistoryBtn.addEventListener('click', showRequestHistory);
releasedRequestsBtn.addEventListener('click', showReleasedRequests);
rejectedRequestsBtn.addEventListener('click', showRejectedRequests);

function showReleasedRequests() {
  document.getElementById('releasedRequests-table-container').style.display = 'block'; // Show released requests
  document.getElementById('rejectedRequests-table-container').style.display = 'none'; // Hide rejected requests
}

function showRejectedRequests() {
  document.getElementById('releasedRequests-table-container').style.display = 'none'; // Hide released requests
  document.getElementById('rejectedRequests-table-container').style.display = 'block'; // Show rejected requests
}

const searchInputHistory = document.getElementById('releasedRequestsSearch');
searchInputHistory.addEventListener('input', async () => {
    const searchTerm = searchInputHistory.value.toLowerCase(); // Corrected input reference

    // Fetch all "releasing" requests for the current user
    const requestsRef = collection(firestore, 'requests');
    const userRequestsQuery = query(requestsRef, where('request_status', '==', 'releasing')); // Filter by status
    const requestsSnapshot = await getDocs(userRequestsQuery);

    const requestListTableBody = document.querySelector('#releasedRequestsTable tbody');
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
            attachViewButtonListeners();
        }
    }
});

const searchInputHistoryRejected = document.getElementById('rejectedRequestsSearch');
searchInputHistoryRejected.addEventListener('input', async () => {
    const searchTerm = searchInputHistoryRejected.value.toLowerCase(); // Corrected input reference

    // Fetch all "reviewing" requests for the current user
    const requestsRef = collection(firestore, 'requests');
    const userRequestsQuery = query(requestsRef, where('request_status', '==', 'reviewing')); // Filter by status
    const requestsSnapshot = await getDocs(userRequestsQuery);

    const requestListTableBody = document.querySelector('#rejectedRequestsTable tbody');
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
            attachViewButtonListeners();
        }
    }
});

async function showAppointmentPage(requestId) {
  // Clear the appointment section
  const appointmentPage = document.getElementById('appointmentPage');
  appointmentPage.innerHTML = "";

  // Fetch the request details from Firestore
  const requestsRef = collection(firestore, 'requests');
  const requestQuery = query(requestsRef, where('requestId', '==', requestId));
  const requestSnapshot = await getDocs(requestQuery);
  const requestData = requestSnapshot.docs[0]?.data();

  if (!requestData) {
    alert("Request data not found.");
    return;
  }

  // Fetch client details from Realtime Database
  const userId = requestData.userId;
  if (!clientRefs[userId]) {
    const clientRef = ref(database, `clients/${userId}`);
    const clientSnapshot = await get(clientRef);
    clientRefs[userId] = clientSnapshot.val(); // Store client data in object
  }

  const clientName = `${clientRefs[userId]?.firstName || ''} ${clientRefs[userId]?.middleName || ''} ${clientRefs[userId]?.lastName || ''}`.trim() || "--";

  // Get the number of samples
  const samplesCount = requestData.samples ? requestData.samples.length : 0;

  // Request Type
  const requestType = requestData.requestType || "--";

  // Fetch available laboratory staff from Realtime Database
  const staffRef = ref(database, 'laboratory_staff'); // Assuming this is the correct path
  const staffSnapshot = await get(staffRef);
  const staffData = staffSnapshot.val() || {};

  // Populate the laboratory staff options
  let staffOptionsHTML = `<option value="" disabled selected>Select a staff member</option>`;
  for (const staffId in staffData) {
    const staffFullName = `${staffData[staffId].firstName || ''} ${staffData[staffId].middleName || ''} ${staffData[staffId].lastName || ''}`.trim();
    staffOptionsHTML += `<option value="${staffId}">${staffFullName}</option>`;
  }

  // Populate appointment details in the page
  appointmentPage.innerHTML = `
    <h2 class="appointment-title">Appointment Page for Request ID: ${requestId}</h2>
    <div class="appointment-form-container">
      <div class="appointment-form-fields">
        <p class="appointment-requester-name"><strong>Requester Name:</strong> ${clientName}</p>
        <p class="appointment-samples-count"><strong>Number of Samples:</strong> ${samplesCount}</p>
        <p class="appointment-request-type"><strong>Request Type:</strong> ${requestType}</p>
        <form id="appointmentForm" class="appointment-form">
          <label for="startDate" class="appointment-label">Starting Date:</label>
          <input type="date" id="startDate" name="startDate" required class="appointment-input">
          
          <label for="endDate" class="appointment-label">End Date:</label>
          <input type="date" id="endDate" name="endDate" required class="appointment-input">

          <label for="priorityLevel" class="appointment-label">Priority Level:</label>
          <select id="priorityLevel" name="priorityLevel" required class="appointment-select">
            <option value="" disabled selected>Select Priority Level</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <label for="assignedStaff" class="appointment-label">Assign Laboratory Staff:</label>
          <select id="assignedStaff" name="assignedStaff" required class="appointment-select">
            ${staffOptionsHTML}
          </select>

          <button type="submit" class="appointment-button">Schedule Appointment</button>
          <button type="button" class="appointment-clear-button">Clear</button> <!-- Clear button -->
        </form>
      </div>
      <div id="calendar" class="appointment-calendar"></div>
    </div>
  `;

  // Show the appointment page and hide others
  appointmentPage.classList.remove('hidden');
  adminRequestDetailsSection.classList.add('hidden');
  requestList.classList.add('hidden');

// Add an event listener to the form for submission
const appointmentForm = document.getElementById('appointmentForm');
appointmentForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  const priorityLevel = document.getElementById('priorityLevel').value;
  const assignedStaffId = document.getElementById('assignedStaff').value;

  try {
    // Fetch staff name from the Realtime Database
    const staffRef = ref(database, `laboratory_staff/${assignedStaffId}`);
    const staffSnapshot = await get(staffRef);
    
    if (!staffSnapshot.exists()) {
      alert("Selected staff not found.");
      return;
    }
    
    const staffData = staffSnapshot.val();
    const assignedLaboratoryStaff = `${staffData.firstName || ''} ${staffData.middleName || ''} ${staffData.lastName || ''}`.trim();

    // Save appointment details to Firestore
    const appointmentsRef = collection(firestore, 'appointments');
    await addDoc(appointmentsRef, {
      requestId: requestId,
      requesterName: clientName,
      samplesCount: samplesCount,
      requestType: requestType,
      startDate: startDate,
      endDate: endDate,
      priorityLevel: priorityLevel,
      assignedStaff: assignedLaboratoryStaff, // Store the staff name
      createdAt: serverTimestamp()
    });

    // Fetch the request document based on requestId
    const requestsRef = collection(firestore, 'requests');
    const requestQuery = query(requestsRef, where('requestId', '==', requestId));
    const requestSnapshot = await getDocs(requestQuery);
    
    if (requestSnapshot.empty) {
      alert("Request not found for updating.");
      return;
    }

    const requestDoc = requestSnapshot.docs[0]; // Assuming there's only one matching document
    const requestDocId = requestDoc.id;

    // Update the request document with priorityLevel and assignedLaboratoryStaff
    const requestRef = doc(firestore, 'requests', requestDocId);
    await updateDoc(requestRef, {
      priorityLevel: priorityLevel,
      assignedLaboratoryStaff: assignedLaboratoryStaff // Store the staff name
    });

    alert('Appointment scheduled successfully!');
    appointmentForm.reset();
    appointmentPage.classList.add('hidden');
    backToRequestList(); // Or any other function to navigate back

  } catch (error) {
    console.error("Error scheduling appointment:", error);
    alert('Failed to schedule appointment. Please try again.');
  }
});

 // Initialize FullCalendar
 const calendarEl = document.getElementById('calendar');
 const calendar = new FullCalendar.Calendar(calendarEl, {
   initialView: 'dayGridMonth',
   dateClick: function (info) {
     // Prevent highlighting if the date is booked
     if (!info.event && !isDateBooked(info.dateStr)) {
       document.getElementById('startDate').value = info.dateStr;
       highlightSelectedDate(info.dateStr);
     }
   },
   events: await getAppointments(), // Fetch existing appointments
   eventColor: 'red', // Default color for booked dates
 });

 calendar.render();

 // Fetch existing appointments to highlight booked dates
 async function getAppointments() {
   const snapshot = await getDocs(collection(firestore, 'appointments'));
   return snapshot.docs.map(doc => {
     const data = doc.data();
     return {
       title: 'Booked',
       start: data.startDate,
       color: 'red',
       extendedProps: { isBooked: true }
     };
   });
 }

 // Check if a date is booked
 function isDateBooked(dateStr) {
   return calendar.getEvents().some(event => event.startStr === dateStr && event.extendedProps.isBooked);
 }

 // Highlight selected date in blue
 let highlightedDate = null; // Keep track of the currently highlighted date

 function highlightSelectedDate(dateStr) {
   // Reset previously highlighted date
   if (highlightedDate) {
     const previousEvent = calendar.getEvents().find(event => event.startStr === highlightedDate);
     if (previousEvent) {
       previousEvent.remove(); // Remove previous highlight
     }
   }

   // Add a new event for the selected date
   highlightedDate = dateStr; // Update highlighted date
   calendar.addEvent({
     title: 'Selected',
     start: dateStr,
     color: 'blue',
     extendedProps: { isSelected: true }
   });
 }

 const clearButton = document.querySelector('.appointment-clear-button');
  clearButton.addEventListener('click', () => {
    appointmentForm.reset();
    document.getElementById('startDate').value = ''; // Reset start date
    document.getElementById('endDate').value = ''; // Reset end date
    highlightedDate = null; // Reset highlighted date
    calendar.getEvents().forEach(event => {
      if (event.extendedProps.isSelected) {
        event.remove(); // Remove the highlighted event
      }
    });
  });
  
}

// Function to show the request history and populate it
async function showRequestHistory() {
  document.getElementById('requestList').style.display = 'none'; // Hide the request list
  document.getElementById('requestHistoryContainer').style.display = 'block'; // Show the request history

  // Call the function to populate request history data
  await populateRequestHistory(); // Wait for the request history data to be populated
}

async function populateRequestHistory() {
  const requestsRef = collection(firestore, 'requests');
  
  // Query for requests with request_status 'releasing' and 'rejected'
  let releasingQuery;
  let rejectedQuery;
  
  if (currentHistoryPage === 1) {
      // Initial page
      releasingQuery = query(requestsRef, where('request_status', '==', 'releasing'), orderBy('timeStamp'), limit(historyPageSize));
      rejectedQuery = query(requestsRef, where('request_status', '==', 'reviewing'), orderBy('timeStamp'), limit(historyPageSize));
  } else {
      // Subsequent pages, use startAfter to paginate
      releasingQuery = query(requestsRef, where('request_status', '==', 'releasing'), orderBy('timeStamp'), startAfter(lastVisibleReleased), limit(historyPageSize));
      rejectedQuery = query(requestsRef, where('request_status', '==', 'reviewing'), orderBy('timeStamp'), startAfter(lastVisibleRejected), limit(historyPageSize));
  }

  const releasingSnapshot = await getDocs(releasingQuery);
  const rejectedSnapshot = await getDocs(rejectedQuery);

  // Clear previous table data
  document.querySelector('#releasedRequestsTable tbody').innerHTML = "";
  document.querySelector('#rejectedRequestsTable tbody').innerHTML = "";

  let hasReleasedRequests = false;
  let hasRejectedRequests = false;

  // Populate released requests table
  for (const doc of releasingSnapshot.docs) {
      const requestData = doc.data();
      const userId = requestData.userId;
      const requestId = requestData.requestId;
      const timestamp = requestData.timeStamp; // Firestore timestamp
      const date = formatTimestamp(timestamp); // Format date using your timestamp function

      // Fetch client details
      const clientType = await getClientType(userId); // Implement this function as needed
      const clientName = await getClientName(userId); // Implement this function as needed

      const samplesCount = requestData.samples ? requestData.samples.length : 0;

      // Append data to the released requests table
      appendRowToTable('releasedRequestsTable', date, requestId, clientType, clientName, samplesCount, requestData.typeOfRequest || '--');
      hasReleasedRequests = true; // Mark that we have released requests
  }

  // Populate rejected requests table
  for (const doc of rejectedSnapshot.docs) {
      const requestData = doc.data();
      const userId = requestData.userId;
      const requestId = requestData.requestId;
      const timestamp = requestData.timeStamp; // Firestore timestamp
      const date = formatTimestamp(timestamp); // Format date using your timestamp function

      // Fetch client details
      const clientType = await getClientType(userId); // Implement this function as needed
      const clientName = await getClientName(userId); // Implement this function as needed

      const samplesCount = requestData.samples ? requestData.samples.length : 0;

      // Append data to the rejected requests table
      appendRowToTable('rejectedRequestsTable', date, requestId, clientType, clientName, samplesCount, requestData.typeOfRequest || '--');
      hasRejectedRequests = true; // Mark that we have rejected requests
  }

  // Update lastVisible for both released and rejected requests
  lastVisibleReleased = releasingSnapshot.docs.length > 0 ? releasingSnapshot.docs[releasingSnapshot.docs.length - 1] : null;
  lastVisibleRejected = rejectedSnapshot.docs.length > 0 ? rejectedSnapshot.docs[rejectedSnapshot.docs.length - 1] : null;

  // Show the appropriate request history tables and hide the original request tables
  document.getElementById('releasedRequests-table-container').style.display = hasReleasedRequests ? 'block' : 'none';
  document.getElementById('rejectedRequests-table-container').style.display = hasRejectedRequests ? 'block' : 'none';

  // Update pagination controls if necessary
  updateRequestHistoryPaginationControls();
}

// Helper functions to get client type and name
async function getClientType(userId) {
  const clientRef = ref(database, `clients/${userId}`);
  const clientSnapshot = await get(clientRef);
  return clientSnapshot.val().clientType || '--'; // Assuming this field exists
}

async function getClientName(userId) {
  const clientRef = ref(database, `clients/${userId}`);
  const clientSnapshot = await get(clientRef);
  const clientData = clientSnapshot.val();
  return `${clientData.firstName || ''} ${clientData.middleName || ''} ${clientData.lastName || ''}`.trim() || "--";
}


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

const requestListContainer = document.getElementById('requestListContainer');
const requestList = document.getElementById('requestList');
const adminRequestDetailsSection = document.getElementById('adminRequestDetailsSection');
const adminRequestDetailsContent = document.getElementById('adminRequestDetailsContent');
const adminRequestDetailsHeader = document.getElementById('adminRequestDetailsHeader');

// Function to show request details
async function showRequestDetails(requestId) {
  const requestsRef = collection(firestore, 'requests');
  const requestQuery = query(requestsRef, where('requestId', '==', requestId));
  const requestSnapshot = await getDocs(requestQuery);

  // Clear previous details
  adminRequestDetailsHeader.innerHTML = ""; 
  adminRequestDetailsContent.innerHTML = ""; 

  if (!requestSnapshot.empty) {
    const requestDoc = requestSnapshot.docs[0].data();
    const userId = requestDoc.userId;

    // Fetch the withMOU status from Realtime Database
    const clientRef = ref(database, `clients/${userId}/withMOU`); 
    const clientSnapshot = await get(clientRef);
    const withMOU = clientSnapshot.exists() ? clientSnapshot.val() : false;

    // Create request information header
    adminRequestDetailsHeader.innerHTML = `<h2>Request Information</h2>`;
    
    // Display basic request information
    const requestInfoDiv = document.createElement('div');
    requestInfoDiv.style.cssText = 'text-align: right;';
    requestInfoDiv.innerHTML = `
      <p><strong>Timestamp:</strong> ${formatTimestamp(requestDoc.timeStamp)}</p>
      <p><strong>Request ID:</strong> ${requestDoc.requestId}</p>
    `;
    adminRequestDetailsContent.appendChild(requestInfoDiv);

    // Determine fields based on the request type and option
    const fields = sampleFieldMapping[requestDoc.requestType][requestDoc.requestOption];

    let tableHTML = '';

    // Check if the request has samples
    if (requestDoc.samples && requestDoc.samples.length > 0) {
      // Define sample stages and get current stage
      const sampleStages = [
        { label: "Submit Request", value: "pending" }, 
        { label: "Reviewing Request", value: "reviewing" },
        { label: "Send Samples", value: "sending" },
        { label: "Validating Samples", value: "validating" },
        { label: "Analysis in Progress", value: "analysing" },
        { label: "Verifying Analysis Report", value: "verifying" },
        { label: "Released Analysis Report", value: "releasing" }
      ];
      const currentStageIndex = sampleStages.findIndex(stage => stage.value === requestDoc.request_status);
      const sampleStatus = sampleStages[currentStageIndex >= 0 ? currentStageIndex : 0].label;

      // Generate progress bar
      const sampleProgressBarHTML = createProgressBar(sampleStatus, sampleStages.map(stage => stage.label));
      
      // Generate table for samples
      tableHTML = `
        ${sampleProgressBarHTML}
        <table class="requestDetailsTable">
          <thead>
            <tr>
              ${fields.map(field => `<th>${field.replace(/([A-Z])/g, ' $1').toUpperCase()}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${requestDoc.samples.map(sample => `
              <tr>
                ${fields.map(field => `<td>${sample[field] || '--'}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      // Handle other cases when no samples are present
      if (requestDoc.requestOption === 'researchCollaboration') {
        let researchStages;

        if (withMOU) {
          // Define the simplified stages when MOU is already in place
          researchStages = [
            { label: "Submit Request", value: "pending" },
            { label: "Reviewing Request", value: "reviewing" },
            { label: "Collaboration Management", value: "managing" }
          ];
        } else {
          // Define the full stages when MOU is not yet in place
          researchStages = [
            { label: "Submit Request", value: "pending" },
            { label: "Reviewing Request", value: "reviewing" },
            { label: "Initiating Contact", value: "initiating" },
            { label: "Drafting and Reviewing of MOU", value: "drafting" },
            { label: "Legal Review and Approval of MOU", value: "approving" },
            { label: "Formal Signing of MOU", value: "signing" },
            { label: "Collaboration Management", value: "managing" }
          ];
        }

        // Find the current stage index based on request_status
        const currentStageIndex = researchStages.findIndex(stage => stage.value === requestDoc.request_status);
        const researchStatus = researchStages[currentStageIndex >= 0 ? currentStageIndex : 0].label; // Default to the first stage if not found

        // Generate the progress bar based on the current stage
        const progressBarHTML = createProgressBar(researchStatus, researchStages.map(stage => stage.label));
        
        // Generate the table for research collaboration details
        tableHTML = `
          ${progressBarHTML}
          <table class="requestDetailsTable"> 
            <thead>
              <tr>
                <th>Project Title</th>
                <th>Principal Investigator</th >
                <th>Collaborating Institutions</th>
                <th>Objectives</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Funding</th>
                <th>Roles & Responsibilities</th>
                <th>Deliverables</th>
                <th>Confidentiality</th>
                <th>Contact Information</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${requestDoc.projectTitle || '--'}</td>
                <td>${requestDoc.principalInvestigator || '--'}</td>
                <td>${requestDoc.collaboratingInstitutions || '--'}</td>
                <td>${requestDoc.objectives || '--'}</td>
                <td>${formatTimestamp(requestDoc.startDate) || '--'}</td>
                <td>${formatTimestamp(requestDoc.endDate) || '--'}</td>
                <td>${requestDoc.funding || '--'}</td>
                <td>${requestDoc.rolesResponsibilities || '--'}</td>
                <td>${requestDoc.deliverables || '--'}</td>
                <td>${requestDoc.confidentiality || '--'}</td>
                <td>${requestDoc.contactInformation || '--'}</td>
              </tr>
            </tbody>
          </table>
        `;
      } else if (requestDoc.requestOption === 'labUseEquipmentAccess') {
        // Define the stages and their corresponding database values
        const labAccessStages = [
          { label: "Submit Request", value: "pending" }, 
          { label: "Reviewing Request", value: "reviewing" },
          { label: "Scheduling of Lab Access", value: "scheduling" },
          { label: "Preparing of Laboratory Equipment", value: "preparing" },
          { label: "Post-Use Inspection and Documentation", value: "inspecting" },
          { label: "Reporting of Laboratory Usage", value: "reporting" },
          { label: "Release of Laboratory Equipment", value: "releasing" }
        ];

        // Find the current stage index based on request_status
        const currentStageIndex = labAccessStages.findIndex(stage => stage.value === requestDoc.request_status);
        const labAccessStatus = labAccessStages[currentStageIndex >= 0 ? currentStageIndex : 0].label; // Default to the first stage if not found

        // Generate the progress bar based on the current stage
        const progressBarHTML = createProgressBar(labAccessStatus, labAccessStages.map(stage => stage.label));

        tableHTML = `
          ${progressBarHTML}
          <table class="requestDetailsTable">
            <thead>
              <tr>
                <th>Equipment ID</th>
                <th>Scheduled Date</th>
                <th>Post Use Condition</th>
                <th>Equipment Requesting</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${requestDoc.equipmentId || '--'}</td>
                <td>${formatTimestamp(requestDoc.scheduledDate) || '--'}</td>
                <td>${requestDoc.postUseCondition || '--'}</td>
                <td>${requestDoc.equipmentRequesting || '--'}</td>
              </tr>
            </tbody>
          </table>
        `;
      } else {
        // Default message when no other conditions match
        tableHTML = '<p>No additional details available for this request option.</p>';
      }
    }

    // Insert the tableHTML content after the requestInfoDiv element
    adminRequestDetailsContent.insertAdjacentHTML('beforeend', tableHTML);

   // Add buttons for pending requests
    if (requestDoc.request_status === "pending") {
      const buttonsHTML = `
          <div class="request-action-buttons">
              <button class="reject-button">Reject</button>
              <button class="approve-button">Approve</button>
          </div>
      `;
      adminRequestDetailsContent.insertAdjacentHTML('beforeend', buttonsHTML);
      
      const rejectButton = adminRequestDetailsContent.querySelector('.reject-button');
      const approveButton = adminRequestDetailsContent.querySelector('.approve-button');

      // Add event listeners to the buttons
      rejectButton.addEventListener('click', async () => {
          // Update request status to "reviewing"
          const requestsRef = collection(firestore, 'requests');
          const requestQuery = query(requestsRef, where('requestId', '==', requestId));
          const requestSnapshot = await getDocs(requestQuery);
          const requestDocRef = requestSnapshot.docs[0].ref;
          await updateDoc(requestDocRef, { request_status: 'reviewing' });
          alert('Request has been rejected.');
          backToRequestList()
      });

      approveButton.addEventListener('click', async () => {
        const requestsRef = collection(firestore, 'requests');
        const requestQuery = query(requestsRef, where('requestId', '==', requestId));
        const requestSnapshot = await getDocs(requestQuery);
        const requestDocRef = requestSnapshot.docs[0].ref;
        
        let updatedStatus = 'sending'; // Default status for approval
        
        // Conditional logic based on requestOption
        if (requestDoc.requestOption === 'researchCollaboration') {
          updatedStatus = 'initiating';
        } else if (requestDoc.requestOption === 'labUseEquipmentAccess') {
          updatedStatus = 'scheduling';
        }
        
        // Update request status based on the requestOption
        await updateDoc(requestDocRef, { request_status: updatedStatus });
        alert(`Request has been approved and moved to ${updatedStatus}.`);
        
        backToRequestList();
      });
      
    }

    if (requestDoc.request_status === "initiating") {
      const initiatingMessageDiv = document.createElement('div');
      initiatingMessageDiv.classList.add('initiating-message');
      initiatingMessageDiv.innerHTML = `
        <p><strong>Note:</strong> Waiting for the client to send their MOU.</p>
      `;
      adminRequestDetailsContent.appendChild(initiatingMessageDiv);
    }

    if (requestDoc.request_status === "validating") {
      const appointmentButtonHTML = `
          <div class="appointment-action-buttons">
              <button class="proceed-to-appointment-button">Proceed to Appointment Page</button>
          </div>
      `;
      adminRequestDetailsContent.insertAdjacentHTML('beforeend', appointmentButtonHTML);

      const proceedToAppointmentButton = adminRequestDetailsContent.querySelector('.proceed-to-appointment-button');
      
      // Listener for proceeding to the appointment page
      proceedToAppointmentButton.addEventListener('click', () => {
          showAppointmentPage(requestId);
      });
    }

    // Show the details section and hide the request list
    adminRequestDetailsSection.classList.remove('hidden');
    requestList.classList.add('hidden');
    requestListContainer.classList.add('hidden');
  } else {
    // If no matching request is found
    adminRequestDetailsContent.innerHTML = '<p>No request details found for this request ID.</p>';
    adminRequestDetailsSection.classList.remove('hidden');
    requestList.classList.add('hidden');
  }
}
const backButton = document.getElementById('backButton');
backButton.addEventListener('click', backToRequestList);
function backToRequestList() {
    adminRequestDetailsSection.classList.add('hidden');
    adminRequestDetailsContent.innerHTML = ""; // Clear the details content
    requestList.classList.remove('hidden');
    requestListContainer.classList.remove('hidden');
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
        <td><button class="view-button" data-request-id="${requestId}">View</button></td>
    `;
    tableBody.appendChild(newRow);
    attachViewButtonListeners();
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
            attachViewButtonListeners();
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
            attachViewButtonListeners();
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
            attachViewButtonListeners();
        }
    }
});

// Call the function to populate the tables when the document is ready
document.addEventListener("DOMContentLoaded", function() {
    populateRequestTables();
    populateRequestHistory();
});
