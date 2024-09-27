import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js";
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { firestore, storage } from './firebase.js';

const eventContainer = document.getElementById('eventContainer');
const eventDetailsModal = document.getElementById('eventDetailsModal');
const eventSearchInput = document.getElementById('eventSearch');

// Function to render the event list
function renderEventList() {
    eventContainer.innerHTML = ''; // Clear container

    getDocs(collection(firestore, 'events')).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const event = doc.data();
            const eventHTML = `
                <div class="event-item" data-event-id="${doc.id}">
                    <img src="${event.imageURL}" alt="Event Image">
                    <h3>${event.title}</h3>
                    <p>${event.description}</p>
                    <button class="more-info-btn">More Info...</button>
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;
            eventContainer.innerHTML += eventHTML;
        });
    }).catch((error) => {
        console.error('Error fetching events:', error);
    });
}

// Function to show event details modal
function showEventDetailsModal(event) {
    const eventImageModal = document.getElementById('eventImageModal');
    const eventTitleModal = document.getElementById('eventTitleModal');
    const eventDescriptionModal = document.getElementById('eventDescriptionModal');

    eventImageModal.src = event.imageURL;
    eventTitleModal.textContent = event.title;
    eventDescriptionModal.textContent = event.description;

    eventDetailsModal.style.display = 'block';
    eventDetailsModal.dataset.eventId = event.id;
}

// Add event listener to "More Info" button to show event details
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('more-info-btn')) {
        const eventId = e.target.parentNode.dataset.eventId;
        const eventRef = doc(firestore, 'events', eventId);
        getDoc(eventRef).then((doc) => {
            const event = doc.data();
            showEventDetailsModal({ ...event, id: doc.id });
        }).catch((error) => {
            console.error('Error fetching event details:', error);
        });
    }
});

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('close')) {
        eventDetailsModal.style.display = 'none';
        // Show all event items again
        const eventItems = document.querySelectorAll('.event-item');
        eventItems.forEach((item) => {
            item.style.display = 'inline-block';
        });
    }
});

// Event search functionality
eventSearchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const eventItems = document.querySelectorAll('.event-item');
    
    eventItems.forEach(item => {
        const title = item.querySelector('h3').textContent.toLowerCase();
        item.style.display = title.includes(searchTerm) ? 'block' : 'none';
    });
});

// Initial render
renderEventList();
