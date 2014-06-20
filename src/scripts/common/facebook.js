define(function() {
  "use strict";

   return function(d, s, id) {
     s = typeof s !== "undefined" ? s : 'script';
     id = typeof id !== "undefined" ? id : 'facebook-jssdk';

     var js, fjs = d.getElementsByTagName(s)[0];

     if (d.getElementById(id)) {
       return;
     }
     js = d.createElement(s);
     js.id = id;
     js.src = "http://connect.facebook.net/en_US/all.js#xfbml=1&appId=1446015978947149";
     fjs.parentNode.insertBefore(js, fjs);
   };
});
