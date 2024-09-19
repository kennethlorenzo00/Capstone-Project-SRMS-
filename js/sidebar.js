document.addEventListener("DOMContentLoaded", function() {
    // Sidebar Toggle
    const sidebar = document.getElementById("mySidebar");
    const openSidebarBtn = document.getElementById("openSidebar");
    const closeSidebarBtn = document.getElementById("closeSidebar");

    if (openSidebarBtn && closeSidebarBtn && sidebar) {
        openSidebarBtn.addEventListener("click", function() {
            sidebar.classList.remove("hidden");
        });

        closeSidebarBtn.addEventListener("click", function() {
            sidebar.classList.add("hidden");
        });
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
        microbialTestingSection.classList.add("hidden");
        microbialAnalysisSection.classList.add("hidden");
        labResearchProcessesSection.classList.add("hidden");
        microbialTestingOptions.classList.add("hidden");
        microbialAnalysisOptions.classList.add("hidden");
        labResearchProcessesOptions.classList.add("hidden");
    }

    // Function to show a specific section
    function showSection(section) {
        hideAllSections();
        section.classList.remove("hidden");
    }

    // Event listeners for sidebar links
    homeLink.addEventListener("click", function() {
        showSection(dashboardContent);
    });

    createRequestLink.addEventListener("click", function() {
        showSection(createRequestContent);
    });

    requestListLink.addEventListener("click", function() {
        showSection(requestListContent);
    });

    myAccountLink.addEventListener("click", function() {
        showSection(myAccountContent);
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
        microbialAnalysisSection.classList.add("hidden");
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
    });

    document.getElementById("agarDiscDiffusionMethodBtn").addEventListener("click", function() {
        microbialTestingOptions.classList.add("hidden");
        document.getElementById("agarDiscForm").classList.remove("hidden");
    });

    document.getElementById("agarWellDiffusionMethodBtn").addEventListener("click", function() {
        microbialTestingOptions.classList.add("hidden");
        document.getElementById("agarWellForm").classList.remove("hidden");
    });

    document.getElementById("micTestingBtn").addEventListener("click", function() {
        microbialTestingOptions.classList.add("hidden");
        document.getElementById("micTestingForm").classList.remove("hidden");
    });

    document.getElementById("mbcTestingBtn").addEventListener("click", function() {
        microbialTestingOptions.classList.add("hidden");
        document.getElementById("mbcTestingForm").classList.remove("hidden");
    });

    document.getElementById("microbialWaterAnalysisBtn").addEventListener("click", function() {
        microbialAnalysisOptions.classList.add("hidden");
        document.getElementById("microbialWaterAnalysisForm").classList.remove("hidden");
    });

    document.getElementById("microbialCharBtn").addEventListener("click", function() {
        microbialAnalysisOptions.classList.add("hidden");
        document.getElementById("microbialCharForm").classList.remove("hidden");
    });

    document.getElementById("microbialCultureCollectionsBtn").addEventListener("click", function() {
        microbialAnalysisOptions.classList.add("hidden");
        document.getElementById("microbialCultureCollectionsForm").classList.remove("hidden");
    });

    document.getElementById("microscopyBtn").addEventListener("click", function() {
        microbialAnalysisOptions.classList.add("hidden");
        document.getElementById("microscopyForm").classList.remove("hidden");
    });

    document.getElementById("plantSpeciesIdentificationBtn").addEventListener("click", function() {
        labResearchProcessesOptions.classList.add("hidden");
        document.getElementById("plantSpeciesIdentificationForm").classList.remove("hidden");
    });

    document.getElementById("labUseAndEquipmentAccessBtn").addEventListener("click", function() {
        labResearchProcessesOptions.classList.add("hidden");
        document.getElementById("labUseAndEquipmentAccessForm").classList.remove("hidden");
    });

    document.getElementById("researchCollaborationProcessBtn").addEventListener("click", function() {
        labResearchProcessesOptions.classList.add("hidden");
        document.getElementById("researchCollaborationForm").classList.remove("hidden");
    });

    // By default, show the dashboard content
    showSection(dashboardContent);
});