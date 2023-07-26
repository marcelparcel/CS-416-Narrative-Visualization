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

export const text_node = t => {
    document.getElementById("svg-container").classList.add("intro");
    return document.createTextNode(t);
}

export function cumsum_line(tot, gg, bg) {
    const width = 1000;
    const height = 700;
    const marginTop = 20;
    const marginRight = 30;
    const marginBottom = 30;
    const marginLeft = 40;

    const transpose = m => m[0].map((x,i) => m.map(x => x[i]));
    const obj_array = a => a.map(([date, sales]) => ({date, sales}));

    gg.sort((x,y) => d3.ascending(x.release, y.release));
    const gg_sum = obj_array(transpose([gg.map(d => d.release), d3.cumsum(gg.map(d => d.sales/1000000))]));

    bg.sort((x,y) => d3.ascending(x.release, y.release));
    const bg_sum = obj_array(transpose([bg.map(d => d.release), d3.cumsum(bg.map(d => d.sales/1000000))]));

    const xs = d3.scaleUtc(d3.extent(tot, d => d.release), [marginLeft, width - marginRight]);
    const ys = d3.scaleLinear([0, d3.max(bg_sum, d => d.sales)], [height - marginBottom, marginTop]);

    const line = d3.line().x(d => xs(d.date)).y(d => ys(d.sales));

    const svg = d3.create("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("class", "graph")
                .attr("id", "graph");

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

    return svg.node();
}

export function sunburst(data) {
    const width = 500;
    const height = width;
    const radius = width/6;

    const salesByGroup = d3.group(data, d => d.label, d => d.sublabel, d => d.group, d => d.album);
    const hierarchy = d3.hierarchy(salesByGroup).sum(d => d.sales).sort((x,y) => d3.descending(x.value, y.value));

    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, hierarchy.children.length + 1));

    console.log(hierarchy);

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
      .style("font", "4px Rubik, sans-serif");

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

}

/*
ideas for charts:
cumsum line graph comparing bgs and ggs over the years - ability to transition to each year and tooltip showing best selling album of that year
pie chart of sales by company in the top 100 bgs and ggs - breaking down further by group
stacked bar chart by year of bg and gg album sales by year - ability to switch to grouped bar charts
extra little thing at the end where you can listen to a snippet of any of the top songs (if time permits)
*/