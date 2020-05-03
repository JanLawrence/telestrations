$(function () {
    $("#canvas1").drawr({
        "enable_tranparency" : false,
        "color-mode": "presets",
    });

    //Enable drawing mode, show controls
    $("#canvas1").drawr("start");
    
    //add custom save button.

    $('#btn-save').on("touchstart mousedown",function(){
        var imagedata = $("#canvas1").drawr("export","image/jpeg");
        console.log(imagedata);
        socket.emit("send image", {
            imagedata : imagedata
        });
        // var element = document.createElement('a');
        // element.setAttribute('href', imagedata);
        // element.setAttribute('download', "test.jpg");
        // element.style.display = 'none';
        // document.body.appendChild(element);
        // element.click();
        // document.body.removeChild(element);
    });

    function destroy(){
        $("#canvas1").drawr("destroy");
    }

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

    socket.on("show image", data => {
        $('#imageDisplay img').attr('src', data.imagedata)
    });
});
