export default function UnitchartGridLayout(
  aq_data,
  canvas,
  article,
  simulation
) {
  // CANVAS SETUP
  let margin = {
      top: 100,
      right: 100,
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

  // function chart() {
  g.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);
  // ga.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);
  ga.attr("transform", `translate(${margin.left},${margin.top})`);

  gx.transition(t).attr("opacity", 0);
  gy.transition(t).attr("opacity", 0);
  gl.transition(t).attr("opacity", 0);
  gn.transition(t).attr("opacity", 0);
  ga.transition(t).attr("opacity", 1);
  gl.selectAll("*").remove();
  gn.selectAll("*").remove();
  ga.selectAll("*").remove();

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

  const gap = 0.1;

  const bin =
    id_array.length == 1
      ? 1
      : Math.max(4, Math.floor(Math.sqrt(id_array.length)));

  console.log(bin);
  // console.log(data2);

  const xValue = (d) => id_array.indexOf(d.id) % bin;

  const yValue = (d) => Math.floor(id_array.indexOf(d.id) / bin);

  const xScale = d3
    .scaleBand()
    .domain(data.map(xValue))
    .range([0, width])
    .padding(gap);

  const yScale = d3
    .scaleBand()
    .domain(data.map(yValue))
    .range([0, height])
    .padding(gap);

  // RENDER

  const rect = g.selectAll("rect").data(data, (d) => d.id);

  let promiseQueue = [];

  rect.join(
    function (enter) {
      const rectEner = enter
        .append("rect")
        .attr("id", (d, i) => "rect" + d.id)
        .attr("stroke", "none")
        .attr("x", (d, i) => xScale(xValue(d)))
        .attr("y", (d, i) => yScale(yValue(d)))
        .attr("width", xScale.bandwidth());
      const rectEnterTransition = rectEner
        .transition()
        .duration(750)
        .style("opacity", 1)
        .attr("height", yScale.bandwidth());

      if (!rectEnterTransition.empty()) {
        promiseQueue.push(rectEnterTransition.end());
      }

      return rectEnterTransition;
    },
    function (update) {
      const rectUpdateTransition = update
        .transition()
        .duration(750)
        .attr("height", yScale.bandwidth())
        .attr("width", xScale.bandwidth())
        .attr("x", (d) => xScale(xValue(d)))
        .attr("y", (d) => yScale(yValue(d)))
        .style("opacity", 1);

      if (!rectUpdateTransition.empty()) {
        promiseQueue.push(rectUpdateTransition.end());
      }
      return rectUpdateTransition;
    },
    function (exit) {
      const rectExitTransition = exit.transition().style("opacity", 0);

      exit.remove();

      if (!rectExitTransition.empty()) {
        promiseQueue.push(rectExitTransition.end());
      }
      return rectExitTransition;
    }
  );

  const highlight = function (event) {
    // reduce opacity of all groups
    canvas.selectAll("rect").transition().style("opacity", 0.1);
    // expect the one that is hovered
    let selected_class = event.toElement.getAttribute("data-highlight");

    canvas.selectAll(`rect.${selected_class}`).transition().style("opacity", 1);
  };

  const noHighlight = function (event) {
    d3.selectAll("rect").transition().style("opacity", 1);
  };

  const rects = g.selectAll("rect").raise();

  article
    .selectAll(".hover-link")
    .on("mouseover", highlight)
    .on("mouseleave", noHighlight);

  rects
    .on("mouseover", (e, d) => {
      tooltip
        .style("display", "block")
        .html(() => `${d.id} ${d.publisher}<br><b>${d.heading}</b>`);
    })
    .on("mousemove", (e, d) => {
      tooltip
        .style("left", d3.pointer(e)[0] + "px")
        .style("top", d3.pointer(e)[1] + "px");
    })
    .on("mouseout", () => {
      tooltip.style("display", "none");
    })
    .on("click", function (e, d) {
      let stroke_status = d3.select(this).attr("stroke");
      d3.select(this)
        .attr("stroke-width", "3")
        .attr("stroke", stroke_status == "none" ? "red" : "none");
    });

  const key_set = new Set(data2.map((d) => d[0]));
  const key_array = Array.from(key_set);

  const bin2 = Math.floor(Math.sqrt(key_array.length));

  const x2Value = (d) => key_array.indexOf(d[0]) % bin2;

  const y2Value = (d) => Math.floor(key_array.indexOf(d[0]) / bin2);

  const xScale2 = d3
    .scaleBand()
    .domain(data2.map(x2Value))
    .range([0, xScale.bandwidth()])
    .padding(0);

  const yScale2 = d3
    .scaleBand()
    .domain(data2.map(y2Value))
    .range([0, yScale.bandwidth()])
    .padding(0);

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

  // RENDER

  const morphRectGroups = ga
    .selectAll("g")
    .data(data2, (d) => d[0])
    .join("g")
    .attr("class", (d) => `morphRectGroups ${d[0]}`);

  morphRectGroups.exit().remove();

  const morphRectGroup = morphRectGroups.selectAll("rect").data(
    (d) => d[1],
    (d) => d.id
  );

  function morphRect() {
    morphRectGroup.join(
      function (enter) {
        const rectEner = enter
          .append("rect")
          .attr("class", (d, i) => "mrect" + d.id)
          .attr("x", (d, i) =>
            id_array.length < 3
              ? +d3.select("#rect" + d.id).attr("x") +
                Math.max(
                  0,
                  xScale.bandwidth() * Math.random() -
                    Math.min(300, xScale2.bandwidth())
                )
              : +d3.select("#rect" + d.id).attr("x") +
                xScale2(key_array.indexOf(d.key) % bin2)
          )
          .attr("y", (d, i) =>
            id_array.length < 3
              ? +d3.select("#rect" + d.id).attr("y") +
                Math.max(
                  0,
                  yScale.bandwidth() * Math.random() -
                    Math.min(25, yScale2.bandwidth())
                )
              : +d3.select("#rect" + d.id).attr("y") +
                yScale2(Math.floor(key_array.indexOf(d.key) / bin2))
          )
          // .attr("height", yScale2.bandwidth())
          .attr("height", Math.min(25, yScale2.bandwidth()))
          .attr("width", Math.min(300, xScale2.bandwidth()))
          .style("opacity", 0)
          .attr("fill", (d) => colorScale(d.key));

        rectEner
          .transition()
          .duration(500)
          .delay((d, i) => d.id * 2)
          .style("opacity", 1);

        return rectEner;
      },
      function (update) {
        return update
          .transition()
          .duration(750)
          .attr(
            "x",
            (d, i) =>
              +d3.select("#rect" + d.id).attr("x") +
              xScale2(key_array.indexOf(d.key) % bin2)
          )
          .transition()
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
        return exit.call((exit) => exit.remove());
      }
    );
  }

  Promise.all(promiseQueue).then(morphRect);
}
