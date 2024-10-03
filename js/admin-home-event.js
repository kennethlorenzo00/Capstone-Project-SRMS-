import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { firestore } from './firebase.js';

const adminEventContainer = document.getElementById('adminEventContainer');
const adminEventDetailsModal = document.getElementById('adminEventDetailsModal');
const adminEventSearchInput = document.getElementById('adminEventSearch');

// Function to show event details modal
function showAdminEventDetailsModal(event) {
    const adminEventImageModal = document.getElementById('adminEventImageModal');
    const adminEventTitleModal = document.getElementById('adminEventTitleModal');
    const adminEventDescriptionModal = document.getElementById('adminEventDescriptionModal');

    adminEventImageModal.src = event.imageURL || ''; // Ensure the imageURL is set
    adminEventTitleModal.textContent = event.title || 'No Title'; // Default title
    adminEventDescriptionModal.textContent = event.description || 'No Description'; // Default description

    adminEventDetailsModal.style.display = 'block';
    adminEventDetailsModal.dataset.eventId = event.id;
}

// Close modal functionality
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('admin-close')) {
        adminEventDetailsModal.style.display = 'none';
    }
});

// Add event listener to "More Info" button to show event details
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('admin-more-info-btn')) {
        const eventId = e.target.parentNode.dataset.eventId;
        const eventRef = doc(firestore, 'events', eventId);
        getDoc(eventRef).then((doc) => {
            const event = doc.data();
            showAdminEventDetailsModal({ ...event, id: doc.id });
        }).catch((error) => {
            console.error('Error fetching event details:', error);
        });
    }
});

async function renderAdminEventList() {
    adminEventContainer.innerHTML = ''; // Clear container

    const eventsRef = collection(firestore, 'events');
    const querySnapshot = await getDocs(eventsRef);
    
    querySnapshot.forEach(doc => {
        const event = doc.data();
        const eventHTML = `
            <div class="admin-event-item" data-event-id="${doc.id}">
                <img src="${event.imageURL}" alt="Event Image">
                <h3>${event.title}</h3>
                <p>${event.description}</p>
                <button class="admin-more-info-btn">More Info...</button>
            </div>
        `;
        adminEventContainer.innerHTML += eventHTML;
    });
}

adminEventSearchInput.addEventListener('input', async (e) => {
    const searchTerm = e.target.value.toLowerCase();
    if (searchTerm === '') {
        renderAdminEventList();
    } else {
        adminEventContainer.innerHTML = ''; // Clear container before appending new event HTML
        const eventsRef = collection(firestore, 'events');
        const querySnapshot = await getDocs(eventsRef);
        querySnapshot.forEach(doc => {
            const event = doc.data();
            if (event.title.toLowerCase().includes(searchTerm)) {
                const eventHTML = `
                    <div class="admin-event-item" data-event-id="${doc.id}">
                        <img src="${event.imageURL}" alt="Event Image">
                        <h3>${event.title}</h3>
                        <p>${event.description}</p>
                        <button class="admin-more-info-btn">More Info...</button>
                    </div>
                `;
                adminEventContainer.innerHTML += eventHTML;
            }
        });
    }
});

// Initial render
renderAdminEventList();
