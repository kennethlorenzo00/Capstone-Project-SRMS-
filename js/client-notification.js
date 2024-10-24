// Import Firebase libraries and initialize app
import { database, firestore } from './firebase.js'; // Assuming firebase.js exports these
import { doc, collection, getDocs, query, where, addDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

// DOM elements
const notificationsBtn = document.getElementById("notificationsBtn");
const notificationPopup = document.getElementById("notificationPopup");
const closePopupBtn = document.getElementById("closePopup");
const notificationsList = document.getElementById("notificationsList");
const notificationCount = document.getElementById("notificationCount");

let notifications = [];

// Utility: Update notification count
function updateNotificationCount() {
    // Filter out notifications with status "read" or undefined status
    const unreadNotifications = notifications.filter(notification => notification.status !== "read");

    const count = unreadNotifications.length;
    notificationCount.textContent = count;

    if (count === 0) {
        notificationsList.innerHTML = "<p>No notifications available</p>";
    } else {
        renderNotifications(); // Renders updated notifications
    }
}

// Utility: Render notifications in the popup
function renderNotifications() {
    notificationsList.innerHTML = ""; // Clear previous list
    notifications.forEach((notification, index) => {
        const notificationItem = document.createElement("div");
        notificationItem.classList.add("notification-item");

        // Apply different styles based on the status
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

// Fetch notifications from Firestore based on clientId
async function fetchNotifications() {
    // Get the current logged-in user
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
        const userId = user.uid; // Get the logged-in user's ID

        // Create a query for the clientnotification collection where clientId matches userId
        const notificationsRef = collection(firestore, 'clientnotification');
        const q = query(notificationsRef, where('clientId', '==', userId)); // Filter by clientId

        const querySnapshot = await getDocs(q);

        notifications = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        updateNotificationCount();
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
    const notificationRef = doc(firestore, "clientnotification", notifications[index].id); // You'll need to store the notification ID
    await updateDoc(notificationRef, {
        status: "read"
    });

    updateNotificationCount(); // Update the count after marking as read
    renderNotifications(); // Re-render notifications to reflect changes
}

// Delete notification
async function deleteNotification(index) {
    const notificationId = notifications[index].id; // Get the notification ID
    await deleteDoc(doc(firestore, "clientnotification", notificationId)); // Delete from Firestore
    notifications.splice(index, 1); // Remove notification from the list
    updateNotificationCount(); // Update the count after deletion
    renderNotifications(); // Re-render notifications to reflect changes
}

// Initialize notifications
const auth = getAuth();
auth.onAuthStateChanged(async (user) => {
    if (user) {
        await fetchNotifications(); // Fetch notifications when the user logs in
    } else {
        // Optionally clear notifications or perform other actions on logout
        notifications = [];
        updateNotificationCount();
    }
});

// Initialize notifications on page load
fetchNotifications(); 