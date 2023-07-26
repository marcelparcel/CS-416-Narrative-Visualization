import * as help from "./helper.js";

const data = await help.init();

const story = new help.Story();
//story.addScene(help.text_node("test"));
story.addScene(help.cumsum_line(data.tot, data.gg, data.bg));
story.addScene(help.sunburst(data.tot));
//console.log(help.sunburst(data.tot));

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
