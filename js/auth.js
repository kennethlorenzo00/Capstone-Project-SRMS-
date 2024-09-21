import { auth, database } from './firebase.js';
import { getAuth,createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { ref, set, get, update, onValue, remove} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

// Variables to track email verification
let isEmailVerified = false;
let currentUser;

// Common function to handle Send Verification Link
function handleSendVerification() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Create user in Firebase Authentication
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            currentUser = userCredential.user;
            console.log("User created, sending verification email...");

            // Send verification email
            sendEmailVerification(currentUser)
                .then(() => {
                    alert("Verification email sent. Please verify your email.");
                })
                .catch((error) => {
                    console.error("Error sending verification email:", error.message);
                });
        })
        .catch((error) => {
            console.error("Error during registration:", error.message);
            alert("Error during registration: " + error.message);
        });
}

// Common function to continuously check email verification status
function checkEmailVerification(registerBtnId) {
    const intervalId = setInterval(() => {
        currentUser.reload().then(() => {
            if (currentUser.emailVerified) {
                isEmailVerified = true;
                document.getElementById(registerBtnId).disabled = false; // Enable register button
                console.log("Email verified, register button enabled.");
                clearInterval(intervalId); // Stop checking once verified
            } else {
                console.log("Email not verified yet.");
            }
        }).catch((error) => {
            console.error("Error reloading user:", error.message);
        });
    }, 3000); // Check every 3 seconds
}

// Function to handle password reset
document.getElementById('passwordResetForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('resetEmail').value;

    sendPasswordResetEmail(getAuth(), email)
    .then(() => {
        alert('Password reset link sent! Please check your email.');
        window.history.back(); 
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(error);
        alert('Error sending password reset link. Please try again.');
    });
});

// Handle Laboratory Staff Registration
if (document.getElementById("labRegisterForm")) {
    const registerBtn = document.getElementById("registerBtn");
    const sendVerificationBtn = document.getElementById("sendVerificationBtn");

    sendVerificationBtn.addEventListener("click", () => {
        handleSendVerification();
        checkEmailVerification("registerBtn");
    });

    document.getElementById("labRegisterForm").addEventListener("submit", function(event) {
        event.preventDefault();

        if (!isEmailVerified) {
            alert("Please verify your email before registering.");
            return;
        }

        const firstName = document.getElementById("firstName").value;
        const middleName = document.getElementById("middleName").value || '';
        const lastName = document.getElementById("lastName").value;
        const username = document.getElementById("username").value;
        const contactNumber = document.getElementById("contactNumber").value;
        const address = document.getElementById("address").value;
        const email = document.getElementById("email").value;

        // Save data to database
        set(ref(database, 'new_user_requests/' + currentUser.uid), {
            firstName,
            middleName,
            lastName,
            username,
            contactNumber,
            address,
            email,
            role: 'Staff',
            status: 'Pending'
        }).then(() => {
            alert("Registration successful, waiting for admin approval.");
            auth.signOut(); // Sign out the user after registration
            window.location.href = 'lab-login.html';
        }).catch((error) => {
            console.error("Error saving registration:", error.message);
            alert("Error saving registration: " + error.message);
        });
    });
}

// Handle External Client Registration
if (document.getElementById("externalClientRegisterForm")) {
    const registerBtn = document.getElementById("registerBtn");
    const sendVerificationBtn = document.getElementById("sendVerificationBtn");

    sendVerificationBtn.addEventListener("click", () => {
        handleSendVerification();
        checkEmailVerification("registerBtn");
    });

    document.getElementById("externalClientRegisterForm").addEventListener("submit", function(event) {
        event.preventDefault();

        if (!isEmailVerified) {
            alert("Please verify your email before registering.");
            return;
        }

        const firstName = document.getElementById("firstName").value;
        const middleName = document.getElementById("middleName").value || '';
        const lastName = document.getElementById("lastName").value;
        const username = document.getElementById("username").value;
        const address = document.getElementById("address").value;
        const contactNumber = document.getElementById("contactNumber").value;
        const userType = document.getElementById("userType").value;
        const school = document.getElementById("school").value;
        const department = document.getElementById("department").value;
        const email = document.getElementById("email").value;

        // Save data to database
        set(ref(database, 'new_user_requests/' + currentUser.uid), {
            firstName,
            middleName,
            lastName,
            username,
            address,
            contactNumber,
            userType,
            school,
            department,
            email,
            role: 'Client',
            clientType: 'External',
            status: 'Pending'
        }).then(() => {
            alert("Registration successful, waiting for admin approval.");
            auth.signOut(); // Sign out the user after registration
            window.location.href = 'external-client-login.html';
        }).catch((error) => {
            console.error("Error saving registration:", error.message);
            alert("Error saving registration: " + error.message);
        });
    });
}

// Handle Internal Client Registration
if (document.getElementById("internalClientRegisterForm")) {
    const registerBtn = document.getElementById("registerBtn");
    const sendVerificationBtn = document.getElementById("sendVerificationBtn");

    sendVerificationBtn.addEventListener("click", () => {
        handleSendVerification();
        checkEmailVerification("registerBtn");
    });

    document.getElementById("internalClientRegisterForm").addEventListener("submit", function(event) {
        event.preventDefault();

        if (!isEmailVerified) {
            alert("Please verify your email before registering.");
            return;
        }

        const firstName = document.getElementById("firstName").value;
        const middleName = document.getElementById("middleName").value || '';
        const lastName = document.getElementById("lastName").value;
        const username = document.getElementById("username").value;
        const address = document.getElementById("address").value;
        const school = document.getElementById("school").value;
        const contactNumber = document.getElementById("contactNumber").value;
        const userType = document.getElementById("userType").value;
        const department = document.getElementById("department").value;
        const email = document.getElementById("email").value;

        // Save data to database
        set(ref(database, 'new_user_requests/' + currentUser.uid), {
            firstName,
            middleName,
            lastName,
            username,
            address,
            contactNumber,
            userType,
            department,
            school,
            email,
            role: 'Client',
            clientType: 'Internal',
            status: 'Pending'
        }).then(() => {
            alert("Registration successful, waiting for admin approval.");
            auth.signOut(); // Sign out the user after registration
            window.location.href = 'internal-client-login.html';
        }).catch((error) => {
            console.error("Error saving registration:", error.message);
            alert("Error saving registration: " + error.message);
        });
    });
}

// Handle Admin Login
document.getElementById("adminLoginForm")?.addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("Login successful, checking role...");

            const userRef = ref(database, 'admins/' + user.uid); // Updated to check 'admins' table
            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    if (userData.role === 'admin') {
                        console.log("User is an admin. Redirecting to dashboard...");
                        sessionStorage.setItem('adminEmail', email);
                        sessionStorage.setItem('adminPassword', password);
                        console.log('Stored Email:', sessionStorage.getItem('adminEmail'));
                        console.log('Stored Password:', sessionStorage.getItem('adminPassword'));

                        window.location.href = 'admin-dashboard.html';
                    } else {
                        console.log("User is not an admin.");
                        alert("You are not authorized to access the admin dashboard.");
                        signOut(auth).catch((error) => {
                            console.error("Error during sign-out:", error);
                        });
                    }
                } else {
                    console.log("No user document found in database.");
                    alert("User not found in database.");
                    signOut(auth).catch((error) => {
                        console.error("Error during sign-out:", error);
                    });
                }
            }).catch((error) => {
                console.error("Error fetching user role:", error);
                alert("Error fetching user role: " + error.message);
            });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Error during login:", errorCode, errorMessage);
            alert("Login failed: " + errorMessage);
        });
});


// Handle Laboratory Staff Login
document.getElementById("labLoginForm")?.addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("Login successful, checking status...");

            const staffRef = ref(database, 'laboratory_staff/' + user.uid);
            get(staffRef).then((snapshot) => {
                if (snapshot.exists()) {
                    // User is in the 'laboratory_staff' table
                    console.log("User is a laboratory staff member.");
                    window.location.href = 'lab-dashboard.html'; 
                } else {
                    // User is not found in 'laboratory_staff', check 'new_user_requests'
                    const requestRef = ref(database, 'new_user_requests/' + user.uid);
                    get(requestRef).then((snapshot) => {
                        if (snapshot.exists()) {
                            const requestData = snapshot.val();
                            if (requestData.status === 'approved') {
                                set(ref(database, 'laboratory_staff/' + user.uid), {
                                    email: requestData.email,
                                    role: 'staff'
                                }).then(() => {
                                    console.log("User approved and moved to laboratory staff.");
                                    window.location.href = 'lab-dashboard.html'; 
                                }).catch((error) => {
                                    console.error("Error moving user to laboratory staff:", error);
                                });
                            } else if (requestData.status === 'pending') {
                                console.log("User request is pending.");
                                alert("Your request is still pending approval.");
                                signOut(auth).catch((error) => {
                                    console.error("Error during sign-out:", error);
                                });
                            } else {
                                console.log("User request was denied.");
                                alert("Your request was denied.");
                                signOut(auth).catch((error) => {
                                    console.error("Error during sign-out:", error);
                                });
                            }
                        } else {
                            console.log("No user request found.");
                            alert("User request not found.");
                            signOut(auth).catch((error) => {
                                console.error("Error during sign-out:", error);
                            });
                        }
                    }).catch((error) => {
                        console.error("Error fetching user request status:", error);
                        alert("Error fetching user request status: " + error.message);
                    });
                }
            }).catch((error) => {
                console.error("Error fetching laboratory staff data:", error);
                alert("Error fetching laboratory staff data: " + error.message);
            });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Error during login:", errorCode, errorMessage);
            alert("Login failed: " + errorMessage);
        });
});

// Handle External Client Login
document.getElementById("externalClientLoginForm")?.addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("Login successful, checking status...");

            const clientRef = ref(database, 'clients/' + user.uid);
            get(clientRef).then((snapshot) => {
                if (snapshot.exists()) {
                    // User is in the 'clients' table
                    console.log("User is an external client.");
                    window.location.href = 'client-dashboard.html'; // Redirect to client dashboard
                } else {
                    // User is not found in 'clients', check 'new_user_requests'
                    const requestRef = ref(database, 'new_user_requests/' + user.uid);
                    get(requestRef).then((snapshot) => {
                        if (snapshot.exists()) {
                            const requestData = snapshot.val();
                            if (requestData.status === 'approved' && requestData.clientType === 'external') {
                                console.log("External client approved.");
                                // Move user to 'clients' table
                                set(ref(database, 'clients/' + user.uid), {
                                    email: requestData.email,
                                    clientType: 'external'
                                }).then(() => {
                                    console.log("User approved and moved to clients.");
                                    window.location.href = 'client-dashboard.html'; // Redirect to client dashboard
                                }).catch((error) => {
                                    console.error("Error moving user to clients:", error);
                                });
                            } else if (requestData.status === 'pending') {
                                console.log("Client request is pending.");
                                alert("Your request is still pending approval.");
                                signOut(auth).catch((error) => {
                                    console.error("Error during sign-out:", error);
                                });
                            } else {
                                console.log("Client request was denied.");
                                alert("Your request was denied.");
                                signOut(auth).catch((error) => {
                                    console.error("Error during sign-out:", error);
                                });
                            }
                        } else {
                            console.log("No client request found.");
                            alert("Client request not found.");
                            signOut(auth).catch((error) => {
                                console.error("Error during sign-out:", error);
                            });
                        }
                    }).catch((error) => {
                        console.error("Error fetching client request status:", error);
                        alert("Error fetching client request status: " + error.message);
                    });
                }
            }).catch((error) => {
                console.error("Error fetching client data:", error);
                alert("Error fetching client data: " + error.message);
            });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Error during login:", errorCode, errorMessage);
            alert("Login failed: " + errorMessage);
        });
});

// Handle Internal Client Login
document.getElementById("internalClientLoginForm")?.addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("Login successful, checking status...");

            const clientRef = ref(database, 'clients/' + user.uid);
            get(clientRef).then((snapshot) => {
                if (snapshot.exists()) {
                    // User is in the 'clients' table
                    console.log("User is an internal client.");
                    window.location.href = 'client-dashboard.html'; // Redirect to client dashboard
                } else {
                    // User is not found in 'clients', check 'new_user_requests'
                    const requestRef = ref(database, 'new_user_requests/' + user.uid);
                    get(requestRef).then((snapshot) => {
                        if (snapshot.exists()) {
                            const requestData = snapshot.val();
                            if (requestData.status === 'approved' && requestData.clientType === 'internal') {
                                console.log("Internal client approved.");
                                // Move user to 'clients' table
                                set(ref(database, 'clients/' + user.uid), {
                                    email: requestData.email,
                                    clientType: 'internal'
                                }).then(() => {
                                    console.log("User approved and moved to clients.");
                                    window.location.href = 'client-dashboard.html'; // Redirect to client dashboard
                                }).catch((error) => {
                                    console.error("Error moving user to clients:", error);
                                });
                            } else if (requestData.status === 'pending') {
                                console.log("Client request is pending.");
                                alert("Your request is still pending approval.");
                                signOut(auth).catch((error) => {
                                    console.error("Error during sign-out:", error);
                                });
                            } else {
                                console.log("Client request was denied.");
                                alert("Your request was denied.");
                                signOut(auth).catch((error) => {
                                    console.error("Error during sign-out:", error);
                                });
                            }
                        } else {
                            console.log("No client request found.");
                            alert("Client request not found.");
                            signOut(auth).catch((error) => {
                                console.error("Error during sign-out:", error);
                            });
                        }
                    }).catch((error) => {
                        console.error("Error fetching client request status:", error);
                        alert("Error fetching client request status: " + error.message);
                    });
                }
            }).catch((error) => {
                console.error("Error fetching client data:", error);
                alert("Error fetching client data: " + error.message);
            });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Error during login:", errorCode, errorMessage);
            alert("Login failed: " + errorMessage);
        });
});


// Handle Admin Dashboard Access (Managing Requests and User Approval)
document.addEventListener("DOMContentLoaded", () => {
    const adminContent = document.getElementById("admin-content");
    const adminErrorMessage = document.getElementById("admin-error-message");
    const newRequestsTable = document.getElementById("newRequestsTable");
    const staffTableBody = document.getElementById("staffTable").getElementsByTagName("tbody")[0];
    const clientsTableBody = document.getElementById("clientsTable").getElementsByTagName('tbody')[0];

    if (!clientsTableBody) {
        console.error("clientsTableBody not found.");
        return;
    }

    if (!adminContent || !adminErrorMessage || !newRequestsTable || !staffTableBody) {
        console.error("Required elements for admin dashboard not found.");
        return;
    }

    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = 'admin-login.html';
        } else {
            const userRef = ref(database, 'admins/' + user.uid);
            try {
                const snapshot = await get(userRef);
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    if (userData.role === 'admin') {
                        adminContent.style.display = "block";
                        adminErrorMessage.style.display = "none";
                        loadNewUserRequests();
                        displayLaboratoryStaff();
                        displayClients();
                    } else {
                        adminContent.style.display = "none";
                        adminErrorMessage.style.display = "block";
                    }
                } else {
                    adminContent.style.display = "none";
                    adminErrorMessage.style.display = "block";
                }
            } catch (error) {
                console.error("Error fetching user role:", error);
                adminContent.style.display = "none";
                adminErrorMessage.style.display = "block";
            }
        }
    });

    function loadNewUserRequests() {
        const newRequestsTable = document.getElementById("newRequestsTable").getElementsByTagName("tbody")[0];
        newRequestsTable.innerHTML = ''; // Clear existing table content
    
        const newUserRequestsRef = ref(database, 'new_user_requests/');
        onValue(newUserRequestsRef, (snapshot) => {
            newRequestsTable.innerHTML = ''; // Ensure the table is cleared at the start of each update
            snapshot.forEach((childSnapshot) => {
                const user = childSnapshot.val();
                const userId = childSnapshot.key;
    
                // Create a new table row
                const row = newRequestsTable.insertRow();
                row.setAttribute('data-user-id', userId); // Add this line
    
                // Handle Staff, Internal Client, and External Client differently
                let name, clientTypeOrDept;
    
                if (user.role === 'Staff') {
                    name = `${user.firstName} ${user.middleName} ${user.lastName}`;
                    clientTypeOrDept = user.department; // Department for staff
                } else if (user.role === 'Client' && user.clientType === 'Internal') {
                    name = `${user.firstName} ${user.middleName} ${user.lastName}`;
                    clientTypeOrDept = 'Internal Client'; // Label for internal clients
                } else if (user.role === 'Client' && user.clientType === 'External') {
                    name = `${user.firstName} ${user.middleName} ${user.lastName}`;
                    clientTypeOrDept = `External Client - ${user.department}`; 
                }
    
                // Insert cells and data
                row.insertCell(0).textContent = name || 'N/A'; 
                row.insertCell(1).textContent = user.email || 'N/A'; 
                row.insertCell(2).textContent = user.role || 'N/A'; 
                row.insertCell(3).textContent = clientTypeOrDept || 'N/A'; 
    
                // Add action buttons
                const actionCell = row.insertCell(4);
    
                // Create and append the "View" button
                const viewButton = document.createElement("button");
                viewButton.textContent = "View";
                viewButton.addEventListener("click", function() {
                    viewUserDetails(userId, user);  // View details on click
                });
                actionCell.appendChild(viewButton);
    
                // Create and append the "Approve" button
                const approveButton = document.createElement("button");
                approveButton.textContent = "Approve";
                approveButton.addEventListener("click", function() {
                    handleApprove(userId, user.role); // Approve the user
                });
                actionCell.appendChild(approveButton);
    
                // Create and append the "Deny" button
                const denyButton = document.createElement("button");
                denyButton.textContent = "Deny";
                denyButton.addEventListener("click", function() {
                    handleDeny(userId); // Deny the user
                });
                actionCell.appendChild(denyButton);
            });
        });
    }
    
    // Ensure that this function is only called once
    loadNewUserRequests();
    
    // Function to handle viewing user details
    function viewUserDetails(userId) {
        const requestRef = ref(database, 'new_user_requests/' + userId);
        get(requestRef).then((snapshot) => {
            if (snapshot.exists()) {
                const user = snapshot.val();
                const userRequest = {
                    email: user.email,
                    role: user.role,
                    clientType: user.clientType || 'N/A',
                    firstName: user.firstName,
                    middleName: user.middleName,
                    lastName: user.lastName,
                    contactNumber: user.contactNumber || 'N/A',
                    userType: user.userType,
                    address: user.address || 'N/A',
                    username: user.username || 'N/A'
                };
    
                // Fetch additional data based on user's role and client type
                if (user.role === 'client' && user.clientType === 'internal') {
                    userRequest.department = user.department || 'N/A';
                } else if (user.role === 'client' && user.clientType === 'external') {
                    userRequest.department = user.department || 'N/A';
                    userRequest.school = user.school || 'N/A';
                }
    
                showModal(userRequest); // Pass the updated userRequest object to showModal
            } else {
                console.error("User not found");
            }
        }).catch((error) => {
            console.error("Error fetching user details:", error);
        });
    }
    
    function handleApprove(userId, role) {
        const requestRef = ref(database, 'new_user_requests/' + userId);
        get(requestRef).then((snapshot) => {
            if (snapshot.exists()) {
                const requestData = snapshot.val();
                if (role === 'Client') {
                    // Add client to the clients table
                    set(ref(database, 'clients/' + userId), {
                        email: requestData.email,
                        role: 'Client',
                        clientType: requestData.clientType, 
                        firstName: requestData.firstName,
                        middleName: requestData.middleName,
                        lastName: requestData.lastName,
                        address: requestData.address,
                        username: requestData.username,
                        contactNumber: requestData.contactNumber,
                        userType: requestData.userType,
                        school: requestData.school,
                        department: requestData.department
                    }).then(() => {
                        console.log("Client added.");
                        remove(requestRef).then(() => {
                            console.log("Request removed.");
                            loadNewUserRequests()// Refresh the table
                            displayClients(); // Refresh the clients table
                            // Remove the row from the table
                            const row = document.querySelector(`tr[data-user-id="${userId}"]`);
                            if (row) {
                                row.remove();
                            }
                        }).catch((error) => {
                            console.error("Error removing request:", error);
                        });
                    }).catch((error) => {
                        console.error("Error adding client:", error);
                    });
                } else if (role === 'Staff') {
                    // Add laboratory staff to the laboratory_staff table
                    set(ref(database, 'laboratory_staff/' + userId), {
                        email: requestData.email,
                        role: 'Staff',
                        firstName: requestData.firstName,
                        middleName: requestData.middleName,
                        lastName: requestData.lastName,
                        address: requestData.address,
                        username: requestData.username,
                        contactNumber: requestData.contactNumber,
                    }).then(() => {
                        console.log("Laboratory staff added.");
                        remove(requestRef).then(() => {
                            console.log("Request removed.");
                            loadNewUserRequests(); // Refresh the table
                            displayLaboratoryStaff(); // Refresh the staff table
                            // Remove the row from the table
                            const row = document.querySelector(`tr[data-user-id="${userId}"]`);
                            if (row) {
                                row.remove();
                            }
                        }).catch((error) => {
                            console.error("Error removing request:", error);
                        });
                    }).catch((error) => {
                        console.error("Error adding laboratory staff:", error);
                    });
                }
            }
        }).catch((error) => {
            console.error("Error fetching request data:", error);
        });
    }
    
    function handleDeny(userId) {
        remove(ref(database, 'new_user_requests/' + userId)).then(() => {
            console.log("Request denied and removed");
            fetchNewUserRequests(); // Refresh the table
            // Remove the row from the table
            const row = document.querySelector(`tr[data-user-id="${userId}"]`);
            if (row) {
                row.remove();
            }
        }).catch((error) => {
            console.error("Error denying request:", error);
        });
    }

    // Function to initialize search functionality
    function initializeSearch() {
        const clientSearchInput = document.getElementById('clientSearch');
        const staffSearchInput = document.getElementById('staffSearch');

        clientSearchInput.addEventListener('input', () => {
            filterTable('clientsTable', clientSearchInput.value.toLowerCase());
        });

        staffSearchInput.addEventListener('input', () => {
            filterTable('staffTable', staffSearchInput.value.toLowerCase());
        });
    }

    // Function to filter table rows based on search input
    function filterTable(tableId, searchTerm) {
        const table = document.getElementById(tableId);
        const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
        
        for (let row of rows) {
            let found = false;
            const cells = row.getElementsByTagName('td');
            
            for (let cell of cells) {
                if (cell.textContent.toLowerCase().includes(searchTerm)) {
                    found = true;
                    break;
                }
            }
            
            row.style.display = found ? '' : 'none';
        }
    }

    function displayLaboratoryStaff() {
        const staffRef = ref(database, 'laboratory_staff/');
        onValue(staffRef, (snapshot) => {
            const staffTableBody = document.getElementById("staffTable").getElementsByTagName('tbody')[0];
            if (!staffTableBody) {
                console.error("staffTableBody not found.");
                return;
            }
            staffTableBody.innerHTML = ""; // Clear existing rows
    
            snapshot.forEach((childSnapshot) => {
                const staff = childSnapshot.val();
                const staffId = childSnapshot.key;
    
                const row = staffTableBody.insertRow();
    
                // Display name
                const name = `${staff.firstName || ''} ${staff.middleName || ''} ${staff.lastName || ''}`;
                row.insertCell(0).textContent = name.trim() || "No name";
    
                // Display email
                row.insertCell(1).textContent = staff.email || "No email";
    
                // Display role
                row.insertCell(2).textContent = staff.role || "No role";
    
                // Display action buttons
                const actionCell = row.insertCell(3);
                const viewDetailsBtn = document.createElement('button');
                viewDetailsBtn.textContent = 'View Details';
                viewDetailsBtn.classList.add('view-details-btn');
                viewDetailsBtn.dataset.id = staffId;
                const deactivateBtn = document.createElement('button');
                deactivateBtn.textContent = 'Deactivate';
                deactivateBtn.classList.add('deactivate-btn');
                deactivateBtn.dataset.id = staffId;
    
                actionCell.appendChild(viewDetailsBtn);
                actionCell.appendChild(deactivateBtn);
    
                viewDetailsBtn.addEventListener('click', () => showStaffDetails(staffId));
                deactivateBtn.addEventListener('click', () => deactivateStaff(staffId));
            });
    
            initializeSearch(); // Initialize search functionality
        });
    }    
    
    function showStaffDetails(staffId) {
        const staffRef = ref(database, `laboratory_staff/${staffId}`);
        get(staffRef).then((snapshot) => {
            if (snapshot.exists()) {
                const staff = snapshot.val();
                const staffDetails = {
                    email: staff.email,
                    role: staff.role,
                    firstName: staff.firstName,
                    middleName: staff.middleName,
                    lastName: staff.lastName,
                    address: staff.address,
                    username: staff.username,
                    contactNumber: staff.contactNumber
                };
                showModal(staffDetails); // Assuming you have a function to show a modal
            } else {
                console.error("Staff not found");
            }
        }).catch((error) => {
            console.error("Error fetching staff details:", error);
        });
    }
    
    function deactivateStaff(staffId) {
        if (confirm(`Are you sure you want to deactivate this staff member? This action cannot be undone.`)) {
            const staffRef = ref(database, `laboratory_staff/${staffId}`);
            remove(staffRef)
                .then(() => {
                    alert('Staff member has been deactivated successfully.');
                    // Optionally, remove the row from the table
                    const row = document.querySelector(`tr[data-id="${staffId}"]`);
                    if (row) {
                        row.remove();
                    }
                })
                .catch((error) => {
                    console.error('Error deactivating staff member:', error);
                    alert('Failed to deactivate staff member. Please try again.');
                });
        }
    }       

    function displayClients() {
        const clientsRef = ref(database, 'clients/');
        onValue(clientsRef, (snapshot) => {
            const clientsTableBody = document.getElementById("clientsTable").getElementsByTagName('tbody')[0];
            if (!clientsTableBody) {
                console.error("clientsTableBody not found.");
                return;
            }
            clientsTableBody.innerHTML = ""; // Clear existing rows
    
            snapshot.forEach((childSnapshot) => {
                const client = childSnapshot.val();
                const clientId = childSnapshot.key; // Use the key as a unique identifier
    
                const row = clientsTableBody.insertRow();
    
                // Display name
                const name = `${client.firstName || ''} ${client.middleName || ''} ${client.lastName || ''}`;
                row.insertCell(0).textContent = name.trim() || "No name";
    
                // Display email
                row.insertCell(1).textContent = client.email || "No email";
    
                // Display role
                row.insertCell(2).textContent = client.role || "No role";
    
                // Display client type
                row.insertCell(3).textContent = client.clientType || "No type";
    
                // Display action buttons
                const actionCell = row.insertCell(4);
                const viewDetailsBtn = document.createElement('button');
                viewDetailsBtn.textContent = 'View Details';
                viewDetailsBtn.classList.add('view-details-btn');
                viewDetailsBtn.dataset.id = clientId;
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.classList.add('delete-btn');
                deleteBtn.dataset.id = clientId;
    
                actionCell.appendChild(viewDetailsBtn);
                actionCell.appendChild(deleteBtn);
    
                viewDetailsBtn.addEventListener('click', () => showClientDetails(clientId));
                deleteBtn.addEventListener('click', () => deleteClient(clientId));
            });
    
            initializeSearch(); // Initialize search functionality
        });
    }

    function showClientDetails(clientId) {
        const clientRef = ref(database, `clients/${clientId}`);
        get(clientRef).then((snapshot) => {
            if (snapshot.exists()) {
                const client = snapshot.val();
                const clientDetails = {
                    email: client.email,
                    role: client.role,
                    clientType: client.clientType,
                    firstName: client.firstName,
                    middleName: client.middleName,
                    lastName: client.lastName,
                    address: client.address,
                    username: client.username,
                    contactNumber: client.contactNumber,
                    userType: client.userType,
                    school: client.school, 
                    department: client.department 
                };
                showModal(clientDetails); // Assuming you have a function to show a modal
            } else {
                console.error("Client not found");
            }
        }).catch((error) => {
            console.error("Error fetching client details:", error);
        });
    }    

    // Store a reference to the row when creating it
    const row = clientsTableBody.insertRow();
    row.setAttribute('data-client-id', clientId);

    // When deleting, use this reference
    function deleteClient(clientId) {
        if (confirm(`Are you sure you want to delete this client? This action cannot be undone.`)) {
            const clientRef = ref(database, `clients/${clientId}`);
            remove(clientRef)
                .then(() => {
                    alert('Client has been deleted successfully.');
                    // Optionally, remove the row from the table
                    const row = document.querySelector(`tr[data-client-id="${clientId}"]`);
                    if (row) {
                        row.remove();
                    }
                })
                .catch((error) => {
                    console.error('Error deleting client:', error);
                    alert('Failed to delete client. Please try again.');
                });
        }
    }

});

// Handle Logout
document.getElementById("logoutButton")?.addEventListener("click", function() {
    signOut(auth).then(() => {
        console.log("Sign-out successful.");
        window.location.href = 'index.html'; 
    }).catch((error) => {
        console.error("Error during sign-out:", error);
        alert("Error during sign-out: " + error.message);
    });
});

// Function to display user details in the modal
function showModal(request) {
    // Create a modal container element
    const modalContainer = document.createElement("div");
    modalContainer.className = "modal-container";

    // Create the modal content element
    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";

    // Debugging logs
    console.log("Request Data:", request);

    // Set the modal content
    modalContent.innerHTML = `
      <h2>User Details</h2>
      <p>Email: ${request['email'] || 'N/A'}</p>
      <p>Role: ${request['role'] || 'N/A'}</p>
      ${request['role'] === 'Client' ? `<p>Client Type: ${request['clientType'] || 'N/A'}</p>` : ''}
      ${request['role'] === 'Client' && request['department'] ? `<p>Department: ${request['department'] || 'N/A'}</p>` : ''}
      ${request['role'] === 'Client' && request['clientType'] === 'External' && request['school'] ? `<p>School: ${request['school'] || 'N/A'}</p>` : ''}
      <p>Full Name: ${request['firstName'] || 'N/A'} ${request['middleName'] ? request['middleName'] + ' ' : ''}${request['lastName'] || 'N/A'}</p>
      <p>Contact Number: ${request['contactNumber'] || 'N/A'}</p>
      ${request['role'] === 'Client' ? `<p>User Type: ${request['userType'] || 'N/A'}</p>` : ''}
      <p>Address: ${request['address'] || 'N/A'}</p>
      ${request['username'] ? `<p>Username: ${request['username'] || 'N/A'}</p>` : ''}
      <button id="closeModal">Close</button>
    `;

    // Add the modal content to the modal container
    modalContainer.appendChild(modalContent);

    // Add the modal container to the body
    document.body.appendChild(modalContainer);

    // Add an event listener to the close button
    document.getElementById("closeModal").addEventListener("click", () => {
      modalContainer.remove();
    });

    // Add an event listener to the modal container to close it when clicked outside
    modalContainer.addEventListener("click", (event) => {
      if (event.target === modalContainer) {
        modalContainer.remove();
      }
    });
}


