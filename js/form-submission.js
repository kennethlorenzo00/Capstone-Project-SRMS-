import { firestore, auth, database } from './firebase.js'; // Import firestore, auth, and database from firebase.js
import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { get, ref } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js'; // Import get and ref from Firebase Realtime Database

document.addEventListener("DOMContentLoaded", function() {
    const reviewModal = document.getElementById('reviewRequestModal');
    const reviewContent = document.getElementById('reviewContent');
    const confirmSubmitButton = document.getElementById('confirmSubmit');
    let pendingData = {}; 

    const requestOptionsMap = {
        microbialTesting: {
            title: "Microbial Testing Methods",
            options: {
                "plateCount": "Plate Count Method",
                "agarDiscDiffusion": "Agar Disc Diffusion Method",
                "agarWellDiffusion": "Agar Well Diffusion Method",
                "MIC": "Minimum Inhibitory Concentration (MIC) Testing",
                "MBC": "Minimum Bactericidal Concentration (MBC) Testing"
            }
        },
        microbialAnalysis: {
            title: "Microbial Analysis & Characterization",
            options: {
                "waterAnalysis": "Microbial Analysis of Water",
                "microbialCharacterization": "Microbial Characterization",
                "cultureCollections": "Microbial Culture Collections (PUPMCC)",
                "microscopy": "Microscopy"
            }
        },
        labResearchProcesses: {
            title: "Laboratory & Research Processes",
            options: {
                "plantIdentification": "Plant Species Identification and Herbarium Curation",
                "labUseEquipmentAccess": "Laboratory Use and Equipment Access",
                "researchCollaboration": "Research Collaboration Process"
            }
        }
    };

    const detailsMap = {
        labUseEquipmentAccess: {
            equipmentId: "Equipment ID",
            scheduledDate: "Scheduled Date",
            postUseCondition: "Post-Use Condition",
            equipmentRequesting: "Equipment Requesting"
        },
        researchCollaboration: {
            projectTitle: "Project Title",
            principalInvestigator: "Principal Investigator",
            collaboratingInstitutions: "Collaborating Institutions",
            objectives: "Objectives",
            startDate: "Start Date",
            endDate: "End Date",
            funding: "Funding",
            rolesResponsibilities: "Roles and Responsibilities",
            deliverables: "Deliverables",
            confidentiality: "Confidentiality",
            contactInformation: "Contact Information"
        }
    };

    // Function to handle form submission
    async function handleFormSubmit(event) {
        event.preventDefault();

        const form = event.target;
        const requestType = form.getAttribute('data-request-type');
        const requestOption = form.getAttribute('data-request-option');
        const requestId = generateRequestId();

        // Get current user
        const user = auth.currentUser;
        if (!user) {
            alert('No user is currently logged in.');
            return;
        }

        // Retrieve user details from Firebase Realtime Database
        let userName = 'Anonymous';
        try {
            const userSnapshot = await get(ref(database, `clients/${user.uid}`));
            if (userSnapshot.exists()) {
                const userData = userSnapshot.val();
                userName = `${userData.firstName || ''} ${userData.middleName || ''} ${userData.lastName || ''}`.trim() || 'Anonymous';
            }
        } catch (error) {
            console.error('Error retrieving user data:', error);
        }

        // Initialize samples as an empty array
        let samples = [];

        // Collect samples data only if the request option is not for equipment
        if (requestOption !== 'labUseEquipmentAccess') {
            const sampleEntries = form.querySelectorAll('.sampleEntry');
            sampleEntries.forEach(entry => {
                const sample = {};
                entry.querySelectorAll('input, select, textarea').forEach(input => {
                    const key = input.name.replace('[]', '');
                    sample[key] = input.value.trim();
                });
                samples.push(sample);
            });
        }

        // Prepare data for review
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            if (!key.includes('sample') && !key.includes('[]')) {
                data[key] = value;
            }
        });

        pendingData = {
            ...data,
            requestId,
            requestType,
            requestOption,
            userId: user.uid,
            userName,
            request_status: 'pending',
            timeStamp: new Date().toISOString()
        };

        // Only add samples if they exist
        if (samples.length) {
            pendingData.samples = samples;
        }

        // Populate review content
        reviewContent.innerHTML = `
            <p><strong>Request ID:</strong> ${pendingData.requestId}</p>
            <p><strong>User Name:</strong> ${pendingData.userName}</p>
            <p><strong>Request Type:</strong> ${requestOptionsMap[pendingData.requestType]?.title || pendingData.requestType}</p>
            <p><strong>Request Option:</strong> ${requestOptionsMap[pendingData.requestType]?.options[pendingData.requestOption] || pendingData.requestOption}</p>
        `;

        // Show samples if they exist and if not an equipment request
        if (pendingData.samples && requestOption !== 'labUseEquipmentAccess') {
            reviewContent.innerHTML += `<p><strong>Samples:</strong></p><ul>${pendingData.samples.map(sample => `
                <li>${Object.entries(sample).map(([key, value]) => `${key}: ${value}`).join(', ')}</li>
            `).join('')}</ul>`;
        } else if (requestOption === 'labUseEquipmentAccess') {
            reviewContent.innerHTML += `<p></p>`;
        }

        // Add details for equipment or research collaboration without samples
        if (pendingData.requestOption === 'labUseEquipmentAccess' || pendingData.requestOption === 'researchCollaboration') {
            reviewContent.innerHTML += `<p><strong>Details:</strong></p><ul>${
                Object.entries(data).map(([key, value]) => 
                    `<li><strong>${detailsMap[pendingData.requestOption][key] || key}:</strong> ${value}</li>`
                ).join('')
            }</ul>`;
        }

        reviewModal.style.display = "block"; // Show the modal
    }
        
    // Confirm submit action
    confirmSubmitButton.addEventListener('click', async () => {
        try {
            await addDoc(collection(firestore, 'requests'), pendingData);
            alert('Request submitted successfully!');
            reviewModal.style.display = "none"; // Hide the modal

            // Reset all forms with data-request-type attribute
            const forms = document.querySelectorAll('form[data-request-type]');
            forms.forEach(form => {
                // Clear the form header
                const formHeader = form.previousElementSibling; // Get the h2 element
                if (formHeader) {
                    formHeader.parentNode.removeChild(formHeader); // Remove the form header
                }

                form.reset(); // Reset each form

                document.getElementById("plateCountForm").classList.add("hidden");
                document.getElementById("agarDiscForm").classList.add("hidden");
                document.getElementById("agarWellForm").classList.add("hidden");
                document.getElementById("micTestingForm").classList.add("hidden");
                document.getElementById("mbcTestingForm").classList.add("hidden");
                document.getElementById("microbialWaterAnalysisForm").classList.add("hidden");
                document.getElementById("microbialCharForm").classList.add("hidden");
                document.getElementById("microbialCultureCollectionsForm").classList.add("hidden");
                document.getElementById("microscopyForm").classList.add("hidden");
                document.getElementById("plantSpeciesIdentificationForm").classList.add("hidden");
                document.getElementById("labUseAndEquipmentAccessForm").classList.add("hidden");
                document.getElementById("researchCollaborationForm").classList.add("hidden");
            });

            // Go back to the create request content section
            document.querySelectorAll('.hidden:not(#createRequestContent)').forEach(el => el.classList.add('hidden'));
            document.getElementById('createRequestContent').classList.remove('hidden');
            
        } catch (error) {
            console.error('Error adding document: ', error);
            alert('Failed to submit request. Please try again.');
        }   
    });


    // Close modal
    document.querySelector('.close').onclick = function() {
        reviewModal.style.display = "none";
    };

    // Attach submit event listener to all forms
    const forms = document.querySelectorAll('form[data-request-type]');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });

    // Function to generate a unique request ID
    function generateRequestId() {
        return 'REQ-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
});
