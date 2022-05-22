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
        data: "",
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
        data: "",
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
        data: "",
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
        data: "",
    },
];

const colors = [
    "rgb(0, 100, 125, 20)",
    "rgb(66, 135, 245)",
    "rgb(235, 64, 52)",
    "rgb(50, 168, 82)",
];
const patterns = [
    "diagonal",
    "dot-dash",
    "diagonal-right-left",
    "dash",
];
const colorsLen = colors.length;
const patternsLen = patterns.length;

const template = {
    file: "data/Arctic_Sea_Ice_Extent.csv",
    id: "arctic-data",
    title: "Arctic Sea Ice Extent",
    type: "bar",
    xAxis: 0,
    yAxes: [
        {
            data: 5,
            backgroundColor: "rgb(252, 190, 3)",
            borderColor: "rgb(252, 190, 3)",
        },
        { data: 4 },
    ],
    xAxisTitle: "Years",
    yAxisTitle: "Million Square km",
    data: "",
};

const templateString = JSON.stringify(template, null, 4);

const charts = [];

const csvTemplate =
    "1979,7.05,4.58\n1980,7.67,4.87\n1981,7.14,4.44\n1982,7.3,4.43";

Chart.defaults.color = "blue";
Chart.defaults.font.size = 16;
Chart.defaults.font.family = "'Roboto', sans-serif";

document.getElementById("csv-data").placeholder = csvTemplate;
document.getElementById("json-data").value = templateString;
document.getElementById("json-data").placeholder = templateString;

(async () => {
    for (const obj of files) {
        await parseData(obj);
    }
})();

async function parseData(obj, prependCanvas) {
    const { file, id, title, type, xAxis, yAxes, xAxisTitle, yAxisTitle } = obj;
    if (!obj.data) {
        const res = await fetch(file);
        obj.data = (await res.text()).trim();
    }
    const text = obj.data;
    const arr = text.split("\n").map((x) => x.split(","));

    const headers = arr.splice(0, 1).flat();

    const labels = arr.map((x) => x[xAxis]);
    const data = {
        labels,
        datasets: yAxes.map(
            ({ label, backgroundColor, borderColor, data }, i) => {
                const currColor = colors[i % colorsLen];
                const defaultColor =
                    type == "bar"
                        ? pattern.draw(patterns[i % patternsLen], currColor)
                        : currColor;
                return {
                    label: label ?? headers[data],
                    backgroundColor: backgroundColor ?? defaultColor,
                    borderColor: borderColor ?? defaultColor,
                    data: arr.map((x) => x[data]),
                };
            }
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
                    pinch: {
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

    if (prependCanvas) {
        container.prepend(chartCanvas);
    } else {
        container.append(chartCanvas);
    }
    charts.push(myChart);
}

function parseInput() {
    const title = document.getElementById("title").value.trim() || "Epic Title";
    const type = document.getElementById("type").value.trim() || "bar";
    const xAxisTitle =
        document.getElementById("xAxis").value.trim() || "X-Axis Title";
    const yAxisTitle =
        document.getElementById("yAxis").value.trim() || "Y-Axis Title";
    const labels =
        document.getElementById("labels").value.trim() || "year,extent,area";
    const csvData =
        document.getElementById("csv-data").value.trim() || csvTemplate;
    const yAxes = csvData
        .split("\n")[0]
        .split(",")
        .map((x, i) => ({ data: i }))
        .slice(1);
    const data = `${labels}\n${csvData}`;
    const obj = {
        file: "",
        id: "",
        title,
        type,
        xAxis: 0,
        yAxes,
        xAxisTitle,
        yAxisTitle,
        data,
    };
    files.push(obj);
    parseData(obj, true);
}

function parseInputAdvanced() {
    const text = document.getElementById("json-data").value || templateString;
    const obj = JSON.parse(text);
    files.push(obj);
    parseData(obj, true);
}

let isAdvanced = false;
function switchInput() {
    const simple = document.querySelector("div.simple-container");
    const advanced = document.querySelector("div.advanced-container");
    const button = document.getElementById("switch-input");
    if (isAdvanced) {
        showDiv(simple);
        hideDiv(advanced);
        // button.textContent = "Advanced Mode";
        isAdvanced = false;
        return;
    }
    showDiv(advanced);
    hideDiv(simple);
    // button.textContent = "Simple Mode";
    isAdvanced = true;
}

function hideDiv(div) {
    div.style.display = "none";
    div.style.visibility = "hidden";
}

function showDiv(div) {
    div.style.display = "block";
    div.style.visibility = "visible";
}

let isHidden = true;
function dropdownToggle() {
    const div = document.getElementById("meta-container");
    const button = document.getElementById("menu-toggle");
    if (isHidden) {
        showDiv(div);
        button.textContent = "Hide!";
        isHidden = false;
        return;
    }
    hideDiv(div);
    button.textContent = "Show!";
    isHidden = true;
}

let isOptions = false;
function menuSwitch() {
    const div1 = document.getElementsByClassName("form-container")[0];
    const div2 = document.getElementById("input-container");
    const div3 = document.getElementById("options-container");
    const title = document.getElementById("form-title");
    const button = document.getElementById("menu-swap");
    if (isOptions) {
        button.textContent = "Options";
        div1.style["background-color"] = 'aliceblue';
        button.style["background-color"] = 'royalblue';
        title.textContent = "Input Your Own Data!";
        showDiv(div2);
        hideDiv(div3);
        isOptions = false;
        return;
    }
    div1.style["background-color"] = 'royalblue';
    button.style["background-color"] = 'aliceblue';
    title.textContent = "Configuration Settings";
    button.textContent = "Input";
    showDiv(div3);
    hideDiv(div2);
    isOptions = true;
}