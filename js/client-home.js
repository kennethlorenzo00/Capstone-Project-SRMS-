import { collection, getDocs, query, where, limit, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { auth, database, firestore, storage } from './firebase.js';

// Function to fetch recent requests
async function fetchRecentRequests(user) {
    if (!user) {
        console.log('No user is currently logged in.');
        return;
    }

    const requestsRef = collection(firestore, 'requests');
    const recentRequestsQuery = query(requestsRef, where('userId', '==', user.uid), limit(3));

    const requestsSnapshot = await getDocs(recentRequestsQuery);
    const recentRequestsTableBody = document.getElementById('recentRequestsTableBody');
    console.log(recentRequestsTableBody);
    recentRequestsTableBody.innerHTML = ""; // Clear the table

    if (!requestsSnapshot.empty) {
        requestsSnapshot.forEach(doc => {
            const requestData = doc.data();
            const tableRow = document.createElement('tr');
            console.log(tableRow);
            tableRow.innerHTML = `
                <td>${formatTimestamp(requestData.timeStamp)}</td>
                <td>${requestData.requestId}</td>
                <td>${requestData.samples ? requestData.samples.length : 0}</td>
                <td>${requestData.priorityLevel || "--"}</td>
                <td>${requestData.assignedLaboratoryStaff || "--"}</td>
                <td>${requestData.request_status}</td>
            `;
            recentRequestsTableBody.appendChild(tableRow);
        });

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
}

// Request "Now" button action
document.getElementById('requestNowButton').addEventListener('click', () => {
    document.getElementById('requestListContent').classList.add('hidden');
    document.getElementById('createRequestContent').classList.remove('hidden');
});

// Function to render events
async function renderEventList() {
    const eventContainer = document.getElementById('eventContainer');
    eventContainer.innerHTML = ''; // Clear container

    const eventsRef = collection(firestore, 'events');
    const querySnapshot = await getDocs(eventsRef);
    
    querySnapshot.forEach(doc => {
        const event = doc.data();
        const eventHTML = `
            <div class="event-item" data-event-id="${doc.id}">
                <img src="${event.imageURL}" alt="Event Image">
                <h3>${event.title}</h3>
                <p>${event.description}</p>
                <button class="more-info-btn">More Info...</button>
            </div>
        `;
        eventContainer.innerHTML += eventHTML;
    });

    document.querySelectorAll('.more-info-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const eventId = e.target.closest('.event-item').getAttribute('data-event-id');
            showEventDetails(eventId);
        });
    });
}

// Function to show event details
async function showEventDetails(eventId) {
    const eventRef = doc(firestore, 'events', eventId);
    const eventDoc = await getDoc(eventRef);

    if (eventDoc.exists()) {
        const eventData = eventDoc.data();
        const eventModal = document.getElementById('eventDetailsModal');
        document.getElementById('eventImageModal').src = eventData.imageURL;
        document.getElementById('eventTitleModal').textContent = eventData.title;
        document.getElementById('eventDescriptionModal').textContent = eventData.description;
        eventModal.style.display = 'block';
    }
}

// Modal close event
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('eventDetailsModal').style.display = 'none';
});

// Utility function for formatting timestamp
function formatTimestamp(timestamp) {
    if (timestamp) {
        const date = new Date(timestamp);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
    return 'Invalid Date';
}

// Call functions to initialize dashboard content
renderEventList();

// Firebase Auth observer to fetch recent requests for logged-in users
auth.onAuthStateChanged(user => {
    if (user) {
        fetchRecentRequests(user);
    }
});