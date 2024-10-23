import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js";
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { firestore, storage } from './firebase.js'; 

const addEventBtn = document.getElementById('addEventBtn');
const addEventForm = document.getElementById('addEventForm');
const eventImageInput = document.getElementById('eventImage');
const imagePreview = document.getElementById('imagePreview');
const uploadEventBtn = document.getElementById('uploadEventBtn');
const eventTitleInput = document.getElementById('eventTitle');
const eventDescriptionInput = document.getElementById('eventDescription');
const eventStartDateInput = document.getElementById('eventStartDate');
const eventEndDateInput = document.getElementById('eventEndDate');
const eventContainer = document.getElementById('eventContainer');
const eventDetailsModal = document.getElementById('eventDetailsModal');
const editEventModal = document.getElementById('editEventModal');
const eventSearchInput = document.getElementById('eventSearch'); // Search input element
const settingsBtn = document.getElementById('settingsBtn');

// Show the add event form when 'Add Event' button is clicked
addEventBtn.addEventListener('click', () => {
    addEventForm.style.display = 'block';
    eventContainer.style.display = 'none';
    eventDetailsModal.style.display = 'none';
    settingsBtn.disabled = false;	
    editEventModal.style.display = 'none';
});

// Display a preview of the selected image
eventImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            imagePreview.style.backgroundImage = `url(${event.target.result})`;
        };
        reader.readAsDataURL(file);
    }
});

// Get the close button element
const closeAddEventFormBtn = document.getElementById('closeAddEventForm');

// Add an event listener to the close button
closeAddEventFormBtn.addEventListener('click', () => {
    addEventForm.style.display = 'none';
    settingsBtn.disabled = false;	
    eventContainer.style.display = 'block';
});

// Handle uploading the event when 'Upload Event' button is clicked
uploadEventBtn.addEventListener('click', async () => {
    const file = eventImageInput.files[0];
    const eventTitle = eventTitleInput.value;
    const eventDescription = eventDescriptionInput.value;
    const eventStartDate = eventStartDateInput.value;
    const eventEndDate = eventEndDateInput.value;

    if (!file || !eventTitle || !eventDescription || !eventStartDate || !eventEndDate) {
        alert('Please fill all the fields and select an image.');
        return;
    }

    try {
        // Create a reference to the storage location for this event image
        const storageRef = ref(storage, `events/${file.name}`);

        // Upload the file to Firebase Storage
        const snapshot = await uploadBytes(storageRef, file);
        
        // Get the download URL of the uploaded image
        const downloadURL = await getDownloadURL(snapshot.ref);

        // Save event details to Firestore
        const eventDocRef = await addDoc(collection(firestore, 'events'), {
            title: eventTitle,
            description: eventDescription,
            imageURL: downloadURL,
            startDate: eventStartDate,
            endDate: eventEndDate,
            createdAt: new Date()
        });

        alert('Event uploaded successfully!');
        addEventForm.style.display = 'none';
        settingsBtn.disabled = false;	
        eventContainer.style.display = 'block';

        // Reset the form after successful upload
        eventImageInput.value = '';
        eventTitleInput.value = '';
        eventDescriptionInput.value = '';
        eventStartDateInput.value = '';
        eventEndDateInput.value = '';
        imagePreview.style.backgroundImage = '';

        // Render the event list
        renderEventList();

    } catch (error) {
        console.error('Error uploading event:', error);
        alert('Error uploading event. Please try again.');
    }
});

// Function to render event list
function renderEventList() {
    eventContainer.innerHTML = ''; // Clear the container

    // Get events from Firestore
    getDocs(collection(firestore, 'events')).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const event = doc.data();
            const eventHTML = `
                <div class="event-item" data-event-id="${doc.id}">
                    <img src="${event.imageURL}" alt="Event Image">
                    <h3>${event.title}</h3>
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

    // Set the data-event-id attribute
    eventDetailsModal.dataset.eventId = event.id;

    eventDetailsModal.style.display = 'block';
    settingsBtn.disabled = true;	
    // Hide other event items
    const eventItems = document.querySelectorAll('.event-item');
    eventItems.forEach((item) => {
        item.style.display = 'none';
    });
    // Show edit and delete buttons
    eventDetailsModal.parentNode.classList.add('show-actions');

    // Store the event object
    eventDetailsModal.event = event;
}

// Add event listener to edit button in event details modal
document.getElementById('editEventBtn').addEventListener('click', () => {
    const event = eventDetailsModal.event;
    showEditEventModal(event);
});

// Function to show edit event modal
function showEditEventModal(event) {
    const editEventTitle = document.getElementById('editEventTitle');
    const editEventDescription = document.getElementById('editEventDescription');

    editEventTitle.value = event.title;
    editEventDescription.value = event.description;

    // Set the data-event-id attribute
    editEventModal.dataset.eventId = event.id;

    editEventModal.style.display = 'block';
}

// Add event listener to more info buttons
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('more-info-btn')) {
        const eventId = e.target.parentNode.dataset.eventId;
        const eventRef = doc(firestore, 'events', eventId);
        getDoc(eventRef).then((doc) => {
            const event = doc.data();
            showEventDetailsModal({ ...event, id: doc.id }); // Ensure event has id
        }).catch((error) => {
            console.error('Error fetching event details:', error);
        });
    }
});

// Add event listener to delete button in the event details modal
document.getElementById('deleteEventBtn').addEventListener('click', () => {
    const eventId = eventDetailsModal.dataset.eventId; // Get the eventId from the modal
    if (!eventId) {
        console.error('No event ID found. Cannot delete the event.');
        return; // Exit if eventId is undefined
    }
    
    const eventRef = doc(firestore, 'events', eventId);
    
    // Optionally, you can add a confirmation dialog here
    if (confirm('Are you sure you want to delete this event?')) {
        deleteDoc(eventRef).then(() => {
            alert('Event deleted successfully!'); // Feedback for the user
            renderEventList(); // Refresh the event list
            eventDetailsModal.style.display = 'none'; // Close the event details modal
            settingsBtn.disabled = false;	
        }).catch((error) => {
            console.error('Error deleting event:', error);
            alert('Error deleting event. Please try again.'); // Feedback for error
        });
    }
});

// Add event listener to close buttons
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('close')) {
        eventDetailsModal.style.display = 'none';
        settingsBtn.disabled = false;	
        editEventModal.style.display = 'none';
        // Show all event items again
        const eventItems = document.querySelectorAll('.event-item');
        eventItems.forEach((item) => {
            item.style.display = 'inline-block';
        });
    }
});

// Add event listener to save edit event button
document.addEventListener('click', (e) => {
    if (e.target.id === 'saveEditEventBtn') {
        const eventId = editEventModal.dataset.eventId; // Get the eventId from the editEventModal div
        if (!eventId) {
            console.error('No event ID found. Cannot update the event.');
            return; // Exit if eventId is undefined
        }
        const eventRef = doc(firestore, 'events', eventId);
        const editEventTitle = document.getElementById('editEventTitle').value;
        const editEventDescription = document.getElementById('editEventDescription').value;

        updateDoc(eventRef, {
            title: editEventTitle,
            description: editEventDescription
        }).then(() => {
            alert('Event updated successfully!'); // Feedback for successful update
            renderEventList(); // Refresh the event list
            editEventModal.style.display = 'none'; // Close the edit modal
        }).catch((error) => {
            console.error('Error updating event:', error);
            alert('Error updating event. Please try again.'); // Feedback for error
        });
    }
});

// Event search functionality
eventSearchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const eventItems = document.querySelectorAll('.event-item');
    
    eventItems.forEach(item => {
        const title = item.querySelector('h3').textContent.toLowerCase();
        item.style.display = title.includes(searchTerm) ? 'block' : 'none'; // Show or hide items based on search term
    });
});

// Initial render
renderEventList();
