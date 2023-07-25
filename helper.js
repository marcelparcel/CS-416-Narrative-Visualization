export class Story {
    #scenes = [];
    curr_scene;
    constructor() {
        this.curr_scene = 0;
    }
    get curr_scene() {
        return this.curr_scene;
    }
    get curr_scene_cnt() {
        return this.#scenes[this.curr_scene];
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

    const transpose = m => m[0].map((x,i) => m.map(x => x[i]));
    const obj_array = a => a.map(([date, sales]) => ({date, sales}));

    gg.sort((x,y) => d3.ascending(x.release, y.release));
    const gg_sum = obj_array(transpose([gg.map(d => d.release), d3.cumsum(gg.map(d => d.sales))]));

    bg.sort((x,y) => d3.ascending(x.release, y.release));
    const bg_sum = obj_array(transpose([bg.map(d => d.release), d3.cumsum(bg.map(d => d.sales))]));

    const xs = d3.scaleUtc(d3.extent(tot, d => d.release), [marginLeft, width - marginRight]);
    const ys = d3.scaleLinear([0, d3.max(bg_sum, d => d.sales)], [height - marginBottom, marginTop]);

    const line = d3.line().x(d => xs(d.date)).y(d => ys(d.sales));

    const svg = d3.create("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("class", "intro");

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
        .text("Total Sales"));

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

    return svg;
}

export function pie_chart(data) {

}

export function bar_chart(data) {

}

export function prev(Story) {
    Story.curr_scene--;
    return Story.curr_scene;
}

export function next(Story) {
    Story.curr_scene++;
    return Story.curr_scene;
}

/*
ideas for charts:
cumsum line graph comparing bgs and ggs over the years - ability to transition to each year and tooltip showing best selling album of that year
pie chart of sales by company in the top 100 bgs and ggs - breaking down further by group
stacked bar chart by year of bg and gg album sales by year - ability to switch to grouped bar charts
extra little thing at the end where you can listen to a snippet of any of the top songs (if time permits)
*/