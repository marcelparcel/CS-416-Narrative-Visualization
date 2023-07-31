export class Story {
    #scenes = [];
    currScene;
    constructor() {
        this.currScene = 0;
    }
    get currScene() {
        return this.currScene;
    }
    set currScene(i) {
        if (i === this.currScene + 1 && this.currScene < this.#scenes.length - 1) {
            this.currScene++;
        } else if (i === this.currScene - 1 && this.currScene > 0) {
            this.currScene--;
        }
    }
    get currSceneContent() {
        return this.#scenes[this.currScene];
    }
    get nextSceneContent() {
        if (this.currScene < this.#scenes.length - 1) {
            return this.#scenes[this.currScene + 1]
        } else return this.#scenes[this.currScene];
    }
    get prevSceneContent() {
        if (this.currScene > 0) {
            return this.#scenes[this.currScene - 1]
        } else return this.#scenes[this.currScene];
    }
    get length() {
        return this.#scenes.length;
    }
    addScene(scene) {
        (this.#scenes).push(scene);
    }
}

export async function init() {
    const gg_data = await d3.csv("./datasets/gg_album_sales.csv");
    const bg_data = await d3.csv("./datasets/bg_album_sales.csv");
    for (let i = 0; i < gg_data.length; i++) {
        gg_data[i].release = new Date(gg_data[i].release);
        bg_data[i].release = new Date(bg_data[i].release);
    }
    const tot_data = (await d3.csv("./datasets/gg_album_sales.csv")).concat((await d3.csv("./datasets/bg_album_sales.csv")));
    tot_data.sort((x,y) => d3.descending(parseInt(x.sales), parseInt(y.sales)));
    for (let i = 1; i <= tot_data.length; i++) {
        tot_data[i-1].rank = i;
        tot_data[i-1].release = new Date(tot_data[i-1].release);
    }
    
    return {"gg": gg_data, "bg": bg_data, "tot": tot_data};
}

export function cumsum_line(tot, gg, bg) {
    const width = 1000;
    const height = 700;
    const marginTop = 20;
    const marginRight = 30;
    const marginBottom = 30;
    const marginLeft = 40;

    const obj_array = a => a.map(([date, sales]) => ({date, sales}));

    const gg_datum = gg.sort((x,y) => d3.ascending(x.release, y.release));
    const gg_sum = obj_array(d3.transpose([gg_datum.map(d => d.release), d3.cumsum(gg.map(d => d.sales/1000000))]));

    const bg_datum = bg.sort((x,y) => d3.ascending(x.release, y.release));
    const bg_sum = obj_array(d3.transpose([bg_datum.map(d => d.release), d3.cumsum(bg.map(d => d.sales/1000000))]));

    const xs = d3.scaleUtc(d3.extent(tot, d => d.release), [marginLeft, width - marginRight]);
    const ys = d3.scaleLinear([0, d3.max(bg_sum, d => d.sales)], [height - marginBottom, marginTop]);

    const line = d3.line().x(d => xs(d.date)).y(d => ys(d.sales));

    const svg = d3.create("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("class", "graph")
                .attr("id", "graph");

    svg.append("rect")
        .attr("x",150)
        .attr("y",5)
        .attr("width",10)
        .attr("height",10)
        .style("fill", "royalblue");

    svg.append("rect")
        .attr("x",220)
        .attr("y",5)
        .attr("width",10)
        .attr("height",10)
        .style("fill", "crimson");

    svg.append("text")
        .attr("x",165)
        .attr("y",15)
        .html("Boys")
        .style("class", "caption")
        .style("font-family", "Verdana, Geneva, sans-serif").style("font-size", "0.85em");;

    svg.append("text")
        .attr("x",235)
        .attr("y",15)
        .html("Girls")
        .style("class", "caption")
        .style("font-family", "Verdana, Geneva, sans-serif").style("font-size", "0.85em");;

    svg.append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(xs).ticks(width / 80).tickSizeOuter(0));

    svg.append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(ys).ticks(height / 40))
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".tick line").clone()
        .attr("x2", width - marginLeft - marginRight)
        .attr("stroke-opacity", 0.1))
    .call(g => g.append("text")
        .attr("x", -marginLeft)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text("Total Sales in Millions of Units"));

    svg.append("path")
      .attr("fill", "none")
      .attr("stroke", "crimson")
      .attr("stroke-width", 1.5)
      .attr("d", line(gg_sum));

    svg.append("path")
      .attr("fill", "none")
      .attr("stroke", "royalblue")
      .attr("stroke-width", 1.5)
      .attr("d", line(bg_sum));

    svg.append("text")
    .attr("x",50)
    .attr("y",625)
    .html("The 3rd generation of K-Pop started in 2012")
    .style("class", "caption")
    .style("font-family", "Verdana, Geneva, sans-serif").style("font-size", "0.85em");;

    svg.append("text")
    .attr("x",370)
    .attr("y",490)
    .html("The 4th generation of K-Pop started in 2018")
    .style("class", "caption")
    .style("font-family", "Verdana, Geneva, sans-serif").style("font-size", "0.85em");;

    svg.append("text")
    .attr("x",620)
    .attr("y",55)
    .html("The 5th generation of K-Pop started in 2023")
    .style("class", "caption")
    .style("font-family", "Verdana, Geneva, sans-serif").style("font-size", "0.85em");;

    return svg.node();
}

export function sunburst(data) {
    const width = 500;
    const height = width;
    const radius = width/6;

    const salesByGroup = d3.group(data, d => d.label, d => d.sublabel, d => d.gender, d => d.group, d => d.album);
    const hierarchy = d3.hierarchy(salesByGroup).sum(d => d.sales).sort((x,y) => d3.descending(x.value, y.value));

    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, hierarchy.children.length + 1));

    const root = d3.partition()
        .size([2 * Math.PI, hierarchy.height + 1])(hierarchy);

    root.each(d => d.current = d);

    const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
        .padRadius(radius * 1.5)
        .innerRadius(d => d.y0 * radius)
        .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));

    const svg = d3.create("svg")
      .attr("viewBox", [-width / 2, -height / 2, width, width])
      .style("font", "4px Verdana, Geneva, sans-serif");

    const path = svg.append("g")
        .selectAll("path")
        .data(root.descendants().slice(1))
        .join("path")
        .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data[0]); })
        .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
        .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")
        .attr("d", d => arc(d.current));

    path.filter(d => (d.height > 1))
        .style("cursor", "pointer")
        .on("click", clicked);

    const format = d3.format(",d");

    path.append("title")
        .text(d => `${d.ancestors().map(d => d.data[0]).reverse().join("->")}\n${format(d.value).concat(" units sold")}\n${d3.format(".2%")(d.value/200442871.0)}`);
      
    const label = svg.append("g")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .style("user-select", "none")
        .selectAll("text")
        .data(root.descendants().slice(1))
        .join("text")
        .attr("dy", "0.35em")
        .attr("fill-opacity", d => +labelVisible(d.current))
        .attr("transform", d => labelTransform(d.current))
        .text(d => d.data[0]);
      
    const parent = svg.append("circle")
        .datum(root)
        .attr("r", radius)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .on("click", clicked);
    
    function clicked(event, p) {
        parent.datum(p.parent || root);
        
        root.each(d => d.target = {
            x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
            x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
            y0: Math.max(0, d.y0 - p.depth),
            y1: Math.max(0, d.y1 - p.depth)
        });
        const t = svg.transition().duration(750);

        path.transition(t)
            .tween("data", d => {
            const i = d3.interpolate(d.current, d.target);
            return t => d.current = i(t);
            })
        .filter(function(d) {
            return +this.getAttribute("fill-opacity") || arcVisible(d.target);
        })
            .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
            .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none") 

            .attrTween("d", d => () => arc(d.current));

        label.filter(function(d) {
            return +this.getAttribute("fill-opacity") || labelVisible(d.target);
        }).transition(t)
            .attr("fill-opacity", d => +labelVisible(d.target))
            .attrTween("transform", d => () => labelTransform(d.current));
    }
  
    function arcVisible(d) {
        return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }

    function labelVisible(d) {
        return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }

    function labelTransform(d) {
        const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
        const y = (d.y0 + d.y1) / 2 * radius;
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }

    return svg.node();
}

export function bar_chart(data) {
    const width = 1000;
    const height = 700;
    const marginTop = 20;
    const marginRight = 0;
    const marginBottom = 20;
    const marginLeft = 20;

    const dates = Array.from(new Set(data.map(d => d.release.getFullYear())));
    const xz = d3.range(dates.length);
    const sby = d3.rollups(data, v => d3.sum(v, d => d.sales), d => d.gender, d => (d.release.getFullYear()));
    sby[0][1].push([2010, 0]);
    sby[0][1].push([2011, 0]);
    sby[1][1].sort((x,y) => d3.ascending(x[0], y[0]));
    sby[0][1].sort((x,y) => d3.ascending(x[0], y[0]));
    
    const yz = [];

    for (let i = 0; i < sby.length; i++) {
        const yearly = [];
        for (let j = 0; j < sby[0][1].length; j++) {
            yearly.push(sby[i][1][j][1]/1000000);
        }
        yz.push(yearly);
    }

    const n = yz.length;

    const y01z = d3.stack()
        .keys(d3.range(n))
        (d3.transpose(yz))
        .map((data, i) => data.map(([y0, y1]) => [y0, y1, i]));

    const yMax = d3.max(yz, y => d3.max(y));
    const y1Max = d3.max(y01z, y => d3.max(y, d => d[1]));

    const x = d3.scaleBand()
        .domain(xz)
        .rangeRound([marginLeft, width - marginRight])
        .padding(0.08);

    const y = d3.scaleLinear()
        .domain([0, y1Max])
        .range([height - marginBottom, marginTop]);

    const color = [d3.rgb("royalblue"), d3.rgb("crimson")];

    const svg = d3.create("svg")
        .attr("id", "bar")
        .attr("viewBox", [0, 0, width, height])
        .attr("width", width)
        .attr("height", height)
        .attr("style", "max-width: 100%; height: auto;")
        .attr("class", "graph");

    svg.append("rect")
        .attr("x",150)
        .attr("y",5)
        .attr("width",10)
        .attr("height",10)
        .style("fill", "royalblue")
        .style("opacity", 0.5);

    svg.append("rect")
        .attr("x",220)
        .attr("y",5)
        .attr("width",10)
        .attr("height",10)
        .style("fill", "crimson")
        .style("opacity", 0.5);

    svg.append("text")
        .attr("x",165)
        .attr("y",15)
        .html("Boys")
        .style("class", "caption")
        .style("font-family", "Verdana, Geneva, sans-serif").style("font-size", "0.85em");;

    svg.append("text")
        .attr("x",235)
        .attr("y",15)
        .html("Girls")
        .style("class", "caption")
        .style("font-family", "Verdana, Geneva, sans-serif").style("font-size", "0.85em");;

    const rect = svg.selectAll("g")
        .data(y01z)
        .join("g")
        .attr("fill", (d, i) => color[i])
        .attr("opacity", 0.5)
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", (d, i) => x(i))
        .attr("y", height - marginBottom)
        .attr("width", x.bandwidth())
        .attr("height", 0);

    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0).tickFormat((d,i) => i+2010));

    svg.append("g")
        .attr("id","y-axis")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).ticks(height / 40))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("x2", width - marginLeft - marginRight)
            .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
            .attr("x", -marginLeft)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text("Sales in Millions of Units"));
    
    svg.append("text")
    .attr("x",70)
    .attr("y",80)
    .html("The best selling boy group album is \"FML\" by SEVENTEEN released on April 24, 2023")
    .style("class", "caption")
    .style("font-family", "Verdana, Geneva, sans-serif").style("font-size", "0.85em");;

    svg.append("text")
    .attr("x",70)
    .attr("y",100)
    .html("The best selling girl group album is \"BORN PINK\" by BLACKPINK released on September 16, 2022")
    .style("class", "caption")
    .style("font-family", "Verdana, Geneva, sans-serif").style("font-size", "0.85em");;

    svg.append("text")
    .attr("x",30)
    .attr("y",548)
    .html("The earliest girl group album in the top 100 was released in 2010")
    .style("class", "caption")
    .style("font-family", "Verdana, Geneva, sans-serif").style("font-size", "0.85em");;

    svg.append("text")
    .attr("x",30)
    .attr("y",570)
    .html("While the first boy group album in the top 100 released in 2012")
    .style("class", "caption")
    .style("font-family", "Verdana, Geneva, sans-serif").style("font-size", "0.85em");;

    function transitionGrouped() {
        y.domain([0, yMax]);

        rect.transition()
            .duration(500)
            .delay((d, i) => i * 20)
            .attr("x", (d, i) => x(i) + x.bandwidth() / n * d[2])
            .attr("width", x.bandwidth() / n)
        .transition()
            .attr("y", d => y(d[1] - d[0]))
            .attr("height", d => y(0) - y(d[1] - d[0]));
        
        svg.select("#y-axis").transition().duration(500).attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).ticks(height / 40))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line")
            .attr("x2", width - marginLeft - marginRight)
            .attr("stroke-opacity", 0.1));
    }

    function transitionStacked() {
        y.domain([0, y1Max]);

        rect.transition()
            .duration(500)
            .delay((d, i) => i * 20)
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]))
        .transition()
            .attr("x", (d, i) => x(i))
            .attr("width", x.bandwidth());

        svg.select("#y-axis").transition().duration(500).attr("transform", `translate(${marginLeft},0)`)
            .call(d3.axisLeft(y).ticks(height / 40))
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line")
                .attr("x2", width - marginLeft - marginRight)
                .attr("stroke-opacity", 0.1));
    }

    function update(layout) {
        if (layout === "stacked") transitionStacked();
        else transitionGrouped();
    }
    let layout = "stacked";
    update(layout);
    svg.on("click", () => {
        layout = layout === "stacked" ? "grouped" : "stacked";
        update(layout);
    });

    return Object.assign(svg.node(), {update});
}

/*
ideas for charts:
cumsum line graph comparing bgs and ggs over the years - ability to transition to each year and tooltip showing best selling album of that year
pie chart of sales by company in the top 100 bgs and ggs - breaking down further by group
stacked bar chart by year of bg and gg album sales by year - ability to switch to grouped bar charts
extra little thing at the end where you can listen to a snippet of any of the top songs (if time permits)
*/