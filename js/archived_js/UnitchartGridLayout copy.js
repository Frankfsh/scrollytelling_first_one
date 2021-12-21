export default function UnitchartGridLayout(aqTable, canvas) {
  // CANVAS SETUP
  let margin = {
      top: 100,
      right: 100,
      bottom: 100,
      left: 100,
    },
    gap = 0.1;

  const unitValue = (d) => d[0];

  function chart(selection) {
    let promiseQueue = [];

    selection.each(function (d, i) {
      const canvas = d3.select(this.parentNode);

      const width = canvas.attr("width") - margin.left - margin.right,
        height = canvas.attr("height") - margin.top - margin.bottom;

      const valueArray = Array.from(new Set(data.map(unitValue)));
      const bin =
        valueArray.length == 1
          ? 1
          : Math.max(4, Math.floor(Math.sqrt(valueArray.length)));

      const xValue = (d) => valueArray.indexOf(d.id) % bin;

      const yValue = (d) => Math.floor(valueArray.indexOf(d.id) / bin);

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

      const rectGroup = d3.select(this);

      rectGroup.selectAll("rect").data(data, unitValue);

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

    chart.margin = function (value) {
      if (!arguments.length) return margin;
      margin = value;
      return chart;
    };
  }

  // RENDER PREPERATION

  // RENDER

  const rect = g1.selectAll("rect").data(data, (d) => d.id);

  let promiseQueue = [];
}

// const g1 = canvas.select("#figure1Group");

// const tooltip = d3.select("#tooltipContainer");

// const t = g1.transition().duration(750);

// g1.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);

// const data = aqTable.orderby("id").objects();
