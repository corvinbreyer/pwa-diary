const values = [12, 19, 3, 5, 2, 3];
const moodLabels = ['😡', '😟', '😐', '🙂', '😄'];
let moodChart;

function initChart(data) {
    const ctx = document.getElementById('myChart');
    moodChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: moodLabels,
            datasets: [{
                label: 'Einträge',
                data: data,
                backgroundColor: '#4dd0e1',
                borderColor: '#0097a7',
                borderWidth: 1
                }]
        },
        options: {
            plugins: {
                legend: {
                    display: false //hides the filtering option
                }
            },
            scales: {
                x: {
                    ticks: {
                        font: {
                            size: 20 //sets the label font size
                        }
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        },
        plugins: [{
            afterDraw: function (chart) {
                const ctx = chart.ctx;
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';

                chart.data.datasets[0].data.forEach((value, index) => {
                    const x = chart.scales.x.getPixelForValue(index);
                    const y = chart.scales.y.bottom - 25; // Position above the X-axis labels
                    const width = 25;
                    const height = 20;

                    ctx.fillStyle = '#b2ebf2';
                    ctx.fillRect(x - width / 2, y, width, height);

                    ctx.fillStyle = '#006064';
                    ctx.fillText(value, x, y + height / 1.5);
                });
            }
        }]
    });
}

// Load data from IndexedDB
function loadMoodDataAndUpdateChart() {
    const moodCounts = {
        '😡': 0,
        '😟': 0,
        '😐': 0,
        '🙂': 0,
        '😄': 0
    };

    const request = indexedDB.open('MoodDB', 1);

    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(['tasks'], 'readonly');
        const store = transaction.objectStore('tasks');

        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = function () {
            const entries = getAllRequest.result;

            entries.forEach(entry => {
                if (moodCounts.hasOwnProperty(entry.mood)) {
                    moodCounts[entry.mood]++;
                }
            });

            const countsArray = moodLabels.map(label => moodCounts[label]);

            if (moodChart) {
                // Update chart data
                moodChart.data.datasets[0].data = countsArray;
                moodChart.update();
            } else {
                initChart(countsArray);
            }
        };
    };

    request.onerror = function () {
        console.error('Failed to open IndexedDB');
    };
}

// Call this function on page load or periodically
loadMoodDataAndUpdateChart();

// Optional: auto-refresh every 2 seconds
setInterval(loadMoodDataAndUpdateChart, 2000);
