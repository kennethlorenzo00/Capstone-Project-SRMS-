import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

// Get the settings button and section
const settingsBtn = document.getElementById('settingsBtn');
const settingsSection = document.getElementById('clientSettingsSection');
const settingsPasswordResetForm = document.getElementById('settingsPasswordResetForm');

// Links and content sections
const homeLink = document.getElementById("homeLink");
const createRequestLink = document.getElementById("createRequestLink");
const requestListLink = document.getElementById("requestListLink");
const myAccountLink = document.getElementById("myAccountLink");

const dashboardContent = document.getElementById("dashboardContent");
const createRequestContent = document.getElementById("createRequestContent");
const requestListContent = document.getElementById("requestListContent");
const myAccountContent = document.getElementById("myAccountContent");

// Request Type Buttons and Sections
const microbialTestingBtn = document.getElementById("microbialTestingBtn");
const microbialAnalysisBtn = document.getElementById("microbialAnalysisBtn");
const labResearchProcessesBtn = document.getElementById("labResearchProcessesBtn");

const microbialTestingSection = document.getElementById("microbialTestingSection");
const microbialAnalysisSection = document.getElementById("microbialAnalysisSection");
const labResearchProcessesSection = document.getElementById("labResearchProcessesSection");

// Options Sections
const microbialTestingOptions = document.getElementById("microbialTestingOptions");
const microbialAnalysisOptions = document.getElementById("microbialAnalysisOptions");
const labResearchProcessesOptions = document.getElementById("labResearchProcessesOptions");

// Function to hide all sections
function hideAllSections() {
    dashboardContent.classList.add("hidden");
    createRequestContent.classList.add("hidden");
    requestListContent.classList.add("hidden");
    myAccountContent.classList.add("hidden");
    myAccountContent.style.display = "none";
    microbialTestingSection.classList.add("hidden");
    microbialAnalysisSection.classList.add("hidden");
    labResearchProcessesSection.classList.add("hidden");
    microbialTestingOptions.classList.add("hidden");
    microbialAnalysisOptions.classList.add("hidden");
    labResearchProcessesOptions.classList.add("hidden");
}

// Store the previous section
let previousSection = null;

// Function to show the settings section
function toggleSettingsSection() {
    console.log('Settings button clicked!');
    const settingsSection = document.getElementById('clientSettingsSection'); // Change the ID to clientSettingsSection
    console.log("Settings button clicked, current state:", settingsSection.classList.contains('hidden'));

    if (settingsSection.classList.contains('hidden')) {
        // Store the current section
        let currentSection;
        if (dashboardContent.classList.contains('client-main')) {
            currentSection = dashboardContent;
        } else if (!createRequestContent.classList.contains('hidden')) {
            currentSection = createRequestContent;
        } else if (!requestListContent.classList.contains('hidden')) {
            currentSection = requestListContent;
        } else if (!myAccountContent.classList.contains('hidden')) {
            currentSection = myAccountContent;
        }

        // Hide all other sections
        hideAllSections();

        // Show the settings section
        settingsSection.classList.remove('hidden');
        console.log("Settings section now visible.");

        // Update previousSection
        previousSection = currentSection;
        if (previousSection) {
            console.log("Previous section is:", previousSection.id); // Print the previous section to the console
        } else {
            console.log("No previous section was visible.");
        }
    } else {
        // Hide the settings section and restore the previous section
        settingsSection.classList.add('hidden'); // Hide settings section
        console.log("Settings section now hidden.");
        if (previousSection) {
            console.log("Restoring previous section:", previousSection.id); // Print the previous section to the console
            previousSection.classList.remove('hidden'); // Show previous section
            console.log("Previous section now visible.");
        } else {
            console.log("No previous section to restore.");
        }
    }
}

document.getElementById('settingsBtn').addEventListener('click', function() {
    console.log('Settings button click event triggered!');
    toggleSettingsSection()
});

// Password reset functionality
settingsPasswordResetForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('resetEmail').value;

    sendPasswordResetEmail(getAuth(), email)
        .then(() => {
            alert('Password reset link sent! Please check your email.');
            // Optionally, hide the settings section or clear the form
            settingsSection.classList.add('hidden'); // Hide settings section after submission
            settingsPasswordResetForm.reset(); // Reset form fields
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error(error);
            alert('Error sending password reset link. Please try again.');
        });
});