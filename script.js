import * as help from "./helper.js";

const data = await help.init();

const story = new help.Story();

const line = [help.cumsum_line(data.tot, data.gg, data.bg),
    document.createTextNode("Total album sales of boy groups and girl groups from 2010 to now")];

const bar = [help.bar_chart(data.tot),
    document.createTextNode("Album sales by year of boy groups and girl groups"),
    document.createTextNode("click the chart to switch graphs")];

const sunburst = [help.sunburst(data.tot),
        document.createTextNode("Album sales by company -> label -> gender -> group"),
        document.createTextNode("click a slice to go further in the group"),
        document.createElement("br"),
        document.createTextNode("hover over a slice to view more info"),
        document.createElement("br"),
        document.createTextNode("click the center to go back")];

const conclusion = [document.createTextNode("As you've seen, boy groups have been leading in sales since the 3rd generation of K-Pop. However, when looking at streaming charts rather than album sales, girl groups are the ones that outperform boy groups.   "),
document.createTextNode("Conclusion")];

story.addScene(line);
story.addScene(bar);
story.addScene(sunburst);
story.addScene(conclusion);

const removeAllChildren = (p) => {
    while(p.firstChild) {
        p.removeChild(p.firstChild);
    }
}

const addAllChildren = (p, l) => {
    for (let i = 2; i < l.length; i++) {
        p.appendChild(l[i]);
    }
}

document.getElementById("title").onclick = () => { 
    document.getElementById("svg-container").appendChild(story.currSceneContent[0]);
    document.getElementById("graph-title").appendChild(story.currSceneContent[1]);
    document.getElementById("svg-container").appendChild(document.getElementById("buttons"));
    document.getElementById("buttons").style.display = "block";
    document.getElementById("intro").style.display = "none";
    document.getElementById("instruct").style.display = "none";
}

document.getElementsByClassName("prev")[0].onclick = () => {
    if (story.currScene > 0) {
        story.currScene--;
        document.getElementById("svg-container").replaceChild(story.currSceneContent[0], story.nextSceneContent[0]);
        document.getElementById("graph-title").replaceChild(story.currSceneContent[1], story.nextSceneContent[1]);
        if (story.currSceneContent.length > 2) {
            if (story.nextSceneContent.length > 2) {
                removeAllChildren(document.getElementById("text"));
                addAllChildren(document.getElementById("text"), story.currSceneContent);   
            }
                else {
                    addAllChildren(document.getElementById("text"), story.currSceneContent);
                }
        }
            else {
                if (story.nextSceneContent.length > 2) removeAllChildren(document.getElementById("text"));
            }
    }
}

document.getElementsByClassName("next")[0].onclick = () => { 
    if (story.currScene < story.length - 1) {
    story.currScene++;
    document.getElementById("svg-container").replaceChild(story.currSceneContent[0], story.prevSceneContent[0]);
    document.getElementById("graph-title").replaceChild(story.currSceneContent[1], story.prevSceneContent[1]);
        if (story.currSceneContent.length > 2) {
            if (story.prevSceneContent.length > 2) {
                removeAllChildren(document.getElementById("text"));
                addAllChildren(document.getElementById("text"), story.currSceneContent);   
            }
                else {
                    addAllChildren(document.getElementById("text"), story.currSceneContent);
                }
        }
            else {
                if (story.prevSceneContent.length > 2) removeAllChildren(document.getElementById("text"));
            }
    }
}