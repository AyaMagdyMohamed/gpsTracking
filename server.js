var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var shortid = require('shortid');
var ObjectId = require('objectid')
const insertInDB=require('./public/js/insertInDB')
var fs=require("fs");
var db = require('./dbConnection.js');
var swaggerUi = require('swagger-ui-express');
var swaggerDocument = require('./swagger.json');
var bodyParser = require('body-parser');



//var arrOFPositins = [{"lat":30.061887,"long":31.337479},{"lat":30.061978,"long":31.337738},{"lat":30.062210, "long":31.339283},{"lat":30.062328,"long": 31.340105},{"lat":30.062457,"long":31.341140},{"lat":30.062578,"long": 31.342063},{"lat":30.062671, "long":31.342835},{"lat":30.062727, "long":31.343479},{"lat":30.062718,"long": 31.343726}]
var arrOFPositins= [

  {
    "lat": 30.059166,
    "long":31.337057,
    "info":"not found",
    "status":"fail"
  },
  {
      "lat": 30.060166,
      "long": 31.337085,
      "info":"sold",
      "status":"success"
  },
  {
      "lat": 30.061482,
      "long": 31.337726,
      "info":"sold",
      "status":"success"
  },
  {
      "lat": 30.063152,
      "long": 31.336809,
      "info":" sold 3000 amount",
      "status":"success"
  },
  {
      "lat": 30.065624,
      "long": 31.337165,
      "info":"sold 5000 amount",
      "status":"success"
  },
  {
    "lat": 30.066657,
    "long": 31.334881,
    "info":"not found",
    "status":"fail"    
  }

];
var arrOFPositins= [
  
    {
      "lat": 30.059166,
      "long":31.337057,
      "info":"not found",
      "status":"fail"
    },
    {
        "lat": 30.060166,
        "long": 31.337085,
        "info":"sold",
        "status":"success"
    },
    {
        "lat": 30.061482,
        "long": 31.337726,
        "info":"sold",
        "status":"success"
    },
    {
        "lat": 30.063152,
        "long": 31.336809,
        "info":" sold 3000 amount",
        "status":"success"
    },
    {
        "lat": 30.065624,
        "long": 31.337165,
        "info":"sold 5000 amount",
        "status":"success"
    },
    {
      "lat": 30.066657,
      "long": 31.334881,
      "info":"not found",
      "status":"fail"    
    }
  
  ];var arrOFPositins2= [
    
      {
        "lat": 30.043672,
        "long":31.237129,
        "info":"found",
        "status":"success"
      },
      {
          "lat": 30.044851,
          "long": 31.238084,
          "info":"not found",
          "status":"fail"
      },
      {
          "lat": 30.046105,
          "long": 31.240047,
          "info":"sold",
          "status":"success"
      },
      {
          "lat": 30.046764,
          "long": 31.238137,
          "info":" not found",
          "status":"fail"
      },
      {
          "lat": 30.049754,
          "long": 31.239950,
          "info":"sold 2000 amount",
          "status":"success"
      }  
    ];
var listOfPositions={};
var tracks={};
var tracksIDs={};
var tracksSocketIDs={};



app.use('/static', express.static(__dirname + "/public"));

app.get('/savedPlaces',function(req,resp)
{
  //resp.send("hello from saved places");
   db.model('saved_places').find({},{"_id":0},function(err,data)
  {
    resp.send(data);
  })
})

app.get('/test.html',function(req,resp)
{ 
  
  resp.sendfile(__dirname+"/views/test.html");
  
})



app.get('/', function(req, res) {
  
    // res.sendfile(__dirname+"/views/index.html");
    res.sendfile(__dirname+"/views/index.html");

    
  });

app.get('/index2', function(req, res) {
    
      // res.sendfile(__dirname+"/views/index.html");
      res.sendfile(__dirname+"/views/index2.html");
  
      
    });

app.get('/locations', function(req, resp) {
  
  db.model("userlocations").find({},function(err,data){
   
    data.forEach(function(x){
      x.location.forEach(function(y)
      {
        console.log("lat:",y.lat);
        console.log("long:",y.long);
        
      } 
    ) 
   
    })

    var json=JSON.stringify(data);
    resp.end(json);
 
})
  
});


app.get("/getUserTracks/:userId",function(req,resp)
{
  
  //resp.send(req.params.userId);
  var userId=JSON.parse(req.params.userId);
  console.log(userId);
  db.model("users").findOne({"userID":userId},{"_id":true},function(err,data)
{
   if(err)
   console.log(err);
   else
    console.log(data)
  db.model("tracks").find({"userID":data._id},function(err,data)
  {
    if (!err)
          resp.send(data);
    else
          resp.send(err)
  })

})
 

})

app.get("/getUsers",function(req,resp){

   db.model("users").find({},function(err,data)
  {
    if (!err)
       resp.send(data);
    else
       resp.send(err)

  })

})
app.get("/getTracks",function(req,resp){
  
  db.model("tracks").find({},function(err,data)
  {
    
  //  db.model("tracks").populate(data,{path:"userID"},function (err,data) {
  //  console.log(data);
  //  resp.send(data);
  // });


    resp.send(data);
 })
  
  })
app.get("/getTrackData/:trackId",function(req,resp)
{
  var trackId=JSON.parse(req.params.trackId)
 db.model("tracks").find({"trackID":trackId},function(err,data)
 {
   
//   db.model("tracks").populate(data,{path:"userID"},function (err,data) {
//   console.log(data);
//   resp.send(data);
//  });

     resp.send(data);

})

})

app.get("/getUserData/:userId",function(req,resp)
{
  var userId=JSON.parse(req.params.userId)
 db.model("users").findOne({"userID":userId},function(err,data)
 {
    
   console.log(data)
   resp.send(data);

})

})

app.get("/getTrackPoints/:trackId",function(req,resp)
{
  var trackId=JSON.parse(req.params.trackId);
  console.log(trackId);
  db.model("tracks").findOne({trackID:trackId},{"_id":1},function(err,data)
{

  db.model("track_coordinates").aggregate({$match:{"track":db.Types.ObjectId(data._id)}},{$unwind:"$location"},
  function(err,data)
  {
     
    console.log(data)
    resp.send(data);
 
 })

})

})

function doSetTimeout(i,location,ID) {
  setTimeout(function() { io.emit("data",{id:ID,lat:location.lat,long:location.long}); }, 6000*i);
} 
function fireSearchEvent(i,visitedLocation){
  //console.log("inside search event",visitedLocation.lat,visitedLocation.long,info);
  setTimeout(function() { io.emit("search",visitedLocation.lat,visitedLocation.long,visitedLocation.info,visitedLocation.status); }, 8000*i);

}


io.on('connection', function(socket){

  var arr=[];
  var id=shortid.generate();
  let insertObj = new insertInDB();
  var trackObjectId;  

  console.log('a user connected');
  socket.on('startTrack', function (ID) {
    
    console.log("hello user"); 
    //console.log("trackID",id);
    //socket.emit('startTrack',id); uncommet this line after remove simulation part
    // for simulation 
    if(ID==1)
    {
      arr=arrOFPositins;
    }
    else if(ID==2)
    {
      arr=arrOFPositins2;
    }
      for (var i = 0; i < arr.length;i++)
      {
        doSetTimeout((i+1),arr[i],id);
        //for(var i=0;i<arr.length;i++)
        fireSearchEvent((i+1),arr[i]);
      }
      
     
    
    

    var trackModel=db.model("tracks");
    var new_track=new trackModel();
    new_track.trackID=id;
    new_track.startTime= new Date();
    new_track.save(function(err,insertedDocument){

     console.log("insertedTrack",insertedDocument._id);
     trackObjectId=insertedDocument._id;
     if((id in tracksIDs )==false)
     {
       tracksIDs[id]=trackObjectId
   
     }

     if(socket.id in tracksSocketIDs==false)
     {
       tracksSocketIDs[socket.id]=id
     }
    
         
    });    
  });


  //isTrackedInCurrentSocket=true
  //insertInDB.dataInsertion("3");
  var locationsList = [];		
  
 socket.on("location",function(trackId,latitude,longitude){


   io.emit("data",{id:trackId,lat:latitude,long:longitude});
   socket.emit("data2",{id:trackId,lat:latitude,long:longitude});

   console.log("trackId",trackId);
   console.log("latitude",latitude);
   console.log("longitude",longitude); 
   if(socket.id in tracksSocketIDs==false)
   {
     tracksSocketIDs[socket.id]=trackId
   }
  

   // var location={"lat":String(latitude),"long":longitude,"timeSent":(new Date).toISOString()}
  if(trackId!=null)
  {
      locationsList.push({"lat":String(latitude),"long":longitude,"timeSent":new Date()})
   //console.log("INSERT_BUFFER_SIZE",insertInDB.INSERT_BUFFER_SIZE);
  //if(locationsList.length == insertInDB.INSERT_BUFFER_SIZE) {
    if((trackId in tracksIDs )==false)
    {
      tracksIDs[trackId]=trackObjectId
  
    }

    console.log("tracksIDs[trackId]",tracksIDs[trackId])
    insertObj.dataInsertion(tracksIDs[trackId],locationsList);
  }
   //   locationsList.splice(0,locationsList.length) ;

  //}
        tracks[socket.id]=locationsList;

 })

 socket.on("disconnect",async function(){
   console.log("disconnected",socket.id);
   //insertInDB.isTrackedInCurrentSocket = false;
  console.log("track id socketIDS",tracksSocketIDs[socket.id]);
  console.log(tracks[socket.id]);
   if (socket.id in tracks){
      var trackId=tracksSocketIDs[socket.id]
     console.log("tracksIDs[trackId]",tracksIDs[trackId])
     if(tracks[socket.id].length!=0)
        {
         await  insertObj.getLastBucketSizeFromDB(tracksIDs[trackId]).then(function(lastBucketSize)
        {
          console.log("current bucket size",lastBucketSize)
          insertObj.lastBucketSize=lastBucketSize;
        });
         await insertObj.getLastBucketNumberFromDB(tracksIDs[trackId]).then(function(currentBucketNo){

          console.log("current bucket numbeeeeer",currentBucketNo)
          insertObj.currentBucketNo=currentBucketNo;
          console.log(insertObj.currentBucketNo);
          console.log(insertObj.lastBucketSize);
          insertObj.handleExistingTrack(tracksIDs[trackId],tracks[socket.id]);
         });
         
        }
   }
 })


 socket.on("endTrack",function(trackID){


     console.log("inside end track");
     console.log(trackID)
     db.model("tracks").update({"trackID":String(trackID)},{$set:{"endTime":new Date()}},function(err,data)
    {

      if(err)
      console.log(err)
      // else
      // console.log(data);

    });   

 })

 socket.on("search",function(lat,long,info)
{
  socket.broadcast.emit("search",lat,long,info);

})

});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
var files_arr=fs.readdirSync(__dirname+"/models")
files_arr.forEach(function(file){
  require(__dirname+"/models/"+file);
});
server.listen(3000, function(){
  console.log('listening on *:3000');
});

// to dedect disconnect of client in case of no internet after 4 seconds
io.set('heartbeat timeout', 4000); 
io.set('heartbeat interval', 2000);    


process.on('SIGINT', function(){
  db.connection.close(function(){
    console.log("Mongoose default connection is disconnected due to application termination");
     process.exit(0);
    });
});