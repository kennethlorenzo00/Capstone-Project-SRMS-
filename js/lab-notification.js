import { auth, database, firestore } from './firebase.js'; // Use your initialized app
import { doc, collection, getDocs, query, where, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

// DOM elements
const notificationsBtn = document.getElementById("notificationsBtn");
const notificationPopup = document.getElementById("notificationPopup");
const closePopupBtn = document.getElementById("closePopup");
const notificationsList = document.getElementById("notificationsList");
const notificationCount = document.getElementById("notificationCount");

let notifications = [];

// Utility: Update notification count
function updateNotificationCount() {
    const unreadNotifications = notifications.filter(notification => notification.status !== "read");
    const count = unreadNotifications.length;
    notificationCount.textContent = count;

    if (count === 0) {
        notificationsList.innerHTML = "<p>No notifications available</p>";
    } else {
        renderNotifications();
    }
}

// Utility: Render notifications in the popup
function renderNotifications() {
    notificationsList.innerHTML = ""; // Clear previous list
    notifications.forEach((notification, index) => {
        const notificationItem = document.createElement("div");
        notificationItem.classList.add("notification-item");
        notificationItem.classList.toggle("read", notification.status === "read");

        notificationItem.innerHTML = `
            <p>${notification.message}</p>
            <div class="notification-menu">
                <i class="fa-solid fa-ellipsis-v"></i>
                <ul class="notification-options">
                    <li class="mark-as-read" data-index="${index}">Mark as Read</li>
                    <li class="delete-notification" data-index="${index}">Delete</li>
                </ul>
            </div>
        `;

        notificationsList.appendChild(notificationItem);
    });
}

// Fetch notifications from Firestore based on staffName
async function fetchNotifications() {
    const user = auth.currentUser; // Use the auth object from firebase.js

    if (user) {
        const userId = user.uid; // Get the logged-in user's ID

        try {
            // Reference to the laboratory_staff node in Realtime Database
            const staffRef = ref(database, `laboratory_staff/${userId}`);

            // Fetch the staff member's details from Realtime Database
            const snapshot = await get(staffRef);
            if (snapshot.exists()) {
                const { firstName, middleName, lastName } = snapshot.val(); // Extract the name fields
                const staffName = `${firstName} ${middleName} ${lastName}`; // Concatenate full name

                // Query the staffnotification collection in Firestore where staffName matches the user's full name
                const notificationsRef = collection(firestore, 'staffnotification');
                const q = query(notificationsRef, where('staffName', '==', staffName));

                const querySnapshot = await getDocs(q);

                notifications = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                updateNotificationCount(); // Update the count after fetching
            } else {
                console.error("No staff details found in Realtime Database.");
            }
        } catch (error) {
            console.error("Error fetching staff data from Realtime Database:", error);
        }
    } else {
        console.error("User not logged in");
    }
}

// Toggle popup visibility when the notification button is clicked
notificationsBtn.addEventListener("click", async () => {
    await fetchNotifications(); // Fetch notifications when the button is clicked
    notificationPopup.classList.toggle("visible");
});

// Close popup when close button is clicked
closePopupBtn.addEventListener("click", () => {
    notificationPopup.classList.remove("visible");
});

// Close popup if clicked outside the popup
document.addEventListener("click", (event) => {
    if (!notificationPopup.contains(event.target) && !notificationsBtn.contains(event.target)) {
        notificationPopup.classList.remove("visible");
    }
});

// Event delegation for notification options
notificationsList.addEventListener("click", (event) => {
    const target = event.target;

    if (target.classList.contains("mark-as-read")) {
        const index = target.getAttribute("data-index");
        markNotificationAsRead(index);
    } else if (target.classList.contains("delete-notification")) {
        const index = target.getAttribute("data-index");
        deleteNotification(index);
    }
});

// Mark notification as read
async function markNotificationAsRead(index) {
    notifications[index].status = "read"; // Update status in the local notifications array

    // Update status in Firestore
    const notificationRef = doc(firestore, "staffnotification", notifications[index].id); // You'll need to store the notification ID
    await updateDoc(notificationRef, {
        status: "read"
    });

    updateNotificationCount();
    renderNotifications();
}

// Delete notification
async function deleteNotification(index) {
    const notificationId = notifications[index].id;
    await deleteDoc(doc(firestore, "staffnotification", notificationId)); // Delete from Firestore
    notifications.splice(index, 1); // Remove notification from the list
    updateNotificationCount();
    renderNotifications();
}

// Initialize notifications
fetchNotifications();