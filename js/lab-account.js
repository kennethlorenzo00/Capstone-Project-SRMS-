import { auth, database, storage } from './firebase.js'; // Import Firebase services
import { ref, get, set, update } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js"; // Import required functions
import { ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js"; // Import storage functions

document.addEventListener('DOMContentLoaded', () => {
    // Elements for displaying account details
    const accountNumberElem = document.getElementById('accountNumber');
    const fullNameElem = document.getElementById('fullName');
    const fullNameDetailElem = document.getElementById('fullNameDetail');
    const addressElem = document.getElementById('address');
    const contactNumberElem = document.getElementById('contactNumber');
    const usernameElem = document.getElementById('username');
    const editAccountBtn = document.getElementById('editAccountBtn');
    const profilePictureElem = document.getElementById('profilePicture');
    const profilePictureInput = document.getElementById('profilePictureInput');

    // Modal Elements
    const modal = document.getElementById('editModal');
    var closeBtn = document.querySelectorAll(".close");
    const saveChangesBtn = document.getElementById('saveChangesBtn');
    

    // Input fields in the modal
    const editFirstName = document.getElementById('editFirstName');
    const editMiddleName = document.getElementById('editMiddleName');
    const editLastName = document.getElementById('editLastName');
    const editAddress = document.getElementById('editAddress');
    const editContactNumber = document.getElementById('editContactNumber');
    const editUsername = document.getElementById('editUsername');

    let userId = ''; // Variable to store the user ID

    auth.onAuthStateChanged((user) => {
        if (user) {
            userId = user.uid;

            const userRef = ref(database, `laboratory_staff/${userId}`);
            
            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const staffData = snapshot.val();

                    // Populate account details
                    accountNumberElem.textContent = userId;
                    fullNameElem.textContent = `${staffData.firstName} ${staffData.middleName} ${staffData.lastName}`;
                    fullNameDetailElem.textContent = `${staffData.firstName} ${staffData.middleName} ${staffData.lastName}`;
                    addressElem.textContent = staffData.address;
                    contactNumberElem.textContent = staffData.contactNumber;
                    usernameElem.textContent = staffData.username;

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
                    console.error("No staff found for this user ID.");
                }
            }).catch((error) => {
                console.error("Error fetching staff data:", error);
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
        const userRef = ref(database, `laboratory_staff/${userId}`);
        update(userRef, updatedData)
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
