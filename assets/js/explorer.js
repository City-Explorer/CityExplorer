
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

//getting API keys for db

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

		    console.log( "google lib load: "+textStatus );
		})
		.fail(function( err, settings, exception ) {
			console.log("Triggered ajaxError handler.");

	});
});

//geolocation global variables
// var city, latitude, longitude;
var map;
var service;

var current_city = {
	name : '',
	trails : 0,
	food : 0,
	weather : 0
}

function renderMap(divMapId, latitude, longitude) {

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

function getGoogleTrails(city){

    console.log("~~ Trails new search!");
	//get latitude & longitude
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode({ 'address': city }, function (results, status) {
		
		console.log("geocoder: ", status, results);
    	
    	if (status == google.maps.GeocoderStatus.OK) {
			var latitude = results[0].geometry.location.lat();
			var longitude = results[0].geometry.location.lng();

			var city_loc = new google.maps.LatLng(latitude, longitude);

			renderMap("googleMapTrails", latitude, longitude);

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

	$("#trails-result .right").empty();
	if (status == google.maps.places.PlacesServiceStatus.OK) {

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

function getFood(city_auto){
	
    console.log("~~ Food new search!");

	var city = city_auto.split(',')[0];

	const proxyurl = "https://shielded-hamlet-43668.herokuapp.com/";

	var settings = {
	  "async": true,
	  "crossDomain": true,
	  "url":proxyurl+"https://api.yelp.com/v3/businesses/search?location="+city+"&categories=restaurants,All",
	  "method":"GET",
	  "headers": {
	  	"Authorization":"Bearer jtdOtf_Nw2aFD-KE_uZwAWGiQB2cNb9sApKVKV_3Bzbhlg0fjZ6lIqmNdziHcaBr47Hd9F3Myyt2eWEm_HmNmoRjMA2bc_znA3M1kYzLKcFxJJ-Mx9wLkmd68JswWnYx",
	  }
	}

	$.ajax(settings)
	.done(function (response_food) {
	 	// console.log(response_food);
	 	renderFood(response_food);
	})
	.fail(function(error){
    	console.log(error.code);
    });
}

function get_rstrnt_review(id, i){

	setTimeout(function(){

		const proxyurl = "https://shielded-hamlet-43668.herokuapp.com/";
		var settings = {
		  "async": true,
		  "crossDomain": true,
		  "url":proxyurl+"https://api.yelp.com/v3/businesses/"+id+"/reviews",	  
		  "method":"GET",
		  "headers": {
		  	"Authorization":"Bearer jtdOtf_Nw2aFD-KE_uZwAWGiQB2cNb9sApKVKV_3Bzbhlg0fjZ6lIqmNdziHcaBr47Hd9F3Myyt2eWEm_HmNmoRjMA2bc_znA3M1kYzLKcFxJJ-Mx9wLkmd68JswWnYx",
		  }
		}
		$.ajax(settings)
		.done(function (response_food) {
			if(response_food.reviews && response_food.reviews.length){
			 	var review = response_food.reviews[0].text;
			 	$("#fr_"+id).html('<strong>random review: </strong>'+review);
		 	}
		})
		.fail(function(error){
	    	console.log(error);
		});

	}, 300*i);
}

function renderFood(data){

	$("#food-result").empty();

	for(var i=0; i<data.businesses.length; i++){

		var cur_restaurant = data.businesses[i];

		var food_card = $("<div>").addClass("card trail");
		food_card.attr("uid", cur_restaurant.id).attr("city", cur_restaurant.location.city);

		var food_card_name = $("<div>").addClass("card-header").html(cur_restaurant.name );
		food_card.append(food_card_name);	
		
		food_features_list = $("<ul>").addClass("list-group");

		var food_descr = $("<li>").addClass("list-group-item");
		var imageRef = cur_restaurant.image_url;
		if(imageRef) {
			var food_image = $("<img>").attr("src",cur_restaurant.image_url);
			food_image.addClass("yelp_images fluid");
			food_descr.append(food_image);
		}
		// var food_review = $("<div>").addClass("trail_descr").html(review);
		var food_review = $("<div>").addClass("trail_descr");
		food_review.attr("id", "fr_"+cur_restaurant.id);
		food_descr.append(food_review);

		food_features_list.append(food_descr);

		if( cur_restaurant.rating ){
				var stars_size = Math.max(0, (Math.min(6, cur_restaurant.rating))) * 16;
				var rating_stars = $("<span>").html("<span style='width:"+stars_size+"px'></span>");
				rating_stars.addClass("stars");
				var yelp_rating = $("<li>").addClass("list-group-item trail_rating").html("<span>"+cur_restaurant.rating+"</span>");
				yelp_rating.append( rating_stars );
				food_features_list.append(yelp_rating);
		}

		var address = cur_restaurant.location.display_address.join();
		var food_location = $("<li>").addClass("list-group-item trail_descr").html(address);
		food_features_list.append(food_location);

		food_card.append(food_features_list);
		$("#food-result").append(food_card);

		get_rstrnt_review(cur_restaurant.id, i);

	}
}


// === WEATHER ================== 
function getWeather(city) {

    console.log("~~ Weather new search!");
	//get latitude & longitude
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode({ 'address': city }, function (results, status) {
		
		console.log("geocoder: ", status, results);
    	
    	if (status == google.maps.GeocoderStatus.OK) {
			var latitude = results[0].geometry.location.lat();
			var longitude = results[0].geometry.location.lng();

			var url_str = "https://api.openweathermap.org/data/2.5/forecast?lat=";
			url_str += latitude+"&lon="+longitude+"&APPID="+weather_key;
			$.ajax({url: url_str})
			.done(function(weather) {
				// console.log(weather);
				renderWeather(weather.list);
			});
		}
	});
}

function renderWeather(data){

	// console.log(data,"console weather here");

    var weather_table = $('<table>').addClass('weather');

	var first_row = $("<tr>");
	var time_labels = ["&nbsp;", "12:00 am", "3:00 am", "6:00 am", "9:00 am", "12:00 pm", "3:00 pm", "6:00 pm", "9:00 pm"];
	for(var tm = 0; tm<time_labels.length; tm++){
		var time_col = $('<td>').html(time_labels[tm]);
		if(tm==0) time_col.addClass('empty');
		time_col.addClass('time');
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

				var temp_p = $('<p>').addClass('temp');
				temp_p.html(fTemp+"&deg;F");

				var hum_p = $('<p>').addClass('hum');
				hum_p.html("hum: "+hum+"%");
				var icon_img = $("<img>").attr("src", "http://openweathermap.org/img/w/"+icon+".png");

				var weatherType_p = $('<p>').addClass('weatherType');
				weatherType_p.html(weatherType);

				temp_p.append(icon_img);
				w_col.append(temp_p);
				w_col.append(weatherType_p);
				w_col.append(hum_p);

			}
			else{
				w_col.html("&nbsp;");//.addClass('empty');
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

	var city_name = $("#city-autocomplete").val();

	if( city_name !== "" ){

		if( city_name!== current_city.name){
			reset_visited(city_name);
		}
		if( this.id === "trails" && current_city.trails === 0 ){
			current_city.trails = 1;
			getGoogleTrails(city_name);
		} 
		if( this.id === "weather" && current_city.weather === 0 ){
			current_city.weather = 1;
			getWeather(city_name);
		}
		if( this.id === "food" && current_city.food === 0 ){
			current_city.food = 1;
			getFood(city_name);
		};
	}
	//switch tabs visibility
	tabs_nav.find('.current').removeClass('current');
	$(this).addClass('current');
	var id = "#"+ this.id + "-result";
	$("#"+this.id+"-result").show().siblings().hide();		

});

$("#city-search").on("click", function(event){

	event.preventDefault();
	
	$("header").find('.frontpage').addClass('top').removeClass('frontpage');
	
	var city_name = $("#city-autocomplete").val();
	if(city_name !== "" && city_name!== current_city.name){

		reset_visited(city_name);

		$(".tabs").show();
		$(".current").click();
	}
});

function set_visited(tab){
	current_city[tab] = 1;
}

function reset_visited(city){
	current_city.name = city;
	current_city.trails = 0;
	current_city.food = 0;
	current_city.weather = 0;
}
