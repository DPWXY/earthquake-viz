function finalProject(){
    var filePath="./earthquake_data.csv";
    scatterPlot(filePath);
    barPlot(filePath);
    stackedbarPlot(filePath);
    geoPlot(filePath);
	geoPlot2(filePath);
	boxPlot(filePath);
}

var scatterPlot=function(filePath){
    var textcolor = "rgb(0, 255, 115)"
    d3.csv(filePath).then(function(data){
        console.log(data)
        var margin = {top: 20, right: 20, bottom: 20, left: 20};
        var width = 800 - margin.left - margin.right;
        var height = 600 - margin.top - margin.bottom;
        var padding = 60;
        var small_pad = 50;
        var xScale = d3.scaleLinear()
                .domain([0, d3.max(data, function(d) { return +d.mmi; })])
                .range([padding, width - padding]);
        var yScale = d3.scaleLinear()
                .domain([d3.min(data, function(d) { return +d.sig; }) - small_pad, 
                    d3.max(data, function(d) { return +d.sig; })])
                .range([height - padding, padding]);
        var svg = d3.select("#scatter_plot").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
        var circles = svg.selectAll("circle")
                .data(data)
                .enter().append("circle")
                .attr("cx", function(d) { return xScale(+d.mmi); })
                .attr("cy", function(d) { return yScale(+d.sig); })
                .attr("r", 4)
                .attr("fill", "rgb(0, 255, 115)")
                .style("opacity", 1);
        // Add Brushing effects to Scatter Plot
        svg.call(d3.brush()
                  .extent( [[0,0], [width,height]] )
                  .on("start brush", updateChart))
        function updateChart(e) {
                extent = e.selection;
                console.log(extent)
                circles.classed("selected", function(d){ return isBrushed(extent, xScale(d.mmi), yScale(d.sig) ) } )
                }
        function isBrushed(brush_coords, cx, cy) {
                var x0 = brush_coords[0][0],
                    x1 = brush_coords[1][0],
                    y0 = brush_coords[0][1],
                    y1 = brush_coords[1][1];
                return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
               }
        // Add axis and titles
        const xAxis = d3.axisBottom().scale(xScale);
        const yAxis = d3.axisLeft().scale(yScale);
        svg.append("g")
                .call(xAxis)
                .attr("transform", "translate(0," + (height-padding) + ")")
                .selectAll("text")
                .attr("font-size", "12px")
        svg.append("g")
                .call(yAxis)
                .attr("transform", "translate(" + padding + ",0)")
        svg.append("text")
                .attr("x", (width / 2))             
                .attr("y", margin.top)
                .attr("text-anchor", "middle")  
                .style("font-size", "16px")
                .text("The Scatter Plot between Significance and MMI for Earthquakes")
                .attr("font-family", "Monaco")
                .attr("fill", textcolor);
        svg.append("text")
                .attr("class", "x label")
                .attr("text-anchor", "end")
                .attr("x", (width / 2) + 100)
                .attr("y", height + margin.bottom/5 - 30)
                .text("The Significance of Earthquake")
                .attr("fill", textcolor);
        svg.append("text")
                .attr("class", "y label")
                .attr("text-anchor", "end")
                .attr("transform", "rotate(-90)")
                .attr("y", -margin.left + 35)
                .attr("x", -height / 3 + 100)
                .text("The Maximum Estimated Instrumental Intensity")
                .attr("fill", textcolor);
    });
}

var barPlot=function(filePath){
    var textcolor = "rgb(0, 255, 115)"
    let parseDate = d3.timeParse("%d-%m-%Y %H:%M")
    var rowConverter = function(d){
        return {
            magnitude: parseInt(d.magnitude),
            year: parseDate(d.date_time).getFullYear()
        }
    }
    d3.csv(filePath, rowConverter).then(function(data){
        console.log(data)
        var margin = {top: 20, right: 20, bottom: 20, left: 20};
        var width = 800 - margin.left - margin.right;
        var height = 600 - margin.top - margin.bottom;
        var padding = 60;
        var small_pad = 50;
        var small_padding = 0.3;
        var adjust = 0.1;
        var bar = 20;
        var avg = d3.flatRollup(data, v => d3.mean(v, d => d.magnitude), d => d.year)
        var datas = []
        avg.forEach((d, i) => {
            datas.push({
                "avg_magnitude": d[1], 
                "year": d[0]
            })
        });
        datas.sort((a, b) => d3.ascending(a.year, b.year))
        var xScale = d3.scaleBand()
                .domain(datas.map(function(d){return d.year}))
                .range([padding, width - padding])
                .padding(small_padding);
        var yScale = d3.scaleLinear()
                .domain([d3.min(datas, function(d) { return d.avg_magnitude; }) - adjust, 
                    d3.max(datas, function(d) { return d.avg_magnitude; })])
                .range([height - padding, padding]);
        var svg = d3.select("#bar_plot").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
        var bars = svg.selectAll('rect')
                .data(datas)
                .enter()
        bars.append('rect')
                .attr('x', function(d) { return xScale(d.year); })
                .attr('y', function(d) { return yScale(d.avg_magnitude)})
                .attr('height', function(d) { return height - padding - yScale(d.avg_magnitude)})
                .attr('width', bar)
                .attr('fill', textcolor);
        const xAxis = d3.axisBottom().scale(xScale);
        const yAxis = d3.axisLeft().scale(yScale);
        svg.append("g")
                .call(xAxis)
                .attr("transform", "translate(0," + (height-padding) + ")")
                .selectAll("text")
                .attr("transform", "rotate(-20)")
                .attr("font-size", "8px")
        svg.append("g")
                .call(yAxis)
                .attr("transform", "translate(" + padding + ",0)")
        svg.append("text")
                .attr("x", (width / 2))             
                .attr("y", margin.top)
                .attr("text-anchor", "middle")  
                .style("font-size", "16px")
                .text("The Bar Plot for Average Magnitude of Earthquakes Over Years")
                .attr("font-family", "Monaco")
                .attr("fill", textcolor);
        svg.append("text")
                .attr("class", "x label")
                .attr("text-anchor", "end")
                .attr("x", (width / 2) + 20)
                .attr("y", height + margin.bottom/5 - 30)
                .text("Year")
                .attr("fill", textcolor);
        svg.append("text")
                .attr("class", "y label")
                .attr("text-anchor", "end")
                .attr("transform", "rotate(-90)")
                .attr("y", -margin.left + 40)
                .attr("x", -height / 2 + 100)
                .text("The Average Magnitude")
                .attr("fill", textcolor);
        const formatFloat = d3.format(".2f");
        bars.append("text")
                .text(function(d) { 
                    var text = formatFloat(d.avg_magnitude).toString();
                    return text
                })
                .attr("x", function(d){
                    return xScale(d.year) + xScale.bandwidth()/2;
                })
                .attr("y", function(d){
                    return yScale(d.avg_magnitude) - 5;
                })
                .attr("font-family" , "sans-serif")
                .attr("font-size" , "14px")
                .attr("fill" , textcolor)
                .attr("text-anchor", "middle");
        bars.append("text")
                .text(function(d) { 
                    var text = "⚠️";
                    return text
                })
                .attr("x", function(d){
                    return xScale(d.year) + xScale.bandwidth()/2;
                })
                .attr("y", function(d){
                    return yScale(d.avg_magnitude) - 20;
                })
                .attr("font-family" , "sans-serif")
                .attr("font-size" , "14px")
                .attr("fill" , textcolor)
                .attr("text-anchor", "middle");
    });
}

var stackedbarPlot=function(filePath){
    var textcolor = "rgb(0, 255, 115)"
    let parseDate = d3.timeParse("%d-%m-%Y %H:%M")
    var rowConverter = function(d){
        return {
            magnitude: parseInt(d.magnitude),
            year: parseDate(d.date_time).getFullYear(),
            alert: d.alert
        }
    }
    d3.csv(filePath, rowConverter).then(function(data){
        console.log(data)
        var margin = {top: 20, right: 20, bottom: 20, left: 20};
        var width = 800 - margin.left - margin.right;
        var height = 600 - margin.top - margin.bottom;
        var padding = 60;
        var small_padding = 0.3;
        var alerts = ['Green', 'Yellow', 'Orange', 'Red', 'None']
        var avg = d3.rollup(data, v => v.length, d => d.year, d => d.alert)
        var datas = []
        avg.forEach((d, i) => {
            datas.push({
                "year": i,
                "None": d.get("") || 0, 
                "Green": d.get("green") || 0,
                "Yellow": d.get("yellow") || 0,
                "Orange": d.get("orange") || 0,
                "Red": d.get("red") || 0
            })
        });
        datas.sort((a, b) => d3.ascending(a.year, b.year))
        var stackedData = d3.stack().keys(alerts)(datas);
        var colors = ['#C8C8CD', '#66FF66', '#FAFA37', '#FF9933', '#FD0E35']
        var xScale = d3.scaleBand()
                .domain(datas.map(function(d){return d.year}))
                .range([padding, width - padding])
                .padding(small_padding);
        var yScale = d3.scaleLinear()
                .domain([0, 
                    d3.max(datas, function(d) { 
                        return d["None"] + d["Green"] + d["Yellow"] + d["Orange"] + d["Red"]})])
                .range([height - padding, padding]);
        var colorScale = d3.scaleOrdinal()
                .domain(d3.map(datas, function(d){return d.alert}))
                .range(colors);
		var Tooltip = d3.select("#stackbar_plot")
				.append("div")
				.style("opacity", 0)
				.attr("class", "tooltip");
        var svg = d3.select("#stackbar_plot").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
        var groups = svg.selectAll(".gbars")
                .data(stackedData)
                .enter().append("g")
                .attr("class", "gbars")
                .attr("fill", d => colorScale(d.key));
        groups.selectAll('rect')
                .data(function(d){
                        return d;
                })
                .enter().append('rect')
                .attr('x', function(d) { return xScale(d.data.year); })
                .attr('y', function(d) { return yScale(d[1])})
                .attr('height', function(d) { return yScale(d[0])-yScale(d[1])})
                .attr('width', xScale.bandwidth())
				.style("opacity", 0.9)
				.on("mouseover", function (e, d) {
					Tooltip.transition().duration(50).style("opacity", 1);
					d3.select(this)
					.style("stroke", "#FF6EFF")
					.style("stroke-width", '2px')
					.style("opacity", 1)
				})
				.on("mousemove", function (e, d) {
					console.log(d)
					Tooltip
					.html("The number of this alerts for year " + d.data.year + " is: " + d[1])
					.style("left", d3.pointer(e)[0] + 2.5 * padding + 'px')
					.style("top", d3.pointer(e)[1] - padding + 'px');
				})
				.on("mouseout", function (e, d) {
					Tooltip.transition().duration(50).style("opacity", 0);
					d3.select(this)
					.style("stroke", "none")
					.style("opacity", 0.9)
				});	
        const xAxis = d3.axisBottom().scale(xScale);
        const yAxis = d3.axisLeft().scale(yScale);
        svg.append("g")
                .call(xAxis)
                .attr("transform", "translate(0," + (height-padding) + ")")
                .selectAll("text")
                .attr("transform", "rotate(-20)")
                .attr("font-size", "8px")
        svg.append("g")
                .call(yAxis)
                .attr("transform", "translate(" + padding + ",0)")
        svg.append("text")
                .attr("x", (width / 2))             
                .attr("y", margin.top)
                .attr("text-anchor", "middle")  
                .style("font-size", "16px")
                .text("The Stacked Bar Plot for Number of Earthquakes for Different Alerts")
                .attr("font-family", "Monaco")
                .attr("fill", textcolor);
        svg.append("text")
                .attr("class", "x label")
                .attr("text-anchor", "end")
                .attr("x", (width / 2) + 20)
                .attr("y", height + margin.bottom/5 - 30)
                .text("Year")
                .attr("fill", textcolor);
        svg.append("text")
                .attr("class", "y label")
                .attr("text-anchor", "end")
                .attr("transform", "rotate(-90)")
                .attr("y", -margin.left + 40)
                .attr("x", -height / 2 + 100)
                .text("The Number of Earthquakes")
                .attr("fill", textcolor);
        var legend_padding = 15;
        svg.append("g")
                .selectAll("circle")
                .data(alerts)
                .enter().append("circle")
                .attr("cx", width - legend_padding * 10)
                .attr("cy", (d, i) => legend_padding + i*20 + 30)
                .attr("r", 4)
                .style("fill", function(d) { return colorScale(d);});
        svg.append("g")
                .selectAll("text")
                .data(alerts)
                .enter()
                .append("text")
                .attr("x", width - legend_padding * 8)             
                .attr("y", (d, i) => legend_padding + i*20 + 35)
                .text(d => d)
                .attr("fill", function(d) { return colorScale(d);});
    });
}

var geoPlot=function(filePath){
	var textcolor = "rgb(0, 255, 115)"
	var rowConverter = function(d){
		return {
			magnitude: parseInt(d.magnitude),
			longitude:  parseFloat(d.longitude),
			latitude:  parseFloat(d.latitude),
			depth: parseInt(d.depth)
		}
	}
	d3.csv(filePath, rowConverter).then(function(data){
		console.log(data)
		var margin = {top: 20, right: 20, bottom: 20, left: 20};
		var width = 1500 - margin.left - margin.right;
		var height = 800 - margin.top - margin.bottom;
		var padding = 10;
		var minradius = 5;
		var maxradius = 20;
		var scale = 200;
		var datatype = 'magnitude'
		var rScale = d3.scaleLinear()
				.domain([d3.min(data, function(d) { return d[datatype]; }), 
						d3.max(data, function(d) { return d[datatype]; })])
				.range([minradius, maxradius]);
		const projection  = d3.geoNaturalEarth1()
				.translate([width/2, height/2])
				.scale(scale);                   
		const pathgeo = d3.geoPath().projection(projection);
		var svg = d3.select("#geo_plot").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
		svg.append('path')
				.attr('class', 'sphere')
				.attr('d', pathgeo({ type: 'Sphere' }))
				.attr('fill', '#0066CC')	
		const worldmap = d3.json("world.json")
            .then(map => {
                svg.selectAll('path')
                    .data(map.features)
                    .enter()
                    .append('path')
                    .attr('d', pathgeo)
                    .attr('fill', '#50BFE6')
                    .style("stroke", "white")
                    .style("stroke-width", "1px");
                var points = svg.selectAll('circle')
                    .data(data)
                    .enter()
                    .append('circle')
                    .attr('r', d => rScale(d[datatype]))
                    .attr('cx', d => projection([d.longitude, d.latitude])[0])
                    .attr('cy', d => projection([d.longitude, d.latitude])[1])
                    .attr('fill', '#FD5B78')
                    .attr('opacity', 0.5)
                    .attr('stroke', 'black')
                    .style("stroke-width", "0.5px");
                svg.append("text")
                    .attr("x", (width / 2))             
                    .attr("y", margin.top + 30)
                    .attr("text-anchor", "middle")  
                    .style("font-size", "16px")
                    .text("Globel Geomap for Large Earthquakes")
                    .attr("font-family", "Monaco")
					.attr("fill", textcolor);
                // Legend
                var legend = []
                data.forEach(d => {
                    legend.push(d[datatype])
                });
                legend = new Set(legend)
                legend = Array.from(legend).sort(d3.ascending)
                var legnedpoint = svg.append("g")
                    .selectAll("circle")
                    .data(legend)
                    .enter().append("circle")
                    .attr("cx", width - padding * 18)
                    .attr("cy", (d, i) => 10 * padding + i*50)
                    .attr("r", d => rScale(d))
                    .style("fill", '#FD5B78')
                    .attr('opacity', 0.9)
                    .attr('stroke', '#66FF66')
                    .style("stroke-width", "1px");
                var legendtext = svg.append("g")
                    .selectAll("text")
                    .data(legend)
                    .enter()
                    .append("text")
                    .attr("x", width - padding * 15)             
                    .attr("y", (d, i) => 10 * padding + i*50 + 5)
                    .text(d => d)
					.attr("fill", textcolor);
                var legnedtitle = svg.append("g")
                    .append("text")
                    .attr("x", width - padding * 20)             
                    .attr("y", 7 * padding)
                    .text(datatype.toUpperCase())
					.attr("fill", textcolor);
				var radio = d3.select('#radio_').attr('name', 'value').on("change", function (d) {
					datatype= d.target.value;
					var circlecolor = '#BEE64B'
					if (datatype == 'magnitude') {
						circlecolor = '#FD5B78';
					}
					var rScale = d3.scaleLinear()
						.domain([d3.min(data, function(d) { return d[datatype]; }), 
								d3.max(data, function(d) { return d[datatype]; })])
						.range([minradius, maxradius]);
					points.data(data)
						.transition()
						.duration(1000)
						.attr('r', d => rScale(d[datatype]))
						.attr('cx', d => projection([d.longitude, d.latitude])[0])
						.attr('cy', d => projection([d.longitude, d.latitude])[1])
						.attr('fill', circlecolor)
						.attr('opacity', 0.5)
						.attr('stroke', 'black')
						.style("stroke-width", "0.5px");
					// Legend
					var legend = []
					var gap = 40;
					if (datatype == 'magnitude') {
						gap = 50;
						data.forEach(d => {
							legend.push(d[datatype])
						});
					}
					else {
						legend.push(d3.min(data, function(d) {return d[datatype]}))
						legend.push(d3.quantile(data.map(function(d) { return d[datatype];}).sort(d3.ascending),.6))
						legend.push(d3.quantile(data.map(function(d) { return d[datatype];}).sort(d3.ascending),.92))
						legend.push(d3.max(data, function(d) {return d[datatype]}))
					}
					legend = new Set(legend)
					legend = Array.from(legend).sort(d3.ascending)
					legnedpoint.data(legend)
						.transition()
						.duration(1000)
						.attr("cx", width - padding * 18)
						.attr("cy", (d, i) => 10 * padding + i*gap)
						.attr("r", d => rScale(d))
						.style("fill", circlecolor)
						.attr('opacity', 0.9)
						.attr('stroke', '#66FF66')
						.style("stroke-width", "1px");
					legendtext.data(legend)
						.transition()
						.duration(1000)
						.attr("x", width - padding * 15)             
						.attr("y", (d, i) => 10 * padding + i*gap + 5)
						.text(d => d)
						.attr("fill", textcolor);
                    legnedtitle.transition()
                        .duration(1000)
                        .attr("x", width - padding * 20)             
                        .attr("y", 7 * padding)
                        .text(datatype.toUpperCase())
                        .attr("fill", textcolor);
				  })
	
            })
	});
}

var geoPlot2=function(filePath){
	var textcolor = "rgb(0, 255, 115)"
	let parseDate = d3.timeParse("%d-%m-%Y %H:%M")
	var rowConverter = function(d){
		return {
			magnitude: parseInt(d.magnitude),
			year: parseDate(d.date_time).getFullYear(),
			longitude:  parseFloat(d.longitude),
			latitude:  parseFloat(d.latitude),
			depth: parseInt(d.depth)
		}
	}
	d3.csv(filePath, rowConverter).then(function(data){
		console.log(data)
		var margin = {top: 20, right: 20, bottom: 20, left: 20};
		var width = 1500 - margin.left - margin.right;
		var height = 800 - margin.top - margin.bottom;
		var padding = 10;
		var minradius = 5;
		var maxradius = 20;
		var scale = 200;
		var datatype = 'magnitude'
		var rScale = d3.scaleLinear()
				.domain([d3.min(data, function(d) { return d[datatype]; }), 
						d3.max(data, function(d) { return d[datatype]; })])
				.range([minradius, maxradius]);
		const projection  = d3.geoNaturalEarth1()
				.translate([width/2, height/2])
				.scale(scale);                   
		const pathgeo = d3.geoPath().projection(projection);
		var svg = d3.select("#geo_plot2").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
		svg.append('path')
				.attr('class', 'sphere')
				.attr('d', pathgeo({ type: 'Sphere' }))
				.attr('fill', '#0066CC')
		var n = data.length
        var link = "sign.png"
		data.sort((a, b) => (a.year, b.yera))
		const worldmap = d3.json("world.json")
            .then(map => {
                svg.selectAll('path')
                    .data(map.features)
                    .enter()
                    .append('path')
                    .attr('d', pathgeo)
                    .attr('fill', '#50BFE6')
                    .style("stroke", "white")
                    .style("stroke-width", "1px");
                var points = svg.selectAll('circle')
                    .data(data)
                    .enter()
                    .append('image')
                // Add restart for animation
				var animation = function() {
                    points.transition()
					.duration(1000)
					.delay(function(d, i) { return i * 10000 / n; })
                    .attr("xlink:href", link)
                    .attr('x', d => projection([d.longitude, d.latitude])[0])
                    .attr('y', d => projection([d.longitude, d.latitude])[1])
                    .attr("width", d => rScale(d[datatype]) * 3)
                    .attr("height", d => rScale(d[datatype]) * 3)
                    .attr('fill', '#FD5B78')
                    .attr('opacity', 1)
                    .attr('stroke', 'black')
                    .style("stroke-width", "0.5px");
                };
                animation();
                d3.select("#replay")
                    .on("click", function() {
                        points.interrupt();
                        points.attr("opacity", 0);
                        animation();
                    });
                // Add title
                svg.append("text")
                    .attr("x", (width / 2))             
                    .attr("y", margin.top + 30)
                    .attr("text-anchor", "middle")  
                    .style("font-size", "16px")
                    .text("Animation for Globel Geomap for Large Earthquakes From 1/1/2001 to 1/1/2023")
                    .attr("font-family", "Monaco")
					.attr("fill", textcolor);
                // Add legend title
                svg.append("g")
                    .append("text")
                    .attr("x", width - padding * 20)             
                    .attr("y", 7 * padding)
                    .text(datatype.toUpperCase())
                    .attr("fill", textcolor);
                // Legend
                var legend = []
                data.forEach(d => {
                    legend.push(d[datatype])
                });
                legend = new Set(legend)
                legend = Array.from(legend).sort(d3.ascending)
                var legnedpoint = svg.append("g")
                    .selectAll("image")
                    .data(legend)
                    .enter().append("image")
                    .attr("xlink:href", link)
                    .attr("x", (d, i) => width - padding * 18 - i*5)
                    .attr("y", (d, i) => 10 * padding + i*50)
                    .attr("width", d => rScale(d) * 3)
                    .attr("height", d => rScale(d) * 3) 
                    .style("fill", '#FD5B78')
                    .attr('opacity', 1)
                    .attr('stroke', 'black')
                    .style("stroke-width", "0.5px");
                var legendtext = svg.append("g")
                    .selectAll("text")
                    .data(legend)
                    .enter()
                    .append("text")
                    .attr("x", width - padding * 13)             
                    .attr("y", (d, i) => 10 * padding + i*60 + 10)
                    .text(d => d)
					.attr("fill", textcolor);
            })
	});
}

var boxPlot=function(filePath){
    var textcolor = "rgb(0, 255, 115)"
    var rowConverter = function(d){
        return {
            magnitude: parseInt(d.magnitude),
			tsunami: d.tsunami
        }
    }
    d3.csv(filePath, rowConverter).then(function(data){
        console.log(data)
        var margin = {top: 20, right: 20, bottom: 20, left: 20};
        var width = 800 - margin.left - margin.right;
        var height = 600 - margin.top - margin.bottom;
        var padding = 60;
        var innerparding = 1;
        var outerpadding = 0.5;
        var groups = d3.rollups(data, 
                    v => [d3.min(v, d => d.magnitude), 
                        d3.quantile(data.map(function(d) { return d.magnitude;}).sort(d3.ascending),.25),
                        d3.quantile(data.map(function(d) { return d.magnitude;}).sort(d3.ascending),.5),
                        d3.quantile(data.map(function(d) { return d.magnitude;}).sort(d3.ascending),.75),
                        d3.max(v, d => d.magnitude)], 
                    d => d.tsunami)
        var sumstat = []
        groups.forEach((d, i) => {
            var stat = {}
            var each = {}
            stat['q1'] = d[1][1];
            stat['median'] = d[1][2];
            stat['q3'] = d[1][3];
            stat['interQuantileRange'] = d[1][3] - d[1][1];
            stat['min'] = d[1][0];
            stat['max'] = d[1][4]
            each.key = d[0]
            each.value = stat
            sumstat.push(each)
        })
        console.log(sumstat)
        var xScale = d3.scaleBand()
                .domain(data.map(function(d){return d.tsunami}))
                .range([padding, width - padding])
                .paddingInner(innerparding)
    			.paddingOuter(outerpadding);
        var yScale = d3.scaleLinear()
                .domain([d3.min(data, function(d) { return d.magnitude; }) - 1, 
                    d3.max(data, function(d) { return d.magnitude; })])
                .range([height - padding, padding]);
        var svg = d3.select("#box_plot").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);
		svg.selectAll("vertLines")
				.data(sumstat)
				.enter()
				.append("line")
				  .attr("x1", function(d){return(xScale(d.key))})
				  .attr("x2", function(d){return(xScale(d.key))})
				  .attr("y1", function(d){return(yScale(d.value.min))})
				  .attr("y2", function(d){return(yScale(d.value.max))})
				  .attr("stroke", textcolor)
                  .attr("stroke-width", "2px")
				  .style("width", 40)
        var boxWidth = 100
        svg.selectAll("boxes")
                .data(sumstat)
                .enter()
                .append("rect")
                    .attr("x", function(d){return(xScale(d.key)-boxWidth/2)})
                    .attr("y", function(d){return(yScale(d.value.q3))})
                    .attr("height", function(d){return(yScale(d.value.q1)-yScale(d.value.q3))})
                    .attr("width", boxWidth )
                    .attr("stroke", "#F1E788")
                    .attr("stroke-width", "0.5px")
                    .style("fill", "#4570E6")
        svg.selectAll("medianLines")
                .data(sumstat)
                .enter()
                .append("line")
                    .attr("x1", function(d){return(xScale(d.key)-boxWidth/2) })
                    .attr("x2", function(d){return(xScale(d.key)+boxWidth/2) })
                    .attr("y1", function(d){return(yScale(d.value.median))})
                    .attr("y2", function(d){return(yScale(d.value.median))})
                    .attr("stroke", "#DA2C43")
                    .attr("stroke-width", "2px")
                    .style("width", 100)
        const xAxis = d3.axisBottom().scale(xScale);
        const yAxis = d3.axisLeft().scale(yScale);
        svg.append("g")
                .call(xAxis)
                .attr("transform", "translate(0," + (height-padding) + ")")
                .selectAll("text")
                .attr("font-size", "15px")
        svg.append("g")
                .call(yAxis)
                .attr("transform", "translate(" + padding + ",0)")
        svg.append("text")
                .attr("x", (width / 2))             
                .attr("y", margin.top)
                .attr("text-anchor", "middle")  
                .style("font-size", "16px")
                .text("The Box Plot for Magnitude of Earthquakes That Cause Tsunami or Not")
                .attr("font-family", "Monaco")
                .attr("fill", textcolor);
        svg.append("text")
                .attr("class", "x label")
                .attr("text-anchor", "end")
                .attr("x", (width / 2)+50)
                .attr("y", height + margin.bottom/5 - 30)
                .text("Tsunami(1) or Not(0)")
                .attr("fill", textcolor);
        svg.append("text")
                .attr("class", "y label")
                .attr("text-anchor", "end")
                .attr("transform", "rotate(-90)")
                .attr("y", -margin.left + 40)
                .attr("x", -height / 2 + 80)
                .text("The Magnitude")
                .attr("fill", textcolor);
        // Legend
        // svg.append("g")
        //     .selectAll("lines")
        //     .append("line")
        //     .attr("x", width - padding * 20)
        //     .attr("y", 10 * padding + 60)
        //     .attr("stroke", "red")
        //     .attr("stroke-width", "2px")
        //     .style("width", 100)
    });
}
