document.getElementById('btn-requests').addEventListener('click', function () {
    toggleInstructions('requests-instructions');
});

document.getElementById('btn-procedures').addEventListener('click', function () {
    toggleInstructions('procedures-instructions');
});

document.getElementById('btn-services').addEventListener('click', function () {
    toggleInstructions('services-instructions');
});

function toggleInstructions(id) {
    const sections = document.querySelectorAll('.instructions');
    const faqSection = document.querySelector('.faq');

    sections.forEach(section => section.style.display = 'none');
    faqSection.style.display = 'none';

    const selectedSection = document.getElementById(id);
    selectedSection.style.display = 'block';

    handleQuestionClick(selectedSection);
}

const faqItems = document.querySelectorAll('.faq ul li span');
faqItems.forEach(item => {
    item.addEventListener('click', function() {
        const answer = this.nextElementSibling;
        answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
    });
});

function handleQuestionClick(section) {
    const questionItems = section.querySelectorAll('li span');
    questionItems.forEach(item => {
        item.removeEventListener('click', toggleAnswer);  
        item.addEventListener('click', toggleAnswer); 
    });
}

function toggleAnswer() {
    const answer = this.nextElementSibling;
    answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
}

document.getElementById('search-btn').addEventListener('click', function() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const allSections = document.querySelectorAll('.faq ul li, .instructions ul li');
    let hasResults = false;

    allSections.forEach(section => {
        const question = section.querySelector('span').textContent.toLowerCase();
        if (question.includes(query)) {
            section.style.display = 'block';
            hasResults = true;
        } else {
            section.style.display = 'none';
        }
    });

    const noResultsMessage = document.getElementById('no-results');
    const categoriesSection = document.getElementById('categories-section');
    const faqSection = document.getElementById('faq-section');
    const contentSections = document.getElementById('content-sections');

    if (!hasResults && query.trim() !== "") {
        noResultsMessage.style.display = 'flex'; 
        categoriesSection.style.display = 'none'; 
        faqSection.style.display = 'none'; 
        contentSections.style.display = 'none';
    } else {
        noResultsMessage.style.display = 'none'; 
        categoriesSection.style.display = 'block';
        faqSection.style.display = 'block'; 
        contentSections.style.display = 'block';
    }
});

// Add the help section toggle
document.getElementById('helpBtn').addEventListener('click', function() {
    toggleHelpSection(); // Toggle the help section
});
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

// Variable to store the currently visible section
let previousSection = null;

function toggleHelpSection() {
    const helpSection = document.getElementById('helpSection');
    console.log("Help button clicked, current state:", helpSection.classList.contains('hidden'));

    if (helpSection.classList.contains('hidden')) {
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

        // Show the help section
        helpSection.classList.remove('hidden');
        console.log("Help section now visible.");

        // Update previousSection
        previousSection = currentSection;
        if (previousSection) {
            console.log("Previous section is:", previousSection.id); // Print the previous section to the console
        } else {
            console.log("No previous section was visible.");
        }
    } else {
        // Hide the help section and restore the previous section
        helpSection.classList.add('hidden'); // Hide help section
        console.log("Help section now hidden.");
        if (previousSection) {
            console.log("Restoring previous section:", previousSection.id); // Print the previous section to the console
            previousSection.classList.remove('hidden'); // Show previous section
            console.log("Previous section now visible.");
        } else {
            console.log("No previous section to restore.");
        }
    }
}


