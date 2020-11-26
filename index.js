const express = require("express");
const app = express();
const http = require("http").Server(app);

const cors = require("cors");
const cookieParser = require('cookie-parser');

const socketio = require('socket.io');
const io = socketio(http);


//포트설정
let PORT = 80;

//기타모듈 설정

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use(cookieParser());

app.use(cors());

///////////// server routing

const apiRouter = require("./routes/api");
app.use("/", apiRouter);

///////////////////

http.listen(PORT, () => {
  console.log(PORT + "번 포트에서 Connected!");
});


/////////////////// 소켓 통신

io.sockets.on('connection', (socket) => {

  socket.on("new", (data) => {

    io.sockets.emit("new", "새로운 메세지가 도착하였습니다.");

  });

});