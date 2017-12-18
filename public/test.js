


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

var arrOFPositins = [];
var socket = io.connect('http://localhost:3000');
var savedMarkers = [];
var myLatlng = new google.maps.LatLng(data.lat,data.long);
var myOptions = {
    zoom: 15,
    center: myLatlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
}
var map = new google.maps.Map(document.getElementById("map"), myOptions);
var flightPlanCoordinates=[];
var marker = new SlidingMarker({
    position: myLatlng,
    map: map,
    duration: 6000,
    title:data.trackId
  });


$.get("savedPlaces", function(data){
    //console.log("Data: " + data );
    arrOFPositins=data
    for (var i = 0; i < arrOFPositins.length; i++) { 
        
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(arrOFPositins[i].lat,arrOFPositins[i].long),
          map: map,
          icon: 'static/GoogleMapsMarkers/yellow_MarkerB.png',
          title:arrOFPositins[i].lat+","+arrOFPositins[i].long
         
        });
    
        savedMarkers.push(marker);
    }
  
});


  
flightPlanCoordinates.push( {lat: Number(data.lat), lng:Number(data.long)})
  
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
socket.on('search', function(lat,long,info) {

    
    console.log("inside search");
    console.log("info",info)
   
    var infowindow = new google.maps.InfoWindow();
    var item={};

    item = savedMarkers.find(item => item.getPosition().lat() == lat&&(String(item.getPosition().lng()).slice(0,long.length))==long);
    console.log("item",typeof(item))
    if(typeof(item)!='object')
    {
        console.log("inside if for push ");
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat,long),
            map: map,
            icon: 'static/GoogleMapsMarkers/blue_MarkerB.png'
           
          });
          
      
          
    }
    for(var i=0;i<savedMarkers.length;i++)
    {
        
      //Note when markers saved put extra digits on longitude
      console.log(lat,"     ",long)
     // console.log(savedMarkers[i].getPosition().lat(),"--------",savedMarkers[i].getPosition().lng())
      if(savedMarkers[i].getPosition().lat()==lat&&(String(savedMarkers[i].getPosition().lng()).slice(0,long.length))==long)
      {
        savedMarkers[i].setIcon('static/GoogleMapsMarkers/green_MarkerR.png');
        google.maps.event.addListener(savedMarkers[i], 'click', (function(marker, i) {
            return function() {
              infowindow.setContent(info);
              infowindow.open(map, marker);
            }
          })(savedMarkers[i], i));
       
      }
      else
         console.log(false)

      
    }

    savedMarkers.push(marker);
   
   
             
});
})

