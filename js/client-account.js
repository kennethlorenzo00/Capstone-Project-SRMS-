import { auth, database, storage } from './firebase.js'; // Import Firebase services
import { ref, get, set, update} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js"; // Import required functions
import { ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js"; // Import storage functions

document.addEventListener('DOMContentLoaded', () => {
    // Elements for displaying account details
    const accountNumberElem = document.getElementById('clientAccountNumber');
    const fullNameElem = document.getElementById('clientFullName');
    const fullNameDetailElem = document.getElementById('clientFullNameDetail');
    const addressElem = document.getElementById('clientAddress');
    const contactNumberElem = document.getElementById('clientContactNumber');
    const usernameElem = document.getElementById('clientUsername');
    const editAccountBtn = document.getElementById('editClientAccountBtn');
    const profilePictureElem = document.getElementById('clientProfilePicture');
    const profilePictureInput = document.getElementById('clientProfilePictureInput');

    // Modal Elements
    const modal = document.getElementById('editClientModal');
    const closeModal = document.querySelector('#editClientModal .close');
    const saveChangesBtn = document.getElementById('saveClientChangesBtn');

    // Input fields in the modal
    const editFirstName = document.getElementById('editClientFirstName');
    const editMiddleName = document.getElementById('editClientMiddleName');
    const editLastName = document.getElementById('editClientLastName');
    const editAddress = document.getElementById('editClientAddress');
    const editContactNumber = document.getElementById('editClientContactNumber');
    const editUsername = document.getElementById('editClientUsername');

    let userId = ''; // Variable to store the user ID

    auth.onAuthStateChanged((user) => {
        if (user) {
            userId = user.uid;

            const userRef = ref(database, `clients/${userId}`);
            
            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const clientData = snapshot.val();

                    // Populate account details
                    accountNumberElem.textContent = userId;
                    fullNameElem.textContent = `${clientData.firstName} ${clientData.middleName} ${clientData.lastName}`;
                    fullNameDetailElem.textContent = `${clientData.firstName} ${clientData.middleName} ${clientData.lastName}`;
                    addressElem.textContent = clientData.address;
                    contactNumberElem.textContent = clientData.contactNumber;
                    usernameElem.textContent = clientData.username;

                    // Load profile picture from Firebase Storage if it exists
                    const profilePicStorageRef = storageRef(storage, `profile_pictures/${userId}.jpg`);
                    getDownloadURL(profilePicStorageRef)
                        .then((url) => {
                            profilePictureElem.src = url; // Set profile picture if it exists
                        })
                        .catch((error) => {
                            console.log("Profile picture not found or failed to load:", error);
                            // Leave the default image if not found
                        });
                } else {
                    console.error("No client found for this user ID.");
                }
            }).catch((error) => {
                console.error("Error fetching client data:", error);
            });
        } else {
            console.log('No user is logged in.');
        }
    });

    // Open the modal when Edit button is clicked
    editAccountBtn.addEventListener('click', () => {
        modal.style.display = 'flex';

        // Pre-fill modal input fields with current details
        const fullName = fullNameDetailElem.textContent.split(' ');
        editFirstName.value = fullName[0];
        editMiddleName.value = fullName.length > 2 ? fullName[1] : ''; // Handle cases without middle name
        editLastName.value = fullName[fullName.length - 1];

        editAddress.value = addressElem.textContent;
        editContactNumber.value = contactNumberElem.textContent;
        editUsername.value = usernameElem.textContent;
    });

    // Close the modal when the "x" is clicked
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Save changes when "Save" button is clicked
    saveChangesBtn.addEventListener('click', () => {
        const updatedData = {
            firstName: editFirstName.value,
            middleName: editMiddleName.value,
            lastName: editLastName.value,
            address: editAddress.value,
            contactNumber: editContactNumber.value,
            username: editUsername.value,
        };

        // Update the database with the new values
        const userRef = ref(database, `clients/${userId}`);
        update(userRef, updatedData)  // Change set to update
            .then(() => {
                // Close the modal after saving
                modal.style.display = 'none';

                // Update the account section with the new data
                fullNameElem.textContent = `${updatedData.firstName} ${updatedData.middleName} ${updatedData.lastName}`;
                fullNameDetailElem.textContent = `${updatedData.firstName} ${updatedData.middleName} ${updatedData.lastName}`;
                addressElem.textContent = updatedData.address;
                contactNumberElem.textContent = updatedData.contactNumber;
                usernameElem.textContent = updatedData.username;

                alert('Account details updated successfully!');
            })
            .catch((error) => {
                console.error("Error updating account details:", error);
                alert('Failed to update account details.');
            });
    });

    // Click event to trigger file selection for profile picture upload
    profilePictureElem.addEventListener('click', () => {
        profilePictureInput.click(); // Simulate a click on the hidden file input
    });

    // Handle file selection for profile picture upload
    profilePictureInput.addEventListener('change', (event) => {
        const file = event.target.files[0]; // Get the selected file

        if (file) {
            const storagePath = `profile_pictures/${userId}.jpg`; // Save as userId.jpg
            const storageRefForProfilePic = storageRef(storage, storagePath);

            // Upload the image to Firebase Storage
            uploadBytes(storageRefForProfilePic, file).then(() => {
                // Once uploaded, get the download URL
                return getDownloadURL(storageRefForProfilePic);
            }).then((url) => {
                // Update the profile picture with the new image
                profilePictureElem.src = url;

                alert('Profile picture updated successfully!');
            }).catch((error) => {
                console.error('Error uploading profile picture:', error);
                alert('Failed to upload profile picture.');
            });
        }
    });

    // Close the modal if user clicks outside the modal content
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});