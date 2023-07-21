async function init() {
    const gg_data = await d3.csv("./datasets/gg_album_sales.csv");
    const bg_data = await d3.csv("./datasets/bg_album_sales.csv");
    var tot_data = gg_data.concat(bg_data);
}