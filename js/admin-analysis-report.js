import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js"; 
import { firestore } from './firebase.js'; // Adjust the path according to your structure

async function fetchAnalysisReports() {
    const analysisReportTableBody = document.getElementById('analysisReportTableBody');
    analysisReportTableBody.innerHTML = ''; // Clear previous content

    try {
        const analysisReportRef = collection(firestore, 'analysisreport');
        const analysisReportsSnapshot = await getDocs(analysisReportRef);

        if (analysisReportsSnapshot.empty) {
            analysisReportTableBody.innerHTML = '<tr><td colspan="3">No reports available.</td></tr>';
            return;
        }

        // Populate the table with analysis report messages, request IDs, and a View PDF button
        analysisReportsSnapshot.forEach(doc => {
            const reportData = doc.data();
            const requestId = reportData.requestId; // Extract the requestId from the reportData
            const pdfFileName = `report_${requestId}.pdf`; // Construct the PDF file name

            // Construct the URL for the PDF file
            const pdfUrl = `https://firebasestorage.googleapis.com/v0/b/srms-be1e2.appspot.com/o/reports%2F${encodeURIComponent(pdfFileName)}?alt=media`;

            console.log(pdfUrl); // Log the constructed URL for debugging

            const row = `
                <tr>
                    <td>${reportData.message || 'N/A'}</td>
                    <td>${requestId || 'N/A'}</td>
                    <td><button onclick="window.open('${pdfUrl}', '_blank')">View PDF</button></td>
                </tr>
            `;
            analysisReportTableBody.innerHTML += row; // Append new row to the table
        });
    } catch (error) {
        console.error('Error fetching analysis reports:', error);
        analysisReportTableBody.innerHTML = '<tr><td colspan="3">Error fetching reports. Please try again.</td></tr>';
    }
}


// Call the function to fetch analysis reports when the tab is shown or when needed
fetchAnalysisReports();
