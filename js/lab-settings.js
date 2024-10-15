import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

// Get the settings button and section
const settingsBtn = document.getElementById('settingsBtn');
const settingsSection = document.getElementById('labSettingsSection');
let previousSection = null; // Initialize previousSection variable

// Function to show the settings section
function toggleLabAdminSettingsSection() {
    console.log('Lab settings button clicked!');
    console.log('Clicked the lab admin settings button at:', new Date().toLocaleTimeString());

    console.log("Lab admin settings button clicked, current state:", settingsSection.classList.contains('hidden'));

    if (settingsSection.classList.contains('hidden')) {
        // Hide all other sections
        hideAllSections();

        // Show the settings section
        settingsSection.classList.remove('hidden');
        console.log("Lab admin settings section now visible.");

        // Update previousSection to the last visible section
        if (previousSection === null) {
            previousSection = document.querySelector(".tabcontent:not(.hidden)");
        }
    } else {
        // Hide the settings section
        settingsSection.classList.add('hidden');
        console.log("Lab admin settings section now hidden.");

        // Show the previous section if it exists
        if (previousSection) {
            previousSection.style.display = "block";
            previousSection.classList.remove("hidden"); // Ensure it is visible
        }
    }
}

// Add event listener to the settings button
settingsBtn.addEventListener('click', function() {
    console.log('Lab admin settings button click event triggered!');
    toggleLabAdminSettingsSection();
});

// Function to hide all sections
function hideAllSections() {
    const tabcontents = document.querySelectorAll(".tabcontent");
    const taskListContainer = document.getElementById('taskListContainer');

    // Hide all tab contents and update previousSection
    tabcontents.forEach(tab => {
        if (tab.style.display === "block") {
            previousSection = tab; // Update previousSection only if currently displayed
        }
        tab.style.display = "none"; // Hide the tab
        tab.classList.add("hidden"); // Ensure hidden class is added
    });

    // Hide the task list container
    taskListContainer.style.display = "none";
}

// Password reset functionality
const labSettingsPasswordResetForm = document.getElementById('passwordResetForm'); // Ensure this element exists
labSettingsPasswordResetForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('labResetEmail').value; // Ensure this element exists

    sendPasswordResetEmail(getAuth(), email)
        .then(() => {
            alert('Password reset link sent! Please check your email.');
            // Hide settings section after submission
            settingsSection.classList.add('hidden'); // Hide settings section
            labSettingsPasswordResetForm.reset(); // Reset form fields
            previousSection = null; // Reset previous section after navigating away
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error(error);
            alert('Error sending password reset link. Please try again.');
        });
});
