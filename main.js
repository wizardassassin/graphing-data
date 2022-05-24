/**
 * There's probably a lot I can do to improve this code,
 * but I'm just happy it just works!
 * Maybe I'll improve on this code later on.
 */

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

const colorArr = [
    "rgb(0, 100, 125, 20)",
    "rgb(66, 135, 245)",
    "rgb(235, 64, 52)",
    "rgb(50, 168, 82)",
];
const patternArr = ["diagonal", "dot-dash", "diagonal-right-left", "dash"];
const colorLen = colorArr.length;
const patternLen = patternArr.length;

const template = {
    file: "data/Arctic_Sea_Ice_Extent.csv",
    id: "arctic-data",
    title: "Arctic Sea Ice Extent 2",
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

function filterShown(chartsArr) {
    const chartLen = chartsArr.length;
    for (let i = chartLen - 1; i >= 0; i--) {
        const elem = chartsArr[i];
        let isSelected = elem.chartCanvas.isConnected;
        if (!isSelected) {
            chartsArr.splice(i, 1);
        }
    }
}

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
                const currColor = colorArr[i % colorLen];
                const defaultColor =
                    type == "bar"
                        ? pattern.draw(patternArr[i % patternLen], currColor)
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

    addChartData({ config, prependCanvas, id });
    addEntry(title, prependCanvas);
}

let fileInd1 = 0;
let fileInd2 = 0;
function addEntry(title, prependCanvas) {
    const isNew = fileInd1 < files.length;
    if (isNew) {
        addLeft(title, prependCanvas);
    }
    addRight(title, prependCanvas);
}

function addLeft(title, prependCanvas) {
    const selection1 = document.getElementById("add-charts-select");
    const default1 = selection1.querySelector("option:nth-child(1)");
    const option1 = document.createElement("option");
    option1.setAttribute("value", fileInd1);
    option1.textContent = title;
    fileInd1++;
    if (prependCanvas) {
        default1.after(option1);
    } else {
        selection1.append(option1);
    }
}

function addRight(title, prependCanvas) {
    const selection2 = document.getElementById("remove-charts-select");
    const default2 = selection2.querySelector("option:nth-child(1)");
    const option2 = document.createElement("option");
    option2.setAttribute("value", fileInd2);
    option2.textContent = title;
    fileInd2++;
    if (prependCanvas) {
        default2.after(option2);
    } else {
        selection2.append(option2);
    }
}

function addChartData(obj) {
    const { config, prependCanvas, id } = obj;
    const container = document.querySelector("div.chart-container");
    const chartCanvas = document.createElement("canvas");
    chartCanvas.setAttribute("id", id);
    const myChart = new Chart(chartCanvas, config);
    const obj2 = {
        myChart,
        chartCanvas,
        config,
        prependCanvas,
        id,
    };

    if (prependCanvas) {
        container.prepend(chartCanvas);
    } else {
        container.append(chartCanvas);
    }
    charts.push(obj2);
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
        div1.style["background-color"] = "aliceblue";
        button.style["background-color"] = "rgb(131 131 233)";
        title.textContent = "Input Your Own Data!";
        showDiv(div2);
        hideDiv(div3);
        isOptions = false;
        return;
    }
    div1.style["background-color"] = "rgb(131 131 233)";
    button.style["background-color"] = "aliceblue";
    title.textContent = "Configuration Settings";
    button.textContent = "Input";
    showDiv(div3);
    hideDiv(div2);
    isOptions = true;
}

function addChart() {
    const selection = document.getElementById("add-charts-select");
    const value = selection.value;
    const option = selection.querySelector(`[value="${value}"]`);
    if (!value) {
        return;
    }
    parseData(files[value], true);
}

function removeChart() {
    const selection = document.getElementById("remove-charts-select");
    const value = selection.value;
    const option = selection.querySelector(`[value="${value}"]`);
    if (!value) {
        return;
    }
    const chartContainer = document.querySelector("div.chart-container");
    const chartContainerArr = Array.from(selection.children);
    const optionInd = chartContainerArr.findIndex((elem) => elem == option) - 1;
    chartContainer.children[optionInd].remove();
    option.remove();
}
