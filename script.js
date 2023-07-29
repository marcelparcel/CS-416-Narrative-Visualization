import * as help from "./helper.js";

const data = await help.init();

const story = new help.Story();
const line = [help.cumsum_line(data.tot, data.gg, data.bg)];
const sunburst = [help.sunburst(data.tot),
    document.createTextNode("click a slice to go further in the group"),
    document.createElement("br"),
    document.createTextNode("hover over a slice to view more info"),
    document.createElement("br"),
    document.createTextNode("click the center to go back")];

const bar = [help.bar_chart(data.tot), document.createTextNode("click the chart to switch graphs")];
story.addScene(line);
story.addScene(sunburst);
story.addScene(bar);

const removeAllChildren = (p) => {
    while(p.firstChild) {
        p.removeChild(p.firstChild);
    }
}

const addAllChildren = (p, l) => {
    for (let i = 1; i < l.length; i++) {
        p.appendChild(l[i]);
    }
}

document.getElementsByClassName("header")[0].onclick = () => { 
    document.getElementById("svg-container").appendChild(story.currSceneContent[0]);
    document.getElementById("svg-container").appendChild(document.getElementById("buttons"));
    document.getElementById("buttons").style.display = "block";
    document.getElementById("intro").style.display = "none";
}

document.getElementsByClassName("prev")[0].onclick = () => {
    if (story.currScene > 0) {
        story.currScene--;
        document.getElementById("svg-container").replaceChild(story.currSceneContent[0], story.nextSceneContent[0]);
        if (story.currSceneContent.length > 1) {
            if (story.nextSceneContent.length > 1) {
                removeAllChildren(document.getElementById("text"));
                addAllChildren(document.getElementById("text"), story.currSceneContent);   
            }
                else {
                    addAllChildren(document.getElementById("text"), story.currSceneContent);
                }
        }
            else {
                if (story.nextSceneContent.length > 1) removeAllChildren(document.getElementById("text"));
            }
    }
}

document.getElementsByClassName("next")[0].onclick = () => { 
    if (story.currScene < story.length - 1) {
    story.currScene++;
    document.getElementById("svg-container").replaceChild(story.currSceneContent[0], story.prevSceneContent[0]);
        if (story.currSceneContent.length > 1) {
            if (story.prevSceneContent.length > 1) {
                removeAllChildren(document.getElementById("text"));
                addAllChildren(document.getElementById("text"), story.currSceneContent);   
            }
                else {
                    addAllChildren(document.getElementById("text"), story.currSceneContent);
                }
        }
            else {
                if (story.prevSceneContent.length > 1) removeAllChildren(document.getElementById("text"));
            }
    }
}