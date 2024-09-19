import { firestore, auth, database } from './firebase.js'; // Import firestore, auth, and database from firebase.js
import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { get, ref } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js'; // Import get and ref from Firebase Realtime Database

document.addEventListener("DOMContentLoaded", function() {
    // Function to handle form submission
    async function handleFormSubmit(event) {
        event.preventDefault();

        const form = event.target;
        const requestType = form.getAttribute('data-request-type'); // e.g., 'microbialTesting', 'microbialAnalysis', 'labResearchProcesses'
        const requestId = generateRequestId(); // Function to generate a unique request ID

        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        // Get current user
        const user = auth.currentUser;
        if (!user) {
            alert('No user is currently logged in.');
            return;
        }

        // Retrieve user details from Firebase Realtime Database
        let userName = 'Anonymous';
        try {
            const userSnapshot = await get(ref(database, `clients/${user.uid}`)); // Update the path to match your database structure
            if (userSnapshot.exists()) {
                const userData = userSnapshot.val();
                userName = `${userData.firstName || ''} ${userData.middleName || ''} ${userData.lastName || ''}`.trim() || 'Anonymous';
            }
        } catch (error) {
            console.error('Error retrieving user data:', error);
        }

        // Add request details
        data.requestId = requestId;
        data.requestType = requestType;
        data.timestamp = serverTimestamp(); // Add a timestamp for when the request was made
        data.userId = user.uid; // Add user ID
        data.userName = userName; // Add user name

        try {
            // Save data to Firestore
            await addDoc(collection(firestore, 'requests'), data);
            alert('Request submitted successfully!');
            form.reset(); // Reset form after submission
        } catch (error) {
            console.error('Error adding document: ', error);
            alert('Failed to submit request. Please try again.');
        }
    }

    // Attach submit event listener to all forms
    const forms = document.querySelectorAll('form[data-request-type]');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });

    // Function to generate a unique request ID (you can customize this)
    function generateRequestId() {
        return 'REQ-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
});
