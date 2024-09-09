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

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("Registration successful");

            set(ref(database, 'new_user_requests/' + user.uid), {
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

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("Registration successful");

            set(ref(database, 'new_user_requests/' + user.uid), {
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

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("Registration successful");

            set(ref(database, 'new_user_requests/' + user.uid), {
                email: email,
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

                        fetchNewUserRequests();
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

    function fetchNewUserRequests() {
        const requestsRef = ref(database, 'new_user_requests/');
        onValue(requestsRef, (snapshot) => {
            newRequestsTable.innerHTML = "";
            snapshot.forEach((childSnapshot) => {
                const request = childSnapshot.val();
                const row = newRequestsTable.insertRow();
                
                // Display the email
                row.insertCell(0).textContent = request.email;
                
                // Display client type and role
                let clientTypeRole = '';
                if (request.role === 'client') {
                    clientTypeRole = `${request.clientType} Client`;
                } else {
                    clientTypeRole = request.role;
                }
                row.insertCell(1).textContent = clientTypeRole;
                
                // Display status
                row.insertCell(2).textContent = request.status;
                
                // Create and append Approve button
                const approveBtn = document.createElement("button");
                approveBtn.textContent = "Approve";
                approveBtn.onclick = () => handleApprove(childSnapshot.key, request.role);
                row.insertCell(3).appendChild(approveBtn);
                
                // Create and append Deny button
                const denyBtn = document.createElement("button");
                denyBtn.textContent = "Deny";
                denyBtn.onclick = () => handleDeny(childSnapshot.key);
                row.insertCell(4).appendChild(denyBtn);
            });
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
