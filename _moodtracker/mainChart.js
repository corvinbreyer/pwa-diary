function cssVar(s) {
    return window.getComputedStyle(document.body).getPropertyValue(s);
}
const ctx = document.getElementById('myChart');
const myChart = {
    labels: ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple'],
    values: [12, 19, 3, 5, 2, 3],
};

new Chart(ctx, {
    type: 'bar',
    data: {
        labels: myChart.labels,
        datasets: [{
            label: '# of Votes',
            data: myChart.values,
            backgroundColor: cssVar('--primary-2') + '33',
            borderColor: cssVar('--primary-2'),
            borderWidth: 1
                }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
