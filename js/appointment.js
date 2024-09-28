import { collection, getDocs, query, where, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { firestore } from './firebase.js';
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

const appointmentsTable = document.getElementById('appointmentsTable').getElementsByTagName('tbody')[0];
const modal = document.getElementById('editModal');
const staffSelect = document.getElementById('staffSelect');
const endDateInput = document.getElementById('endDate');
const saveButton = document.getElementById('saveButton');
const closeButton = document.querySelector('.close');

let currentAppointmentId = null;

// Function to render appointments
async function renderAppointments() {
    appointmentsTable.innerHTML = ''; // Clear the table body

    // Query to get requests with specific request_status
    const requestsQuery = query(collection(firestore, 'requests'), where('request_status', 'not-in', ['pending', 'reviewing', 'sending', 'releasing']));
    
    try {
        const requestsSnapshot = await getDocs(requestsQuery);
        if (requestsSnapshot.empty) {
            appointmentsTable.innerHTML = '<tr><td colspan="6">No appointments scheduled.</td></tr>';
            return;
        }

        const appointmentsSnapshot = await getDocs(collection(firestore, 'appointments'));
        const appointmentsData = {};

        // Store appointments data in an object for quick lookup
        appointmentsSnapshot.forEach(appointmentDoc => {
            const appointment = appointmentDoc.data();
            const createdAt = appointment.createdAt instanceof Date ? appointment.createdAt : appointment.createdAt.toDate(); // Convert Timestamp to Date
            
            appointmentsData[appointmentDoc.id] = { // Use document ID for lookup
                createdAt,
                requestId: appointment.requestId,
                requesterName: appointment.requesterName,
                endDate: appointment.endDate,
                assignedStaff: appointment.assignedStaff
            };
        });

        requestsSnapshot.forEach(appointmentDoc => {
            const appointment = appointmentDoc.data();
            const requestId = appointment.requestId;

            // Look for matching appointment data
            for (const appointmentId in appointmentsData) {
                if (appointmentsData[appointmentId].requestId === requestId) {
                    const { createdAt, requesterName, endDate, assignedStaff } = appointmentsData[appointmentId];
                    const appointmentRow = `
                        <tr>
                            <td>${createdAt.toLocaleDateString()}</td>
                            <td>${requestId}</td>
                            <td>${requesterName}</td>
                            <td>${endDate}</td>
                            <td>${assignedStaff}</td>
                            <td><button class="edit-btn" data-appointment-id="${appointmentId}">Edit</button></td>
                        </tr>
                    `;
                    appointmentsTable.innerHTML += appointmentRow;
                }
            }
        });
    } catch (error) {
        console.error('Error fetching appointments:', error);
    }
}

// Function to fetch available laboratory staff from Realtime Database
async function fetchStaff() {
    const database = getDatabase();
    const staffRef = ref(database, 'laboratory_staff');
    const staffSnapshot = await get(staffRef);
    const staffData = staffSnapshot.val() || {};

    let staffOptionsHTML = `<option value="" disabled selected>Select a staff member</option>`;
    for (const staffId in staffData) {
        const staffFullName = `${staffData[staffId].firstName || ''} ${staffData[staffId].middleName || ''} ${staffData[staffId].lastName || ''}`.trim();
        staffOptionsHTML += `<option value="${staffFullName}">${staffFullName}</option>`; // Use full name as the value
    }
    staffSelect.innerHTML = staffOptionsHTML;
}

// Open edit modal and populate fields
async function openEditModal(appointmentId) {
    currentAppointmentId = appointmentId;

    // Fetch the specific appointment details
    const appointmentRef = doc(firestore, 'appointments', appointmentId);
    const appointmentSnapshot = await getDoc(appointmentRef);

    if (appointmentSnapshot.exists()) {
        const appointmentData = appointmentSnapshot.data();
        // Populate fields
        staffSelect.value = appointmentData.assignedStaff; // Assuming staff name is stored
        endDateInput.value = appointmentData.endDate; // Assuming this is a string representation of the date

        // Show modal
        document.getElementById('editAppointmentModal').style.display = 'block';
    } else {
        console.error(`No appointment found for ID: ${appointmentId}`);
    }
}

// Save updated appointment details
// Save updated appointment details
async function saveAppointment() {
    if (!currentAppointmentId) return;

    const updatedStaff = staffSelect.value; // This now contains the full staff name
    const updatedEndDate = endDateInput.value;

    const appointmentRef = doc(firestore, 'appointments', currentAppointmentId);
    await setDoc(appointmentRef, {
        assignedStaff: updatedStaff, // Save the staff name instead of ID
        endDate: updatedEndDate,
    }, { merge: true });

    // Close modal and refresh the appointments table
    document.getElementById('editAppointmentModal').style.display = 'none';
    renderAppointments();
}

// Add event listener to the edit buttons
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-btn')) {
        const appointmentId = e.target.dataset.appointmentId;
        openEditModal(appointmentId);
    }
});

// Add event listeners for modal buttons
saveButton.addEventListener('click', saveAppointment);
closeButton.addEventListener('click', () => {
    document.getElementById('editAppointmentModal').style.display = 'none';
});

// Initial rendering of the appointments and fetching staff
fetchStaff();
renderAppointments();
