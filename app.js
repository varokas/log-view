var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require("redis");
var bodyParser  = require('body-parser');

var REDIS_PORT = 6379;
var REDIS_HOST = "127.0.0.1";
var PORT = 3000;
var LIST_NAME = "log"
var LIST_SIZE = 20

var rClient = redis.createClient(REDIS_PORT, REDIS_HOST);

app.use(express.static('public'));
app.use(bodyParser.json());

app.post('/log', (req,res) => {
   var timestamp = Date.now()
   var data = {timestamp: timestamp, data: req.body};
   var input = JSON.stringify(data);

   rClient.rpush([LIST_NAME, JSON.stringify(data)], (err, rep) => {
      res.send(input)
      io.emit('log_insert', data);
   })
});

app.get('/logs', (req,res) => {
  rClient.lrange(LIST_NAME, -1 - LIST_SIZE + 1, -1, (err, reply) => {
    res.send(reply.map( r => JSON.parse(r) ))
  });
});

// io.on('connection', (socket) => {
//   socket.on('log_insert', function(msg){
//     console.log(msg)
//   });
// });

http.listen(PORT, function () {
  console.log('Example app listening on port 3000!');
});
