import { firestore } from './firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

let forecastChartInstance = null;
let topRequestsChartInstance = null;

const forecastBtn = document.getElementById('forecastBtn');
const forecastSection = document.getElementById('forecastSection');
const requestList = document.getElementById('requestList');
const backBtn = document.getElementById('backForecastBtn');

// Show forecast section, hide the request list
forecastBtn.addEventListener('click', () => {
    requestList.style.display = 'none'; // Hide the request list
    forecastSection.style.display = 'block'; // Show the forecast section
    generateForecastChart(); // Generate the forecast chart
    generateTopRequestsChart(); // Generate the top requests chart
});

// Back button functionality to go back to request list
backBtn.addEventListener('click', () => {
    forecastSection.style.display = 'none'; // Hide the forecast section
    requestList.style.display = 'block'; // Show the request list again
});

async function generateForecastChart() {
    const forecastData = await getRequestDataForForecast();
    
    const ctx = document.getElementById('requestForecastChart').getContext('2d');

    // Destroy the existing chart instance if it exists
    if (forecastChartInstance !== null) {
        forecastChartInstance.destroy();
    }

    forecastChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: forecastData.monthLabels, 
            datasets: [{
                label: 'Number of Requests',
                data: forecastData.requestCounts, 
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        }
    });
}

async function getRequestDataForForecast() {
    const currentMonth = new Date().getMonth(); 
    const currentYear = new Date().getFullYear();
    const requestCounts = [];
    const monthLabels = [];

    for (let i = -3; i <= 3; i++) {
        const targetMonth = (currentMonth + i + 12) % 12;
        const targetYear = currentYear + Math.floor((currentMonth + i) / 12);
        monthLabels.push(new Date(targetYear, targetMonth).toLocaleString('default', { month: 'long' }));

        const requestSnapshot = await getDocs(collection(firestore, 'requests'));
        let monthlyRequestCount = 0;

        requestSnapshot.forEach((doc) => {
            const requestData = doc.data();
            const requestDate = new Date(requestData.timeStamp);
            if (requestDate.getMonth() === targetMonth && requestDate.getFullYear() === targetYear) {
                monthlyRequestCount++;
            }
        });

        requestCounts.push(monthlyRequestCount);
    }

    const forecastedCounts = forecastFutureRequests(requestCounts.slice(-3)); 
    requestCounts.push(...forecastedCounts);

    return { monthLabels, requestCounts };
}

function forecastFutureRequests(lastThreeMonths) {
    const avgGrowth = (lastThreeMonths[2] - lastThreeMonths[0]) / 2;
    const futureCounts = [];

    for (let i = 1; i <= 3; i++) {
        futureCounts.push(Math.round(lastThreeMonths[2] + avgGrowth * i));
    }

    return futureCounts;
}

async function generateTopRequestsChart() {
    const topRequestsData = await getTopRequestTypes();

    const ctx = document.getElementById('requestsTopRequestsChart').getContext('2d');

    // Destroy the existing chart instance if it exists
    if (topRequestsChartInstance !== null) {
        topRequestsChartInstance.destroy();
    }

    topRequestsChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: topRequestsData.requestTypes, 
            datasets: [{
                label: 'Number of Requests',
                data: topRequestsData.requestCounts, 
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        }
    });
}

async function getTopRequestTypes() {
    const requestSnapshot = await getDocs(collection(firestore, 'requests'));
    const requestTypeCounts = {};

    requestSnapshot.forEach((doc) => {
        const requestData = doc.data();
        const requestOption = requestData.requestOption;
        if (requestOption) {
            if (!requestTypeCounts[requestOption]) {
                requestTypeCounts[requestOption] = 0;
            }
            requestTypeCounts[requestOption]++;
        }
    });

    const sortedTypes = Object.entries(requestTypeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3); 

    const requestTypes = sortedTypes.map(entry => entry[0]);
    const requestCounts = sortedTypes.map(entry => entry[1]);

    return { requestTypes, requestCounts };
}
