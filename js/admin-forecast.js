import { firestore } from './firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

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
    const model = await trainModel(requestCounts.slice(-6)); // Train with last 6 months
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

    // Forecast using ML
    const forecastedCounts = await forecastFutureRequestsUsingML(requestCounts.slice(-6)); // Use the last 6 months for ML forecast
    requestCounts.push(...forecastedCounts);

    return { monthLabels, requestCounts };
}

// Function to generate the forecast chart
async function generateForecastChart() {
    const forecastData = await getRequestDataForForecast();
    
    const ctx = document.getElementById('forecastChart').getContext('2d');
    new Chart(ctx, {
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

// Call the function to generate the forecast chart
generateForecastChart();

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
generateTopRequestsChart();
