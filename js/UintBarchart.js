export default function UnitBarchartLayout(
  aq_data,
  canvas,
  article,
  simulation
) {
  // CANVAS SETUP
  const margin = {
      top: 100,
      right: 100 + canvas.attr("width") * 0.5,
      bottom: 100,
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

  // g.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);
  // ga.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);
  gx.transition(t).attr(
    "transform",
    `translate(${margin.left + canvas.attr("width") * 0.5},${
      margin.top + height
    })`
  );
  gy.transition(t).attr(
    "transform",
    `translate(${margin.left + canvas.attr("width") * 0.5},${margin.top})`
  );
  gn.attr("transform", `translate(${margin.left},${margin.top})`);

  gx.transition(t).attr("opacity", 1);
  gy.transition(t).attr("opacity", 1);
  gl.transition(t).attr("opacity", 0);
  gn.transition(t).attr("opacity", 1);
  ga.transition(t).attr("opacity", 1);

  gl.selectAll("*").remove();

  // simulation.stop();

  // DATA MANIPULATE

  const data = aq_data
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
    .objects({ grouped: "entries" })
    .sort((a, b) => a[1].at(-1).value_stackmax - b[1].at(-1).value_stackmax);

  // RENDER PREPERATION

  // const yValue = (d) => d[1].value_stackmax;

  const keySet = new Set(data.map((d) => d[0]));
  const keyArray = Array.from(keySet);

  const xValue = (d) => d[0];
  const yValue = (d) => d.value_stackmax;

  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(data.map((d) => d[1]).flat(), yValue)])
    .range([0, width])
    .nice();

  const yScale = d3
    .scaleBand()
    .domain(data.map(xValue))
    .range([height, 0])
    .padding(0.2);

  gx.transition(t).call(d3.axisBottom(xScale));

  gy.transition(t)
    .call(d3.axisLeft(yScale))
    .call(function (g) {
      g.selectAll("line").remove();
      g.selectAll("text").style("text-anchor", "start").attr("x", 6);
      return g;
    });

  const colorScale = d3
    .scaleOrdinal()
    .domain([
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
    .range(d3.range(1, 16).map((v) => d3.interpolateTurbo(v / 16)));

  d3.selectAll(".morphRectGroups").select(function () {
    const newNode = document.getElementById("nodesGroup");
    return newNode.appendChild(this.cloneNode(true));
  });

  const morphRectGroups = gn
    .selectAll("g")
    .data(data, (d) => d[0])
    .join("g")
    .attr("class", (d) => `morphRectGroupsCloned ${d[0]}`);

  const morphRectGroup = morphRectGroups.selectAll("rect").data((d) => d[1]);

  morphRectGroup.join(
    function (enter) {
      const rectEner = enter
        .append("rect")
        .attr("id", (d, i) => "mrect" + d.id)
        .attr("y", (d) => yScale(d.key))
        .attr("height", yScale.bandwidth())
        .attr("x", (d) => xScale(d.value_stackmin) + canvas.attr("width") * 0.5)
        .attr(
          "width",
          (d) => xScale(d.value_stackmax) - xScale(d.value_stackmin)
        )
        .attr("fill", (d) => colorScale(d.key));

      return rectEner;
    },
    function (update) {
      return update
        .transition()
        .ease(d3.easeExpIn)
        .delay(
          (d, i) => (keyArray.length - keyArray.indexOf(d.key)) * 750 + i * 5
        )
        .attr("stroke", (d) => colorScale(d.key))
        .attr("stroke-width", 10)
        .transition()
        .duration(750)
        .attr("y", (d) => yScale(d.key))
        .transition()
        .attr("x", (d) => xScale(d.value_stackmin) + canvas.attr("width") * 0.5)
        .transition()
        .duration(50)
        .attr("height", yScale.bandwidth())
        .attr(
          "width",
          (d) => xScale(d.value_stackmax) - xScale(d.value_stackmin)
        )
        .attr("stroke-width", 0);
    },
    function (exit) {
      return exit.call((exit) => exit.transition(t).style("opacity", 0));
    }
  );

  gy.raise();
}
