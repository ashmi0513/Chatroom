const express = require('express');
const path = require ('path');
const mongoose = require('mongoose');
const app = express();
const server = require('http').createServer(app);
const io = require("socket.io")(server);
app.use(express.static(path.join(__dirname+"/public")));

mongoose.connect("mongodb://localhost:27017/chatDB")
.then(()=> console.log("Connected to chat DB"))
.catch(()=>console.log("Not connected, please  try again"));

const chatSchema = new mongoose.Schema({
    uid:Number,
    chat: {
    username:String,
    text:String }
});

const chatlog = mongoose.model("Chatlog",chatSchema);

io.on("connection", function(socket){
    socket.on("newuser",function(username){
        socket.broadcast.emit("update", username + " joined the conversation");
    });
    
    socket.on("exituser",function(username){
        socket.broadcast.emit("update", username + " left the conversation");
    });

    socket.on("chat",function(message){
        socket.broadcast.emit("chat",message);
        console.log(message);
        let log = new chatlog(message);
        log.insertOne({uid:message.uid},(err)=>{if(err) console.log(err); else console.log("Saved Successfully");})
    });
});

server.listen(5000);

