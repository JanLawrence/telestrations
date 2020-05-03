let mysql = require('mysql');
let express = require("express");
let session = require('express-session');
let bodyParser = require('body-parser');
let app = express();
let path = require("path");
let http = require("http").createServer(app);
let io = require("socket.io")(http);
let dateTime = require('node-datetime');

let connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'telestration'
});

app.use(express.static(path.join(__dirname, "public")));

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/views/login.html");
});

app.post('/login', function(req, res) {
	let username = req.body.username;
	let password = req.body.password;
	if (username && password == 'marisa') {
		connection.query('SELECT * FROM tbl_player WHERE username = ?', [username], function(error, results, fields) {
			if (results.length > 0) {
				req.session.loggedin = true;
                req.session.username = username;
                
                //update `online` and `last_online` on the tbl_player 
                let dt = dateTime.create();
                let formatted = dt.format('Y-m-d H:M:S');
                let sql = `UPDATE tbl_player SET online = 'true', last_online = '${formatted}'  WHERE username = '${username}'`;
                connection.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log(result.affectedRows + " record(s) updated");
                    
                });
                io.emit('new logged in', {
                    username : username
                });

                res.send('logged in');
			} else {
				res.send('Incorrect Username and/or Password!');
			}			
			res.end();
		});
	} else {
		res.send('Username or password is incorrect. Try Again!');
		res.end();
	}
});

app.get("/logout", (req, res) => {
    let dt = dateTime.create();
    let formatted = dt.format('Y-m-d H:M:S');
    let sql = `UPDATE tbl_player SET online = 'false', last_online = '${formatted}'  WHERE username = '${req.session.username}'`;
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log(result.affectedRows + " record(s) updated");
    });

    io.emit('new logged out', {
        username : req.session.username
    });

    req.session.loggedin = false;
    req.session.username = null;
    res.redirect('/');
})

app.get("/lobby", (req, res) => {
    if (req.session.loggedin) {
        // res.send('Please login to view this page!'); 
		res.sendFile(__dirname + "/public/views/lobby.html");
	} else {
		res.redirect('/');
	}
});

app.get("/allPlayers", (req, res) => {
    if (req.session.loggedin) {
        connection.query("SELECT * FROM tbl_player", function (err, result, fields) {
            if (err) throw err;
            res.json({
                players : result
            });
        });
	}
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
