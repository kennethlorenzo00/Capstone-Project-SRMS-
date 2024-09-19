
document.addEventListener("DOMContentLoaded", function() {
    // Function to show a confirmation dialog before going back
    function showConfirmation(message, callback) {
        if (confirm(message)) {
            callback();
        }
    }

    // Function to hide all form sections
    function hideAllForms() {
        const forms = document.querySelectorAll("div[id$='Form']");
        forms.forEach(form => form.classList.add("hidden"));
    }

    // Function to show the create request section
    function showCreateRequestSection() {
        document.getElementById("createRequestContent").classList.remove("hidden");
    }

    // Add event listeners to back buttons by their IDs
    const backButtonIds = [
        "backPlateCountForm",
        "backAgarDiscForm",
        "backAgarWellForm",
        "backMicTestingForm",
        "backMbcTestingForm",
        "backMicrobialWaterAnalysisForm",
        "backMicrobialCharForm",
        "backMicrobialCultureCollectionsForm",
        "backMicroscopyForm",
        "backPlantSpeciesIdentificationForm",
        "backLabUseAndEquipmentAccessForm",
        "backResearchCollaborationForm"
    ];

    backButtonIds.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener("click", function() {
                showConfirmation("Are you sure you want to go back? All unsaved changes will be lost.", function() {
                    hideAllForms();
                    showCreateRequestSection();
                });
            });
        }
    });

        function addSample(formId, containerId, sampleType) {
        const container = document.getElementById(containerId);
        const sampleEntries = container.querySelectorAll('.sampleEntry');
        const sampleCount = sampleEntries.length + 1;
        let sampleEntry;
    
        // Check if there are existing samples to clone
        if (sampleEntries.length > 0) {
            // Clone the last sample entry if it exists
            sampleEntry = sampleEntries[sampleEntries.length - 1].cloneNode(true);
    
            // Remove the delete button from cloned entries
            const deleteButton = sampleEntry.querySelector('.deleteSampleButton');
            if (deleteButton) {
                deleteButton.remove();
            }
    
            // Add delete button to cloned entry
            const newDeleteButton = document.createElement('button');
            newDeleteButton.type = 'button';
            newDeleteButton.classList.add('deleteSampleButton');
            newDeleteButton.textContent = 'Delete Sample';
            sampleEntry.appendChild(newDeleteButton);
        } else {
            // Create a new sample entry if no existing entries
            sampleEntry = document.createElement('div');
            sampleEntry.classList.add('sampleEntry');
    
            sampleEntry.innerHTML = `
                <h3 class="sampleLabel">Sample no.${sampleCount}</h3>
                <label for="${sampleType}Id">Sample ID:</label>
                <input type="text" class="${sampleType}Id" name="${sampleType}Id[]"><br><br>
                <label for="${sampleType}Name">Sample Name:</label>
                <input type="text" class="${sampleType}Name" name="${sampleType}Name[]"><br><br>
                <label for="${sampleType}Type">Sample Type:</label>
                <input type="text" class="${sampleType}Type" name="${sampleType}Type[]"><br><br>
                <button type="button" class="deleteSampleButton">Delete Sample</button>
            `;
        }
    
        // Update the label of the entry
        sampleEntry.querySelector('.sampleLabel').textContent = `Sample no.${sampleCount}`;
    
        // Clear input fields in the entry
        sampleEntry.querySelectorAll('input').forEach(input => input.value = '');
    
        // Add the new entry to the container
        container.appendChild(sampleEntry);
    
        // Add event listener to the delete button
        sampleEntry.querySelector('.deleteSampleButton').addEventListener('click', function() {
            container.removeChild(sampleEntry);
            updateSampleLabels(container);
        });
    }
    
    // Function to update sample labels after deletion
    function updateSampleLabels(container) {
        const sampleEntries = container.querySelectorAll('.sampleEntry');
        sampleEntries.forEach((entry, index) => {
            entry.querySelector('.sampleLabel').textContent = `Sample no.${index + 1}`;
        });
    }
    
    
    // Event listener for 'Add Another Sample' buttons
    const addSampleButtons = {
        "addSampleButtonPlateCount": { containerId: "sampleContainerPlateCount", sampleType: "plateCount" },
        "addSampleButtonAgarDisc": { containerId: "sampleContainerAgarDisc", sampleType: "agarDisc" },
        "addSampleButtonAgarWell": { containerId: "sampleContainerAgarWell", sampleType: "agarWell" },
        "addSampleButtonMicTesting": { containerId: "sampleContainerMicTesting", sampleType: "micTesting" },
        "addSampleButtonMbcTesting": { containerId: "sampleContainerMbcTesting", sampleType: "mbcTesting" },
        "addSampleButtonMicrobialWaterAnalysis": { containerId: "sampleContainerMicrobialWaterAnalysis", sampleType: "microbialWaterAnalysis" },
        "addSampleButtonMicrobialChar": { containerId: "sampleContainerMicrobialChar", sampleType: "microbialChar" },
        "addSampleButtonMicrobialCultureCollections": { containerId: "sampleContainerMicrobialCultureCollections", sampleType: "microbialCultureCollections" },
        "addSampleButtonMicroscopy": { containerId: "sampleContainerMicroscopy", sampleType: "microscopy" },
        "addSampleButtonPlantSpecies": { containerId: "sampleContainerPlantSpecies", sampleType: "plantSpecies" },
        "addSampleButtonLabEquipment": { containerId: "sampleContainerLabEquipment", sampleType: "labEquipment" }
    };

    Object.keys(addSampleButtons).forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', function() {
                const { containerId, sampleType } = addSampleButtons[buttonId];
                addSample(buttonId, containerId, sampleType);
            });
        }
    });
});
