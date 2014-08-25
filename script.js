var height = 1200, 
	width = 900,
	padding = 5;

var svg = d3.select("body").select("#vis").append("svg")
			.attr("width", width)
			.attr("height", height);

//http://www.theverge.com/2014/8/22/6056617/marvels-movie-business-is-crushing-dcs-and-its-not-close
d3.csv("superherosData.csv", function(data){

//JavaScript data cleaning, because why not?
data = data.slice(0, data.length - 2) //deal with eroneous last two empty entries

for (var i = 0; i < data.length; i++){ //clean the adjusted amounts. 
	data[i].year    	 = parseFloat(   data[i].year   );
	data[i].adjusted     = parseFloat(   data[i].adjusted.slice(1).replace(/,/g,'')   );
	data[i].domestic     = parseFloat(   data[i].domestic.slice(1).replace(/,/g,'')   );
	data[i].worldwide    = parseFloat(   data[i].worldwide.slice(1).replace(/,/g,'')   );
	data[i].foreign      = parseFloat(   data[i]["foreign "].slice(1).replace(/,/g,'')   );
	delete data[i]["foreign "] //get rid of weirdly titled entry. 
	delete data[i][""] //because I am a neat freak. 
}

function dataChooser(type){
	var filteredData = [];

	for (var i = 0; i < data.length; i++){
		if ( isNaN(data[i][type])){
		} else {
			filteredData.push(
				{	"movie"  : data[i].movie,
					"stat"   : data[i][type],
					"year"	 : data[i].year,
					"company": data[i].company
				})
		}  
	}
	return filteredData;
}

console.log(data)

var maxPoint = d3.max(data, function(d){return d.adjusted})
var minPoint = d3.min(data, function(d){return d.adjusted})

var xScale = d3.scale.linear()
				.domain([0, maxPoint])
				.range([padding, width - 80]) //-50 for fitting text

var yScale = d3.scale.ordinal()
				.domain(d3.range(data.length + 1))
				.rangeRoundBands([0,height],0.2); 

svg.selectAll("rect")
	.data(data, function(d){return (d.movie + d.year)})
	.enter()
	.append("rect")
	.attr("x", 0)
	.attr("y", function(d,i){return yScale(i)})
	.attr("rx",2)
	.attr("ry",2)
	.attr("width", function(d){return xScale(d.adjusted)})
	.attr("height", yScale.rangeBand())
	.attr("fill", function(d){
		if (d.company === "Marvel") {
			return "red"
		} else {
			return "blue"
		}
	})
	.on("mouseover", function(d){
		d3.select(this)
			.classed("selectedBar", true)
	})
	.on("mouseout", function(d){
		d3.select(this)
			.classed("selectedBar", false)
	})

svg.selectAll("text")
	.data(data, function(d){return (d.movie + d.year)})
	.enter()
	.append("text")
	.attr("class", "movieTitles")
	.attr("x", function(d){return xScale(d.adjusted) + 4})
	.attr("y", function(d,i){ return (yScale(i) + ( (yScale.rangeBand() )/2 ) + 3 ) })
	.text(function(d){return d.movie + " (" + d.year + ")" })	
	.attr("font-family", "Optima") 
	.attr("font-size", "11px")
	.attr("fill", "black")
	.attr("text-anchor", "start");		

var commasFormatter = d3.format(",.0f")

svg.append("g")
	.attr("class", "axis")
    .call(d3.svg.axis()
    .scale(xScale)
    .ticks(3)
    .tickFormat(function(d) { return "$" + commasFormatter(d); })
    .orient("bottom"));

d3.selectAll(".menuItems")
	.on("mouseover", function(d){
		d3.select(this)
			.classed("hovered",true)
		})
	.on("mouseout", function(d){
		d3.select(this)
			.classed("hovered",false)
		})
	.on("click", function(d){
		console.log("clicked")
		d3.select("#menuTable")
			.selectAll("td")
			.classed("selected", false)
		d3.select(this)
			.classed("selected",true)

		firstTime = true; 
		updateVis(d3.select(this).attr("id"))
	})

var firstTime = true;

//Update function___________________________________________________
function updateVis(type){

	var bars = svg.selectAll("rect")
			.data(dataChooser(type), function(d){return (d.movie + d.year)})
			.sort(function(a, b) {return d3.descending(a.stat, b.stat); })

	bars
		.exit()
		.transition()
		.duration(1200)
		.attr("width",0)
		.remove()

	bars
		.enter()
		.append("rect")
		.attr("x", 0)
		.attr("y", function(d,i){return yScale(i)})
		.attr("rx",2)
		.attr("ry",2)
		.attr("height", yScale.rangeBand())
		.attr("fill", function(d){
			if (d.company === "Marvel") {
				return "red"
			} else {
				return "blue"
			}
		})
		.attr("width",0)
		.on("mouseover", function(d){
			d3.select(this)
				.classed("selectedBar", true)
		})
		.on("mouseout", function(d){
			d3.select(this)
				.classed("selectedBar", false)
		})
		.transition()
		.duration(1200)
		.attr("width", function(d){return xScale(d.stat)})

	bars
		.transition()
		.duration(1200)
		.attr("x", 0)
		.attr("y", function(d,i){return yScale(i)})
		.attr("rx",2)
		.attr("ry",2)
		.attr("width", function(d){return xScale(d.stat)})
		.attr("height", yScale.rangeBand())
		.attr("fill", function(d){
			if (d.company === "Marvel") {
				return "red"
			} else {
				return "blue"
			}
		})

	var movieTitles = svg.selectAll(".movieTitles")
			.data(dataChooser(type), function(d){return (d.movie + d.year)})
			.sort(function(a, b) {return d3.descending(a.stat, b.stat); })

	movieTitles
		.exit()
		.transition()
		.duration(1200)
		.attr("x",0)
		.remove()

	movieTitles
		.enter()
		.append("text")
		.attr("class", "movieTitles")
		.attr("x", 0)
		.attr("y", function(d,i){ return (yScale(i) + ( (yScale.rangeBand() )/2 ) + 3 ) })
		.text(function(d){return d.movie + " (" + d.year + ")" })	
		.attr("font-family", "Optima") 
		.attr("font-size", "11px")
		.attr("fill", "black")
		.attr("text-anchor", "start")
		.transition()
		.duration(1200)
		.attr("x", function(d){return xScale(d.stat) + 4})

	movieTitles
		.transition()
		.duration(1200)
		.attr("x", function(d){return xScale(d.stat) + 4})
		.attr("y", function(d,i){ return (yScale(i) + ( (yScale.rangeBand() )/2 ) + 3 ) })
		.each("end", function(){
				if(firstTime) { //run transition again once because they are buggy. Because why figure out the root of the problem?
					updateVis(type)
					firstTime = false;
				}
		})

}


var intro = d3.select("#intro")

//Allow user to move forward on click.  
d3.select("#continueText")
    .on("click", function(d){
        d3.select("#visualization").classed("hidden", false)
        intro.classed("hidden",true) 
    })

})//close csv load. 

