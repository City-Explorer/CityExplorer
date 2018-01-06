
// Initialize Firebase
var config = {
	apiKey: "AIzaSyBQNQixtPcDY1FVSTf98j_1QrYQcJwBrfk",
	authDomain: "city-explorer-1513208628803.firebaseapp.com",
	databaseURL: "https://city-explorer-1513208628803.firebaseio.com",
	projectId: "city-explorer-1513208628803",
	storageBucket: "city-explorer-1513208628803.appspot.com",
	messagingSenderId: "701212733449"
};
firebase.initializeApp(config);

var db = firebase.database();

var google_key = "";
var weather_key ="";
var food_key="";

db.ref('/api_keys').on("value", function(snap_google){
	google_key = snap_google.val().google;
	weather_key = snap_google.val().weather;
	food_key = snap_google.val().food;

	$.getScript("https://maps.googleapis.com/maps/api/js?key="+google_key+"&libraries=places&language=en")
		.done(function( script, textStatus ) {
			// === city autocomplete====
			var input = document.getElementById('city-autocomplete');
			var autocomplete = new google.maps.places.Autocomplete(input,{types: ['(cities)']});
			google.maps.event.addListener(autocomplete, 'place_changed', function(){
			    var place = autocomplete.getPlace();
			});

		    console.log( textStatus );
		})
		.fail(function( jqxhr, settings, exception ) {
			console.log("Triggered ajaxError handler.");

	});
});

//geolocation global variables
var city, latitude, longitude;
var map;
var service;

function renderMap(divMapId) {

	var mapProp = {
	    center: new google.maps.LatLng(latitude,longitude),
	    zoom: 10,
	    mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById(divMapId),mapProp);
}

function addTrailMarker(place) {

	var marker = new google.maps.Marker({
        position : place.geometry.location,
        map : map,
        title : place.name,
        url : "#"+place.place_id
	});
	//city_marker.push({id: place.place_id, m: marker});

	marker.setIcon('assets/images/green_marker.png');
	// marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');

  	google.maps.event.addListener(marker, 'click', function() {
  		//move right tab content on current location
  		//console.log("marker clicked "+marker.url);
  		$("#trails-result .right").animate({
        	scrollTop: $("#trails-result .right").scrollTop() + $(marker.url).offset().top -150 
        },
        1000);
  	});
}

function getGoogleTrails(){

    city = document.getElementById('city-autocomplete').value;

	//get latitude & longitude
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode({ 'address': city }, function (results, status) {
		
		console.log(status, results);
    	
    	if (status == google.maps.GeocoderStatus.OK) {
			latitude = results[0].geometry.location.lat();
			longitude = results[0].geometry.location.lng();

			var city_loc = new google.maps.LatLng(latitude, longitude);

			renderMap("googleMapTrails");

			var request = {
				location: city_loc,
				radius: '50',
				query: city+' walking trails',
			};

			service = new google.maps.places.PlacesService(map);
			service.textSearch(request, renderGoogleTrails);
		}
	});

}

function renderGoogleTrails(results, status) {

	if (status == google.maps.places.PlacesServiceStatus.OK) {

		$("#trails-result .right").empty();

	    for (var i = 0; i < results.length; i++) {
	    	var place = results[i];
	    	//console.log(place);

			addTrailMarker(place);

			var name = place.name;
			var address = place.formatted_address;
			var id = place.place_id;
			var rating = place.rating;
			var imageRef="";
			if(place.photos){
				imageRef = place.photos[0].getUrl({maxWidth: 500});
			}

			var trail_card = $("<div>").addClass("card trail")
			trail_card.attr("id", id);
			
			var trail_card_name = $("<div>").addClass("card-header").html( name );
			var map_icon = $("<img>").attr("src", "assets/images/google_marker2.png").addClass("trail_marker");
			trail_card_name.prepend(map_icon);
			trail_card.append(trail_card_name);

			var trail_features_list = $("<ul>").addClass("list-group");

			if(imageRef) {
				var trail_image = $("<img>").attr("src", imageRef).attr("alt", "place photo");
				trail_image.addClass("img-trail");
				var trail_descr = $("<li>").addClass("list-group-item trail_img");
				trail_descr.prepend(trail_image);
				trail_features_list.append(trail_descr);
			}
			// add raiting and hours
			if( rating ){
				var stars_size = Math.max(0, (Math.min(5, rating))) * 16;
				var rating_stars = $("<span>").html("<span style='width:"+stars_size+"px'></span>");
				rating_stars.addClass("stars");
				var trail_rating = $("<li>").addClass("list-group-item trail_rating").html("<span>"+rating+"</span>");
				trail_rating.append( rating_stars );
				trail_features_list.append(trail_rating);
			}

			if( address ){
				var trail_address = $("<li>").addClass("list-group-item trail_descr").html( address );
				trail_features_list.append(trail_address);
			}

			//place.opening_hours{}

			trail_card.append(trail_features_list);
			$("#trails-result .right").append(trail_card);

		}
	}
}

function getFood(){
	
	console.log("starting Yelp API");

	var city_auto = $("#city-autocomplete").val();
	var city_prop = city_auto.split(',');
	var city = city_prop[0];

	// const proxyurl = "https://cors-anywhere.herokuapp.com/";
	const proxyurl = "https://shielded-hamlet-43668.herokuapp.com/";

	var settings = {
	  "async": true,
	  "crossDomain": true,
	  // "url": "https://trailapi-trailapi.p.mashape.com/?limit="+limit+"&q%5Bcity_cont%5D="+city,
	  "url":proxyurl+"https://api.yelp.com/v3/businesses/search?location="+city,
	  "method":"GET",
	  "headers": {
	  	"Authorization":"Bearer jtdOtf_Nw2aFD-KE_uZwAWGiQB2cNb9sApKVKV_3Bzbhlg0fjZ6lIqmNdziHcaBr47Hd9F3Myyt2eWEm_HmNmoRjMA2bc_znA3M1kYzLKcFxJJ-Mx9wLkmd68JswWnYx",
	  }
	}

	$.ajax(settings)
	.done(function (response_food) {
	 	console.log(response_food);
	 	renderFood(response_food);


	})
	.fail(function(error){
    	console.log(error.code);
    });
}

function renderFood(data){

	$("#food-result").empty();

	for(var i=0; i<data.businesses.length; i++){

		var name = data.businesses[i].name;
		var descr = "Rating: "+data.businesses[i].rating;
		var directions = "Address: "+data.businesses[i].location.address1+","+data.businesses[i].location.city+","+data.businesses[i].location.zip_code;
		var id = data.businesses[i].id;
		var country = data.businesses[i].location.country;


		var food_card = $("<div>").addClass("card trail")
		food_card.attr("uid", id).attr("city", data.businesses[i].location.city);
		var food_card_name = $("<div>").addClass("card-header").html( name );
		food_card.append(food_card_name);
		$("#food-result").append(food_card);
	}
}
// === WEATHER (Alyna) ================== 
function getWeather() {
	console.log("run weather");

	var settings = {
		"url": "https://api.openweathermap.org/data/2.5/forecast?lat="+latitude+"&lon="+longitude+"&APPID="+weather_key,
	};
	$.ajax(settings)
	.done(function(weather) {
		console.log(weather);
		renderWeather(weather.list);
	})
}

function renderWeather(data){

	// console.log(data,"console weather here");

    var weather_table = $('<table>').addClass('weather');

	var first_row = $("<tr>").addClass('time');
	var time_labels = ["&nbsp;", "12:00 am", "3:00 am", "6:00 am", "9:00 am", "12:00 pm", "3:00 pm", "6:00 pm", "9:00 pm"];
	for(var tm = 0; tm<time_labels.length; tm++){
		var time_col = $('<td>').html(time_labels[tm]);
		first_row.append(time_col);
	}
	weather_table.append(first_row);

	var counter = 0;
	for(var w_day=0; w_day<5; w_day++){
		var w_row = $('<tr>');
		var [date, time] =  data[counter].dt_txt.split(" ");
	    var convertedDate = moment(date, "YYYY-MM-DD").format("ddd Do MMM");

		var date_td = $('<td>').addClass('date');
		date_td.html(convertedDate);
		w_row.append(date_td);

		for(var w_tm = 0; w_tm<=21; w_tm+=3){
			var [date, time] =  data[counter].dt_txt.split(" ");
			var fTemp = Math.floor(9*(data[counter].main.temp - 273)/5 +32);

			var [t1, t2, t3] = time.split(':');

			var hum = data[counter].main.humidity;
			var weatherType = data[counter].weather[0].description;
			var icon = data[counter].weather[0].icon;
			
			var w_col = $('<td>');
			if(parseInt(t1) === w_tm){
				counter++;
				// var time_p = $('<p>').addClass('time');
				// time_p.html([time]);

				var temp_p = $('<p>').addClass('temp');
				temp_p.html(fTemp+"&deg;F");

				var hum_p = $('<p>').addClass('hum');
				hum_p.html("hum: "+hum+"%");
				var icon_img = $("<img>").attr("src", "http://openweathermap.org/img/w/"+icon+".png");

				var weatherType_p = $('<p>').addClass('weatherType');
				weatherType_p.html(weatherType);

				// w_col.append(time_p);
				temp_p.append(icon_img);
				w_col.append(temp_p);
				w_col.append(weatherType_p);
				w_col.append(hum_p);

			}
			else{
				w_col.html("&nbsp;");
				//create empty td
			}
			w_row.append(w_col);
		}
		weather_table.append(w_row);
	}

	$("#weather-result").empty();
	$("#weather-result").append(weather_table);

}

//=== end weather =======================

// ====== TABS & Search button =======

var current_tab = "trails";
var tabs_nav = $(".tabs-nav");

tabs_nav.find('.tabs-anchor').on("click", function(event){

	var city_data = $("#city-autocomplete").val();

	if(city_data != "" && this.id == "trails"){
		getGoogleTrails();

	} 
	if(city_data != "" && this.id == "weather"){
		getWeather();
	}
	else if(city_data != "" && this.id == "food"){
		getFood();
	};

	tabs_nav.find('.current').removeClass('current');
	$(this).addClass('current');
	var id = "#"+ this.id + "-result";
	$("#"+this.id+"-result").show().siblings().hide();		

});

$("#city-search").on("click", function(event){

	event.preventDefault();
	
	$("header").find('.frontpage').addClass('top').removeClass('frontpage');
	
	var city_data = $("#city-autocomplete").val();
	if(city_data != ""){
		$(".tabs").show();
		$(".current").click();
	}
});


