$(function(){
    $('.btn-done').click(function(){
        let uri = $('#paint')[0].toDataURL();
        console.log(uri);
        $('img').attr('src', uri);
    })
})