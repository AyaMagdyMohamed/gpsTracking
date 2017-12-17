


$(document).ready(function() {
    console.log("tesssst")
    var url = document.location.href,
    params = url.split('?')[1].split('&'),
    data = {}, tmp;
for (var i = 0, l = params.length; i < l; i++) {
     tmp = params[i].split('=');
     data[tmp[0]] = tmp[1];
     data[tmp[1]] = tmp[2];
     data[tmp[2]] = tmp[3];
}
console.log("urlllllll",data.lat,data.long);

var arrOFPositins = [{"lat":30.061887,"long":31.33747900000003},{"lat":30.061978,"long":31.337738},{"lat":30.062210, "long":31.339283},{"lat":30.062328,"long": 31.340105},{"lat":30.062457,"long":31.341140},{"lat":30.062578,"long": 31.342063},{"lat":30.062671, "long":31.342835},{"lat":30.062727, "long":31.343479},{"lat":30.062718,"long": 31.343726}]

var socket = io.connect('http://localhost:3000');
var savedMarkers = [];


var myLatlng = new google.maps.LatLng(data.lat,data.long);
var myOptions = {
    zoom: 15,
    center: myLatlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
}
var map = new google.maps.Map(document.getElementById("map"), myOptions);
for (var i = 0; i < arrOFPositins.length; i++) {  
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(arrOFPositins[i].lat,arrOFPositins[i].long),
      map: map,
      icon: 'static/GoogleMapsMarkers/yellow_MarkerB.png'
     
    });

    savedMarkers.push(marker);
}
var flightPlanCoordinates=[];
var marker = new SlidingMarker({
    position: myLatlng,
    map: map,
    duration: 6000,
    title:data.trackId
  });

  
  flightPlanCoordinates.push( {lat: Number(data.lat), lng:Number(data.long)}
  )
function moveCursor(socketData)
{
    console.log("--------------data-------------")
    console.log(socketData.id);
    console.log(socketData.lat);
    console.log(socketData.long);
    
            
                console.log('just funna move it...');
                marker.setPosition(new google.maps.LatLng(socketData.lat,socketData.long));
               
                    flightPlanCoordinates.push( {lat: Number(socketData.lat), lng:Number(socketData.long)}
                    )
                    console.log("size issssssssss",flightPlanCoordinates.length)
                    if(flightPlanCoordinates.length==2)
                    {
                        
                        var flightPath = new google.maps.Polyline({
                            path: flightPlanCoordinates,
                            
                            strokeColor: '#FF0000',
                            strokeOpacity: 1.0,
                            strokeWeight: 2
                          }); 
                          flightPath.setMap(map);
                          //map.fitBounds(latLngBounds);
                          var temp=flightPlanCoordinates[1];
                          flightPlanCoordinates=[temp]
                          
                    }
                

}

socket.on('data', function(socketData) {
    
            // setInterval(moveCursor(data),10000);
                    
            if((socketData.id==data.trackId)==true)
               moveCursor(socketData)
            console.log("dataaa",socketData.id)
            console.log("comparing",(socketData.id==data.trackId))
     
        });


//TODO
// based on status come with socket change marker color
// change popup content to info come from socket
socket.on('search', function(lat,long) {

    
    console.log("inside search");
    var infowindow = new google.maps.InfoWindow();

    for(var i=0;i<savedMarkers.length;i++)
    {
        
  
     // console.log(lat,"     ",long)
      //console.log(savedMarkers[i].getPosition().lat(),"--------",savedMarkers[i].getPosition().lng())
      if(savedMarkers[i].getPosition().lat()==lat&&savedMarkers[i].getPosition().lng()==long)
      savedMarkers[i].setIcon('static/GoogleMapsMarkers/green_MarkerR.png')
      else
         console.log(false)

       google.maps.event.addListener(savedMarkers[i], 'click', (function(marker, i) {
            return function() {
              infowindow.setContent("info: sold");
              infowindow.open(map, marker);
            }
          })(savedMarkers[i], i));
    }
   
             
                });
})

