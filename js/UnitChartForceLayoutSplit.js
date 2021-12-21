export default function UnitChartForceLayoutSplit(
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

  const t = canvas.transition().duration(500);

  g.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);
  ga.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);
  gx.transition(t).attr(
    "transform",
    `translate(${margin.left},${height + margin.top})`
  );
  gy.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);

  gx.transition(t).attr("opacity", 0);
  gy.transition(t).attr("opacity", 0);
  gl.transition(t).attr("opacity", 0);
  gn.transition(t).attr("opacity", 0);
  gl.selectAll("*").remove();
  gn.selectAll("*").remove();
  ga.selectAll("*").remove();

  // DATA MANIPULATE
  const size = (d) => 10;

  const data = aq_data.objects();

  console.log(data);

  let publiserList = [...new Set(aq_data.array("publisher"))];

  data.forEach(function (d) {
    d.x = +d3.select("#rect" + d.id).attr("x");
    d.y = +d3.select("#rect" + d.id).attr("y");
  });

  const centerScale = d3
    .scalePoint()
    .domain(data.map((d) => d.publisher))
    .range([0, width])
    .padding(0.2);

  const rect = g.selectAll("rect").data(data, (d) => d.id);

  simulation
    .nodes(data, (d) => d.id)
    .force(
      "collide",
      d3.forceCollide().radius((d) => size(d))
    )
    .force("x", d3.forceX((d) => centerScale(d.publisher)).strength(0.1))
    .force("y", d3.forceY(height / 2).strength(0.05))
    .alpha(0.721)
    .stop();

  ga.selectAll("text")
    .data(publiserList)
    .join("text")
    .attr("x", (d) => centerScale(d))
    .text((d) => d)
    .attr("text-anchor", "middle");

  rect.join(
    (enter) =>
      enter
        .append("rect")
        .attr("y", height * 2)
        .call((enter) =>
          enter
            .transition(t)
            .attr("opacity", 1)
            .attr("x", (d) => d.x)
            .attr("y", (d) => d.y)
            .attr("width", (d) => size(d))
            .attr("height", (d) => size(d))
        ),
    (update) =>
      update.call((update) =>
        update
          .transition(t)
          .attr("width", (d) => size(d))
          .attr("height", (d) => size(d))
      ),
    (exit) =>
      exit.call((exit) =>
        exit
          .transition(t)
          .attr("opacity", 0)
          .attr("x", (d) => width * -1)
      )
  );

  const ticked = () => {
    console.log("tick");
    rect.attr("x", (d) => d.x).attr("y", (d) => d.y);
  };

  simulation.on("tick", ticked).restart();
}
