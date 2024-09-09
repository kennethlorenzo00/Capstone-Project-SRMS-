// Toggle sidebar visibility
document.getElementById("openSidebar").addEventListener("click", function() {
    document.getElementById("sidebar").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
});

document.getElementById("closeSidebar").addEventListener("click", function() {
    document.getElementById("sidebar").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
});

// Open tab content
function openTab(evt, tabName) {
    const tabcontents = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontents.length; i++) {
        tabcontents[i].style.display = "none";
    }
    const tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Manage sidebar links visibility
document.getElementById("manageUsersLink").addEventListener("click", function() {
    document.getElementById("manageUsersSection").classList.toggle("hidden");
});
