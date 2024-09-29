import { auth, database, firestore, storage } from './firebase.js';
import { ref as dbRef, get } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js"; // For Realtime Database
import { collection, query, where, onSnapshot, getDocs, limit, startAfter, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { ref as storageRef, uploadBytes } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js"; // For Storage

// Get the request list table body and details section
const requestListTableBody = document.getElementById('requestListTableBody');
const requestDetailsContent = document.getElementById('requestDetailsContent');
const requestDetailsHeader = document.getElementById('requestDetailsHeader');
const requestListGroup = document.getElementById('requestListContent');
const requestDetailsSection = document.getElementById('requestDetailsSection'); 

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

function formatTimestamp(timestamp) {
    if (timestamp) {
        const date = new Date(timestamp);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
    return 'Invalid Date';
}

const searchInput = document.getElementById('searchInput');
// Get the pagination controls
const prevPageButton = document.getElementById('prevPage');
const nextPageButton = document.getElementById('nextPage');
const pageInfoSpan = document.querySelector('.page-numbers.active');

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

// Add event listeners to pagination controls
prevPageButton.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchRequestData(auth.currentUser);
        updatePaginationControls();
    }
});

nextPageButton.addEventListener('click', () => {
    currentPage++;
    fetchRequestData(auth.currentUser);
    updatePaginationControls();
});

async function fetchRequestData(user) {
    if (!user) {
        console.log('No user is currently logged in.');
        return;
    }

    const requestsRef = collection(firestore, 'requests');
    console.log('Fetching requests for user ID:', user.uid);

    // Start with the query for user requests
    let userRequestsQuery = query(requestsRef, where('userId', '==', user.uid), limit(pageSize));

    // If not the first page, start after the last visible document
    if (currentPage > 1 && lastVisible) {
        userRequestsQuery = query(userRequestsQuery, startAfter(lastVisible), limit(pageSize));
    }

    const requestsSnapshot = await getDocs(userRequestsQuery);
    requestListTableBody.innerHTML = ""; // Clear the table body

    if (!requestsSnapshot.empty) {
        requestsSnapshot.forEach(doc => {
            const requestData = doc.data();
            console.log('Request Data:', requestData);

            const tableRow = document.createElement('tr');
            tableRow.innerHTML = `
                <td>${formatTimestamp(requestData.timeStamp)}</td>
                <td>${requestData.requestId}</td>
                <td>${requestData.samples ? requestData.samples.length : 0}</td>
                <td>${requestData.priorityLevel || "--"}</td>
                <td>${requestData.assignedLaboratoryStaff || "--"}</td>
                <td>${requestData.request_status}</td>
                <td><button class="view-button" data-request-id="${requestData.requestId}">View</button></td>
            `;
            requestListTableBody.appendChild(tableRow);
        });

        // Update lastVisible to the last document in the current snapshot
        lastVisible = requestsSnapshot.docs[requestsSnapshot.docs.length - 1];

        // If the current batch of requests is less than the page size, there are no more documents
        if (requestsSnapshot.size < pageSize) {
            lastVisible = null; // No more documents to fetch
        }

        // Add event listeners to all View buttons
        document.querySelectorAll('.view-button').forEach(button => {
            button.addEventListener('click', () => {
                const requestId = button.getAttribute('data-request-id');
                showRequestDetails(requestId);
            });
        });
    } else {
        console.log('No requests found for the current user.');
    }

    updatePaginationControls(); // Update pagination controls after fetching data
}

// Search function
searchInput.addEventListener('input', async () => {
    const searchTerm = searchInput.value.toLowerCase();
    currentPage = 1; // Reset to the first page

    const requestsRef = collection(firestore, 'requests');
    const userRequestsQuery = query(requestsRef, where('userId', '==', auth.currentUser.uid));
    const requestsSnapshot = await getDocs(userRequestsQuery);

    requestListTableBody.innerHTML = ""; // Clear the table body

    requestsSnapshot.forEach(doc => {
        const requestData = doc.data();
        
        // Check if the requestId contains the search term
        if (requestData.requestId.toLowerCase().includes(searchTerm)) {
            const tableRow = document.createElement('tr');
            tableRow.innerHTML = `
                <td>${formatTimestamp(requestData.timeStamp)}</td>
                <td>${requestData.requestId}</td>
                <td>${requestData.samples ? requestData.samples.length : 0}</td>
                <td>${requestData.priorityLevel || "--"}</td>
                <td>${requestData.assignedLaboratoryStaff || "--"}</td>
                <td>${requestData.request_status}</td>
                <td><button class="view-button" data-request-id="${requestData.requestId}">View</button></td>
            `;
            requestListTableBody.appendChild(tableRow);
        }
    });
});

// Show request details
async function showRequestDetails(requestId) {
    const requestsRef = collection(firestore, 'requests');
    const requestQuery = query(requestsRef, where('requestId', '==', requestId));
    const requestSnapshot = await getDocs(requestQuery);

    const requestDetailsContent = document.getElementById('requestDetailsContent');

    // Clear previous details
    requestDetailsContent.innerHTML = "";
    requestDetailsHeader.innerHTML = "";
    
    if (!requestSnapshot.empty) {
        const requestDoc = requestSnapshot.docs[0].data();
        const userId = requestDoc.userId;

        // Fetch the withMOU status from Realtime Database
        const clientRef = dbRef(database, `clients/${userId}/withMOU`); 
        const clientSnapshot = await get(clientRef);
        const withMOU = clientSnapshot.exists() ? clientSnapshot.val() : false;

        const requestHeaderDiv = document.createElement('div');
        requestHeaderDiv.innerHTML = `<h2>Request Information</h2>`;
        requestDetailsHeader.appendChild(requestHeaderDiv);

        const requestInfoDiv = document.createElement('div');
        requestInfoDiv.style.cssText = 'text-align: right;';
        requestInfoDiv.innerHTML = `
            <p><strong>Timestamp:</strong> ${formatTimestamp(requestDoc.timeStamp)}</p>
            <p><strong>Request ID:</strong> ${requestDoc.requestId}</p>
        `;
        requestDetailsHeader.appendChild(requestInfoDiv);

        const fields = sampleFieldMapping[requestDoc.requestType][requestDoc.requestOption];

        let tableHTML = '';

        if (requestDoc.samples && requestDoc.samples.length > 0) {
            // Define the stages and their corresponding database values
            const sampleStages = [
                { label: "Submit Request", value: "pending" }, // Default value, should be shown by default
                { label: "Reviewing Request", value: "reviewing" },
                { label: "Send Samples", value: "sending" },
                { label: "Validating Samples", value: "validating" },
                { label: "Analysis in Progress", value: "analysing" },
                { label: "Verifying Analysis Report", value: "verifying" },
                { label: "Released Analysis Report", value: "releasing" }
            ];
        
            // Find the current stage index based on request_status
            const currentStageIndex = sampleStages.findIndex(stage => stage.value === requestDoc.request_status);
            const sampleStatus = sampleStages[currentStageIndex >= 0 ? currentStageIndex : 0].label; // Default to the first stage if not found
        
            // Generate the progress bar based on the current stage
            const sampleProgressBarHTML = createProgressBar(sampleStatus, sampleStages.map(stage => stage.label));
            
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
        }
        else if (requestDoc.requestOption === 'researchCollaboration') {
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
                { label: "Submit Request", value: "pending" }, // Default value, should be shown by default
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
        }

        // Append the tableHTML to the requestDetailsContent element
        requestDetailsContent.innerHTML = tableHTML;

        if (requestDoc.request_status === "initiating") {
            const initiatingMessageDiv = document.createElement('div');
            initiatingMessageDiv.classList.add('initiating-message');
            initiatingMessageDiv.innerHTML = `
                <p><strong>Note:</strong> You need to upload your MOU.</p>
                <a href="/documents/CO-AUTHORSHIP-AGREEMENT.docx" download>Download MOU Template</a>
                <div class="file-upload">
                    <input type="file" id="mouUpload" accept=".pdf"/>
                    <button id="uploadMOUButton">Upload MOU</button>
                </div>
            `;
            requestDetailsContent.appendChild(initiatingMessageDiv);
        
            // Add event listener for the upload button
            document.getElementById('uploadMOUButton').addEventListener('click', async () => {
                const fileInput = document.getElementById('mouUpload');
                const file = fileInput.files[0];
                if (file) {
                    const mouStorageRef = storageRef(storage, `mous/${userId}/${file.name}`);
                    await uploadBytes(mouStorageRef, file);
                    alert('MOU uploaded successfully!');

                    // Update the request status in Firestore
                    const requestsRef = collection(firestore, 'requests');
                    const requestQuery = query(requestsRef, where('requestId', '==', requestId));
                    const requestSnapshot = await getDocs(requestQuery);

                    if (!requestSnapshot.empty) {
                        const requestDocRef = doc(firestore, requestSnapshot.docs[0].ref.path);
                        // Update the request status
                        let updatedStatus = 'drafting'; // Update this as needed
                        await updateDoc(requestDocRef, { request_status: updatedStatus });
                        alert(`Request status has been updated to ${updatedStatus}.`);
                    }

                    // Show the request list section and hide request details
                    requestDetailsSection.classList.add('hidden');
                    requestListGroup.classList.remove('hidden');
                } else {
                    alert('Please select a file to upload.');
                }
            });
        }        

        if (requestDoc.request_status === "validating") {
            const validatingMessageDiv = document.createElement('div');
            validatingMessageDiv.classList.add('validating-message');
            validatingMessageDiv.innerHTML = `
              <p><strong>Note:</strong> Your request is under validation.</p>
            `;
            requestDetailsContent.appendChild(validatingMessageDiv);
          }

        if (requestDoc.request_status === "analysing") {
            const analysingMessageDiv = document.createElement('div');
            analysingMessageDiv.classList.add('analysing-message');
            analysingMessageDiv.innerHTML = `
              <p><strong>Note:</strong> Your request is under analysis.</p>
            `;
            requestDetailsContent.appendChild(analysingMessageDiv);
          }
        
          if (requestDoc.request_status === "scheduling") {
            const schedulingMessageDiv = document.createElement('div');
            schedulingMessageDiv.classList.add('scheduling-message');
            schedulingMessageDiv.innerHTML = `
              <p><strong>Note:</strong> Your request is under analysis.</p>
            `;
            requestDetailsContent.appendChild(schedulingMessageDiv);
          }

          if (requestDoc.request_status === "preparing") {
            const preparingMessageDiv = document.createElement('div');
            preparingMessageDiv.classList.add('preparing-message');
            preparingMessageDiv.innerHTML = `
              <p><strong>Note:</strong> Your request is under analysis.</p>
            `;
            requestDetailsContent.appendChild(preparingMessageDiv);
          }

          if (requestDoc.request_status === "drafting") {
            const draftingMessageDiv = document.createElement('div');
            draftingMessageDiv.classList.add('drafting-message');
            draftingMessageDiv.innerHTML = `
              <p><strong>Note:</strong> Your request is being drafted.</p>
            `;
            requestDetailsContent.appendChild(draftingMessageDiv);
          }

          if (requestDoc.request_status === "inspecting") {
            const inspectingMessageDiv = document.createElement('div');
            inspectingMessageDiv.classList.add('inspecting-message');
            inspectingMessageDiv.innerHTML = `
              <p><strong>Note:</strong> Your request is under analysis.</p>
            `;
            requestDetailsContent.appendChild(inspectingMessageDiv);
          }

        // Show the request details content and hide the request list group
        requestDetailsSection.classList.remove('hidden');
        requestListGroup.classList.add('hidden');
    }
}

const backButton = document.getElementById('backButton');
backButton.addEventListener('click', () => {
    requestDetailsSection.classList.add('hidden');
    requestListGroup.classList.remove('hidden');
});

const addRequestButton = document.getElementById('addRequestButton');
addRequestButton.addEventListener('click', () => {
    document.getElementById('requestListContent').classList.add('hidden');
    document.getElementById('createRequestContent').classList.remove('hidden');
});

auth.onAuthStateChanged(user => {
    if (user) {
        console.log('User is logged in:', user);
        fetchRequestData(user);
        updatePaginationControls(); // Update pagination controls on login
    } else {
        console.log('No user is currently logged in.');
    }
});

// Call the function to fetch data when the page loads
document.addEventListener('DOMContentLoaded', () => {
    if (auth.currentUser) {
        fetchRequestData(auth.currentUser);
    }
});
