import * as help from "./helper.js";

const data = await help.init();

const story = new help.Story();
const line = help.cumsum_line(data.tot, data.gg, data.bg);
const sunburst = help.sunburst(data.tot);
const bar = help.bar_chart(data.tot);
const layout = "stacked";
bar.update(layout);
story.addScene(line);
story.addScene(sunburst);
story.addScene(bar);

function transitionGraphs() {
    layout === "stacked" ? "grouped" : "stacked";
    bar.update(layout);
}

document.getElementsByClassName("header")[0].onclick = () => { 
    document.getElementById("svg-container").appendChild(story.currSceneContent);
    document.getElementById("svg-container").appendChild(document.getElementById("buttons"));
    document.getElementById("buttons").style.display = "block";
    //console.log(document.getElementById("graph").childNodes);
}

document.getElementsByClassName("prev")[0].onclick = () => {
    if (story.currScene > 0) {
        story.currScene--;
        document.getElementById("svg-container").replaceChild(story.currSceneContent, story.nextSceneContent);
    }
    //console.log(document.getElementById("svg-container").childNodes);
}

document.getElementsByClassName("next")[0].onclick = () => { 
    if (story.currScene < story.length - 1) {
    story.currScene++;
    document.getElementById("svg-container").replaceChild(story.currSceneContent, story.prevSceneContent);
    }
    //console.log(document.getElementById("svg-container").childNodes);
}