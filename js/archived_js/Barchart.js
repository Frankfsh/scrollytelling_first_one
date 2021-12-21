function HorizontalBarChart(aq_data, canvas, article) {

    // CANVAS SETUP
    const margin = {
            top: 30,
            right: 30,
            bottom: 30,
            left: 150,
        },
        width = canvas.attr("width") - margin.left - margin.right,
        height = canvas.attr("height") - margin.top - margin.bottom;

    const g = canvas.select("#figureGroup"),
        gx = canvas.select("#xAxisGroup"),
        gy = canvas.select("#yAxisGroup");

    const t = canvas.transition().duration(750);

    g.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);
    gx.transition(t).attr(
        "transform",
        `translate(${margin.left},${height + margin.top})`
    );
    gy.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);

    // DATA MANIPULATE

    let data_units = aq_data.objects();


    console.log(data_units);

    const xValue = (d) => d.Cases;
    const yValue = (d) => d["Country/Region"];

    const xScale = d3
        .scaleLinear()
        .domain([0, d3.max(data_units, xValue)])
        .range([0, width]);

    const yScale = d3
        .scaleBand()
        .domain(data_units.map(yValue))
        .range([height, 0])
        .padding(0.1);

    gx.transition(t)
        .attr("opacity", 1)
        .call(
            d3
            .axisBottom(xScale)
            .tickFormat(d3.format("~s"))
            .ticks(Math.round(width / 100))
        );

    gy.transition(t).attr("opacity", 1).call(d3.axisLeft(yScale));

    const syntaxElement = g
        .selectAll("rect")
        .data(data_units, (d) => d['Country/Region']);

    syntaxElement.join(
        (enter) =>
        enter
        .append("rect")
        .attr("fill", "red")
        .style("mix-blend-mode", "multiply")
        .attr("x", 0)
        .attr("height", yScale.bandwidth)
        .attr("width", 0)
        .call((enter) =>
            enter
            .attr("y", (d) => yScale(yValue(d)))
            .transition(t).delay(750)
            .attr("width", (d) => xScale(xValue(d)))
        ),
        (update) =>
        update.call((update) =>
            update
            .transition(t)
            .attr("fill", "orange")
            .attr("height", yScale.bandwidth)
            .attr("y", (d) => yScale(yValue(d)))
            .transition(t)
            .attr("x", 0)
            .attr("width", (d) => xScale(xValue(d)))
            .attr("fill", "red")
        ),
        (exit) => exit.call(
            (exit) => exit.transition(t).attr("width", 0).remove()
        )
    );
}

function VerticalBarChart(aq_data, canvas, article) {
    const margin = {
            top: 30,
            right: 50,
            bottom: 100,
            left: 70,
        },
        width = canvas.attr("width") - margin.left - margin.right,
        height = canvas.attr("height") - margin.top - margin.bottom;

    const g = canvas.select("#figureGroup"),
        gx = canvas.select("#xAxisGroup"),
        gy = canvas.select("#yAxisGroup");

    const t = canvas.transition().duration(750);


    g.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);
    gx.transition(t).attr(
        "transform",
        `translate(${margin.left},${height + margin.top})`
    );
    gy.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);


    let data_units = aq_data.objects();

    const yValue = (d) => d.Cases;
    const xValue = (d) => d["Country/Region"];

    const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(data_units, yValue)])
        .range([height, 0]);

    const xScale = d3
        .scaleBand()
        .domain(data_units.map(xValue))
        .range([0, width])
        .padding(0.4);

    gx.transition(t)
        .attr("opacity", 1)
        .call(d3.axisBottom(xScale))
        .call((g) =>
            g
            .selectAll("text")
            .attr("transform", "rotate(15)")
            .style("text-anchor", "start")
        );

    gy.transition(t)
        .attr("opacity", 1)
        .call(
            d3
            .axisLeft(yScale)
            .tickFormat(d3.format("~s"))
            .ticks(Math.round(width / 100))
        );

    const syntaxElement = g
        .selectAll("rect")
        .data(data_units, (d) => d['Country/Region'] + d.Date);

    syntaxElement.join(
        (enter) =>
        enter
        .append("rect")
        .attr("fill", "red")
        .style("mix-blend-mode", "multiply")
        .attr("y", height)
        .call((enter) =>
            enter
            .attr("x", (d) => xScale(xValue(d)))
            .transition(t)
            .attr("fill", "orange")
            .attr("width", xScale.bandwidth)
            .transition(t)
            .attr("y", (d) => yScale(yValue(d)))
            .attr("height", (d) => height - yScale(yValue(d)))
            .attr("fill", "red")
        ),
        (update) =>
        update.call((update) =>
            update
            .transition(t)
            .attr("rx", 0)
            .attr("ry", 0)
            .attr("width", xScale.bandwidth)
            .attr("x", (d) => xScale(xValue(d)))
            .transition(t)
            .attr("y", (d) => yScale(yValue(d)))
            .attr("height", (d) => height - yScale(yValue(d)))
        ),
        (exit) =>
        exit.call((exit) =>
            exit.transition(t).attr("height", 0).attr("y", height).remove()
        )
    );
}

function VerticalBarChart1(aq_data, canvas, article) {
    const margin = {
            top: 30,
            right: 50,
            bottom: 100,
            left: 70,
        },
        width = canvas.attr("width") - margin.left - margin.right,
        height = canvas.attr("height") - margin.top - margin.bottom;

    const g = canvas.select("#figureGroup"),
        gx = canvas.select("#xAxisGroup"),
        gy = canvas.select("#yAxisGroup");

    const t = canvas.transition().duration(750);


    g.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);
    gx.transition(t).attr(
        "transform",
        `translate(${margin.left},${height + margin.top})`
    );
    gy.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);


    let data_units = aq_data.objects();

    data_units.forEach(function (d) {
        d.Dates = d3.timeParse("%m/%y")(d.Date);
    });

    const yValue = (d) => d.Cases;
    const xValue = (d) => d.Dates;

    const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(data_units, yValue)])
        .range([height, 0]);

    const xScale = d3
        .scaleTime()
        .domain(data_units.map(xValue))
        .domain(d3.extent(data_units, xValue))
        .range([0, width]);

    const xBand = d3.scaleBand()
        .domain(d3.timeMonth.range(...xScale.domain()))
        .range([0, width])
        .padding(0.4);

    gx.transition(t)
        .attr("opacity", 1)
        .call(d3.axisBottom(xScale))
        .call((g) =>
            g
            .selectAll("text")
            .attr("transform", "rotate(15)")
            .style("text-anchor", "start")
        );

    gy.transition(t)
        .attr("opacity", 1)
        .call(
            d3
            .axisLeft(yScale)
            .tickFormat(d3.format("~s"))
            .ticks(Math.round(width / 100))
        );

    const syntaxElement = g
        .selectAll("rect")
        .data(data_units, (d) => d['Country/Region'] + d.Date);

    syntaxElement.join(
        (enter) =>
        enter
        .append("rect")
        .attr("fill", "red")
        .style("mix-blend-mode", "multiply")
        .attr("y", height)
        .call((enter) =>
            enter
            .attr("x", (d) => xScale(xValue(d)))
            .transition(t)
            .attr("fill", "orange")
            .attr("width", xBand.bandwidth)
            .transition(t)
            .attr("y", (d) => yScale(yValue(d)))
            .attr("height", (d) => height - yScale(yValue(d)))
            .attr("fill", "red")
        ),
        (update) =>
        update.call((update) =>
            update
            .transition(t)
            .attr("rx", 0)
            .attr("ry", 0)
            .attr("width", xBand.bandwidth)
            .attr("x", (d) => xScale(xValue(d)))
            .transition(t)
            .attr("y", (d) => yScale(yValue(d)))
            .attr("height", (d) => height - yScale(yValue(d)))
        ),
        (exit) =>
        exit.call((exit) =>
            exit.transition(t).attr("height", 0).attr("y", height).remove()
        )
    );
}

export {
    HorizontalBarChart,
    VerticalBarChart,
    VerticalBarChart1
};