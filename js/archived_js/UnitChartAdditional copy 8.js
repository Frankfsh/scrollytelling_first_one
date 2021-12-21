export default function UnitChart_adtional(
  aq_data,
  aq_data_link,
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
    ga = canvas.select("#anotationGroup");

  const t = canvas.transition().duration(500);

  g.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);
  ga.attr("transform", `translate(${margin.left},${margin.top})`);
  gx.transition(t).attr("opacity", 0);
  gy.transition(t).attr("opacity", 0);

  simulation.stop();

  // DATA MANIPULATE
  const size = (d) => 10,
    bin = 18,
    gap = 0.1,
    padding = 50;

  const data_links = aq_data_link.objects();
  const data = aq_data.objects();

  const nodeByName = new Map();

  for (const link of data_links) {
    if (!nodeByName.has(link.source))
      nodeByName.set(link.source, { name: link.source });
    if (!nodeByName.has(link.target))
      nodeByName.set(link.target, { name: link.target });
  }
  let graph = { nodes: Array.from(nodeByName.values()), links: data_links };

  const sankey = d3
    .sankey()
    .nodeId((d) => d.name)
    .nodeWidth(15)
    .nodePadding(10)
    .extent([
      [0, 0],
      [width, height],
    ]);

  const { nodes, links } = sankey({
    nodes: graph.nodes.map((d) => Object.assign({}, d)),
    links: graph.links.map((d) => Object.assign({}, d)),
  });

  console.log(nodes);

  const hueScale = d3
    .scaleOrdinal()
    .domain(data.map((d) => d.name))
    .range(d3.schemeTableau10);

  ga.selectAll(".node")
    .data(nodes, (d) => d.name)
    .join("rect")
    .attr("class", "node")
    .attr("id", (d, i) => "node" + d.name)
    .attr("x", (d) => d.x0)
    .attr("y", (d) => d.y0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("fill", (d) => hueScale(d.name));

  let sourceList = [...new Set(aq_data_link.array("source"))];

  function gathering(source) {
    let filteredData = data.filter((d) => d[source] == 1);
    console.log(source);
    console.log(filteredData.length);

    filteredData.forEach(function (d) {
      d.x = +d3.select("#rect" + d.id).attr("x");
      d.y = +d3.select("#rect" + d.id).attr("y");
    });

    const visualElement = g
      .selectAll(null)
      .data(filteredData, (d) => d.id)
      .enter()
      .append("rect")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("width", (d) => size(d))
      .attr("height", (d) => size(d))
      .attr("opacity", 0);

    visualElement
      .transition()
      .duration(1000)
      .attr("fill", (d) => hueScale(source))
      .attr("opacity", 1)
      .attr("width", (d) => size(d))
      .attr("height", (d) => size(d))
      .transition()
      .duration(500)
      .delay((d, i) => i * 5)
      .attr("x", (d, i) => +d3.select("#node" + source).attr("x"))
      .attr("y", (d, i) => +d3.select("#node" + source).attr("y"))
      .end()
      .then(() =>
        sourceList.length ? gathering(sourceList.pop()) : console.log("allDone")
      );
  }

  gathering(sourceList.pop());
}
