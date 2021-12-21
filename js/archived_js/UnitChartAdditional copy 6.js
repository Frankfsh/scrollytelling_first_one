export default function UnitChart_adtional(
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

  const t = canvas.transition().duration(1000);
  const ts = canvas.transition().duration(400);

  g.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);
  ga.attr("transform", `translate(${margin.left},${margin.top})`);
  gl.attr("transform", `translate(${margin.left},${margin.top})`);
  gn.attr("transform", `translate(${margin.left},${margin.top})`);
  gx.transition(t).attr("opacity", 0);
  gy.transition(t).attr("opacity", 0);

  // simulation.stop();

  // DATA MANIPULATE

  const aq_data_g = aq_data
    .fold([
      "FirstNations",
      "Women",
      "Children",
      "Racialminorities",
      "Peoplewithdisabilitiesorchronichealthconditions",
      "Unemployedorprecariouslyemployed",
      "Youngpeople",
    ])
    .select("id", "key", "value");

  const aq_data_i = aq_data
    .fold([
      "Violence",
      "Work",
      "Crime.criminaljustice",
      "Prejudiceanddiscrimination.general",
      "Healthcare.Health",
      "Familyrelations",
      "inequality",
      "Shelter",
    ])
    .select("id", "key", "value");

  const aq_data_gi = aq_data_g
    .join(aq_data_i, ["id", "id"])
    .filter((d) => d.value_1 * d.value_2 == 1)
    .rename({ key_1: "source", key_2: "target", value_1: "value" })
    .select("id", "source", "target", "value");

  const data_links = aq_data_gi.objects();

  console.log(data_links);

  const sankey = d3
    .sankey()
    .nodeId((d) => d.name)
    .nodeSort(null)
    .nodeWidth(15)
    .nodePadding(10)
    .extent([
      [0, 0],
      [width, height],
    ]);

  function updateSankey(data_links) {
    const nodeByName = new Map();

    for (const link of data_links) {
      if (!nodeByName.has(link.source))
        nodeByName.set(link.source, { name: link.source });
      if (!nodeByName.has(link.target))
        nodeByName.set(link.target, { name: link.target });
    }
    const graph = { nodes: Array.from(nodeByName.values()), links: data_links };

    // const color = (v) => d3.interpolateRainbow(v);

    // graph.nodes.forEach((node) => {
    //   node.color = color(graph.nodes.indexOf(node) / graph.nodes.length);
    // });

    // console.log(graph.nodes);

    const { nodes, links } = sankey({
      nodes: graph.nodes.map((d) => Object.assign({}, d)),
      links: graph.links.map((d) => Object.assign({}, d)),
    });

    links.forEach((link) => {
      link.path = link.source.name + "_" + link.target.name;
    });

    const linksByPath = new Map();

    for (const link of links) {
      if (!linksByPath.has(link.path)) {
        linksByPath.set(link.path, [link]);
      } else {
        linksByPath.get(link.path).push(link);
      }
    }

    const linksByPathGroupArray = Array.from(linksByPath.entries());

    console.log(linksByPathGroupArray);

    const color = d3
      .scaleOrdinal()
      .domain(nodes.map((d) => d.name))
      .range(d3.schemeTableau10);

    console.log(links);
    console.log(nodes);

    const link = gl.selectAll("g").data(links, (d) => d.id);

    link.join(
      (enter) =>
        enter
          .append("g")
          .attr("class", (d) => `linkGroup ${d.path}`)
          .call((enter) =>
            enter
              .append("path")
              .attr("id", (d) => d.id)
              .attr("d", d3.sankeyLinkHorizontal())
              .attr("stroke-dasharray", (d, i, n) => n[i].getTotalLength() * 2)
              .attr("stroke-dashoffset", (d, i, n) => n[i].getTotalLength() * 2)
              .transition(t)
              .delay((d, i) => i * 10)
              .attr("stroke-dashoffset", 0)
              .attr("stroke-width", (d) => Math.max(1, d.width))
          ),
      (update) =>
        update.call((update) =>
          update
            .select("path")
            .transition(t)
            .delay((d, i) => i * 10)
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke-dasharray", (d, i, n) => n[i].getTotalLength() * 2)
            .attr("stroke-width", (d) => Math.max(1, d.width))
            .attr("stroke-dashoffset", 0)
        ),
      (exit) =>
        exit.call((exit) =>
          exit
            .select("path")
            .transition(ts)
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke-width", 0)
        )
    );

    link.exit().transition(ts).remove();

    const node = gn.selectAll("g").data(nodes, (d) => d.name);

    node.join(
      (enter) =>
        enter
          .append("g")
          .attr("class", (d) => `nodeGroup ${d.name}`)
          .call((enter) =>
            enter
              .append("rect")
              .attr("y", (d) => d.y0)
              .attr("fill", (d) => color(d.name))
              .attr("height", (d) => d.y1 - d.y0)
              .attr("opacity", 1)
          )
          .call((enter) => {
            enter
              .select("rect")
              .filter((d) => d.x0 < width / 2)
              .attr("x", (d) => d.x1)
              .transition(t)
              .attr("x", (d) => d.x0)
              .attr("width", (d) => d.x1 - d.x0);
          })
          .call((enter) =>
            enter
              .select("rect")
              .filter((d) => d.x0 > width / 2)
              .attr("x", (d) => d.x0)
              .transition(t)
              .attr("width", (d) => d.x1 - d.x0)
          )
          .call((enter) =>
            enter
              .append("text")
              .attr("opacity", 0)
              .attr("dy", "0.35em")
              .attr("text-anchor", "end")
              .attr("x", (d) => d.x0 - 6)
              .attr("y", (d) => (d.y1 + d.y0) / 2)
              .text((d) => d.name)
              .filter((d) => d.x0 < width / 2)
              .attr("x", (d) => d.x1 + 6)
              .attr("text-anchor", "start")
          )
          .call((enter) =>
            enter.select("text").transition(t).attr("opacity", 1)
          ),
      (update) =>
        update
          .call((update) =>
            update
              .select("rect")
              .transition(t)
              .attr("x", (d) => d.x0)
              .attr("y", (d) => d.y0)
              .attr("width", (d) => d.x1 - d.x0)
              .attr("height", (d) => d.y1 - d.y0)
              .attr("fill", (d) => color(d.name))
          )
          .call((update) =>
            update
              .select("text")
              .transition(t)
              .attr("opacity", 1)
              .attr("y", (d) => (d.y1 + d.y0) / 2)
              .filter((d) => d.x0 < width / 2)
              .attr("text-anchor", "start")
          ),
      (exit) =>
        exit
          .call((exit) =>
            exit
              .select("rect")
              .transition(ts)
              .attr("width", 0)
              .filter((d) => d.x0 < width / 2)
              .attr("x", (d) => d.x1)
          )
          .call((exit) => exit.select("text").transition(ts).attr("opacity", 0))
    );

    // function setDash(d, i, n) {
    //   let el = n[i];
    //   let length = el.getTotalLength();
    //   el.attr("stroke-dasharray", `${length} ${length}`).attr(
    //     "stroke-dashoffset",
    //     length
    //   );
    // }

    // const gradientLinks = view
    //   .selectAll("path.gradient-link")
    //   .data(graph.links)
    //   .join("path")
    //   .classed("gradient-link", true)
    //   .attr("id", (d) => d.path.id)
    //   .attr("d", sankey.sankeyLinkHorizontal())
    //   .attr("stroke", (d) => d.gradient)
    //   .attr("stroke-opacity", 0)
    //   .attr("stroke-width", (d) => Math.max(1, d.width))
    //   .attr("fill", "none")
    //   .each(setDash);

    // function branchAnimate(node) {
    //   let links = view.selectAll("path.gradient-link").filter((link) => {
    //     return node.sourceLinks.indexOf(link) !== -1;
    //   });
    //   let nextNodes = [];
    //   links.each((link) => {
    //     nextNodes.push(link.target);
    //   });
    //   links
    //     .attr("stroke-opacity", 0.5)
    //     .transition()
    //     .duration(duration)
    //     .ease(d3.easeLinear)
    //     .attr("stroke-dashoffset", 0)
    //     .on("end", () => {
    //       nextNodes.forEach((node) => {
    //         branchAnimate(node);
    //       });
    //     });
    // }

    // function branchClear() {
    //   gradientLinks.transition();
    //   gradientLinks.attr("stroke-opactiy", 0).each(setDash);
    // }

    // nodes.on("mouseover", branchAnimate).on("mouseout", branchClear);
  }

  updateSankey(data_links);
}
