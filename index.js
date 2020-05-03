var express = require("express");
var app = express();
var path = require("path");
var http = require("http").createServer(app);
var io = require("socket.io")(http);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/views/index.html");
});

let numUsers = 0;

io.on("connection", (socket) => {
    let addedUser = false;
    console.log("a user connected");

    socket.on("add user", (name) => {
        if (addedUser) return;

        socket.username = name;
        ++numUsers;
        addedUser = true;

        socket.emit("login", {
            numUsers: numUsers,
        });

        socket.broadcast.emit("user joined", {
            username: socket.username,
            numUsers: numUsers,
        });
    });

    socket.on("disconnect", () => {
        if (addedUser) {
            --numUsers;
            socket.broadcast.emit("user disconnected", {
                username: socket.username,
            });
        }
        console.log("user disconnected");
    });

    socket.on("chat message", (msg) => {
        io.emit("chat message", msg);
    });

    socket.on("typing", (msg) => {
        console.log("typing", msg);
    });

    socket.on("send image", data => {
        socket.broadcast.emit("show image", data);
    })
});

http.listen(3000, () => {
    console.log("listening on *:3000");
});
