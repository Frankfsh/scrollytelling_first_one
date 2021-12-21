function ScatterPlot(aq_data, canvas, article) {
  const margin = {
      top: 30,
      right: 50,
      bottom: 100,
      left: 70,
    },
    width = canvas.attr("width") - margin.left - margin.right,
    height = canvas.attr("height") - margin.top - margin.bottom;

  const g = canvas.select("#figureGroup"),
    gx = canvas.select("#xAxisGroup"),
    gy = canvas.select("#yAxisGroup");

  const t = canvas.transition().duration(750);

  g.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);
  gx.transition(t).attr(
    "transform",
    `translate(${margin.left},${height + margin.top})`
  );
  gy.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);

  let data = aq_data.objects();

  data.forEach(function (d) {
    d.Dates = d3.timeParse("%m/%y")(d.Date);
  });

  const xValue = (d) => d.Dates;
  const yValue = (d) => d.Cases;

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, yValue)])
    .range([height, 0]);

  const xScale = d3
    .scaleTime()
    .domain(data.map(xValue))
    .domain(d3.extent(data, xValue))
    .range([0, width]);

  g.selectAll("path").transition(t).attr("opacity", 0).remove();

  gx.transition(t)
    .attr("opacity", 1)
    .call(d3.axisBottom(xScale))
    .call((g) =>
      g
        .selectAll("text")
        .attr("transform", "rotate(15)")
        .style("text-anchor", "start")
    );

  gy.transition(t)
    .attr("opacity", 1)
    .call(
      d3
        .axisLeft(yScale)
        .tickFormat(d3.format("~s"))
        .ticks(Math.round(height / 100))
    );

  const syntaxElement = g
    .selectAll("rect")
    .data(data, (d) => d["Country/Region"] + d.Date);

  const r = 10;

  syntaxElement.join(
    (enter) =>
      enter
        .append("rect")
        .attr("fill", "red")
        .style("mix-blend-mode", "multiply")
        .attr("x", (d) => xScale(xValue(d)) - r / 2)
        .attr("y", (d) => yScale(yValue(d)) - r / 2)
        .call((enter) =>
          enter
            .transition(t)
            .attr("rx", r)
            .attr("ry", r)
            .attr("width", r)
            .attr("height", r)
        ),
    (update) =>
      update.call((update) =>
        update
          .transition(t)
          .attr("rx", r)
          .attr("ry", r)
          .attr("width", r)
          .attr("height", r)
          .transition(t)
          .delay((d, i) => i * 10)
          .attr("x", (d) => xScale(xValue(d)) - r / 2)
          .attr("y", (d) => yScale(yValue(d)) - r / 2)
      ),
    (exit) =>
      exit.call((exit) =>
        exit
          .transition(t)
          .attr("rx", 0)
          .attr("ry", 0)
          .attr("width", 0)
          .attr("height", 0)
      )
  );
}

function ScatterPlotLog(aq_data, canvas, article) {
  const margin = {
      top: 30,
      right: 50,
      bottom: 100,
      left: 70,
    },
    width = canvas.attr("width") - margin.left - margin.right,
    height = canvas.attr("height") - margin.top - margin.bottom;

  const g = canvas.select("#figureGroup"),
    gx = canvas.select("#xAxisGroup"),
    gy = canvas.select("#yAxisGroup");

  const t = canvas.transition().duration(750);

  g.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);
  gx.transition(t).attr(
    "transform",
    `translate(${margin.left},${height + margin.top})`
  );
  gy.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);

  let data = aq_data.objects();

  data.forEach(function (d) {
    d.Dates = d3.timeParse("%m/%y")(d.Date);
  });

  const xValue = (d) => d.Dates;
  const yValue = (d) => d.Cases + 1;

  const yScale = d3
    .scaleLog()
    .base(10)
    .domain([1, d3.max(data, yValue)])
    .range([height, 0]);

  const xScale = d3
    .scaleTime()
    .domain(data.map(xValue))
    .domain(d3.extent(data, xValue))
    .range([0, width]);

  gx.transition(t)
    .attr("opacity", 1)
    .call(d3.axisBottom(xScale))
    .call((g) =>
      g
        .selectAll("text")
        .attr("transform", "rotate(15)")
        .style("text-anchor", "start")
    );

  gy.transition(t)
    .attr("opacity", 1)
    .call(
      d3
        .axisLeft(yScale)
        .tickFormat(d3.format("~s"))
        .ticks(Math.round(height / 100))
    );

  const syntaxElement = g
    .selectAll("rect")
    .data(data, (d) => d["Country/Region"] + d.Date);

  const r = 10;

  syntaxElement.join(
    (enter) =>
      enter
        .append("rect")
        .attr("fill", "red")
        .style("mix-blend-mode", "multiply")
        .attr("x", (d) => xScale(xValue(d)) - r / 2)
        .attr("y", (d) => yScale(yValue(d)) - r / 2)
        .call((enter) =>
          enter
            .transition(t)
            .attr("rx", r)
            .attr("ry", r)
            .attr("width", r)
            .attr("height", r)
        ),
    (update) =>
      update.call((update) =>
        update
          .transition(t)
          .attr("rx", r)
          .attr("ry", r)
          .attr("width", r)
          .attr("height", r)
          .transition(t)
          .delay((d, i) => i * 10)
          .attr("x", (d) => xScale(xValue(d)) - r / 2)
          .attr("y", (d) => yScale(yValue(d)) - r / 2)
      ),
    (exit) =>
      exit.call((exit) =>
        exit
          .transition(t)
          .attr("rx", 0)
          .attr("ry", 0)
          .attr("width", 0)
          .attr("height", 0)
      )
  );
}

export { ScatterPlot, ScatterPlotLog };
