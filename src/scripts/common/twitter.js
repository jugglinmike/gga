define(function() {
  'use strict';

  return function(d, s, id){
    s = typeof s !== "undefined" ? s : "script";
    id = typeof id !== "undefined" ? id : "twitter-wjs";

    var js,
        fjs=d.getElementsByTagName(s)[1],
        p=/^http:/.test(d.location)?'http':'https';

    if (!d.getElementById(id)) {
      js=d.createElement(s);
      js.id=id;
      js.src=p+'://platform.twitter.com/widgets.js';
      fjs.parentNode.insertBefore(js,fjs);
    }
  };
});
