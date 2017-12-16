function getTrails(){
	
	console.log("starting ajax");

	var key = "XUuOf3VXVkmshrHJYmJzcpGFl6Qgp1TZAeLjsnx7RxEWfCbevw";
	var limit = 30;

	var city_auto = $("#city-autocomplete").val();
	var city_prop = city_auto.split(',');
	var city = city_prop[0];

	var settings = {
	  "async": true,
	  "crossDomain": true,
	  // "url": "https://trailapi-trailapi.p.mashape.com/?limit="+limit+"&q%5Bcity_cont%5D="+city,
	  "url": "https://trailapi-trailapi.p.mashape.com/?limit="+limit+"&q%5Bactivities_activity_type_name_eq%5D=hiking&q%5Bcity_cont%5D="+city,  "method": "GET",
	  "headers": {
	    "x-mashape-key": key,
	    "accept": "text/plain",
	    "cache-control": "no-cache",
	  }
	}

	$.ajax(settings)
	.done(function (response_trails) {
	 	console.log(response_trails.places);
	 	renderTrails(response_trails.places);


	})
	.fail(function(error){
    	console.log(error.code);
    });
}

	// Weather global variable
	var lon = 0;
	var lat = 0;


function renderTrails(data){

	$("#trails-result").empty();

	for(var i=0; i<data.length; i++){


		var name = data[i].name;
		var descr = data[i].description;
		var directions = data[i].directions;
		var id = data[i].unique_id;
		var country = data[i].country;

		// Give weather values
		lon = data[i].lon;
		lat = data[i].lat;

		var trail_card = $("<div>").addClass("card trail")
		trail_card.attr("uid", id).attr("city", data[i].city);
		
		var trail_card_name = $("<div>").addClass("card-header").html( name );
		trail_card.append(trail_card_name);

		var trail_features_list = $("<ul>").addClass("list-group list-group-flush");

		if( descr ){
			var tr_descr = $("<li>").addClass("list-group-item trail_descr").html( descr );
			trail_features_list.append(tr_descr);
		}
		if( directions ){
			var dir_decoded = directions.replace(/&lt;br \/&gt;/g, ' ');
			var tr_dir = $("<li>").addClass("list-group-item trail_dir").html( dir_decoded );
			trail_features_list.append(tr_dir);
		}
		
		trail_card.append(trail_features_list);
		$("#trails-result").append(trail_card);

	}
}

var current_tab = null;
var tabs_nav = $(".tabs-nav");

$('.tab').hide();
$(".tabs").hide();

tabs_nav.find('.tabs-anchor').on("click", function(event){

	var city_data = $("#city-autocomplete").val();

	if(city_data != "" && this.id == "trails"){
		getTrails();
	}
	else if(this.id == "weather"){
		getWeather();
		
	}

	tabs_nav.find('.current');
	tabs_nav.find('.current').removeClass('current');
	$(this).addClass('current');
	var id = "#"+ this.id + "-result";
	$("#"+this.id+"-result").show().siblings().hide();		


});

$("#city-search").on("click", function(){
	event.preventDefault();
	var city_data = $("#city-autocomplete").val();
	if(city_data != ""){
		$(".tabs").show();
		$(".current").click();
	}
});

function getWeather() {
	console.log("run weather");

	var settings = {
		"url": "https://api.openweathermap.org/data/2.5/forecast?lat="+lat+"&lon="+lon+"&APPID=fd262fdfe1750a09395cde502e14e98a",
		// "method": "get"
	};
	$.ajax(settings)
	.done(function(weather) {
		console.log(weather);
		renderWeather(weather.list);
	})
}

function renderWeather(data){
	for(var i=0; i<data.length; i++){
		var date_time = data[i].dt_txt;
		var [date, time] = date_time.split(" ");
		// var date = data[i].dt_txt;
		var fTemp = Math.floor(9*(data[i].main.temp_max - 273)/5 +32);
		var weather_line = $("<p>");
		weather_line.html(date + "<br>"+time+"<br>"+"max temp:"+fTemp+"&deg;");
		$("#weather-result").append(weather_line);
	}
}
