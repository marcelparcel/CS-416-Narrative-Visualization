async function init() {
    const gg_data = await d3.csv("./datasets/gg_album_sales.csv");
    const bg_data = await d3.csv("./datasets/bg_album_sales.csv");
    var tot_data = (await d3.csv("./datasets/gg_album_sales.csv")).concat((await d3.csv("./datasets/bg_album_sales.csv")));
    tot_data.sort(function (x,y) {
        return d3.descending(parseInt(x.sales), parseInt(y.sales));
    });
    for (var i = 1; i <= tot_data.length; i++) {
        tot_data[i-1].rank = i;
    }
}

function intro(data) {
    ys = d3.scaleLinear().domain([0,7000000]).range([200,0]);
    xs = d3.scaleLinear().domain([0,7000000]).range([0,200]);
    d3.select("svg").selectAll("circle").data(data).enter().append("circle")
    .attr("cx", function(d,i) {return d.sales;});
}

/*
ideas for charts:
rollup line graph comparing bgs and ggs over the years - ability to transition to each year and tooltip showing best selling album of that year
pie chart of sales by company in the top 100 bgs and ggs - breaking down further by group
stacked bar chart by year of bg and gg album sales by year - ability to switch to grouped bar charts
extra little thing at the end where you can listen to a snippet of any of the top songs (if time permits)
*/