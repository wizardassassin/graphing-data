const files = [
    {
        file: "data/Carbon_Dioxide.csv",
        id: "carbon",
        title: "Carbon Dioxide",
        type: "line",
        xAxis: 0,
        yAxes: [
            { data: 4 },
            {
                data: 3,
                backgroundColor: "rgb(120, 75, 0)",
                borderColor: "rgb(120, 75, 0)",
            },
        ],
        xAxisTitle: "Years",
        yAxisTitle: "CO2 (parts per million)",
    },
    {
        file: "data/Global_Temperature.csv",
        id: "global",
        title: "Global Temperature",
        type: "bar",
        xAxis: 0,
        yAxes: [{ data: 1 }],
        xAxisTitle: "Years",
        yAxisTitle: "Temperature Anomaly (C)",
    },
    {
        file: "data/Arctic_Sea_Ice_Extent.csv",
        id: "arctic",
        title: "Arctic Sea Ice Extent",
        type: "bar",
        xAxis: 0,
        yAxes: [
            {
                data: 5,
                backgroundColor: pattern.draw("zigzag-horizontal", "#fcbe03"),
                borderColor: pattern.draw("zigzag-horizontal", "#fcbe03"),
            },
            { data: 4 },
        ],
        xAxisTitle: "Years",
        yAxisTitle: "Million Square km",
    },
    {
        file: "data/Ocean_Heat_Content.csv",
        id: "ocean",
        title: "Ocean Heat Content",
        type: "line",
        xAxis: 0,
        yAxes: [
            { data: 1 },
            {
                backgroundColor: "rgb(120, 75, 0)",
                borderColor: "rgb(120, 75, 0)",
                data: 3,
            },
        ],
        xAxisTitle: "Years",
        yAxisTitle: "Zettajoules",
    },
];

const charts = [];

Chart.defaults.color = "blue";
Chart.defaults.font.size = 16;
Chart.defaults.font.family = "'Roboto', sans-serif";

(async () => {
    for (const obj of files) {
        await parseData(obj);
    }
})();

async function parseData(obj) {
    const { file, id, title, type, xAxis, yAxes, xAxisTitle, yAxisTitle } = obj;
    const res = await fetch(file);
    const text = await res.text();
    const arr = text.split("\n").map((x) => x.split(","));

    const headers = arr.splice(0, 1).flat();

    const labels = arr.map((x) => x[xAxis]);
    const data = {
        labels,
        datasets: yAxes.map(
            ({ label, backgroundColor, borderColor, data }) => ({
                label: label ?? headers[data],
                backgroundColor:
                    backgroundColor ??
                    (type == "bar"
                        ? pattern.draw("dash", "rgb(0, 100, 125, 20)")
                        : "rgb(0, 100, 125, 20)"),
                borderColor:
                    borderColor ??
                    (type == "bar"
                        ? pattern.draw("dash", "rgb(0, 100, 125, 20)")
                        : "rgb(0, 100, 125, 20)"),
                data: arr.map((x) => x[data]),
            })
        ),
    };
    const options = {
        plugins: {
            title: {
                display: true,
                text: title,
            },
            zoom: {
                pan: {
                    enabled: true,
                    mode: "xy",
                },
                limits: {
                    x: {
                        min: "original",
                        max: "original",
                    },
                    y: {
                        min: "original",
                        max: "original",
                    },
                },
                zoom: {
                    wheel: {
                        enabled: true,
                    },
                    mode: "xy",
                },
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: xAxisTitle,
                },
            },
            y: {
                title: {
                    display: true,
                    text: yAxisTitle,
                },
                beginAtZero: false,
            },
        },
    };
    const config = {
        type,
        data,
        options,
    };

    const container = document.querySelector("div.chart-container");
    const chartCanvas = document.createElement("canvas");
    chartCanvas.setAttribute("id", id);
    const myChart = new Chart(chartCanvas, config);

    container.appendChild(chartCanvas);
    charts.push(myChart);
}
