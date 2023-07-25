import * as help from "./helper.js";

const data = await help.init();

console.log(data);

const story = new help.Story();
story.addScene(help.cumsum_line(data.tot, data.gg, data.bg));
d3.select("body").select("#svg-container")
    .attr();