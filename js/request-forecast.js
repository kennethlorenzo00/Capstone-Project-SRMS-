import { firestore } from './firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

let forecastChartInstance = null;
let topRequestsChartInstance = null;

const forecastBtn = document.getElementById('forecastBtn');
const forecastSection = document.getElementById('forecastSection');
const requestList = document.getElementById('requestList');
const backBtn = document.getElementById('backForecastBtn');
const settingsBtn = document.getElementById('settingsBtn');

// Show forecast section, hide the request list
forecastBtn.addEventListener('click', () => {
    requestList.style.display = 'none'; // Hide the request list
    forecastSection.style.display = 'block'; // Show the forecast section
    settingsBtn.disabled = true;
    generateForecastChart(); // Generate the forecast chart
    generateTopRequestsChart(); // Generate the top requests chart
});

// Back button functionality to go back to request list
backBtn.addEventListener('click', () => {
    forecastSection.style.display = 'none'; // Hide the forecast section
    requestList.style.display = 'block'; // Show the request list again
    settingsBtn.disabled = false;
});

// Function to train the machine learning model
async function trainModel(data) {
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 10, activation: 'relu', inputShape: [1] }));
    model.add(tf.layers.dense({ units: 1 }));

    model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

    const xs = tf.tensor2d(data.slice(0, -1).map(d => [d])); // All but last month
    const ys = tf.tensor2d(data.slice(1).map(d => [d])); // All but first month

    await model.fit(xs, ys, { epochs: 100 });
    return model;
}

// Function to forecast future requests using the trained model
async function forecastFutureRequestsUsingML(requestCounts) {
    const model = await trainModel(requestCounts.slice(-3)); // Train with last 3 months
    const futureCounts = [];
    let lastMonthCount = requestCounts[requestCounts.length - 1];

    for (let i = 0; i < 3; i++) { // Forecast for the next 3 months
        const inputTensor = tf.tensor2d([lastMonthCount], [1, 1]); // Last month count as input
        const prediction = model.predict(inputTensor);

        const forecastedValue = prediction.dataSync()[0]; // Get the predicted value
        futureCounts.push(Math.round(forecastedValue)); // Round off the predicted value
        lastMonthCount = forecastedValue; // Update for next iteration
    }

    return futureCounts;
}

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

    // Get data for the last 3 months
    for (let i = -3; i <= 0; i++) {
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

    // Forecast using ML for the next 3 months
    const forecastedCounts = await forecastFutureRequestsUsingML(requestCounts); // Use the last 3 months for ML forecast

    // Add the forecasted counts to the requestCounts and generate labels for future months
    for (let i = 1; i <= 3; i++) {
        const futureMonth = (currentMonth + i) % 12;
        const futureYear = currentYear + Math.floor((currentMonth + i) / 12);
        monthLabels.push(new Date(futureYear, futureMonth).toLocaleString('default', { month: 'long' }));
    }

    requestCounts.push(...forecastedCounts); // Add forecasted counts to the end of requestCounts

    return { monthLabels, requestCounts };
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
