const { urlencoded } = require('body-parser');
const express = require('express');
const https = require("https");
const axios = require('axios');
const { rejects } = require('assert');
const app = express();

app.use(urlencoded({extended : true}));

const playlistURL = "https://youtube.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&playlistId=PLeZN5uWYmxWfKMV0Aqgu0hQ90oWkAWtbC&key="+process.env.API_KEY; 

const videoURL = "https://youtube.googleapis.com/youtube/v3/videos?part=contentDetails&id=0_6RDuiUyFk&key="+process.env.API_KEY;

const videoArr = [];
const videoDur = [];
app.get('/',async (req,res)=>{
    getAllVideos(playlistURL, function(){
        getVideoLength( function(){
            res.send("Video length finished")
        } )
    });
    
})

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


app.listen(3000 ,()=>{
    console.log("Listening on port 3000");
})



// https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Y