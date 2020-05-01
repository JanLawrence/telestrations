$(function () {
    var socket = io();

    $("#login form").submit(function (e) {
        e.preventDefault();
        socket.emit("add user", $("#name").val());
    });

    $("form#m").submit(function (e) {
        e.preventDefault(); // prevents page reloading
        socket.emit("chat message", $("#m").val());
        $("#m").val("");
        return false;
    });

    $("form#m").on("keyup", function () {
        if ($(this).val() != "") {
            socket.emit("typing", $(this).val());
        }
    });

    socket.on("chat message", function (msg) {
        $("#messages").append($("<li>").text(msg));
    });

    socket.on("login", function (numUsers) {
        console.log("numUsers", numUsers);
    });

    socket.on("user joined", function (data) {
        console.log("user joined", data);
    });

    socket.on("user disconnected", function (data) {
        console.log("user disconnected", data);
    });
});
