export default function initialRender(canvas) {
  const margin = {
      top: 100,
      right: 100,
      bottom: 100,
      left: 100,
    },
    width = canvas.attr("width") - margin.left - margin.right,
    height = canvas.attr("height") - margin.top - margin.bottom;

  canvas
    .append("g")
    .attr("id", "figureGroup")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  canvas
    .append("g")
    .attr("id", "xAxisGroup")
    .attr("transform", `translate(${margin.left},${height + margin.top})`);
  canvas
    .append("g")
    .attr("id", "yAxisGroup")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  canvas.append("g").attr("id", "anotationGroup");

  canvas.append("g").attr("id", "linksGroup");

  canvas.append("g").attr("id", "nodesGroup");
}
