export default function UnitchartGridLayout(
  aq_data,
  canvas,
  article,
  simulation
) {
  // CANVAS SETUP
  const margin = {
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
  const h = 25,
    w = 25,
    bin = 17,
    gap = 1;

  const id_set = new Set(data.map((d) => d.id));
  const id_array = Array.from(id_set);

  console.log(id_array);
  // console.log(data2);

  const xValue = (d, i) => id_array.indexOf(d.id) % bin;

  const yValue = (d, i) => Math.floor(id_array.indexOf(d.id) / bin);

  const xScale = d3
    .scaleBand()
    .domain(data.map(xValue))
    .range([0, width * 0.7])
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
        .style("opacity", 1);

      const rectEnterTransition = rectEner
        .attr("x", (d, i) => xScale(xValue(d, i)) - w / 2)
        .attr("y", (d, i) => yScale(yValue(d, i)) - h / 2)
        .transition(t)
        .style("opacity", 1)
        .attr("height", h)
        .attr("width", w);

      if (!rectEnterTransition.empty()) {
        promiseQueue.push(rectEnterTransition.end());
      }

      return rectEnterTransition;
    },
    function (update) {
      const rectUpdateTransition = update
        .transition(t)
        .attr("height", h)
        .attr("width", w)
        .attr("x", (d, i) => xScale(xValue(d, i)) - w / 2)
        .attr("y", (d, i) => yScale(yValue(d, i)) - h / 2)
        .transition(t)
        .style("opacity", 1);

      if (!rectUpdateTransition.empty()) {
        promiseQueue.push(rectUpdateTransition.end());
      }

      return rectUpdateTransition;
    },
    function (exit) {
      const rectExitTransition = exit.transition(t).style("opacity", 0);
      if (!rectExitTransition.empty()) {
        promiseQueue.push(rectExitTransition.end());
      }
      return rectExitTransition;
    }
  );

  const morphTransition = function () {
    // const yValue = (d) => d[1].value_stackmax;
    const bin = 4,
      gap = 0;

    const key_set = new Set(data2.map((d) => d[0]));
    const key_array = Array.from(key_set);

    console.log(data2);

    const xScale3 = d3
      .scaleBand()
      .domain(data2.map((d) => key_array.indexOf(d[0]) % bin))
      .range([0, w])
      .padding(gap);

    const yScale3 = d3
      .scaleBand()
      .domain(data2.map((d) => Math.floor(key_array.indexOf(d[0]) / bin)))
      .range([0, h])
      .padding(gap);

    console.log(xScale3.domain());

    const t = canvas.transition().duration(750);

    const xScale2 = d3
      .scaleLinear()
      // .domain([0, d3.max(data2, yValue)])
      .domain([0, 120])
      .range([width * 0.7, width]);

    const yScale2 = d3
      .scaleBand()
      .domain(data2.map((d) => d[0]))
      .range([height, 0])
      .padding(0.2);

    // const keyScale = d3
    //   .scaleBand()
    //   .domain(data2.map((d) => d[0]))
    //   .range([0, width])
    //   .padding(0.2);

    gx.transition(t).call(d3.axisBottom(xScale2));

    gy.transition(t)
      .call(d3.axisLeft(yScale2))
      .call(function (g) {
        g.selectAll("line").remove();
        g.selectAll("text").style("text-anchor", "start").attr("x", 6);
        return g;
      });

    const colorScale = d3
      .scaleOrdinal()
      .domain([
        "Firstnations",
        "Women",
        "Children",
        "Racialminorities",
        "Peoplewithdisabilitiesorchronichealthconditions",
        "Unemployedorprecariouslyemployed",
        "Youngpeople",
        "Violence",
        "Work",
        "Criminaljustice",
        "Prejudiceanddiscrimination",
        "Healthcare",
        "Familyrelations",
        "inequality",
        "Shelter",
      ])
      .range(d3.range(1, 16).map((v) => d3.interpolateTurbo(v / 16)));

    const morphRectGroups = ga
      .selectAll("g ")
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
              xScale3(key_array.indexOf(d.key) % bin)
          )
          .attr(
            "y",
            (d, i) =>
              +d3.select("#rect" + d.id).attr("y") +
              yScale3(Math.floor(key_array.indexOf(d.key) / bin))
          )
          .attr("height", yScale3.bandwidth())
          .attr("width", xScale3.bandwidth())
          .style("opacity", 0)
          .attr("fill", (d) => colorScale(d.key))
          .transition(t)
          .delay((d, i) => yScale2(d.key) + i * 5)
          .style("opacity", 1);

        return rectEner;
      },
      function (update) {
        return (
          update
            .transition(t)
            .delay(1000)
            .attr("y", (d) => yScale2(d.key))
            .attr("height", yScale2.bandwidth())
            // .transition(t)
            .attr("x", (d) => xScale2(d.value_stackmin))
            .attr(
              "width",
              (d) => xScale2(d.value_stackmax) - xScale2(d.value_stackmin)
            )
        );
      },
      function (exit) {
        return exit.call((exit) => exit.transition(t).style("opacity", 0));
      }
    );

    gy.raise();
  };

  Promise.all(promiseQueue).then(morphTransition);

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
}
