import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

// Get the settings button and section
const settingsBtn = document.getElementById('settingsBtn');
const settingsSection = document.getElementById('adminSettingsSection');
let previousSection = null; // Initialize previousSection variable

// Function to show the settings section
function toggleAdminSettingsSection() {
    console.log('Admin settings button clicked!');
    console.log('Clicked the admin settings button at:', new Date().toLocaleTimeString());

    console.log("Admin settings button clicked, current state:", settingsSection.classList.contains('hidden'));

    if (settingsSection.classList.contains('hidden')) {
        // Hide all other sections
        hideAllSections();

        // Show the settings section
        settingsSection.classList.remove('hidden');
        console.log("Admin settings section now visible.");

        // Update previousSection to the last visible section
        if (previousSection === null) {
            previousSection = document.querySelector(".tabcontent:not(.hidden)");
        }
    } else {
        // Hide the settings section
        settingsSection.classList.add('hidden');
        console.log("Admin settings section now hidden.");

        // Show the previous section if it exists
        if (previousSection) {
            previousSection.style.display = "block";
            previousSection.classList.remove("hidden"); // Ensure it is visible
        }
    }
}

// Add event listener to the settings button
settingsBtn.addEventListener('click', function() {
    console.log('Admin settings button click event triggered!');
    toggleAdminSettingsSection();
});

// Function to hide all sections
function hideAllSections() {
    const tabcontents = document.querySelectorAll(".tabcontent");
    const tableContainers = document.querySelectorAll("#table-container > div");

    // Hide all tab contents and update previousSection
    tabcontents.forEach(tab => {
        if (tab.style.display === "block") {
            previousSection = tab; // Update previousSection only if currently displayed
        }
        tab.style.display = "none"; // Hide the tab
        tab.classList.add("hidden"); // Ensure hidden class is added
    });

    // Hide all table containers
    tableContainers.forEach(container => {
        container.style.display = "none";
    });
}

// Password reset functionality
const settingsPasswordResetForm = document.getElementById('settingsPasswordResetForm'); // Assuming this is defined elsewhere
settingsPasswordResetForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('resetEmail').value;

    sendPasswordResetEmail(getAuth(), email)
        .then(() => {
            alert('Password reset link sent! Please check your email.');
            // Hide settings section after submission
            settingsSection.classList.add('hidden'); // Hide settings section
            settingsPasswordResetForm.reset(); // Reset form fields
            previousSection = null; // Reset previous section after navigating away
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error(error);
            alert('Error sending password reset link. Please try again.');
        });
});
