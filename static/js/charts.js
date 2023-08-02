queue()
  .defer(d3.json,"/static/JSON/escalations.json")
  .defer(d3.json,"/static/geoJSON/world.json")
  .await(makeGraphs)

function makeGraphs(error,escalation_json,world_json) {
  if(error) {
    console.log(error);
    return;
  }
  var malware_escalations = escalation_json;
  var dateFormat = d3.time.format("%Y-%m-%d");
  malware_escalations.forEach(function(d) {
    if(d["Responded As"] == "-")
      d["Responded As"] = "Escalated to TI";
    d["Date"] = dateFormat.parse(d["Date"]);
    d.Timestamp = new Date(d["Date"]);
  });


  var apac = ['Russia',"China","India","Bangladesh",'Bhutan','Brunei','Cambodia','Indonesia','Laos','North Korea','South Korea',
    'Malaysia','Maldives','Mongolia','Myanmar','Nepal','Pakistan','Philippines','Singapore','Sri Lanka',
    'Thailand','VietNam','Australia','New Caledonia','New Zealand','Papua New Guinea','Solomon Islands','Vanuatu'];

  var emea = ['Albania','Algeria','Angola','Austria','Belarus','Belgium','Benin','Bosnia and Herzegovina','Botswana',
    'Bulgaria','Burkina Faso','Burundi','Cameroon','Central African Republic','Chad','Croatia','Cyprus','Northern Cyprus',
    'Czech Republic','Democratic Republic of the Congo','Denmark','Djibouti','Egypt','Equatorial Guinea','Eritrea',
    'Estonia','Ethiopia','Finland','France','Gabon','Gambia','Georgia','Germany','Ghana','Greece','Guinea','Guinea Bissau',
    'Equatorial Guinea','Hungary','Iceland','Iran','Iraq','Ireland','Israel','Italy','Ivory Coast','Jordan','Kenya',
    'Kuwait','Latvia','Lebanon','Lesotho','Liberia','Libya','Lithuania','Luxembourg','Macedonia','Madagascar',
    'Malawi','Mali','Mauritania','Moldova','Montenegro','Morocco','Mozambique','Namibia','Netherlands','Niger','Nigeria',
    'Norway','Oman','Poland','Portugal','Qatar','Romania','Rwanda','Saudi Arabia','Senegal','Serbia','Slovakia','Slovenia',
    'Somalia','South Africa','Spain','Sudan','Swaziland','Sweden','Switzerland','Syria','Tanzania','Togo','Tunisia',
    'Turkey','Uganda','Ukraine','United Arab Emirates','United Kingdom','Western Sahara','Yemen','Zambia','Zimbabwe'];

  var amer = ['Bahamas','Canada','Cuba','Dominica','Dominican Republic','Haiti','Jamaica','Trinidad and Tobago',
    'United States of America','Greenland','Puerto Rico'];

  var ltam = ['Argentina','Belize','Bolivia','Brazil','Chile','Colombia','Costa Rica','Ecuador','El Salvador','Falkland Islands',
    'Guatemala','Guyana','Honduras','Mexico','Nicaragua','Panama','Paraguay','Peru','Suriname','Uruguay','Venezuela'];

  var japan = ['Japan'];

  // Mapping Countries to Region
  function getRegion(country) {
    if(apac.includes(country))
      return 'APAC';
    else if(emea.includes(country))
      return 'EMEA';
    else if(amer.includes(country))
      return 'AMER';
    else if(ltam.includes(country))
      return 'LTAM';
    else if(japan.includes(country))
      return 'Japan';
    else {
      return 'Other';
    }
  }

  var ndx = crossfilter(malware_escalations);
  var ndxDim = ndx.dimension(function(d) { return d;});

  //Defining Dimensions
  var weekDim = ndx.dimension(function(d) { return d["Week"]});
  var idDim = ndx.dimension(function(d) { return d["Item ID"];});
  var dateDim = ndx.dimension(function(d) { return d["Date"];});
  var monthDim = ndx.dimension(function(d) { return d['Month'];});
  var customerDim = ndx.dimension(function(d) {return d["Customer"];});
  var supportLevelDim = ndx.dimension(function(d) {return d["Support Level"];});
  var severityDim = ndx.dimension(function(d) { return d["Severity"];});
  var issueDim = ndx.dimension(function(d) {return d["Issue"];});
  var regionDim = ndx.dimension(function(d) {return d["Region"];});
  var respondedAsDim = ndx.dimension(function(d) {return d["Responded As"];});
  var actionDim = ndx.dimension(function(d) { return d["Action"];});
  var handledByDim = ndx.dimension(function(d) {return d["Handled By"];});

  //Defining Groups
  var week_group = weekDim.group();
  var date_group = dateDim.group();
  var month_group = monthDim.group();
  var customer_group = customerDim.group();
  var support_group = supportLevelDim.group();
  var severity_group = severityDim.group();
  var issue_group = issueDim.group();
  var region_group = regionDim.group();
  var responded_group = respondedAsDim.group();
  var action_group = actionDim.group();
  var handledBy_group = handledByDim.group();

  var all = ndx.groupAll();

  var minDate = dateDim.bottom(1)[0]["Date"];
	var maxDate = dateDim.top(1)[0]["Date"];

  console.log(minDate);
  console.log(maxDate);

  //Defining Visualization Charts
  var timeChart = dc.barChart("#time-chart");
  var weekChart = dc.barChart("#week-chart");
  var monthChart = dc.barChart("#month-chart");
  var issueChart = dc.rowChart("#issue-chart");
  var customerChart = dc.rowChart("#customer-chart");
  var actionChart = dc.rowChart("#action-chart");
  var responseChart = dc.rowChart("#response-chart");
  var severityChart = dc.pieChart("#severity-chart");
  var regionChart = dc.geoChoroplethChart("#region-chart");
  var num_escalationsND = dc.numberDisplay("#total-escalations-nd");
  var nasdaqCount = dc.dataCount(".dc-data-count");
  var nasdaqTable = dc.dataTable(".dc-data-table");

  //Count all filtered escalations
  num_escalationsND
    .width(300)
    .height(250)
    .formatNumber(d3.format("d"))
    .transitionDuration(50)
    .valueAccessor(function(d) {return d;})
    .group(all);

  //Creating Date BarChart
  timeChart
    .width(1600)
    .height(160)
    .margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(dateDim)
		.group(date_group)
		.transitionDuration(500)
		.x(d3.time.scale())
    .elasticX(true)
		.elasticY(true)
		.xAxisLabel("Date")
    .yAxisLabel("Number of Escalations")
    .xUnits(d3.time.days)
    .yAxis().ticks(4);

    timeChart.renderlet(function(chart){

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

  weekChart
    .width(1600)
    .height(160)
    .margins({top: 10, right: 50, bottom: 30, left: 50})
    .dimension(weekDim)
    .group(week_group)
    .transitionDuration(500)
    .x(d3.scale.ordinal()
        .domain(malware_escalations.map(function(d) { return d['Week'];})))
    .elasticX(true)
    .elasticY(true)
    .xAxisLabel("Week")
    .yAxisLabel("Number of Escalations")
    .xUnits(dc.units.ordinal)
    .yAxis().ticks(4);

    weekChart.renderlet(function(chart){

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

  monthChart
    .width(1600)
    .height(160)
    .margins({top: 10, right: 50, bottom: 30, left: 50})
    .dimension(monthDim)
    .group(month_group)
    .transitionDuration(500)
    .x(d3.scale.ordinal()
        .domain(malware_escalations.map(function(d) { return d['Month'];})))
    .elasticX(true)
    .elasticY(true)
    .xAxisLabel("Month")
    .yAxisLabel("Number of Escalations")
    .xUnits(dc.units.ordinal)
    .yAxis().ticks(4);

    monthChart.renderlet(function(chart){

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


  //Creating row chart having count of Issues (top 5 and rest as others)
  issueChart
    .width(300)
    .height(250)
    .transitionDuration(500)
    .dimension(issueDim)
    .ordering(function(d) { return -d.value;})
    .cap(8)
    .group(issue_group)
    .elasticX(true)
    .xAxis().ticks(4);

  //Creating row chart having count of Actions (top 5 and rest as others)
  actionChart
    .width(300)
    .height(250)
    .transitionDuration(500)
    .dimension(actionDim)
    .ordering(function(d) {return -d.value;})
    .cap(5)
    .group(action_group)
    .elasticX(true)
    .xAxis().ticks(4);

    //Creating row chart having count of Responses (top 5 and rest as others)
    responseChart
    .width(300)
    .height(250)
    .transitionDuration(500)
    .dimension(respondedAsDim)
    .ordering(function(d) {return -d.value;})
    .cap(5)
    .group(responded_group)
    .elasticX(true)
    .xAxis().ticks(4);

    //Creating row chart having count of Customers (top 5 and rest as others)
    customerChart
      .width(300)
      .height(250)
      .transitionDuration(500)
      .dimension(customerDim)
      .ordering(function(d) {return -d.value;})
      .cap(5)
      .group(customer_group)
      .elasticX(true)
      .xAxis().ticks(4);

    //Creating pie chart having count of Severity (top 5 and rest as others)
    severityChart
      .width(300)
      .height(250)
      .innerRadius(0)
      .transitionDuration(500)
      .dimension(severityDim)
      .group(severity_group)
      .legend(dc.legend())
      .on('pretransition', function(chart) {
        chart.selectAll('text.pie-slice').text(function(d) {
          return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle)/(2*Math.PI)*100) + '%';
        })
      });


    var width = 960;
    var height = 500;

    //Marking all regions on world map and overlaying escalation filter
    regionChart
      .width(600)
      .height(400)
      .dimension(regionDim)
      .group(region_group)
      .colors(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF","#51AEFF"])
      .colorDomain([0,6])
      .overlayGeoJson(world_json["features"], "region", function(d) {
        return getRegion(d.properties.name);
      })
      .projection(d3.geo.mercator()
        .scale(width/4/Math.PI)
        .translate([(width+250)/5,height/2]))
      .title(function(p) {
        return "Region: " + p["key"]
        + "\n"
        + "Escalations: "+ p["value"];
      });

    //Creating count of filtered items
    nasdaqCount
      .dimension(ndx)
      .group(all);

    //Displays Data Table of filtered escalation cases
    nasdaqTable
      .size(Infinity)
      .dimension(idDim)
      .group(function(d) {
        return "";
      })
      .columns([
        function(d) { return d["Item ID"]; },
        function(d) { return d["Date"]; },
        function(d) { return d["Customer"]; },
        function(d) { return d["Support Level"]; },
        function(d) { return d["Severity"];},
        function(d) { return d["Region"]; },
        function(d) { return d["Issue"]; },
        function(d) { return d["Responded As"]; },
        function(d) { return d["Action"]; },
        function(d) { return d["Handled By"];},
      ])
      .sortBy(function(d) {
        return new Date(d["Date"]);
      })
      .order(d3.ascending);

      //DOWNLOAD Function
      $("#exportData").unbind().click(function() {
        var blob = new Blob([d3.csv.format(ndxDim.top(Infinity))],
                    {type: "text/csv;charset=utf-8"});
                    saveAs(blob, 'data.csv');
            });

      function convert(str) {
        var date = new Date(str),
        mnth = ("0" + (date.getMonth()+1)).slice(-2),
        day  = ("0" + date.getDate()).slice(-2);
        return [ date.getFullYear(), mnth, day ].join("-");
      }

      //Date Search function
      $("#search").unbind().click(function() {
        document.getElementById('loader').style.display = "block";
        var from = document.getElementById('from').value;
        var to = document.getElementById('to').value;
        if(!Date.parse(from) || !Date.parse(to))
        {
          alert("Please enter Date range");
          document.getElementById('loader').style.display = "none";
          return false;
        }
        else {
          $.ajax({
            url:'/',
            type:'GET',
            data:{'from':convert(from),'to':convert(to)},
            success:function(response) {
              document.getElementById('loader').style.display = "none";
              $('#from').val(from);
              $('#to').val(to);
              queue()
                .defer(d3.json,"/static/JSON/escalations.json")
                .await(remake)
              function remake(error,escalation_json) {
                ndx.remove();
                var malware_escalations = escalation_json;
                malware_escalations.forEach(function(d) {
                  if(d["Responded As"] == "-")
                    d["Responded As"] = "Escalated to TI";
                  d["Date"] = dateFormat.parse(d["Date"]);
                  d.Timestamp = new Date(d["Date"]);
                });
                ndx.add(malware_escalations);
                dc.redrawAll();
                dc.renderAll();
              };
            },
            error:function(error) {
              document.getElementById('loader').style.display = "none";
              $('body').html(error);
            }
          });
        }
      });

      $("#index_selection").change(function() {
        var index_selected = $(this).find('option:selected').text();
        console.log(index_selected);
        if(index_selected == "Select Type")
          return;
        else {
          if(index_selected == "Week") {
            document.getElementById('time-chart').style.display="none";
            document.getElementById('week-chart').style.display="block";
            document.getElementById('month-chart').style.display="none";
          }
          else if(index_selected=="Month") {
            document.getElementById('time-chart').style.display="none";
            document.getElementById('week-chart').style.display="none";
            document.getElementById('month-chart').style.display="block";
          }
          else {
            document.getElementById('time-chart').style.display="block";
            document.getElementById('week-chart').style.display="none";
            document.getElementById('month-chart').style.display="none";
          }
        }
      });



  dc.renderAll();

};
