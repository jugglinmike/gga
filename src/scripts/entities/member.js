GeneralAssemblyApp.module("Entities", function(Entities, GeneralAssemblyApp, Backbone, Marionette, $, _){
  Entities.Member = Backbone.Model.extend({
    initialize: function() {
      // Create tooltip info string
      var tooltipInfo = this.get("full_name") + ", " + this.get("district_address_city");
      if ( this.get("title") !== "" ) {
        tooltipInfo += ", " + this.get("title");
      }
      this.set("tooltip_info", tooltipInfo);
    }
  });

  Entities.MembersCollection = Backbone.Collection.extend({
    model: Entities.Member,
    url: "http://localhost:3000/api/members/",
    comparator: function(member) {
      return ( (member.get("district_type") === "House" ? "A" : "B") + _.string.sprintf('%03s', member.get("district_number")) );
    },
    criterion: {}
  });

  var API = {
    getMembers: function() {
      var defer = $.Deferred();
      if (! Entities.members) {
        Entities.members = new Entities.MembersCollection();
        Entities.members.fetch({
          success: function(data) {
            defer.resolve(data);
          }
        });
        return defer.promise();
      } else {
        return Entities.members;
      }
    },

    getMember: function(memberId) {
      var member = Entities.members.where({id: memberId})[0];
      return member;
    }
  };

  GeneralAssemblyApp.reqres.setHandler("members:collection", function() {
    return API.getMembers();
  });

  GeneralAssemblyApp.reqres.setHandler("members:member", function(id) {
    return API.getMember(id);
  });
});
