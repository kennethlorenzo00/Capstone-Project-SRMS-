import { auth, database } from './firebase.js'; // Ensure this path is correct
import { createUserWithEmailAndPassword, signOut,signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

// Get the modal elements
const addClientModal = document.getElementById('addClientModal');
const closeAddClientModal = document.getElementById('closeAddClientModal');
const addClientForm = document.getElementById('addClientForm');
const addClientSubmit = document.getElementById('addClientSubmit');

const addStaffModal = document.getElementById('addStaffModal');
const closeAddStaffModal = document.getElementById('closeAddStaffModal');
const addStaffForm = document.getElementById('addStaffForm');
const addStaffSubmit = document.getElementById('addStaffSubmit');

// Add event listeners
document.getElementById('addClientBtn').addEventListener('click', openAddClientModal);
closeAddClientModal.addEventListener('click', closeAddClientModalHandler);
addClientSubmit.addEventListener('click', addNewClient);

document.getElementById('addStaffBtn').addEventListener('click', openAddStaffModal);
closeAddStaffModal.addEventListener('click', closeAddStaffModalHandler);
addStaffSubmit.addEventListener('click', addNewStaff);

// Function to open the add client modal
function openAddClientModal() {
    addClientModal.style.display = 'block';
}

// Function to close the add client modal
function closeAddClientModalHandler() {
    addClientModal.style.display = 'none';
    addClientForm.reset();  // Reset form fields
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Function to add a new client
async function addNewClient(event) {
    event.preventDefault();

    const newClientEmail = document.getElementById('newClientEmail').value.trim();
    const newClientRole = document.getElementById('newClientRole').value;
    const newClientType = document.querySelector('input[name="clientType"]:checked').value;
    const firstName = document.getElementById('firstName').value.trim();
    const middleName = document.getElementById('middleName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const address = document.getElementById('address').value.trim();
    const username = document.getElementById('username').value.trim();
    const contactNumber = document.getElementById('contactNumber').value.trim();
    const school = document.getElementById('school').value.trim();
    const department = document.getElementById('department').value.trim();

    try {
        // Validate client email format
        if (!isValidEmail(newClientEmail)) {
            alert('Please enter a valid email.');
            return;
        }

        // Generate a temporary password for the new client
        const temporaryPassword = generateRandomPassword();

        // Create the new client account
        const userCredential = await createUserWithEmailAndPassword(auth, newClientEmail, temporaryPassword);
        const userId = userCredential.user.uid;

        // Retrieve stored credentials
        const storedEmail = sessionStorage.getItem('adminEmail');
        const storedPassword = sessionStorage.getItem('adminPassword');

        // Log in again with stored credentials
        await signInWithEmailAndPassword(auth, storedEmail, storedPassword);

        // Save new client data in the database
        await set(ref(database, `clients/${userId}`), {
            email: newClientEmail,
            role: newClientRole ,
            clientType: newClientType,
            firstName: firstName,
            middleName: middleName,
            lastName: lastName,
            address: address,
            username: username,
            contactNumber: contactNumber,
            school: school,
            department: department
        });

        alert(`New client added successfully. The temporary password is: ${temporaryPassword}`);
        closeAddClientModalHandler();
  
    } catch (error) {
        console.error('Error adding new client:', error.message);
        alert(`Error adding new client: ${error.message}`);
    }
}

// Function to open the add staff modal
function openAddStaffModal() {
    addStaffModal.style.display = 'block';
}

// Function to close the add staff modal
function closeAddStaffModalHandler() {
    addStaffModal.style.display = 'none';
    addStaffForm.reset();  // Reset form fields
}

// Function to add a new laboratory staff
async function addNewStaff(event) {
    event.preventDefault();
    const newStaffEmail = document.getElementById('newStaffEmail').value.trim();
    const newStaffRole = document.getElementById('newStaffRole').value;
    const firstName = document.getElementById('staffFirstName').value.trim();
    const middleName = document.getElementById('staffMiddleName').value.trim();
    const lastName = document.getElementById('staffLastName').value.trim();
    const address = document.getElementById('staffAddress').value.trim();
    const username = document.getElementById('staffUsername').value.trim();
    const contactNumber = document.getElementById('staffContactNumber').value.trim();
    
    try {
        if (!isValidEmail(newStaffEmail)) {
            alert('Please enter a valid email.');
            return;
        }

        // Generate a temporary password for the new staff
        const temporaryPassword = generateRandomPassword();

        // Create the new staff account
        const userCredential = await createUserWithEmailAndPassword(auth, newStaffEmail, temporaryPassword);
        const userId = userCredential.user.uid;

        // Retrieve stored credentials
        const storedEmail = sessionStorage.getItem('adminEmail');
        const storedPassword = sessionStorage.getItem('adminPassword');

        // Log in again with stored credentials
        await signInWithEmailAndPassword(auth, storedEmail, storedPassword);

        // Save new staff data in the database
        await set(ref(database, `laboratory_staff/${userId}`), {
            email: newStaffEmail,
            role: 'Staff',
            firstName: firstName,
            middleName: middleName,
            lastName: lastName,
            address: address,
            username: username,
            contactNumber: contactNumber,
        });

        alert(`New staff added successfully. The temporary password is: ${temporaryPassword}`);
        closeAddStaffModalHandler();

    } catch (error) {
        console.error('Error adding new staff:', error.message);
        alert(`Error adding new staff: ${error.message}`);
    }
}

// Helper function to generate a random password
function generateRandomPassword() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
        password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return password;
}
