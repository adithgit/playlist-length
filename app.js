require('dotenv').config();
const { urlencoded } = require('body-parser');
const express = require('express');
const ejs = require('ejs');
const axios = require('axios');
const app = express();

app.set('view engine','ejs');
app.use(urlencoded({extended : true}));
app.use(express.static('/public'))

const playlistBaseURL = "https://youtube.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&key="+process.env.API_KEY+"&playlistId="; 

const videoBaseURL = "https://youtube.googleapis.com/youtube/v3/videos?part=contentDetails&key="+process.env.API_KEY;


const videoArr = [];
const videoDur = [];
let totalSeconds = 0;

let playlistURL = "";

// POST request getting the playlist URL and parsing it.

app.post('/get-data',async (req,res)=>{
    
    // Get the ID of playlist using URLSearchparam class 
    const params = new URLSearchParams(req.body.playlistURL);
    const playlistID =params.get('https://www.youtube.com/playlist?list')

    // Concat the ID with base API calliPLxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Yng URL along with API_KEY
    playlistURL = playlistBaseURL+playlistID;

    // Find all the videos in playlist and push them to VideoArr
    getAllVideos(playlistURL, function(){

        // Find the duration of all videos in the VideoArr and push them to videoDur
        getVideoLength(function(){

            // Conver all the  PTMS formats in videoDur array to seconds and add them to totalSeconds variable
            convertToSeconds( function(){

                // Convert the totalSeconds to HH:MM:SS format
                var date = new Date(null);
                date.setSeconds(totalSeconds);
                const result = date.toISOString().substr(11,8);
                res.render('index',{result:"The length of playlist is :- "+result});
            })
        })
    });
})

app.get('/' ,(req,res) =>{
    res.render('index')
})


// Find all the videos in the playlist with given ID

function getAllVideos(url, callback){
    axios.get(url).then((res)=>{
        videoArr.push(...res.data.items)
        if(res.data.nextPageToken){
            getAllVideos(playlistURL+"&pageToken="+res.data.nextPageToken, callback); 
        }else{
            callback();
        }
    })
}

// Find the length of all videos and push them to videoDur array

function getVideoLength(callback){

if(videoArr.length==0){
    callback();
}else{
    const video = videoArr.pop();
    const videoURL  =  videoBaseURL+"&id="+video.contentDetails.videoId;
    axios.get(videoURL).then( (res)=>{

        // Recursive calls until array is empty

       if( res.data.items[0] ){
           videoDur.push(res.data.items[0].contentDetails.duration);
           getVideoLength(callback);
       }else{
           getVideoLength(callback)
       }
    })
    }
}



// Convert all the element in videoDur array to seconds and add all of them to totalSeconds variable 

function convertToSeconds(callback){
    if(videoDur.length == 0 ){
        callback();
    }else{
    var duration = videoDur.pop();
    var match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

    match = match.slice(1).map(function(x) {
      if (x != null) {
          return x.replace(/\D/, '');
      }
    });
  
    var hours = (parseInt(match[0]) || 0);
    var minutes = (parseInt(match[1]) || 0);
    var seconds = (parseInt(match[2]) || 0);

    
    totalSeconds += hours * 3600 + minutes * 60 + seconds;
    convertToSeconds(callback);
}
}




app.listen(3000|| process.env.PORT ,()=>{
    console.log("Listening on port 3000");
})