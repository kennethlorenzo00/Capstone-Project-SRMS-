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
    const antimicrobialBtn = document.getElementById("antimicrobialBtn");
    const microbioAssayBtn = document.getElementById("microbioAssayBtn");
    const labEquipmentBtn = document.getElementById("labEquipmentBtn");

    const antimicrobialSection = document.getElementById("antimicrobialSection");
    const microbioAssaySection = document.getElementById("microbioAssaySection");
    const labEquipmentSection = document.getElementById("labEquipmentSection");

    // Options Sections
    const antimicrobialOptions = document.getElementById("antimicrobialOptions");
    const microbioAssayOptions = document.getElementById("microbioAssayOptions");
    const labEquipmentOptions = document.getElementById("labEquipmentOptions");

    // Back Button
    const backToCreateRequest = document.getElementById("backToCreateRequest");

    // Function to hide all sections
    function hideAllSections() {
        dashboardContent.classList.add("hidden");
        createRequestContent.classList.add("hidden");
        requestListContent.classList.add("hidden");
        myAccountContent.classList.add("hidden");
        antimicrobialSection.classList.add("hidden");
        microbioAssaySection.classList.add("hidden");
        labEquipmentSection.classList.add("hidden");
        antimicrobialOptions.classList.add("hidden");
        microbioAssayOptions.classList.add("hidden");
        labEquipmentOptions.classList.add("hidden");
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
    antimicrobialBtn.addEventListener("click", function() {
        antimicrobialSection.classList.remove("hidden");
        microbioAssaySection.classList.add("hidden");
        labEquipmentSection.classList.add("hidden");
    });

    microbioAssayBtn.addEventListener("click", function() {
        antimicrobialSection.classList.add("hidden");
        microbioAssaySection.classList.remove("hidden");
        labEquipmentSection.classList.add("hidden");
    });

    labEquipmentBtn.addEventListener("click", function() {
        antimicrobialSection.classList.add("hidden");
        microbioAssaySection.classList.add("hidden");
        labEquipmentSection.classList.remove("hidden");
    });

    // Event listeners for "Back" buttons
    document.getElementById("backToCreateRequestAntimicrobial").addEventListener("click", function() {
        antimicrobialOptions.classList.add("hidden");
        createRequestContent.classList.remove("hidden");
    });

    document.getElementById("backToCreateRequestMicrobioAssay").addEventListener("click", function() {
        microbioAssayOptions.classList.add("hidden");
        createRequestContent.classList.remove("hidden");
    });

    document.getElementById("backToCreateRequestLabEquipment").addEventListener("click", function() {
        labEquipmentOptions.classList.add("hidden");
        createRequestContent.classList.remove("hidden");
    });

    // Event listeners for "Proceed Now!" buttons
    document.getElementById("proceedAntimicrobial").addEventListener("click", function() {
        antimicrobialSection.classList.add("hidden");
        createRequestContent.classList.add("hidden");
        antimicrobialOptions.classList.remove("hidden");
    });

    document.getElementById("proceedMicrobioAssay").addEventListener("click", function() {
        microbioAssaySection.classList.add("hidden");
        createRequestContent.classList.add("hidden");
        microbioAssayOptions.classList.remove("hidden");
    });

    document.getElementById("proceedLabEquipment").addEventListener("click", function() {
        labEquipmentSection.classList.add("hidden");
        createRequestContent.classList.add("hidden");
        labEquipmentOptions.classList.remove("hidden");
    });

    // By default, show the dashboard content
    showSection(dashboardContent);
});
