import morphTransition from "./morphRect.js";
export default async function UnitchartGridLayout(
  aq_data,
  canvas,
  article,
  simulation
) {
  // CANVAS SETUP
  const margin = {
      top: 50,
      right: 100,
      bottom: 0,
      left: 100,
    },
    width = canvas.attr("width") - margin.left - margin.right,
    height = canvas.attr("height") - margin.top - margin.bottom;

  const g = canvas.select("#figureGroup"),
    gx = canvas.select("#xAxisGroup"),
    gy = canvas.select("#yAxisGroup"),
    ga = canvas.select("#anotationGroup"),
    gl = canvas.select("#linksGroup"),
    gn = canvas.select("#nodesGroup");

  const tooltip = d3.select("#tooltipContainer");

  const t = canvas.transition().duration(750);

  g.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);
  ga.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);
  gx.transition(t).attr(
    "transform",
    `translate(${margin.left},${height + margin.top})`
  );
  gy.transition(t).attr(
    "transform",
    `translate(${margin.left + width * 0.7},${margin.top})`
  );

  gx.transition(t).attr("opacity", 1);
  gy.transition(t).attr("opacity", 1);
  gl.transition(t).attr("opacity", 0);
  gn.transition(t).attr("opacity", 0);
  ga.transition(t).attr("opacity", 1);
  gl.selectAll("*").remove();
  gn.selectAll("*").remove();
  // ga.selectAll("*").remove();

  simulation.stop();

  // DATA MANIPULATE
  const data = aq_data.orderby("id").objects();

  const data2 = aq_data
    .fold([
      "firstnations",
      "racialminorities",
      "women",
      "children",
      "youngpeople",
      "unemployedorprecariouslyemployed",
      "peoplewithdisabilitiesorchronichealthconditions",
      "shelter",
      "healthcare_health",
      "familyrelations",
      "violence",
      "voice",
      "work",
      "crime_criminaljustice",
      "inequality",
      "prejudiceanddiscrimination_general",
    ])
    .filter((d) => d.value == 1)
    .groupby("key")
    .derive({ value_stackmax: aq.rolling((d) => op.sum(d.value)) })
    .derive({ value_stackmin: (d) => op.lag(d.value_stackmax, 1, 0) })
    .orderby("key", "id")
    .objects({ grouped: "entries" });

  // RENDER PREPERATION

  const id_set = new Set(data.map((d) => d.id));
  const id_array = Array.from(id_set);

  const bin = Math.floor(Math.sqrt(id_array.length));

  const xValue = (d, i) => id_array.indexOf(d.id) % bin;

  const yValue = (d, i) => Math.floor(id_array.indexOf(d.id) / bin);

  const xScale = d3
    .scaleBand()
    .domain(data.map(xValue))
    .range([0, width])
    .padding(0.1);

  const yScale = d3
    .scaleBand()
    .domain(data.map(yValue))
    .range([0, height])
    .padding(0.1);

  const key_set = new Set(data2.map((d) => d[0]));
  const key_array = Array.from(key_set);

  const bin2 = Math.floor(Math.sqrt(key_array.length));

  const x2Value = (d) => key_array.indexOf(d[0]) % bin2;

  const y2Value = (d) => Math.floor(key_array.indexOf(d[0]) / bin2);

  const xScale2 = d3
    .scaleBand()
    .domain(data2.map(x2Value))
    .range([0, xScale.bandwidth()])
    .padding(0.2);

  const yScale2 = d3
    .scaleBand()
    .domain(data2.map(y2Value))
    .range([0, yScale.bandwidth()])
    .padding(0.2);

  // RENDER

  const morphRectGroups = ga
    .selectAll("g")
    .data(data2, (d) => d[0])
    .join("g")
    .attr("class", (d) => `morphRectGroups ${d[0]}`);

  const morphRectGroup = morphRectGroups.selectAll("rect").data(
    (d) => d[1],
    (d) => d.id
  );

  morphRectGroup.join(
    function (enter) {
      const rectEner = enter
        .append("rect")
        .attr("id", (d, i) => "mrect" + d.id)
        .attr(
          "x",
          (d, i) =>
            +d3.select("#rect" + d.id).attr("x") +
            xScale2(key_array.indexOf(d.key) % bin2)
        )
        .attr(
          "y",
          (d, i) =>
            +d3.select("#rect" + d.id).attr("y") +
            yScale2(Math.floor(key_array.indexOf(d.key) / bin2))
        )
        .attr("height", yScale2.bandwidth())
        .attr("width", xScale2.bandwidth())
        .style("opacity", 0)
        .attr("fill", (d) => colorScale(d.key));

      rectEner
        .transition(t)
        .delay((d, i) => i * 5)
        .style("opacity", 1);

      return rectEner;
    },
    function (update) {
      return update
        .transition(t)
        .attr(
          "x",
          (d, i) =>
            +d3.select("#rect" + d.id).attr("x") +
            xScale2(key_array.indexOf(d.key) % bin2)
        )
        .attr(
          "y",
          (d, i) =>
            +d3.select("#rect" + d.id).attr("y") +
            yScale2(Math.floor(key_array.indexOf(d.key) / bin2))
        )
        .attr("height", yScale2.bandwidth())
        .attr("width", xScale2.bandwidth())
        .style("opacity", 1)
        .attr("fill", (d) => colorScale(d.key));
    },
    function (exit) {
      return exit.call((exit) => exit.transition(t).style("opacity", 0));
    }
  );
}
