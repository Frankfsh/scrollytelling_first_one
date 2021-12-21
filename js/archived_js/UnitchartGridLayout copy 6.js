export default function UnitchartGridLayout(figure) {
  let margin = {
      top: 100,
      right: 100,
      bottom: 100,
      left: 100,
    },
    gap = 0.1,
    containerRect = figure.node().getBoundingClientRect(),
    unitValue = (d) => d[0];

  let width = containerRect.width - margin.left - margin.right,
    height = containerRect.height - margin.top - margin.bottom;

  function chart(selection) {
    let promiseQueue = [];

    selection.each(function (aqTable) {
      const data = aqTable.objects();

      console.log(data);
      const valueArray = Array.from(new Set(data.map(unitValue)));
      const bin =
        valueArray.length == 1
          ? 1
          : Math.max(4, Math.floor(Math.sqrt(valueArray.length)));

      const unitValueIndex = (d) => valueArray.indexOf(unitValue);

      const xValue = (d) => unitValueIndex % bin;

      const yValue = (d) => Math.floor(unitValueIndex / bin);

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

      const svg = d3.select(this).append("svg");

      svg.attr("width", width).attr("height", height);

      const g = svg.append("g");

      const rect = g.selectAll("rect").data(data, unitValue);

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
    });

    return promiseQueue;
  }

  chart.margin = function (_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.gap = function (_) {
    if (!arguments.length) return gap;
    xValue = _;
    return chart;
  };

  chart.unitValue = function (_) {
    if (!arguments.length) return unitValue;
    yValue = _;
    return chart;
  };

  return chart;
}
