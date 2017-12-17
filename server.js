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
var arrOFPositins= new Array();
var listOfPositions={};
var tracks={};
var tracksIDs={};
var tracksSocketIDs={};

app.use('/static', express.static(__dirname + "/public"));


 async  function getData ()
{

  var bucket;
 await db.model("track_coordinates").find({track:"5a23e773cf96e91804403917"},{location:1,_id:0}).sort({bucket:-1}).limit(1).then(function(data)
  {
  
    console.log("bucket num ",data[0].location.length);
    bucket=data[0].location.length; 
  
    
  }

 )

 return bucket ;

 
}

app.get('/test3',function(req,resp)
{ 
  getData().then(function(data)
{
  console.log(data);
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
  db.model("users").findOne({"userID":userId},{"_id":1},function(err,data)
{
   
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

io.on('connection', function(socket){

  var id=shortid.generate();
  let insertObj = new insertInDB();
  var trackObjectId;  

  console.log('a user connected');
  console.log(socket.id)
  
  socket.on('startTrack', function () {
    
    console.log("hello user"); 
    console.log("trackID",id);
    socket.emit('startTrack',id);

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

 socket.on("search",function(lat,long)
{
  socket.broadcast.emit("search",lat,long);

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


io.set('heartbeat timeout', 4000); 
io.set('heartbeat interval', 2000);    