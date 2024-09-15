import { auth, database } from './firebase.js'; // Adjust the path if necessary
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { ref, set, get, update, onValue, remove } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

// Handle Admin Registration
document.getElementById("adminRegisterForm")?.addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("Registration successful");

            set(ref(database, 'admins/' + user.uid), {
                role: 'admin'
            }).then(() => {
                console.log("Admin role saved in database");
                window.location.href = 'admin-login.html'; 
            }).catch((error) => {
                console.error("Error saving admin role:", error);
                alert("Error saving admin role: " + error.message);
            });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Error during registration:", errorCode, errorMessage);
            alert("Registration failed: " + errorMessage);
        });
});

// Handle Laboratory Staff Registration
document.getElementById("labRegisterForm")?.addEventListener("submit", function(event) {
    event.preventDefault();

    const firstName = document.getElementById("firstName").value;
    const middleName = document.getElementById("middleName").value;
    const lastName = document.getElementById("lastName").value;
    const username = document.getElementById("username").value;
    const contactNumber = document.getElementById("contactNumber").value;
    const address = document.getElementById("address").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("Registration successful");

            set(ref(database, 'new_user_requests/' + user.uid), {
                firstName: firstName,
                middleName: middleName,
                lastName: lastName,
                username: username,
                contactNumber: contactNumber,
                address: address,
                email: email,
                role: 'staff',
                status: 'pending' // New requests are initially pending
            }).then(() => {
                console.log("New user request saved in database");
                window.location.href = 'lab-login.html'; 
            }).catch((error) => {
                console.error("Error saving new user request:", error);
                alert("Error saving new user request: " + error.message);
            });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Error during registration:", errorCode, errorMessage);
            alert("Registration failed: " + errorMessage);
        });
});


// Handle External Client Registration
document.getElementById("externalClientRegisterForm")?.addEventListener("submit", function(event) {
    event.preventDefault();

    const firstName = document.getElementById("firstName").value;
    const middleName = document.getElementById("middleName").value || ''; // optional
    const lastName = document.getElementById("lastName").value;
    const username = document.getElementById("username").value;
    const address = document.getElementById("address").value;
    const contactNumber = document.getElementById("contactNumber").value;
    const school = document.getElementById("school").value;
    const department = document.getElementById("department").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("Registration successful");

            set(ref(database, 'new_user_requests/' + user.uid), {
                firstName: firstName,
                middleName: middleName,
                lastName: lastName,
                username: username,
                address: address,
                contactNumber: contactNumber,
                school: school,
                department: department,
                email: email,
                role: 'client',
                clientType: 'external',  // Automatically assigned as external
                status: 'pending'
            }).then(() => {
                console.log("External client request saved in database");
                window.location.href = 'external-client-login.html'; 
            }).catch((error) => {
                console.error("Error saving client request:", error);
                alert("Error saving client request: " + error.message);
            });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Error during registration:", errorCode, errorMessage);
            alert("Registration failed: " + errorMessage);
        });
});


// Handle Internal Client Registration
document.getElementById("internalClientRegisterForm")?.addEventListener("submit", function(event) {
    event.preventDefault();

    const firstName = document.getElementById("firstName").value;
    const middleName = document.getElementById("middleName").value;
    const lastName = document.getElementById("lastName").value;
    const username = document.getElementById("username").value;
    const address = document.getElementById("address").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const contactNumber = document.getElementById("contactNumber").value;
    const department = document.getElementById("department").value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("Registration successful");

            set(ref(database, 'new_user_requests/' + user.uid), {
                firstName: firstName,
                middleName: middleName,
                lastName: lastName,
                username: username,
                email: email,
                address: address,
                contactNumber: contactNumber,
                department: department,
                role: 'client',
                clientType: 'internal',  // Automatically assigned as internal
                status: 'pending'
            }).then(() => {
                console.log("Internal client request saved in database");
                window.location.href = 'internal-client-login.html'; 
            }).catch((error) => {
                console.error("Error saving client request:", error);
                alert("Error saving client request: " + error.message);
            });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Error during registration:", errorCode, errorMessage);
            alert("Registration failed: " + errorMessage);
        });
});


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

    if (!adminContent || !adminErrorMessage || !newRequestsTable || !staffTableBody) {
        console.error("Required elements for admin dashboard not found.");
        return;
    }

    auth.onAuthStateChanged((user) => {
        if (user) {
            const userRef = ref(database, 'admins/' + user.uid);
            get(userRef).then((snapshot) => {
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
            }).catch((error) => {
                console.error("Error fetching user role:", error);
                adminContent.style.display = "none";
                adminErrorMessage.style.display = "block";
            });
        } else {
            window.location.href = 'admin-login.html';
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
    
                if (user.role === 'staff') {
                    name = `${user.firstName} ${user.middleName} ${user.lastName}`;
                    clientTypeOrDept = user.department; // Department for staff
                } else if (user.role === 'client' && user.clientType === 'internal') {
                    name = `${user.firstName} ${user.middleName} ${user.lastName}`;
                    clientTypeOrDept = 'Internal Client'; // Label for internal clients
                } else if (user.role === 'client' && user.clientType === 'external') {
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
                if (role === 'client') {
                    // Add client to the clients table
                    set(ref(database, 'clients/' + userId), {
                        email: requestData.email,
                        role: 'client',
                        clientType: requestData.clientType // Add client type if available
                    }).then(() => {
                        console.log("Client added.");
                        remove(requestRef).then(() => {
                            console.log("Request removed.");
                            fetchNewUserRequests(); // Refresh the table
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
                } else if (role === 'staff') {
                    // Add laboratory staff to the laboratory_staff table
                    set(ref(database, 'laboratory_staff/' + userId), {
                        email: requestData.email,
                        role: 'staff'
                    }).then(() => {
                        console.log("Laboratory staff added.");
                        remove(requestRef).then(() => {
                            console.log("Request removed.");
                            fetchNewUserRequests(); // Refresh the table
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

    function displayLaboratoryStaff() {
        const staffRef = ref(database, 'laboratory_staff/');
        onValue(staffRef, (snapshot) => {
            const staffTableBody = document.getElementById("staffTable").getElementsByTagName('tbody')[0];
            staffTableBody.innerHTML = "";
            snapshot.forEach((childSnapshot) => {
                const staff = childSnapshot.val();
                const row = staffTableBody.insertRow();
                
                // Display email
                row.insertCell(0).textContent = staff.email || "No email";
                
                // Display role
                row.insertCell(1).textContent = staff.role || "No role";
            });
        });
    }    

    function displayClients() {
        const clientsRef = ref(database, 'clients/');
        onValue(clientsRef, (snapshot) => {
            const clientsTableBody = document.getElementById("clientsTable").getElementsByTagName('tbody')[0];
            clientsTableBody.innerHTML = "";
            snapshot.forEach((childSnapshot) => {
                const client = childSnapshot.val();
                const row = clientsTableBody.insertRow();
                
                // Display email
                row.insertCell(0).textContent = client.email || "No email";
                
                // Display client type
                row.insertCell(1).textContent = client.role || "No Role";

                // Display client type
                row.insertCell(2).textContent = client.clientType || "No type";
            });
        });
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
      ${request['role'] === 'client' ? `<p>Client Type: ${request['clientType'] || 'N/A'}</p>` : ''}
      ${request['role'] === 'client' && request['department'] ? `<p>Department: ${request['department'] || 'N/A'}</p>` : ''}
      ${request['role'] === 'client' && request['clientType'] === 'external' && request['school'] ? `<p>School: ${request['school'] || 'N/A'}</p>` : ''}
      <p>Full Name: ${request['firstName'] || 'N/A'} ${request['middleName'] ? request['middleName'] + ' ' : ''}${request['lastName'] || 'N/A'}</p>
      <p>Contact Number: ${request['contactNumber'] || 'N/A'}</p>
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

