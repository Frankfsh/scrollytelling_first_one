export default function UnitChartSankeyAdditional(
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
      left: canvas.attr("width") * 0.3,
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
  const ts = canvas.transition().duration(200);

  // g.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);
  ga.attr("transform", `translate(${margin.left},${margin.top})`);
  gl.attr("transform", `translate(${margin.left},${margin.top})`);
  gn.attr("transform", `translate(${margin.left},${margin.top})`);
  gx.transition(t).attr("opacity", 0);
  gy.transition(t).attr("opacity", 0);
  gl.transition(t).attr("opacity", 1);
  gn.transition(t).attr("opacity", 1);
  ga.selectAll("*").remove();

  // DATA MANIPULATE

  const aq_data_g = aq_data
    .fold([
      "firstnations",
      "racialminorities",
      "women",
      "children",
      "youngpeople",
      "unemployedorprecariouslyemployed",
      "peoplewithdisabilitiesorchronichealthconditions",
    ])
    .select("id", "key", "value");

  const aq_data_i = aq_data
    .fold([
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
    .select("id", "key", "value");

  const aq_data_gi = aq_data_g
    .join(aq_data_i, ["id", "id"])
    .filter((d) => d.value_1 * d.value_2 == 1)
    .rename({ key_1: "source", key_2: "target", value_1: "value" })
    .select("id", "source", "target", "value");

  const data = aq_data.objects();

  const data_links = aq_data_gi.objects();

  const sankey = d3
    .sankey()
    .nodeId((d) => d.name)
    .nodeSort((n1, n2) => n2.value - n1.value)
    .nodeWidth(20)
    .nodePadding(10)
    .extent([
      [0, 0],
      [width, height],
    ]);

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
  const linksByPathGroupKeys = Array.from(linksByPath.keys());

  console.log(linksByPath);
  // console.log(linksByPathGroupKeys);

  // const warm8 = d3.range(8).map((v) => d3.interpolateTurbo(v / 8));
  // const cool7 = d3.range(7).map((v) => d3.interpolateCool(v / 7));

  const color = d3
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
    .range(d3.range(1, 17).map((v) => d3.interpolateTurbo(v / 16)));

  const nodeGroup = gn.selectAll("g").data(nodes, (d) => d.name);

  nodeGroup.join(
    (enter) =>
      enter
        .append("g")
        .attr("class", (d) =>
          d.x0 < width / 2
            ? `nodeGroup sourceGroup ${d.name}`
            : `nodeGroup targetGroup ${d.name}`
        )
        .call((enter) =>
          enter
            .append("rect")
            .attr("id", (d) => d.name)
            .attr("y", (d) => d.y0)
            .attr("fill", (d) => color(d.name))
            .attr("height", (d) => d.y1 - d.y0)
            .attr("opacity", 1)
        )
        .call((enter) => {
          enter
            .select("rect")
            .transition(t)
            .attr("x", (d) => d.x0)
            .attr("width", (d) => d.x1 - d.x0);
        })
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
        .call((enter) => enter.select("text").transition(t).attr("opacity", 1)),
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
        .remove()
  );

  const linksGroups = gl
    .selectAll("g")
    .data(linksByPathGroupArray, (d) => d[0])
    .join("g")
    .attr("class", (d) => `linksGroup ${d[0]}`);

  const linkGroup = linksGroups.selectAll("path").data(
    (d) => d[1],
    (d) => d.id
  );

  linkGroup.join(
    (enter) =>
      enter
        .append("path")
        .attr("class", (d) => `linkGroup article${d.id}`)
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke-dasharray", (d, i, n) => n[i].getTotalLength() * 2)
        .attr("stroke-dashoffset", (d, i, n) => n[i].getTotalLength() * 2)
        .call((enter) =>
          enter
            .transition(t)
            .attr("stroke-width", (d) => Math.max(1, d.width))
            .transition(t)
            .delay((d, i) => i * 20)
            .attr("stroke-dashoffset", 0)
        ),
    (update) =>
      update.call((update) =>
        update
          .transition(t)
          .attr("d", d3.sankeyLinkHorizontal())
          .attr("stroke-dasharray", (d, i, n) => n[i].getTotalLength() * 2)
          .attr("stroke-width", (d) => Math.max(1, d.width))
          .attr("stroke-dashoffset", 0)
      ),
    (exit) =>
      exit.call((exit) =>
        exit
          .transition(ts)
          .attr("d", d3.sankeyLinkHorizontal())
          .attr("stroke-width", 0)
      )
  );

  const rect = g.selectAll("rect");

  let overedId;

  rect
    .on("mouseover", function (e, d) {
      g.selectAll("rect").attr("fill", "lightgray");
      let overedRect = d3.select(this);
      overedRect.attr("fill", "black");
      overedId = overedRect.data()[0].id;
      d3.selectAll(`.linkGroup.article${overedId}`)
        .attr("stroke", "black")
        .attr("stroke-width", (d) => Math.max(5, d.width))
        .raise();
      tooltip
        .style("display", "block")
        .html(() => `${d.publisher}<br><b>${d.heading}</b>`);
    })
    .on("mouseout", function () {
      tooltip.style("display", "none");
      g.selectAll("rect").attr("fill", "black");
      d3.selectAll(`.linkGroup.article${overedId}`)
        .attr("stroke", "lightgray")
        .attr("stroke-width", (d) => Math.max(1, d.width));
    })
    .on("mousemove", (e, d) => {
      tooltip
        .style("left", d3.pointer(e)[0] + "px")
        .style("top", d3.pointer(e)[1] + "px");
    });

  const link = gl.selectAll("path");

  link
    .on("mouseover", function (e, d) {
      let overedLink = d3.select(this);
      overedLink.attr("stroke-width", (d) => Math.max(5, d.width)).raise();

      let overedRectId = overedLink
        .attr("class")
        .split(" ")[1]
        .replace("article", "rect");

      let overedLinkGroup = d3.select(this.parentNode);
      let overedPath = overedLinkGroup.attr("class").split(" ")[1];

      let articleInPath = linksByPath.get(overedPath);

      g.selectAll("rect").attr("fill", "lightgray");

      for (article of articleInPath) {
        let articleRect = g.select(`#rect${article.id}`);

        articleRect.attr("fill", "gray");
      }

      g.select(`#${overedRectId}`).attr("fill", "black");
    })
    .on("mouseout", function (e, d) {
      d3.select(this).attr("stroke-width", (d) => Math.max(1, d.width));
      g.selectAll("rect").attr("fill", "black");
    });

  const node = gn.selectAll("rect");

  node
    .on("mouseover", function (e, d) {
      g.selectAll("rect").attr("fill", "lightgray");
      let articleInNode = d.sourceLinks.length ? d.sourceLinks : d.targetLinks;
      console.log(articleInNode);

      for (article of articleInNode) {
        g.select(`#rect${article.id}`).attr("fill", color(d.name));
        gl.select(`.linksGroup.${article.path}`)
          .selectAll("path")
          .attr("stroke", "black");
      }
    })
    .on("mouseout", function (e, d) {
      g.selectAll("rect").attr("fill", "black");
      gl.selectAll(".linksGroup").selectAll("path").attr("stroke", "lightgray");
    });
}
