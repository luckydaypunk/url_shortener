// client-side js
// run by the browser each time your view template is loaded

(function(){
  function createURL () {
    let url;
    if ($("#userUrl").val() == "") {
      url = "https://url-short-db.glitch.me/api/https://example.com";
    }else{
      url = "https://url-short-db.glitch.me/api/" + $("#userUrl").val();
    }
    return url;
  }
  $("#userUrl").keydown(key => {
    if (key.which == 13){
      $("#fetch").trigger('click');
    }
  });
  $("#fetch").click(function(){
    let url = createURL();
    $.get(url,function(data){
      let json = JSON.parse(data);
      $("#results").html('<a href="' + json.shortUrl + '">' + json.shortUrl + '</a>');
    }); 
  }); 
})()