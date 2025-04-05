const ctx = document.getElementById('myChart');
const values = [12, 19, 3, 5, 2, 3];
new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['😡', '😟', '😐', '🙂', '😄'],
        datasets: [{
            label: '# of Votes',
            data: values,
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
