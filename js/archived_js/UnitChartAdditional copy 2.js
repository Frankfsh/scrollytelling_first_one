export default function UnitChart_adtional2(
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
    ga = canvas.select("#anotationGroup"),
    gl = canvas.select("#linksGroup"),
    gn = canvas.select("#nodesGroup");

  const t = canvas.transition().duration(2000);

  g.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);
  ga.attr("transform", `translate(${margin.left},${margin.top})`);
  gl.attr("transform", `translate(${margin.left},${margin.top})`);
  gn.attr("transform", `translate(${margin.left},${margin.top})`);
  gx.transition(t).attr("opacity", 0);
  gy.transition(t).attr("opacity", 0);

  simulation.stop();

  // DATA MANIPULATE

  const data_links = aq_data_link.objects();
  const data = aq_data.objects();

  const sankey = d3
    .sankey()
    .nodeId((d) => d.name)
    .nodeWidth(15)
    .nodePadding(10)
    .extent([
      [0, 0],
      [width, height],
    ]);

  const color = d3
    .scaleOrdinal()
    .domain(data.map((d) => d.name))
    .range(d3.schemeTableau10);

  function updateSankey(data_links) {
    const nodeByName = new Map();

    for (const link of data_links) {
      if (!nodeByName.has(link.source))
        nodeByName.set(link.source, { name: link.source });
      if (!nodeByName.has(link.target))
        nodeByName.set(link.target, { name: link.target });
    }
    let graph = { nodes: Array.from(nodeByName.values()), links: data_links };

    const { nodes, links } = sankey({
      nodes: graph.nodes.map((d) => Object.assign({}, d)),
      links: graph.links.map((d) => Object.assign({}, d)),
    });

    const link = gl.selectAll("path").data(links, function (d) {
      return d;
    });

    const linkEnter = link
      .enter()
      .append("path")
      .attr("d", d3.sankeyLinkHorizontal())
      .attr("stroke-width", 1);

    linkEnter.transition(t).attr("stroke-width", function (d) {
      return Math.max(1, d.width);
    });

    link
      .transition(t)
      .attr("d", d3.sankeyLinkHorizontal())
      .attr("stroke-width", function (d) {
        return Math.max(1, d.width);
      });

    linkEnter.append("title").text(function (d) {
      return d.source.name + " → " + d.target.name + "\n" + d.value;
    });

    link.exit().remove();

    const node = gn.selectAll("g").data(nodes, function (d) {
      return d.name;
    });

    const nodeEnter = node.enter().append("g");

    nodeEnter
      .append("rect")
      .attr("x", function (d) {
        return d.x0;
      })
      .attr("y", function (d) {
        return d.y0;
      })
      .attr("height", function (d) {
        return d.y1 - d.y0;
      })
      .attr("width", function (d) {
        return d.x1 - d.x0;
      })
      .attr("fill", function (d) {
        return color(d.name);
      });

    node
      .select("rect")
      .transition(t)
      // .attr("x", function(d) { return d.x0; })
      .attr("y", function (d) {
        return d.y0;
      })
      .attr("height", function (d) {
        return d.y1 - d.y0;
      });
    // .attr("width", function(d) { return d.x1 - d.x0; });

    nodeEnter
      .append("text")
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("x", function (d) {
        return d.x0 - 6;
      })
      .attr("y", function (d) {
        return (d.y1 + d.y0) / 2;
      })
      .text(function (d) {
        return d.name;
      })
      .filter(function (d) {
        return d.x0 < width / 2;
      })
      .attr("x", function (d) {
        return d.x1 + 6;
      })
      .attr("text-anchor", "start");

    node
      .select("text")
      .transition(t)
      // .attr("dy", "0.35em")
      // .attr("text-anchor", "end")
      // .attr("x", function(d) { return d.x0 - 6; })
      .attr("y", function (d) {
        return (d.y1 + d.y0) / 2;
      })
      .filter(function (d) {
        return d.x0 < width / 2;
      })
      // .attr("x", function(d) { return d.x1 + 6; })
      .attr("text-anchor", "start");

    nodeEnter.append("title").text(function (d) {
      return d.name + "\n" + d.value;
    });

    node.select("title").text(function (d) {
      return d.name + "\n" + d.value;
    });

    node.exit().remove();

    t.selectAll("*").end().then(console.log("transition t done"));
  }

  updateSankey(data_links);

  // let updated_data_links = [];

  // while (data_links.length) {
  //   updated_data_links.push(data_links.pop());
  //   console.log(updated_data_links);
  //   updateSankey(data_links);
  // }

  // // console.log(graph);

  // const updateSankeyPromise = (data_links) =>
  //   new Promise((res) => updateSankey(data_links, ms));

  // // for (var i = 0; i < data_links.length; i++) {
  // //     console.log(data_links[i]);
  // //     //Do something
  // // }

  // for (const row of data_links) {
  //   setTimeout(() => {
  //     updated_data_links.push(row);
  //     console.log(updated_data_links);
  //   }, 5000);
  // }
  // // const timer = (ms) => new Promise((res) => setTimeout(res, ms));

  // async function load() {
  //   // We need to wrap the loop into an async function for this to work
  //   for (const row of data_links) {
  //     updated_data_links.push(row);
  //     console.log(updated_data_links);
  //     updateSankey(data_links);
  //   }
  // }

  // load();

  // const link = ga
  //   .append("g")
  //   .attr("fill", "none")
  //   .selectAll("g")
  //   .data(links)
  //   .join("g")
  //   .attr("stroke", "rgb(240, 240, 240)")
  //   .style("mix-blend-mode", "multiply");

  // link
  //   .append("path")
  //   .attr("d", d3.sankeyLinkHorizontal())
  //   .attr("stroke-width", (d) => Math.max(1, d.width));

  // link
  //   .append("title")
  //   .text(
  //     (d) => `${d.source.name} → ${d.target.name}\n${d.value.toLocaleString()}`
  //   );

  // ga.append("g")
  //   .style("font", "10px sans-serif")
  //   .selectAll("text")
  //   .data(nodes)
  //   .join("text")
  //   .attr("x", (d) => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
  //   .attr("y", (d) => (d.y1 + d.y0) / 2)
  //   .attr("dy", "0.35em")
  //   .attr("text-anchor", (d) => (d.x0 < width / 2 ? "start" : "end"))
  //   .text((d) => d.name)
  //   .append("tspan")
  //   .attr("fill-opacity", 0.7)
  //   .text((d) => ` ${d.value.toLocaleString()}`);

  // let updated_data_links = [];

  // const timer = (ms) => new Promise((res) => setTimeout(res, ms));

  // async function load() {
  //   // We need to wrap the loop into an async function for this to work
  //   for (const row of data_links) {
  //     updated_data_links.push(row);
  //     console.log(updated_data_links);
  //     updateSankey(data_links);
  //     await timer(500);
  //   }
  // }

  // load();
}
