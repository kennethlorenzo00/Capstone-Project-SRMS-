 // Sidebar Toggle
 const sidebar = document.getElementById("sidebar");
 const openSidebarBtn = document.getElementById("openSidebar");
 const closeSidebarBtn = document.getElementById("closeSidebar");

 openSidebarBtn.addEventListener("click", function() {
     sidebar.classList.remove("hidden");
 });

 closeSidebarBtn.addEventListener("click", function() {
     sidebar.classList.add("hidden");
 });

 // Tab functionality
 function openTab(evt, tabName) {
     const tabcontents = document.querySelectorAll(".tabcontent");
     const tablinks = document.querySelectorAll(".tablinks");

     tabcontents.forEach(tab => tab.style.display = "none");
     tablinks.forEach(link => link.classList.remove("active"));

     document.getElementById(tabName).style.display = "block";
     evt.currentTarget.className += " active";
 }

 // Show the first tab by default
 document.addEventListener("DOMContentLoaded", function() {
     document.querySelector(".tablinks").click();
 });