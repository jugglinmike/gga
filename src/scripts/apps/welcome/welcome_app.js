define(["marionette", "apps/welcome/welcome_view", "common/bills-count-view"], function(Marionette, View, BillsCountView) {
  "use strict";

  var WelcomeApp = {
    Router: Marionette.AppRouter.extend({
      routes: {
        "": "welcome"
      },

      initialize: function(options) {
        this.region = options.region;
        this.layout = new View.Layout();

        this.listenTo(this.layout, "bills:show", function(id) {
          this.trigger("bills:show", id);
        });
        this.listenTo(this.layout, "watchedbills:categories:list", function() {
          this.trigger("watchedbills:categories:list");
        });
        this.listenTo(this.layout, "members:list", function() {
          this.trigger("members:list");
        });
      },

      welcome: function() {
        var self = this;

        // These modules are loaded lazily in order to avoid race conditions in
        // an underlying circular dependency.
        // TODO: Simplify "entities" module definition to remove the circular
        // dependency so that these modules can be defined immediately.
        require(["entities/bill","entities/days_left","goog!feeds,1"], function(bill, daysLeft) {
          var fetchingBillsCount = bill.getBillsCount();
          var fetchingDaysLeft = daysLeft.getDaysLeft()
          $.when(fetchingBillsCount, fetchingDaysLeft)
            .done(function(billsCount, daysLeft) {
              var billsCountView = new BillsCountView({
                model: billsCount
              });

              var daysLeftView = new View.DaysLeftView({
                model: daysLeft
              });

              self.layout.billsCountRegion.show(billsCountView);
              self.layout.daysLeftRegion.show(daysLeftView);

              self.region.show(self.layout);
            });
        });
      }
    })
  };

  return WelcomeApp;
});
