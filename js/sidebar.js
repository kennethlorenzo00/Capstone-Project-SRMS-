document.addEventListener("DOMContentLoaded", function() {
// Sidebar Toggle
const sidebar = document.getElementById("mySidebar");
const toggleSidebarBtn = document.getElementById("openSidebar"); // Reuse the burger button
const mainContent = document.getElementById("main"); // Reference to the main content div
const logoutBtn = document.getElementById("logoutBtn"); // Reference to the logout button
const settingsBtn = document.getElementById('settingsBtn');
const helpBtn = document.getElementById('helpBtn');

// Initialize the sidebar as closed by default
sidebar.classList.add("minimized"); // This indicates the sidebar is initially closed
mainContent.style.marginLeft = "60px"; // Set margin for minimized state

toggleSidebarBtn.addEventListener("click", function() {
    if (sidebar.classList.contains("minimized")) {
        // Open Sidebar
        sidebar.classList.remove("minimized");  // Show the sidebar
        mainContent.style.marginLeft = "250px"; // Set to sidebar's width
        logoutBtn.classList.remove("minimized"); // Ensure logout button margin is reset
    } else {
        // Close Sidebar
        sidebar.classList.add("minimized");  // Collapse the sidebar
        mainContent.style.marginLeft = "60px"; // Adjust margin for minimized sidebar
        logoutBtn.classList.add("minimized"); // Apply minimized class to logout button
    }
});



    const forms = [
        document.getElementById("plateCountForm"),
        document.getElementById("agarDiscForm"),
        document.getElementById("agarWellForm"),
        document.getElementById("micTestingForm"),
        document.getElementById("mbcTestingForm"),
        document.getElementById("microbialWaterAnalysisForm"),
        document.getElementById("microbialCharForm"),
        document.getElementById("microbialCultureCollectionsForm"),
        document.getElementById("microscopyForm"),
        document.getElementById("plantSpeciesIdentificationForm"),
        document.getElementById("labUseAndEquipmentAccessForm"),
        document.getElementById("researchCollaborationForm"),
        document.getElementById("requestDetailsSection")
    ];

    function isAnyFormVisible() {
        return forms.some(form => !form.classList.contains("hidden"));
    }

    function toggleSidebarDisabled() {
        if (isAnyFormVisible()) {
            sidebar.classList.add("disabled-sidebar");
            settingsBtn.disabled = true;
            helpBtn.disabled = true;
        } else {
            sidebar.classList.remove("disabled-sidebar");
            settingsBtn.disabled = false;
            helpBtn.disabled = false;
        }
    }

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
        forms.forEach(form => form.classList.add("hidden"));
    }

    // Function to show a specific section
    function showSection(section) {
        hideAllSections();
        section.classList.remove("hidden");
        toggleSidebarDisabled();
    }

    // Event listeners for sidebar links
    homeLink.addEventListener("click", function() {
        showSection(dashboardContent);
        const helpSection = document.getElementById('helpSection');
        helpSection.classList.add('hidden');
        const settingsSection = document.getElementById('clientSettingsSection');
        settingsSection.classList.add('hidden');
    });

    createRequestLink.addEventListener("click", function() {
        showSection(createRequestContent);
        const helpSection = document.getElementById('helpSection');
        helpSection.classList.add('hidden');
        const settingsSection = document.getElementById('clientSettingsSection');
        settingsSection.classList.add('hidden');
    });

    requestListLink.addEventListener("click", function() {
        showSection(requestListContent);
        const helpSection = document.getElementById('helpSection');
        helpSection.classList.add('hidden');
        const settingsSection = document.getElementById('clientSettingsSection');
        settingsSection.classList.add('hidden');
    });

    myAccountLink.addEventListener("click", function() {
        showSection(myAccountContent);
        myAccountContent.style.display = "block";
        const helpSection = document.getElementById('helpSection');
        helpSection.classList.add('hidden');
        const settingsSection = document.getElementById('clientSettingsSection');
        settingsSection.classList.add('hidden');
    });

    // Event listeners for request type buttons in Create Request section
    microbialTestingBtn.addEventListener("click", function() {
        microbialTestingSection.classList.remove("hidden");
        microbialAnalysisSection.classList.add("hidden");
        labResearchProcessesSection.classList.add("hidden");
    });

    microbialAnalysisBtn.addEventListener("click", function() {
        microbialTestingSection.classList.add("hidden");
        microbialAnalysisSection.classList.remove("hidden");
        labResearchProcessesSection.classList.add("hidden");
    });

    labResearchProcessesBtn.addEventListener("click", function() {
        microbialTestingSection.classList.add("hidden");
        microbialAnalysisSection.classList.add("hidden");
        labResearchProcessesSection.classList.remove("hidden");
    });

    // Event listeners for "Back" buttons
    document.getElementById("backToCreateRequestMicrobialTesting").addEventListener("click", function() {
        microbialTestingOptions.classList.add("hidden");
        createRequestContent.classList.remove("hidden");
    });

    document.getElementById("backToCreateRequestMicrobialAnalysis").addEventListener("click", function() {
        microbialAnalysisOptions.classList.add("hidden");
        createRequestContent.classList.remove("hidden");
    });

    document.getElementById("backToCreateRequestLabResearchProcesses").addEventListener("click", function() {
        labResearchProcessesOptions.classList.add("hidden");
        createRequestContent.classList.remove("hidden");
    });

    // Event listeners for "Proceed Now!" buttons
    document.getElementById("proceedMicrobialTesting").addEventListener("click", function() {
        microbialTestingSection.classList.add("hidden");
        createRequestContent.classList.add("hidden");
        microbialTestingOptions.classList.remove("hidden");
    });

    document.getElementById("proceedMicrobialAnalysis").addEventListener("click", function() {
        microbialAnalysisSection .classList.add("hidden");
        createRequestContent.classList.add("hidden");
        microbialAnalysisOptions.classList.remove("hidden");
    });

    document.getElementById("proceedLabResearchProcesses").addEventListener("click", function() {
        labResearchProcessesSection.classList.add("hidden");
        createRequestContent.classList.add("hidden");
        labResearchProcessesOptions.classList.remove("hidden");
    });

    // Event listeners for options buttons
    document.getElementById("plateCountMethodBtn").addEventListener("click", function() {
        microbialTestingOptions.classList.add("hidden");
        document.getElementById("plateCountForm").classList.remove("hidden");
        toggleSidebarDisabled();
    });

    document.getElementById("agarDiscDiffusionMethodBtn").addEventListener("click", function() {
        microbialTestingOptions.classList.add("hidden");
        document.getElementById("agarDiscForm").classList.remove("hidden");
        toggleSidebarDisabled();
    });

    document.getElementById("agarWellDiffusionMethodBtn").addEventListener("click", function() {
        microbialTestingOptions.classList.add("hidden");
        document.getElementById("agarWellForm").classList.remove("hidden");
        toggleSidebarDisabled();
    });

    document.getElementById("micTestingBtn").addEventListener("click", function() {
        microbialTestingOptions.classList.add("hidden");
        document.getElementById("micTestingForm").classList.remove("hidden");
        toggleSidebarDisabled();
    });

    document.getElementById("mbcTestingBtn").addEventListener("click", function() {
        microbialTestingOptions.classList.add("hidden");
        document.getElementById("mbcTestingForm").classList.remove("hidden");
        toggleSidebarDisabled();
    });

    document.getElementById("microbialWaterAnalysisBtn").addEventListener("click", function() {
        microbialAnalysisOptions.classList.add("hidden");
        document.getElementById("microbialWaterAnalysisForm").classList.remove("hidden");
        toggleSidebarDisabled();
    });

    document.getElementById("microbialCharBtn").addEventListener("click", function() {
        microbialAnalysisOptions.classList.add("hidden");
        document.getElementById("microbialCharForm").classList.remove("hidden");
        toggleSidebarDisabled();
    });

    document.getElementById("microbialCultureCollectionsBtn").addEventListener("click", function() {
        microbialAnalysisOptions.classList.add("hidden");
        document.getElementById("microbialCultureCollectionsForm").classList.remove("hidden");
        toggleSidebarDisabled();
    });

    document.getElementById("microscopyBtn").addEventListener("click", function() {
        microbialAnalysisOptions.classList.add("hidden");
        document.getElementById("microscopyForm").classList.remove("hidden");
        toggleSidebarDisabled();
    });

    document.getElementById("plantSpeciesIdentificationBtn").addEventListener("click", function() {
        labResearchProcessesOptions.classList.add("hidden");
        document.getElementById("plantSpeciesIdentificationForm").classList.remove("hidden");
        toggleSidebarDisabled();
    });

    document.getElementById("labUseAndEquipmentAccessBtn").addEventListener("click", function() {
        labResearchProcessesOptions.classList.add("hidden");
        document.getElementById("labUseAndEquipmentAccessForm").classList.remove("hidden");
        toggleSidebarDisabled();
    });

    document.getElementById("researchCollaborationProcessBtn").addEventListener("click", function() {
        labResearchProcessesOptions.classList.add("hidden");
        document.getElementById("researchCollaborationForm").classList.remove("hidden");
        toggleSidebarDisabled();
    });

    document.getElementById("backPlateCountForm").addEventListener("click", function() {
        document.getElementById("plateCountForm").classList.add("hidden");
        toggleSidebarDisabled();
    });

    document.getElementById("backAgarDiscForm").addEventListener("click", function() {
        document.getElementById("agarDiscForm").classList.add("hidden");
        toggleSidebarDisabled();
    });

    document.getElementById("backAgarWellForm").addEventListener("click", function() {
        document.getElementById("agarWellForm").classList.add("hidden");
        toggleSidebarDisabled();
    });

    document.getElementById("backMicTestingForm").addEventListener("click", function() {
        document.getElementById("micTestingForm").classList.add("hidden");
        toggleSidebarDisabled();
    });

    document.getElementById("backMbcTestingForm").addEventListener("click", function() {
        document.getElementById("mbcTestingForm").classList.add("hidden");
        toggleSidebarDisabled();
    });

    document.getElementById("backMicrobialWaterAnalysisForm").addEventListener("click", function() {
        document.getElementById("microbialWaterAnalysisForm").classList.add("hidden");
        toggleSidebarDisabled();
    });

    document.getElementById("backMicrobialCharForm").addEventListener("click", function() {
        document.getElementById("microbialCharForm").classList.add("hidden");
        toggleSidebarDisabled();
    });

    document.getElementById("backMicrobialCultureCollectionsForm").addEventListener("click", function() {
        document.getElementById("microbialCultureCollectionsForm").classList.add("hidden");
        toggleSidebarDisabled();
    });

    document.getElementById("backMicroscopyForm").addEventListener("click", function() {
        document.getElementById("microscopyForm").classList.add("hidden");
        toggleSidebarDisabled();
    });

    document.getElementById("backPlantSpeciesIdentificationForm").addEventListener("click", function() {
        document.getElementById("plantSpeciesIdentificationForm").classList.add("hidden");
        toggleSidebarDisabled();
    });

    document.getElementById("backLabUseAndEquipmentAccessForm").addEventListener("click", function() {
        document.getElementById("labUseAndEquipmentAccessForm").classList.add("hidden");
        toggleSidebarDisabled();
    });

    document.getElementById("backResearchCollaborationForm").addEventListener("click", function() {
        document.getElementById("researchCollaborationForm").classList.add("hidden");
        toggleSidebarDisabled();
    });

    // By default, show the dashboard content
    showSection(dashboardContent);
});