import InitialRender from "../js/InitialRender.js";
import UnitchartGridLayout from "../js/UnitchartGridLayout.js";
import UnitChartForceLayout from "../js/UnitChartForceLayout.js";
import UnitChartSankeyAdditional from "../js/UnitChartSankeyAdditional.js";
import UnitBarchartLayout from "../js/UintBarchart.js";
import UnitchartGridLayout2 from "../js/UnitchartGridLayout2.js";
import morphTransition from "../js/morphRect.js";
import UnitChartForceLayoutSplit from "../js/UnitChartForceLayoutSplit.js";
// import {
//   HorizontalBarChart,
//   VerticalBarChart,
//   VerticalBarChart1,
// } from "../js/Barchart.js";
// import { ScatterPlot, ScatterPlotLog } from "../js/ScatterPlot.js";
// import { LineChart } from "../js/LineChart.js";
// import { AreaChart } from "../js/AreaChart.js";

let aq_data = await aq.load("../data/data.csv", { using: aq.fromCSV });

aq_data = aq_data;

const main = d3.select("main");
const scrolly = main.select("#scrolly");
const figure = scrolly.select("figure");
const article = scrolly.select("article");
const step = article.selectAll(".step");
const canvas = figure.append("svg");
const scroller = scrollama();
const simulation = d3.forceSimulation();

const handleResize = () => {
  const stepHeight = Math.floor(window.innerHeight * 0.75);

  step.style("height", stepHeight + "px");

  const figureHeight = window.innerHeight;
  const figureMarginTop = (window.innerHeight - figureHeight) / 2;

  figure
    .style("height", figureHeight + "px")
    .style("top", figureMarginTop + "px");

  scroller.resize();

  const containerRect = figure.node().getBoundingClientRect(),
    containerWidth = containerRect.width,
    containerHeight = containerRect.height;

  canvas.attr("width", containerWidth).attr("height", containerHeight);
};

// scrollama event handlers
const handleStepChange = (response) => {
  // console.log(response);
  // response = { element, direction, index }

  // add color to current step only
  step.classed("is-active", (_, i) => i === response.index);

  switch (response.index + 1) {
    case 0:
      InitialRender(canvas);
      break;

    case 1:
      UnitchartGridLayout(aq_data.slice(0, 1), canvas, article, simulation);
      break;

    case 2:
      UnitchartGridLayout(aq_data.slice(0, 2), canvas, article, simulation);
      break;

    case 3:
      UnitchartGridLayout(aq_data.slice(0, 80), canvas, article, simulation);
      // UnitChartForceLayout(aq_data.slice(0, 0), canvas, article, simulation);
      // UnitChartSankeyAdditional(aq_data, canvas, article, simulation);
      // d3.selectAll(".linkGroup").remove();
      // d3.selectAll(".targetGroup").remove();
      break;

    case 4:
      UnitchartGridLayout(aq_data, canvas, article, simulation);
      // UnitChartForceLayout(aq_data.slice(0, 0), canvas, article, simulation);
      // UnitChartSankeyAdditional(aq_data, canvas, article, simulation);
      // d3.selectAll(".linkGroup").remove();
      break;

    case 5:
      UnitchartGridLayout2(aq_data, canvas, article, simulation);
      break;

    case 6:
      UnitBarchartLayout(aq_data, canvas, article, simulation);
      break;

    case 7:
      UnitchartGridLayout2(aq_data.slice(0, 2), canvas, article, simulation);
      break;

    case 8:
      UnitChartForceLayout(aq_data.slice(0, 2), canvas, article, simulation);
      UnitChartSankeyAdditional(
        aq_data.slice(0, 2),
        canvas,
        article,
        simulation
      );
      break;

    case 9:
      UnitChartForceLayout(aq_data, canvas, article, simulation);
      UnitChartSankeyAdditional(aq_data, canvas, article, simulation);
      break;

    case 10:
      UnitChartForceLayout(
        aq_data.filter((d) => d.firstnations == 1),
        canvas,
        article,
        simulation
      );
      UnitChartSankeyAdditional(
        aq_data.filter((d) => d.firstnations == 1),
        canvas,
        article,
        simulation
      );

      const selector = d3.select("#selectContainer");
      let options = document.querySelectorAll("#selectContainer option");
      for (let i = 0, l = options.length; i < l; i++) {
        options[i].selected = options[i].defaultSelected;
      }

      selector.on("change", function (e, d) {
        // recover the option that has been chosen
        let selectedOption = d3.select(this).property("value");
        // run the updateChart function with this selected option
        let selectedData =
          selectedOption == "all"
            ? aq_data
            : aq_data.filter(aq.escape((d) => d[selectedOption] == 1));
        UnitChartForceLayout(selectedData, canvas, article, simulation);
        UnitChartSankeyAdditional(selectedData, canvas, article, simulation);
      });

      break;

    case 11:
      break;

    case 12:
      break;
  }
};

const init = () => {
  handleResize();
  InitialRender(canvas);

  scroller
    .setup({
      step: "#scrolly article .step",
      offset: 0.4,
      debug: false,
    })
    .onStepEnter(handleStepChange);
};

window.onload = init();
