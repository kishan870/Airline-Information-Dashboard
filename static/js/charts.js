queue()
  .defer(d3.json,"/static/JSON/Olympics.json")
  .await(makeGraphs)

function makeGraphs(error,olympics_json) {

  if(error) {
    console.log(error);
    return;
  }


  var olympics_data = olympics_json;

  var ndx = crossfilter(olympics_data);
  var ndxDim = ndx.dimension(function(d) { return d;});

  var yearDim = ndx.dimension(function(d) {return d['Year'];});
  var sexDim = ndx.dimension(function(d) {return d['Sex'];});
  var ageDim = ndx.dimension(function(d) {return d['Age'];});
  var teamDim = ndx.dimension(function(d) {return d['Team'];});
  var seasonDim = ndx.dimension(function(d) {return d['Season'];});
  var cityDim = ndx.dimension(function(d) {return d['City'];});
  var sportDim = ndx.dimension(function(d) {return d['Sport'];});

  var yearGroup = yearDim.group();
  var sexGroup = sexDim.group();
  var ageGroup = ageDim.group();
  var teamGroup = teamDim.group();
  var seasonGroup = seasonDim.group();
  var cityGroup = cityDim.group();
  var sportGroup = sportDim.group();

  var yearChart = dc.barChart("#year-chart");
  var sexChart = dc.pieChart("#sex-chart");
  var ageChart = dc.rowChart("#age-chart");
  var teamChart = dc.rowChart("#team-chart");
  var seasonChart = dc.pieChart("#season-chart");
  var cityChart = dc.rowChart("#city-chart");
  var sportChart = dc.rowChart("#sport-chart");

  yearChart
    .width(1600)
    .height(180)
    .margins({top: 10, right: 50, bottom: 30, left: 50})
    .dimension(yearDim)
    .group(yearGroup)
    .transitionDuration(500)
    .x(d3.scale.ordinal()
        .domain(olympics_data.map(function(d) { return d['Year'];})))
    .elasticX(true)
    .elasticY(true)
    .xAxisLabel("Year")
    .yAxisLabel("Olympic Participants")
    .xUnits(dc.units.ordinal)
    .yAxis().ticks(4);

    yearChart.renderlet(function(chart){

    var barsData = [];
    var bars = chart.selectAll('.bar').each(function(d) { barsData.push(d); });

    //Remove old values (if found)
    d3.select(bars[0][0].parentNode).select('#inline-labels').remove();
    //Create group for labels
    var gLabels = d3.select(bars[0][0].parentNode).append('g').attr('id','inline-labels');

    for (var i = bars[0].length - 1; i >= 0; i--) {

        var b = bars[0][i];
        //Only create label if bar height is tall enough
        //if (+b.getAttribute('height') < 18) continue;

        gLabels
            .append("text")
            .text(barsData[i].data.value)
            .attr('x', +b.getAttribute('x') + (b.getAttribute('width')/2) )
            .attr('y', +b.getAttribute('y') + 15)
            .attr('text-anchor', 'middle')
            .attr('fill', 'white');
    }

  })
  .on("preRedraw", function(chart){

      //Remove old values (if found)
      chart.select('#inline-labels').remove();

  });

  //Creating pie chart having count of Sex of players
  sexChart
    .width(300)
    .height(250)
    .innerRadius(0)
    .transitionDuration(500)
    .dimension(sexDim)
    .group(sexGroup)
    .legend(dc.legend())
    .on('pretransition', function(chart) {
      chart.selectAll('text.pie-slice').text(function(d) {
        return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle)/(2*Math.PI)*100) + '%';
      })
    });

    //Creating row chart having count of Age Group
    ageChart
      .width(300)
      .height(250)
      .transitionDuration(500)
      .dimension(ageDim)
      .ordering(function(d) { return -d.value;})
      .cap(8)
      .group(ageGroup)
      .elasticX(true)
      .xAxis().ticks(4);

      //Creating row chart having count of Country of player (top 5 and rest as others)
      teamChart
        .width(300)
        .height(250)
        .transitionDuration(500)
        .dimension(teamDim)
        .ordering(function(d) { return -d.value;})
        .cap(8)
        .group(teamGroup)
        .elasticX(true)
        .xAxis().ticks(4);

        //Creating pie chart having count of Olympic Season
        seasonChart
          .width(300)
          .height(250)
          .innerRadius(0)
          .transitionDuration(500)
          .dimension(seasonDim)
          .group(seasonGroup)
          .legend(dc.legend())
          .on('pretransition', function(chart) {
            chart.selectAll('text.pie-slice').text(function(d) {
              return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle)/(2*Math.PI)*100) + '%';
            })
          });

          //Creating row chart having count of Host City (top 5 and rest as others)
          cityChart
            .width(300)
            .height(250)
            .transitionDuration(500)
            .dimension(cityDim)
            .ordering(function(d) { return -d.value;})
            .cap(8)
            .group(cityGroup)
            .elasticX(true)
            .xAxis().ticks(4);

            //Creating row chart having count of Sport (top 5 and rest as others)
            sportChart
              .width(300)
              .height(250)
              .transitionDuration(500)
              .dimension(sportDim)
              .ordering(function(d) { return -d.value;})
              .cap(8)
              .group(sportGroup)
              .elasticX(true)
              .xAxis().ticks(4);

dc.renderAll();

};
