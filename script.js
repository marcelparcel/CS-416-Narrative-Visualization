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