import { firestore } from './firebase.js';
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

async function generateForecastChart() {
    const forecastData = await getRequestDataForForecast();
    
    const ctx = document.getElementById('forecastChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: forecastData.monthLabels, // ["July", "August", "September", "October", "November", "December"]
            datasets: [{
                label: 'Number of Requests',
                data: forecastData.requestCounts, // [3, 4, 5, 6, 7, 8] example data
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
    const currentMonth = new Date().getMonth(); // Current month (0-11)
    const currentYear = new Date().getFullYear();
    const requestCounts = [];
    const monthLabels = [];

    for (let i = -3; i <= 3; i++) {
        const targetMonth = (currentMonth + i + 12) % 12; // Handle wrap-around for months
        const targetYear = currentYear + Math.floor((currentMonth + i) / 12); // Handle year change
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

    const forecastedCounts = forecastFutureRequests(requestCounts.slice(-3)); // Forecasting based on last 3 months
    requestCounts.push(...forecastedCounts);

    return { monthLabels, requestCounts };
}

function forecastFutureRequests(lastThreeMonths) {
    const avgGrowth = (lastThreeMonths[2] - lastThreeMonths[0]) / 2; // Simple average growth
    const futureCounts = [];

    for (let i = 1; i <= 3; i++) {
        futureCounts.push(Math.round(lastThreeMonths[2] + avgGrowth * i)); // Forecasting future values
    }

    return futureCounts;
}

async function generateTopRequestsChart() {
    const topRequestsData = await getTopRequestTypes();

    const ctx = document.getElementById('topRequestsChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: topRequestsData.requestTypes, // ["Research", "Lab Access", "Consultation"]
            datasets: [{
                label: 'Number of Requests',
                data: topRequestsData.requestCounts, // [10, 15, 20] example data
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
        .slice(0, 3); // Get top 3 request types

    const requestTypes = sortedTypes.map(entry => entry[0]);
    const requestCounts = sortedTypes.map(entry => entry[1]);

    return { requestTypes, requestCounts };
}

// Call the functions to generate the charts
generateForecastChart();
generateTopRequestsChart();
