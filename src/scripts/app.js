define(["marionette",
  "apps/welcome/welcome_app",
  "jquery-ui","jquery-scrolltofixed","jquery-datatables","datejs","underscore.string", "spin","spin.jquery","tabletop","goog"
  ], function(Marionette, WelcomeApp) {
  "use strict";

  var GeneralAssemblyApp = new Marionette.Application();

  GeneralAssemblyApp.addRegions({
    mainRegion: "#main-region"
  });

  GeneralAssemblyApp.navigate = function(route, options) {
    options  = options || {};
    Backbone.history.navigate(route, options);
  };

  GeneralAssemblyApp.getCurrentRoute = function() {
    return Backbone.history.fragment;
  };

  GeneralAssemblyApp.on("initialize:after", function() {
    var welcomeRouter = new WelcomeApp.Router({
      region: GeneralAssemblyApp.mainRegion
    });
    this.listenTo(welcomeRouter, "bills:show", function(id) {
      this.trigger("bills:show", id);
    });
    this.listenTo(welcomeRouter, "watchedbills:categories:list", function() {
      this.trigger("watchedbills:categories:list");
    });
    this.listenTo(welcomeRouter, "members:list", function() {
      this.trigger("members:list");
    });
  });

  GeneralAssemblyApp.on("initialize:after", function() {
    // TODO: Document the case where `Backbone.history` is not defined
    if (Backbone.history) {
      require(["apps/members/members_app","apps/watched_bills/watched_bills_app","apps/bills/bills_app","apps/about/about_app","entities/common"], function() {
        Backbone.history.start();

        // if (GeneralAssemblyApp.getCurrentRoute() === "") {
        //   GeneralAssemblyApp.trigger("welcome:show");
        // }

        Tabletop.init({
          key: 'https://docs.google.com/spreadsheet/pub?key=0Ap9h1zLSgOWUdEhsQi1Yb0JZV3REUVExV1hqT2h6NHc&output=html',
          simpleSheet: true,
          proxie: 'https://s3.amazonaws.com/obscure-atoll-3469',
          callback: function(data) {
            var text = {};
            _.each(data, function(row) { text[row.id] = row.text; });
            GeneralAssemblyApp.text = text;
          }
        });
      });
    }
  });

  return GeneralAssemblyApp;
});
