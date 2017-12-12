$(document).ready(function() {


	 console.log("tesssst")

    var socket = io.connect('http://localhost:3000');
    
    //Used to remember markers
	var savedMarkers = {};

	var myLatlng = new google.maps.LatLng(30.020122, 31.305276);
    var myOptions = {
        zoom: 10,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
    }
	var map = new google.maps.Map(document.getElementById("map"), myOptions);
	
	function moveCursor(data)
	{
		console.log("--------------data-------------")
        console.log(data.id);
        console.log(data.lat);
		console.log(data.long);
		
				if(savedMarkers.hasOwnProperty(data.id)) {
					console.log('just funna move it...');
					savedMarkers[data.id].setPosition(new google.maps.LatLng(data.lat,data.long));
				} else {

						if (Object.keys(savedMarkers).length==0)
						{
							map.setCenter(new google.maps.LatLng(data.lat,data.long));
							
						}
						var marker = new SlidingMarker({
							position: new google.maps.LatLng(data.lat,data.long),
							title:data.id,
							duration: 6000,
							map:map,
							draggable:true
			         	});	
					savedMarkers[data.id] = marker;
					addTask(data.id);	
				}
		
	}
	var addTask = function (id) {
		
			var newCheckbox = document.createElement("input");
			newCheckbox.type = "checkbox";
			newCheckbox.value = id;
			document.getElementById("list").appendChild(newCheckbox);
		
			var label = document.createElement('label');
			label.htmlFor = id;
			label.appendChild(document.createTextNode(id));
		
			document.getElementById("list").appendChild(label);
			document.getElementById("list").appendChild(document.createElement("br"));
		}
    socket.on('data', function(data) {

		// setInterval(moveCursor(data),10000);
				
		
		moveCursor(data)
		
	});

	function randRange(min, max) {
		return Math.random() * (max - min) + min;
	}


}
)